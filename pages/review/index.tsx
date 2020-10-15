import { Button, Card, CardActions, CardContent, CardHeader, IconButton, Typography } from '@material-ui/core';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import netlifyIdentity from 'netlify-identity-widget';
import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/page';
import Spinner from '../../components/spinner';
import { IdentityContext } from '../../hooks/useIdentity';
import { Cart, CartItem, ICart } from '../../model/Cart';
import { IFaunaObject, lambda } from '../../model/Constants';
import moment from 'moment';
import styles from './index.module.scss';
import useToastState from '../../hooks/useToastState';
import Toast from '../../components/toast';
import List from '../../components/cart/list';

interface IOrder {
    cart: ICart,
    payment: {
        address: {
            city: string,
            country_code: string,
            line1: string,
            postal_code: string,
            recipient_name: string,
            state: string
        },
        email: string,
        paymentID: string
    }
}

export default function Review() {

    const [user, token] = useContext(IdentityContext);
    const [orders, setOrders] = useState<IFaunaObject<IOrder>[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isToastOpen, openToast, closeToast] = useToastState();

    useEffect(() => {
        /** Launch login popup if there is no user cookie */
        netlifyIdentity.on('init', user => {
            if (!user) {
                login();
            }
        });
    }, []);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            lambda('order', 'GET', null, token).then(async response => {
                if (response.ok) {
                    const result: IFaunaObject<IOrder>[] = await response.json();
                    result.forEach(order => {
                        order.data.cart = new Cart(order.data.cart.items.map(item => new CartItem(item.design)));
                    });
                    
                    setOrders(result);
                } else {
                    openToast();
                    console.log(response);
                }
            }).catch(err => {
                openToast();
                console.log(err);
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            setOrders(null);
        }
    }, [user]);

    function login() {
        netlifyIdentity.open('login');
    }

    function logout() {
        netlifyIdentity.logout();
        login();
    }

    return (
        <Page>
            {
                user ?
                    <Button
                        onClick={logout}
                        color='primary'
                        variant='contained'>
                        Logout
                </Button> :
                    <Button
                        onClick={login}
                        color='primary'
                        variant='contained'>
                        Login
                </Button>
            }

            <ul className={styles.orders}>
                {
                    orders ?
                        orders.map(order => (
                            <li className={styles.order} key={order.ref["@ref"].id}>
                                <Card variant='outlined'>
                                    <CardHeader
                                        title={`Payment ID: ${order.data.payment.paymentID}`}
                                        subheader={moment(order.ts / 1000).locale('de').format('LLL')} />
                                    <CardContent>
                                        <section className={styles.address}>
                                            <Typography variant='h6' component='h2' color='textSecondary'>
                                                Address
                                            </Typography>
                                            <Typography variant='body1' component='p'>
                                                {order.data.payment.address.recipient_name}
                                            </Typography>
                                            <Typography variant='body2' component='p'>
                                                {order.data.payment.address.line1} <br />
                                                {order.data.payment.address.city}, {order.data.payment.address.state} {order.data.payment.address.postal_code}
                                            </Typography>
                                        </section>
                                        <section>
                                            <Typography variant='h6' component='h2' color='textSecondary'>
                                                Designs
                                            </Typography>
                                            <List
                                                cart={order.data.cart as Cart}
                                            />
                                        </section>
                                    </CardContent>

                                    <CardActions disableSpacing>
                                        <Button
                                            aria-label='download'
                                            color='primary'
                                            startIcon={<SaveAltIcon />}>
                                            Download Images
                                        </Button>
                                    </CardActions>
                                </Card>
                            </li>
                        )) :
                        null
                }
            </ul>
            <Spinner isSpinning={isLoading} />
            <Toast
                isToastOpen={isToastOpen}
                onClose={closeToast}
                severity='error'>
                Something went wrong. Please try again.
            </Toast>
        </Page>
    );
}