import { Typography } from "@material-ui/core";
import React from "react";
import { Cart, CartItem } from "../../model/Cart";
import { formatPrice } from "../../model/Constants";
import Item from "./item";
import styles from "./list.module.scss";

export default React.memo(function List(props: {
  cart: Cart;
  isEditable?: boolean;
  onQuantityChange?: (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index: number
  ) => void;
  onDelete?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number
  ) => void;
}) {
  return (
    <React.Fragment>
      <ul className={styles.list}>
        <li className={`${styles.listItem} ${styles.listHeader}`}>
          <div>Design</div>
          <div>Größe</div>
          <div>Preis</div>
          <div>Anzahl</div>
          <div>Gesamt</div>
          <div></div>
        </li>
        {props.cart.getItems().map((item: CartItem, index, arr: CartItem[]) => (
          <li key={index}>
            <Item
              item={item}
              isEditable={props.isEditable}
              onQuantityChange={(event) => props.onQuantityChange(event, index)}
              onDelete={(event) => props.onDelete(event, index)}
            />
          </li>
        ))}
      </ul>
      {props.cart.getItems().reduce((total, item) => total + item.quantity, 0) >
      0 ? (
        <section className={styles.cartSummary}>
          <p className={styles.cartSummaryItem}>
            <span className={styles.label}>Zwischensumme</span>
            {formatPrice(props.cart.getSubtotal())}
          </p>
          <p className={styles.cartSummaryItem}>
            <span className={styles.label}>Versand</span>
            {formatPrice(props.cart.getShipping())}
          </p>
          <p className={`${styles.cartSummaryItem} ${styles.cartSummaryTotal}`}>
            <span className={styles.label}>Rechnungsbetrag</span>
            {formatPrice(props.cart.getTotal())}
          </p>
        </section>
      ) : (
        <Typography variant="body2" component="p">
          None of the items in your cart have a quantity.
        </Typography>
      )}
    </React.Fragment>
  );
});
