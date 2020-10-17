import React, { Dispatch, useCallback, useEffect, useRef } from "react";
import { useReducer } from "react";
import { Cart, ICart } from "../model/Cart";
import { STORAGE_KEYS } from "../model/Constants";
import useLambda, { IFaunaObject } from "./useLambda";

interface ICartContext {
    readonly cart: Cart,
    cartDispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>(null);

export enum CartActionType {
    replace,
    updateList,
    updateQuantity,
    clear
}

export interface ICartAction {
    type: CartActionType,
    value?: any
}

export function useCart(): [Cart, Dispatch<ICartAction>] {
    const { data: rawNewCartData, execute: createCart, hasExecuted: hasCreated } = useLambda<IFaunaObject<ICart>>();
    const { data: rawCartData, execute: loadCart, hasExecuted: hasLoaded } = useLambda<IFaunaObject<ICart>>();
    const { data: rawUpdatedCartData, execute: updateCart } = useLambda<IFaunaObject<ICart>>();
    const cartRef = useRef(null);

    const memoizedCartDispatcher = useCallback((state: Cart, action: ICartAction) => {
        let cart = Cart.clone(state);
        switch (action.type) {
            case CartActionType.replace:
                cart = Cart.clone(action.value);
                break;
            case CartActionType.updateList:
                cart = Cart.clone(action.value);
                updateCart(`cart/${state.id}`, 'PUT', { cart });
                break;
            case CartActionType.updateQuantity:
                const item = cart.getItem(action.value.index);
                item.quantity = action.value.quantity;
                break;
            case CartActionType.clear:
                cart = new Cart();
                break;
        }
        return cart;
    }, [updateCart]);
    const [cart, cartDispatcher] = useReducer(memoizedCartDispatcher, new Cart());

    useEffect(() => {
        /** Maintain ref for the beforeunload listener */
        cartRef.current = cart;
    }, [cart]);

    useEffect(() => {
        /** If there were any quantity changes, store an update to the database when leaving the page */
        const listener = (event: BeforeUnloadEvent) => {
            updateCart(`cart/${cartRef.current.id}`, 'PUT', { cart: cartRef.current });
        };

        window.addEventListener('beforeunload', listener);
        return () => {
            window.removeEventListener('beforeunload', listener);
        }
    }, [cartRef, updateCart]);

    useEffect(() => {
        /** Read cart from local storage and either load or create cart from db  */
        let cartID: string = window.localStorage.getItem(STORAGE_KEYS.CART_IDENTIFIER_KEY);
        if (cartID) {
            loadCart(`cart/${cartID}`, 'GET', null, null, null, () => {
                createCart(`cart`, 'POST', new Cart());
            });
        } else {
            createCart(`cart`, 'POST', new Cart());
        }
    }, [cartDispatcher]);

    useEffect(() => {
        /** If loaded from db, parse cart */
        if (rawUpdatedCartData || rawCartData) {
            const rawData = rawUpdatedCartData || rawCartData;
            const id = window.localStorage.getItem(STORAGE_KEYS.CART_IDENTIFIER_KEY);
            let cart = Cart.constructCartFromDatabase(id, rawData.data);
            cartDispatcher({
                type: CartActionType.replace,
                value: cart
            });
        }
    }, [rawCartData, rawUpdatedCartData, cartDispatcher]);

    useEffect(() => {
        /** If new cart, construct and initialize and save ID to local storage */
        if (rawNewCartData) {
            let cart = new Cart();
            cart.id = rawNewCartData.ref["@ref"].id;
            window.localStorage.setItem(STORAGE_KEYS.CART_IDENTIFIER_KEY, cart.id);
            cartDispatcher({
                type: CartActionType.replace,
                value: cart
            });
            updateCart(`cart/${cart.id}`, 'PUT', { cart });
        }
    }, [rawNewCartData, cartDispatcher]);

    return [cart, cartDispatcher];
}