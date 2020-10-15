import { Button, Card, CardContent, CardHeader } from '@material-ui/core';
import netlifyIdentity from 'netlify-identity-widget';
import React, { useContext, useEffect, useState } from 'react';
import Page from '../../components/page';
import Spinner from '../../components/spinner';
import { IdentityContext } from '../../hooks/useIdentity';
import { ICart } from '../../model/Cart';
import { IFaunaObject, lambda } from '../../model/Constants';
import moment from 'moment';
import styles from './index.module.scss';

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
                const result = await response.json();
                setOrders(result);
            }).catch(err => {
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
                                        title={moment(order.ts/1000).locale('de').format('LLL')}
                                        subheader={`Payment ID: ${order.data.payment.paymentID}`} />
                                    <CardContent>
                                    </CardContent>
                                </Card>
                            </li>
                        )) :
                        null
                }
            </ul>
            <Spinner isSpinning={isLoading} />
        </Page>
    );
}