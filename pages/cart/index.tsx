import { useContext, useState } from 'react';
import Page from '../../components/page';
import { CartActionType, CartContext } from '../../hooks/useCart';
import React from 'react';
import styles from './index.module.scss';
import PayPalButton from '../../components/payPalButton';
import Divider from '../../components/divider';
import { lambda } from '../../model/Constants';
import router from 'next/router';
import Toast from '../../components/toast';
import useToastState from '../../hooks/useToastState';
import Spinner from '../../components/spinner';
import List from '../../components/cart/list';

export default function Cart() {
    const { cart, cartDispatcher } = useContext(CartContext);
    const [isToastOpen, openToast, closeToast] = useToastState();
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
        setIsLoading(true);
        lambda('order', 'POST', {
            cart,
            payment
        }).then(response => {
            if (response.ok) {
                router.push('/ordercomplete');
                cartDispatcher({
                    type: CartActionType.clear
                });
            } else {
                console.log(response);
                openToast();
            }
        }).catch(err => {
            console.log(err);
            openToast();
        }).finally(() => {
            setIsLoading(false);
        });
    }

    return (
        <Page>
            <h1 className={styles.heading}>Shopping Cart</h1>
            {
                cart.getSize() === 0 ?
                    <p className={styles.empty}>Your cart is empty.</p> :
                    <React.Fragment>
                        <List
                            cart={cart}
                            isEditable
                            onQuantityChange={(event, index) => quantityChanged(event, index)}
                            onDelete={(event, item) => {
                                cartDispatcher({
                                    type: CartActionType.remove,
                                    value: item
                                })
                            }}
                        />
                        <Divider />
                        <footer className={styles.footer}>
                            <PayPalButton
                                total={cart.getTotal()}
                                onSuccess={onPaid}
                            />
                        </footer>
                    </React.Fragment>
            }
            <Toast
                isToastOpen={isToastOpen}
                onClose={closeToast}
                severity='error'
                >
                Something went wrong. Please try again or contact us for support.
            </Toast>
            <Spinner isSpinning={isLoading} />
        </Page>
    );
}