import React from "react";
import { useReducer } from "react";
import { Cart } from "../model/Cart";

interface ICartContext {
    readonly cart: Cart,
    cartDispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>(null);

export enum CartActionType {
    add,
    remove,
    update
}

export interface ICartAction {
    type: CartActionType,
    value: any
}

export function useCart() {
    return useReducer((state: Cart, action: ICartAction) => {
        const cart = new Cart();
        state.getItems().forEach(item => cart.addItem(item));
        switch (action.type) {
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
}