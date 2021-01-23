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
import useLambda from '../../hooks/useLambda';
import { IOrder, Order } from '../../model/Order';
import { IFaunaObject } from '../../model/lambda';
import OrderComponent from '../../components/review/order';
import { URLS } from '../../utils/const';

const Review: React.FC = () => {
    const [user, token] = useContext(IdentityContext);
    const { data: rawOrderData, execute: loadOrders, isLoading } = useLambda<
        IFaunaObject<IOrder>[],
        undefined
    >();
    const [isProcessingOrders, setIsProcessingOrders] = useState(false);
    const { execute: updateOrder, isLoading: isUpdatingOrder } = useLambda<
        IFaunaObject<IOrder>,
        Partial<Order>
    >();
    const [orders, setOrders] = useState<Order[]>([]);
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
        (async () => {
            /** Process raw data to create Cart classes */
            if (rawOrderData) {
                setIsProcessingOrders(true);
                const orders: Order[] = [];
                const orderData = rawOrderData.slice();
                for (let i = 0; i < orderData.length; i++) {
                    const order = orderData[i];
                    const cart = await Cart.constructCartFromDatabase(
                        order.data.cart.id ?? '0',
                        order.data.cart.itemIds
                    );
                    orders.push(
                        new Order(
                            order.ref['@ref'].id,
                            order.data.created_at,
                            cart,
                            order.data.payment,
                            order.data.isInProgress,
                            order.data.isComplete
                        )
                    );
                }
                setOrders(orders);
                setIsProcessingOrders(false);
            }
        })();
    }, [rawOrderData]);

    function login() {
        netlifyIdentity.open('login');
    }

    function logout() {
        netlifyIdentity.logout();
        login();
    }

    const updateOrderStatus = (order: Order, isComplete = false) => {
        updateOrder(URLS.ORDER.UPDATE(order.id), 'PATCH', {
            isInProgress: true,
            isComplete,
        }).then(() => {
            const originals = orders.slice();
            originals
                .filter(
                    (localOrder) =>
                        localOrder.payment.paymentID === order.payment.paymentID
                )
                .map((localOrder) => {
                    localOrder.isInProgress = true;
                    localOrder.isComplete = isComplete;
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
                                    <OrderComponent
                                        key={order.id}
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
            <Spinner
                isSpinning={isLoading || isProcessingOrders || isUpdatingOrder}
            />
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
