import React from "react";
import { useReducer } from "react";
import { Cart, Design } from "../model/Cart";

interface ICartContext {
    cart: Cart,
    dispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>(null);

export enum CartActionType {
    add,
    remove
}

export interface ICartAction {
    type: CartActionType,
    value: Design
}

export function useCart() {
    return useReducer((state, action: ICartAction) => {
        switch (action.type) {
            case CartActionType.add:
                break;
            case CartActionType.remove:
                break;
        }
        return state;
    }, new Cart());
}