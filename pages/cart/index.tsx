import { useContext } from 'react';
import Page from '../../components/page';
import {
    CartActionType,
    CartContext,
    UpdateCartActionValue,
} from '../../hooks/useCart';
import React from 'react';
import styles from './index.module.scss';
import PayPalButton from '../../components/payPalButton';
import Divider from '../../components/divider';
import Toast from '../../components/toast';
import useToastState from '../../hooks/useToastState';
import Spinner from '../../components/spinner';
import List from '../../components/cart/list';
import useLambda from '../../hooks/useLambda';
import router from 'next/router';
import { Cart as CartModel } from '../../model/Cart';
import { IOrder, IPayment } from '../../model/Order';
import { formatPrice } from '../../utils';
import { Typography } from '@material-ui/core';
import { VAT } from '../../utils/const';
import NewDesignLink from '../../components/NewDesignLink';

const Cart: React.FC = () => {
    const { cart, cartDispatcher, isCartLoading } = useContext(CartContext);
    const [isToastOpen, openToast, closeToast] = useToastState();
    const { execute: submitOrder, isLoading } = useLambda<
        void,
        Partial<IOrder>
    >();

    function quantityChanged(
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        index: number
    ) {
        let quantity: number | string = Number(event.target.value);
        if (event.target.value.length === 0) {
            quantity = '';
        } else if (quantity < 1) {
            quantity = 1;
        } else if (quantity > 999) {
            quantity = 999;
        }
        cartDispatcher({
            type: CartActionType.updateQuantity,
            value: {
                index,
                quantity,
            } as UpdateCartActionValue,
        });
    }

    function onPaid(payment: IPayment) {
        const validItems = cart
            .getItems()
            .filter((item) => item.quantity && item.quantity > 0);
        const cartToOrder = new CartModel(
            cart.id,
            cart.s3KeyCounter,
            validItems
        );
        submitOrder(
            'order',
            'POST',
            {
                cart: {
                    id: cartToOrder.id ?? '0',
                    s3KeyCounter: cartToOrder.s3KeyCounter,
                    itemIds: cartToOrder.getItemIds(),
                },
                payment,
                isInProgress: false,
                isComplete: false,
            },
            undefined,
            checkoutComplete,
            openToast
        );
    }

    function checkoutComplete() {
        router.push('/ordercomplete').then(() => {
            cartDispatcher({
                type: CartActionType.clear,
            });
        });
    }

    return (
        <Page>
            <div className={styles.header}>
                <h1>Warenkorb</h1>
                <NewDesignLink variant="text" />
            </div>
            {cart.getSize() === 0 ? (
                <p className={styles.empty}>Der Warenkorb ist leer.</p>
            ) : (
                <React.Fragment>
                    <List
                        cart={cart}
                        isEditable
                        onQuantityChange={(event, index) =>
                            quantityChanged(event, index)
                        }
                        onDelete={(event, index) => {
                            const newCart = CartModel.clone(cart);
                            const deletedItem = newCart.removeAt(index);
                            cartDispatcher({
                                type: CartActionType.deleteItem,
                                value: {
                                    cart: newCart,
                                    itemId: deletedItem.id,
                                },
                            });
                        }}
                    />
                    {cart
                        .getItems()
                        .reduce((total, item) => total + item.quantity, 0) >
                    0 ? (
                        <section className={styles.cartSummary}>
                            <div className={styles.flexEnd}>
                                <NewDesignLink variant="text" />
                            </div>
                            <p className={styles.cartSummaryItem}>
                                <span className={styles.label}>
                                    Zwischensumme
                                </span>
                                {formatPrice(cart.getSubtotal())}
                            </p>
                            <p className={styles.cartSummaryItem}>
                                <span className={styles.label}>Versand</span>
                                {formatPrice(cart.getShipping())}
                            </p>
                            <p
                                className={`${styles.cartSummaryItem} ${styles.cartSummaryTotal}`}
                            >
                                <span className={styles.label}>
                                    Rechnungsbetrag
                                </span>
                                {formatPrice(cart.getTotal())}
                            </p>
                            <p className={styles.cartSummaryItem}>
                                <span className={styles.label}>
                                    inkl. 19% MwSt.
                                </span>
                                {formatPrice(VAT * cart.getTotal())}
                            </p>
                        </section>
                    ) : (
                        <Typography variant="body2" component="p">
                            None of the items in your cart have a quantity.
                        </Typography>
                    )}
                    {cart
                        .getItems()
                        .reduce((total, item) => total + item.quantity, 0) >
                    0 ? (
                        <React.Fragment>
                            <Divider />
                            <footer className={styles.footer}>
                                <PayPalButton
                                    total={cart.getTotal()}
                                    onSuccess={onPaid}
                                />
                            </footer>
                        </React.Fragment>
                    ) : null}
                </React.Fragment>
            )}
            <Toast
                isToastOpen={isToastOpen}
                onClose={closeToast}
                severity="error"
            >
                Something went wrong. Please try again or contact us for
                support.
            </Toast>
            <Spinner isSpinning={isLoading || isCartLoading} />
        </Page>
    );
};

export default Cart;
