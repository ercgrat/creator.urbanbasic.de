import React from "react";
import { Cart, CartItem } from "../../model/Cart";
import { formatPrice } from "../../model/Constants";
import Item from './item';
import styles from './list.module.scss';

export default React.memo(function List(props: {
    cart: Cart,
    isEditable?: boolean,
    onQuantityChange?: (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => void,
    onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, item: CartItem) => void
}) {
    return (
        <React.Fragment>
            <ul className={styles.list}>
                <li className={`${styles.listItem} ${styles.listHeader}`}>
                    <div>Design</div>
                    <div>Size</div>
                    <div>Price</div>
                    <div>Quantity</div>
                    <div>Total price</div>
                    <div></div>
                </li>
                {
                    props.cart.getItems().map((item: CartItem, index, arr: CartItem[]) => (
                        <li key={index}>
                            <Item
                                item={item}
                                isEditable={props.isEditable}
                                onQuantityChange={(event) => props.onQuantityChange(event, index)}
                                onDelete={(event) => props.onDelete(event, item)}
                            />
                        </li>
                    ))
                }
            </ul>
            <section className={styles.cartSummary}>
                <p className={styles.cartSummaryItem}><span className={styles.label}> Subtotal</span> {formatPrice(props.cart.getSubtotal())}</p>
                <p className={styles.cartSummaryItem}><span className={styles.label}> Shipping</span> {formatPrice(props.cart.getShipping())}</p>
                <p className={`${styles.cartSummaryItem} ${styles.cartSummaryTotal}`}><span className={styles.label}> Total</span> {formatPrice(props.cart.getTotal())}</p>
            </section>
        </React.Fragment>
    );
});