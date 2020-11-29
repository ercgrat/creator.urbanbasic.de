import { Button, Typography } from '@material-ui/core';
import netlifyIdentity from 'netlify-identity-widget';
import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/page';
import Spinner from '../../components/spinner';
import { IdentityContext } from '../../hooks/useIdentity';
import { Cart } from '../../model/Cart';
import styles from './index.module.scss';
import useToastState from '../../hooks/useToastState';
import Toast from '../../components/toast';
import useLambda, { IFaunaObject } from '../../hooks/useLambda';
import { IOrder } from '../../model/Order';
import Order from '../../components/review/order';

const Review: React.FC = () => {
    const [user, token] = useContext(IdentityContext);
    const { data: rawOrderData, execute: loadOrders, isLoading } = useLambda<
        IFaunaObject<IOrder>[],
        undefined
    >();
    const { execute: updateOrder, isLoading: isUpdatingOrder } = useLambda<
        IFaunaObject<IOrder>,
        IFaunaObject<Partial<IOrder>>
    >();
    const [orders, setOrders] = useState<IFaunaObject<IOrder>[]>([]);
    const [isToastOpen, openToast, closeToast] = useToastState();

    useEffect(() => {
        /** Launch login popup if there is no user cookie */
        netlifyIdentity.on('init', (user) => {
            if (!user) {
                login();
            }
        });
    }, []);

    useEffect(() => {
        /**
         * Load orders on user login, clear on logout
         */
        if (user && token) {
            loadOrders('order', 'GET', undefined, token, undefined, openToast);
        } else {
            setOrders([]);
        }
    }, [user, token, loadOrders, openToast]);

    useEffect(() => {
        /** Process raw data to create Cart classes */
        if (rawOrderData) {
            const orderData = rawOrderData.slice();
            orderData.forEach((order) => {
                order.data.cart = Cart.constructCartFromDatabase(
                    order.data.cart.id ?? '0',
                    order.data.cart
                );
            });
            setOrders(orderData);
        }
    }, [rawOrderData]);

    function login() {
        netlifyIdentity.open('login');
    }

    function logout() {
        netlifyIdentity.logout();
        login();
    }

    const updateOrderStatus = (
        order: IFaunaObject<IOrder>,
        isComplete = false
    ) => {
        updateOrder('order', 'PATCH', {
            data: {
                isInProgress: true,
                isComplete,
            },
            ref: order.ref,
            ts: order.ts,
        }).then(() => {
            const originals = orders.slice();
            originals
                .filter(
                    (localOrder) =>
                        localOrder.data.payment.paymentID ===
                        order.data.payment.paymentID
                )
                .map((localOrder) => {
                    localOrder.data.isInProgress = true;
                    localOrder.data.isComplete = isComplete;
                });
            setOrders(originals);
        });
    };

    return (
        <Page>
            {user ? (
                <React.Fragment>
                    <Button
                        onClick={logout}
                        color="primary"
                        variant="contained"
                    >
                        Logout
                    </Button>
                    <ul className={styles.orders}>
                        {orders ? (
                            orders.length === 0 ? (
                                <Typography variant="h5" component="h2">
                                    There are no orders to review.
                                </Typography>
                            ) : (
                                orders.map((order) => (
                                    <Order
                                        order={order}
                                        updateOrderStatus={updateOrderStatus}
                                    />
                                ))
                            )
                        ) : null}
                    </ul>
                </React.Fragment>
            ) : (
                <Button onClick={login} color="primary" variant="contained">
                    Login
                </Button>
            )}
            <Spinner isSpinning={isLoading || isUpdatingOrder} />
            <Toast
                isToastOpen={isToastOpen}
                onClose={closeToast}
                severity="error"
            >
                Something went wrong. Please try again.
            </Toast>
        </Page>
    );
};

export default Review;
