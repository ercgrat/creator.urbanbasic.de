import { useContext, useState } from 'react';
import Page from '../../components/page';
import { CartActionType, CartContext } from '../../hooks/useCart';
import { CartItem } from '../../model/Cart';
import React from 'react';
import styles from './index.module.scss';
import { Button, IconButton, Snackbar, TextField } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import PayPalButton from '../../components/payPalButton';
import Divider from '../../components/divider';
import { lambda } from '../../model/Constants';
import router from 'next/router';
import { Alert } from '@material-ui/lab';
import ShirtUnderlay from '../../components/shirtUnderlay';
import { formatPrice } from '../../utils';

export default function Cart() {
    const { cart, cartDispatcher } = useContext(CartContext);
    const [errorOpen, setErrorOpen] = useState(false);

    function quantityChanged(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) {
        let quantity: number | string = Number(event.target.value);
        if (event.target.value.length === 0) { quantity = ''; }
        else if (quantity < 0) { quantity = 0; }
        else if (quantity > 999) { quantity = 999; }
        cartDispatcher({
            type: CartActionType.update,
            value: {
                index,
                quantity: quantity
            }
        })
    }

    function onPaid(payment: any) {
        lambda('order', 'POST', {
            cart,
            payment
        }).then(response => {
            router.push('/ordercomplete');
            cartDispatcher({
                type: CartActionType.clear
            });
        }).catch(err => {
            setErrorOpen(true);
        });
    }

    function handleErrorClose() {
        setErrorOpen(false);
    }
    
    return (
        <Page>
            <h1 className={styles.heading}>Shopping Cart</h1>
            {
                cart.getSize() === 0 ?
                    <p className={styles.empty}>Your cart is empty.</p> :
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
                                cart.getItems().map((item: CartItem, index, arr: CartItem[]) => (
                                    <li className={styles.listItem} key={index}>
                                        <div className={styles.product}>
                                            <div className={styles.imageContainer}>
                                                <ShirtUnderlay className={styles.image} shirtPosition='front' color={item.design.color} />
                                                <img className={styles.design} src={item.design.frontDataURL}></img>
                                            </div>
                                            <div className={styles.imageContainer}>
                                                <ShirtUnderlay className={styles.image} shirtPosition='back' color={item.design.color} />
                                                <img className={styles.design} src={item.design.backDataURL}></img>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={styles.listItemLabel}>Size: </span>
                                            {item.design.size}
                                        </div>
                                        <div>
                                            <span className={styles.listItemLabel}>Price: </span>
                                            {formatPrice(item.price)}
                                        </div>
                                        <div>
                                            <span className={styles.listItemLabel}>Quantity: </span>
                                            <TextField
                                                className={styles.quantity}
                                                type="number"
                                                InputLabelProps={{
                                                    shrink: true,
                                                }}
                                                variant="outlined"
                                                size="small"
                                                value={item.quantity}
                                                onChange={(event) => quantityChanged(event, index)}
                                            />
                                        </div>
                                        <div>
                                            <span className={styles.listItemLabel}>Total price: </span>
                                            {formatPrice(item.getTotalPrice())}
                                        </div>
                                        <div>
                                            <div className={styles.iconDelete}>
                                                <IconButton
                                                    className={styles.iconDelete}
                                                    aria-label="delete"
                                                    onClick={() => cartDispatcher({
                                                        type: CartActionType.remove,
                                                        value: item
                                                    })}>
                                                    <DeleteForeverIcon />
                                                </IconButton>
                                            </div>
                                            <div className={styles.fullDelete}>
                                                <Button
                                                    className={styles.fullDelete}
                                                    aria-label="delete"
                                                    onClick={() => cartDispatcher({
                                                        type: CartActionType.remove,
                                                        value: item
                                                    })}
                                                    startIcon={<DeleteForeverIcon />}>
                                                    Delete Item
                                                </Button>
                                            </div>

                                        </div>
                                    </li>
                                ))
                            }
                        </ul>
                        <section className={styles.cartSummary}>
                            <p className={styles.cartSummaryItem}><span className={styles.label}> Subtotal</span> {formatPrice(cart.getSubtotal())}</p>
                            <p className={styles.cartSummaryItem}><span className={styles.label}> Shipping</span> {formatPrice(cart.getShipping())}</p>
                            <p className={`${styles.cartSummaryItem} ${styles.cartSummaryTotal}`}><span className={styles.label}> Total</span> {formatPrice(cart.getTotal())}</p>
                        </section>
                        <Divider />
                        <footer className={styles.footer}>
                            <PayPalButton
                                total={cart.getTotal()}
                                onSuccess={onPaid}
                            />
                        </footer>
                    </React.Fragment>
            }
            <Snackbar
                anchorOrigin={
                    {
                        vertical: 'top',
                        horizontal: 'center'
                    }
                }
                open={errorOpen}
                autoHideDuration={3000}
                onClose={handleErrorClose}>
                <Alert
                    variant="filled"
                    onClose={handleErrorClose}
                    severity="success"
                >
                    Something went wrong. Please refresh your browser.
                </Alert>
            </Snackbar>
        </Page>
    );
}