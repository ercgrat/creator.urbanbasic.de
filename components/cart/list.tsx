import React from 'react';
import { Cart, CartItem } from '../../model/Cart';
import { CanvasImageData } from '../../utils/canvas';
import Item from './item';
import styles from './list.module.scss';

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
    onDataLoaded?: (item: CartItem, data: CanvasImageData) => void;
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
                {props.cart.getItems().map((item: CartItem, index) => (
                    <li key={index}>
                        <Item
                            item={item}
                            isEditable={props.isEditable}
                            onQuantityChange={(event) =>
                                props.onQuantityChange?.(event, index)
                            }
                            onDelete={(event) => props.onDelete?.(event, index)}
                            onDataLoaded={props.onDataLoaded}
                        />
                    </li>
                ))}
            </ul>
        </React.Fragment>
    );
});
