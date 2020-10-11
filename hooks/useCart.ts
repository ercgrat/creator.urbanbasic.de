import React, { Dispatch, useEffect, useRef } from "react";
import { useReducer } from "react";
import { Cart, CartItem, ICartStorage } from "../model/Cart";
import { STORAGE_KEYS } from "../model/Constants";

interface ICartContext {
    readonly cart: Cart,
    cartDispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>(null);

export enum CartActionType {
    initialize,
    add,
    remove,
    update
}

export interface ICartAction {
    type: CartActionType,
    value: any
}

export function useCart(): [Cart, Dispatch<ICartAction>] {
    const [cart, cartDispatcher] = useReducer((state: Cart, action: ICartAction) => {
        let cart = new Cart();
        state.getItems().forEach(item => cart.addItem(item));
        switch (action.type) {
            case CartActionType.initialize:
                cart = new Cart(action.value);
                break;
            case CartActionType.add:
                cart.addDesign(action.value);
                break;
            case CartActionType.remove:
                cart.removeItem(action.value);
                break;
            case CartActionType.update:
                const item = cart.getItem(action.value.index);
                item.quantity = action.value.quantity;
        }
        return cart;
    }, new Cart());

    const cartRef = useRef<Cart>(cart);
    useEffect(() => {
        cartRef.current = cart;
    }, [cart]);

    useEffect(() => {
        const cartJSON = window.localStorage.getItem(STORAGE_KEYS.CART_STORAGE_KEY);
        if (cartJSON) {
            const cartData: ICartStorage = JSON.parse(cartJSON);
            cartDispatcher({
                type: CartActionType.initialize,
                value: cartData.items.map(item => new CartItem(item.design, item.quantity))
            });
        }
    }, [cartDispatcher]);

    useEffect(() => {
        const listener = () => {
            const storage: ICartStorage = {
                items: cartRef.current.getItems()
            };
            window.localStorage.setItem(STORAGE_KEYS.CART_STORAGE_KEY, JSON.stringify(storage));
        };
        window.addEventListener('beforeunload', listener);

        return () => {
            window.removeEventListener('beforeunload', listener);
        }
    }, []);

    return [cart, cartDispatcher];
}