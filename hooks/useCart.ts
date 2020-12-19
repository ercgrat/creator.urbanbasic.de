import React, { Dispatch, useCallback, useEffect, useState } from 'react';
import { useReducer } from 'react';
import { Cart, ICart, ICartItem } from '../model/Cart';
import { IFaunaObject } from '../model/lambda';
import { STORAGE_KEYS, URLS } from '../utils/const';
import useLambda from './useLambda';

interface ICartContext {
    readonly cart: Cart;
    cartDispatcher: React.Dispatch<ICartAction>;
    isCartLoading: boolean;
}
export const CartContext = React.createContext<ICartContext>({
    cart: new Cart(),
    cartDispatcher: () => {
        throw new Error('CartContext was used without a provider');
    },
    isCartLoading: false,
});

export enum CartActionType {
    initializeFromDB,
    deleteItem,
    updateQuantity,
    clear,
}

export interface ICartAction {
    type: CartActionType;
    value?: unknown;
}

export interface ICartDeleteActionValue {
    cart: Cart;
    itemId: string;
}

export type ICartRequest = {
    itemIds: string[];
    originals?: string[];
};

export type UpdateCartActionValue = {
    index: number;
    quantity: number;
};

export function useCart(): [Cart, Dispatch<ICartAction>, boolean] {
    const { data: rawNewCartData, execute: createCart } = useLambda<
        IFaunaObject<ICart>,
        void
    >();
    const { data: rawCartData, execute: loadCart } = useLambda<
        IFaunaObject<ICart>,
        void
    >();
    const { execute: updateCart } = useLambda<
        IFaunaObject<ICart>,
        ICartRequest
    >();
    const { execute: updateCartItem } = useLambda<
        IFaunaObject<ICartItem>,
        ICartItem
    >();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const memoizedCartDispatcher = useCallback(
        (state: Cart, action: ICartAction) => {
            let cart = Cart.clone(state);
            switch (action.type) {
                case CartActionType.initializeFromDB:
                    cart = Cart.clone(action.value as Cart);
                    break;
                case CartActionType.deleteItem:
                    {
                        const value = action.value as ICartDeleteActionValue;
                        cart = Cart.clone(value.cart as Cart);
                        updateCart(
                            URLS.CART.DELETE_ITEM(cart.id ?? '0', value.itemId),
                            'DELETE',
                            {
                                itemIds: cart.getItemIds(),
                            }
                        );
                    }
                    break;
                case CartActionType.updateQuantity:
                    {
                        const value = action.value as UpdateCartActionValue;
                        const item = cart.getItem(value.index);
                        item.quantity = value.quantity;
                        updateCartItem(
                            URLS.CART_ITEM.UPDATE(item.id ?? '0'),
                            'PUT',
                            item
                        );
                    }
                    break;
                case CartActionType.clear:
                    window.localStorage.removeItem(
                        STORAGE_KEYS.CART_IDENTIFIER_KEY
                    );
                    cart = new Cart();
                    createCart(URLS.CART.CREATE(), 'POST');
                    break;
            }
            return cart;
        },
        [createCart, updateCart, updateCartItem]
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
                    createCart(`cart`, 'POST');
                }
            );
        } else {
            createCart(`cart`, 'POST');
        }
    }, [cartDispatcher, createCart, loadCart]);

    useEffect(() => {
        (async () => {
            /** If loaded from db, parse cart */
            if (rawCartData) {
                setIsLoading(true);
                const cartID: string = window.localStorage.getItem(
                    STORAGE_KEYS.CART_IDENTIFIER_KEY
                ) as string;
                const cart = await Cart.constructCartFromDatabase(
                    cartID,
                    rawCartData.data.itemIds
                );
                cartDispatcher({
                    type: CartActionType.initializeFromDB,
                    value: cart,
                });
                setIsLoading(false);
            }
        })();
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

    return [cart, cartDispatcher, isLoading];
}
