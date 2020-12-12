import React, { Dispatch, useCallback, useEffect } from 'react';
import { useReducer } from 'react';
import { Cart, ICart } from '../model/Cart';
import { STORAGE_KEYS } from '../model/Constants';
import useLambda, { IFaunaObject } from './useLambda';

interface ICartContext {
    readonly cart: Cart;
    cartDispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>({
    cart: new Cart(),
    cartDispatcher: () => {
        throw new Error('CartContext was used without a provider');
    },
});

export enum CartActionType {
    initializeFromDB,
    updateList,
    updateQuantity,
    clear,
}

export interface ICartAction {
    type: CartActionType;
    value?: unknown;
}

export type ICartRequest = {
    cart: ICart;
    originals?: string[];
};

export type UpdateCartActionValue = {
    index: number;
    quantity: number;
};

export function useCart(): [Cart, Dispatch<ICartAction>] {
    const { data: rawNewCartData, execute: createCart } = useLambda<
        IFaunaObject<ICart>,
        ICart
    >();
    const { data: rawCartData, execute: loadCart } = useLambda<
        IFaunaObject<ICart>,
        undefined
    >();
    const { execute: updateCart } = useLambda<
        IFaunaObject<ICart>,
        ICartRequest
    >();

    const memoizedCartDispatcher = useCallback(
        (state: Cart, action: ICartAction) => {
            let cart = Cart.clone(state);
            switch (action.type) {
                case CartActionType.initializeFromDB:
                    cart = Cart.clone(action.value as Cart);
                    break;
                case CartActionType.updateList:
                    cart = Cart.clone(action.value as Cart);
                    updateCart(`cart/${cart.id}`, 'PUT', { cart });
                    break;
                case CartActionType.updateQuantity:
                    {
                        const value = action.value as UpdateCartActionValue;
                        const item = cart.getItem(value.index);
                        item.quantity = value.quantity;
                        updateCart(`cart/${cart.id}`, 'PUT', { cart });
                    }
                    break;
                case CartActionType.clear:
                    window.localStorage.removeItem(
                        STORAGE_KEYS.CART_IDENTIFIER_KEY
                    );
                    cart = new Cart();
                    createCart(`cart`, 'POST', cart);
                    break;
            }
            return cart;
        },
        [createCart, updateCart]
    );

    const [cart, cartDispatcher] = useReducer(
        memoizedCartDispatcher,
        new Cart()
    );

    useEffect(() => {
        /** On context creation, read cart from local storage and load from db or create new cart  */
        const cartID: string | null = window.localStorage.getItem(
            STORAGE_KEYS.CART_IDENTIFIER_KEY
        );
        if (cartID) {
            loadCart(
                `cart/${cartID}`,
                'GET',
                undefined,
                undefined,
                undefined,
                () => {
                    createCart(`cart`, 'POST', new Cart());
                }
            );
        } else {
            createCart(`cart`, 'POST', new Cart());
        }
    }, [cartDispatcher, createCart, loadCart]);

    useEffect(() => {
        /** If loaded from db, parse cart */
        if (rawCartData) {
            const rawData = rawCartData;
            const cartID: string = window.localStorage.getItem(
                STORAGE_KEYS.CART_IDENTIFIER_KEY
            ) as string;
            const cart = Cart.constructCartFromDatabase(cartID, rawData.data);
            cartDispatcher({
                type: CartActionType.initializeFromDB,
                value: cart,
            });
        }
    }, [rawCartData, cartDispatcher]);

    useEffect(() => {
        /** If new cart, construct and initialize and save ID to local storage */
        if (rawNewCartData) {
            const cart = new Cart();
            cart.id = rawNewCartData.ref['@ref'].id;
            window.localStorage.setItem(
                STORAGE_KEYS.CART_IDENTIFIER_KEY,
                cart.id
            );
            cartDispatcher({
                type: CartActionType.initializeFromDB,
                value: cart,
            });
        }
    }, [rawNewCartData, cartDispatcher]);

    return [cart, cartDispatcher];
}
