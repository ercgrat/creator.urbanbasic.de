import { useContext } from 'react';
import Page from '../../components/page';
import { CartContext } from '../../hooks/useCart';
import { CartItem } from '../../model/Cart';
import React from 'react';
import styles from './index.module.scss';

export default function Cart() {
    const { cart } = useContext(CartContext);
    return (
        <Page>
            {
                cart.getSize() === 0 ?
                    <p>Your cart is empty.</p> :
                    <ul className={styles.list}>
                        {
                            cart.getItems().map((item: CartItem, index) => (
                                <li className={styles.listItem} key={index}>
                                    <div className={styles.imageContainer}>
                                        <img className={styles.image} src={`/images/${item.design.color}-front.jpg`}></img>
                                        <img className={styles.design} src={item.design.frontBlob}></img>
                                    </div>
                                    <div className={styles.imageContainer}>
                                        <img className={styles.image} src={`/images/${item.design.color}-back.jpg`}></img>
                                        <img className={styles.design} src={item.design.backBlob}></img>
                                    </div>
                                    <p>{item.design.color}</p>
                                    <p>{item.design.size}</p>
                                </li>
                            ))
                        }
                    </ul>
            }
        </Page>
    );
}