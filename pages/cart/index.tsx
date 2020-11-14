import { useContext } from "react";
import Page from "../../components/page";
import { CartActionType, CartContext } from "../../hooks/useCart";
import React from "react";
import styles from "./index.module.scss";
import PayPalButton from "../../components/payPalButton";
import Divider from "../../components/divider";
import Toast from "../../components/toast";
import useToastState from "../../hooks/useToastState";
import Spinner from "../../components/spinner";
import List from "../../components/cart/list";
import useLambda from "../../hooks/useLambda";
import router from "next/router";
import { Cart as CartModel } from "../../model/Cart";
import { IOrder } from "../../model/Order";

export default function Cart() {
  const { cart, cartDispatcher } = useContext(CartContext);
  const [isToastOpen, openToast, closeToast] = useToastState();
  const { execute: submitOrder, isLoading } = useLambda<null, IOrder>();

  function quantityChanged(
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number
  ) {
    let quantity: number | string = Number(event.target.value);
    if (event.target.value.length === 0) {
      quantity = "";
    } else if (quantity < 1) {
      quantity = 1;
    } else if (quantity > 999) {
      quantity = 999;
    }
    cartDispatcher({
      type: CartActionType.updateQuantity,
      value: {
        index,
        quantity: quantity,
      },
    });
  }

  function onPaid(payment: any) {
    const validItems = cart
      .getItems()
      .filter((item) => item.quantity && item.quantity > 0);
    let cartToOrder = new CartModel(cart.id, validItems, cart.shippingCost);
    submitOrder(
      "order",
      "POST",
      {
        cart: cartToOrder,
        payment,
        isReviewed: false,
      },
      null,
      checkoutComplete,
      openToast
    );
  }

  function checkoutComplete() {
    router.push("/ordercomplete").then(() => {
      cartDispatcher({
        type: CartActionType.clear,
      });
    });
  }

  return (
    <Page>
      <h1 className={styles.heading}>Warenkorb</h1>
      {cart.getSize() === 0 ? (
        <p className={styles.empty}>Your cart is empty.</p>
      ) : (
        <React.Fragment>
          <List
            cart={cart}
            isEditable
            onQuantityChange={(event, index) => quantityChanged(event, index)}
            onDelete={(event, index) => {
              let newCart = CartModel.clone(cart);
              newCart.removeAt(index);
              cartDispatcher({
                type: CartActionType.updateList,
                value: newCart,
              });
            }}
          />
          {cart.getItems().reduce((total, item) => total + item.quantity, 0) >
          0 ? (
            <React.Fragment>
              <Divider />
              <footer className={styles.footer}>
                <PayPalButton total={cart.getTotal()} onSuccess={onPaid} />
              </footer>
            </React.Fragment>
          ) : null}
        </React.Fragment>
      )}
      <Toast isToastOpen={isToastOpen} onClose={closeToast} severity="error">
        Something went wrong. Please try again or contact us for support.
      </Toast>
      <Spinner isSpinning={isLoading} />
    </Page>
  );
}
