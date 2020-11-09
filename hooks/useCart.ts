import React, { Dispatch, useCallback, useEffect, useRef } from "react";
import { useReducer } from "react";
import { Cart, ICart } from "../model/Cart";
import { STORAGE_KEYS } from "../model/Constants";
import useLambda, { IFaunaObject } from "./useLambda";

interface ICartContext {
  readonly cart: Cart;
  cartDispatcher: React.Dispatch<ICartAction>;
}
export const CartContext = React.createContext<ICartContext>(null);

export enum CartActionType {
  initializeFromDB,
  updateList,
  updateQuantity,
  clear,
}

export interface ICartAction {
  type: CartActionType;
  value?: any;
}

export type ICartRequest = {
  cart: ICart;
  originals?: string[];
};

export function useCart(): [Cart, Dispatch<ICartAction>] {
  const { data: rawNewCartData, execute: createCart } = useLambda<
    IFaunaObject<ICart>,
    ICart
  >();
  const { data: rawCartData, execute: loadCart } = useLambda<
    IFaunaObject<ICart>
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
          cart = Cart.clone(action.value);
          break;
        case CartActionType.updateList:
          cart = Cart.clone(action.value);
          updateCart(`cart/${cart.id}`, "PUT", { cart });
          break;
        case CartActionType.updateQuantity:
          const item = cart.getItem(action.value.index);
          item.quantity = action.value.quantity;
          updateCart(`cart/${cart.id}`, "PUT", { cart });
          break;
        case CartActionType.clear:
          window.localStorage.removeItem(STORAGE_KEYS.CART_IDENTIFIER_KEY);
          cart = new Cart();
          break;
      }
      return cart;
    },
    []
  );
  const [cart, cartDispatcher] = useReducer(memoizedCartDispatcher, new Cart());

  useEffect(() => {
    /** On context creation, read cart from local storage and load from db or create new cart  */
    let cartID: string = window.localStorage.getItem(
      STORAGE_KEYS.CART_IDENTIFIER_KEY
    );
    if (cartID) {
      loadCart(`cart/${cartID}`, "GET", null, null, null, () => {
        createCart(`cart`, "POST", new Cart());
      });
    } else {
      createCart(`cart`, "POST", new Cart());
    }
  }, [cartDispatcher]);

  useEffect(() => {
    /** If loaded from db, parse cart */
    if (rawCartData) {
      const rawData = rawCartData;
      const id = window.localStorage.getItem(STORAGE_KEYS.CART_IDENTIFIER_KEY);
      let cart = Cart.constructCartFromDatabase(id, rawData.data);
      cartDispatcher({
        type: CartActionType.initializeFromDB,
        value: cart,
      });
    }
  }, [rawCartData, cartDispatcher]);

  useEffect(() => {
    /** If new cart, construct and initialize and save ID to local storage */
    if (rawNewCartData) {
      let cart = new Cart();
      cart.id = rawNewCartData.ref["@ref"].id;
      window.localStorage.setItem(STORAGE_KEYS.CART_IDENTIFIER_KEY, cart.id);
      cartDispatcher({
        type: CartActionType.initializeFromDB,
        value: cart,
      });
    }
  }, [rawNewCartData, cartDispatcher]);

  return [cart, cartDispatcher];
}
