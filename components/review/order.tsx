import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {
    CheckBox,
    CheckBoxOutlineBlank,
    WatchLater,
    SaveAlt,
    CheckCircle,
} from '@material-ui/icons';
import moment from 'moment';
import React, { useEffect } from 'react';
import useLambda, { IFaunaObject } from '../../hooks/useLambda';
import { Cart } from '../../model/Cart';
import { IOrder, IOriginal } from '../../model/Order';
import List from '../../components/cart/list';
import Spinner from '../../components/spinner';
import styles from './order.module.scss';

type Props = {
    order: IFaunaObject<IOrder>;
    updateOrderStatus: (
        order: IFaunaObject<IOrder>,
        isComplete?: boolean
    ) => void;
};
const Order: React.FC<Props> = ({ order, updateOrderStatus }) => {
    const {
        data: rawOriginalsData,
        execute: loadOriginals,
        isLoading: isLoadingOriginals,
    } = useLambda<IFaunaObject<IOriginal>[], undefined>();
    function downloadOriginals(order: IFaunaObject<IOrder>) {
        const originals: string[] = [];
        order.data.cart.items.forEach((item) => {
            item.originals?.forEach((original) => {
                originals.push(original);
            });
        });

        loadOriginals(`original/${originals.join(',')}`, 'GET');
    }

    useEffect(() => {
        if (rawOriginalsData) {
            rawOriginalsData.forEach((original) => {
                const link = document.createElement('a');
                link.setAttribute('href', original.data.src);
                link.setAttribute('download', original.ref['@ref'].id);
                link.click();
            });
        }
    }, [rawOriginalsData]);

    return (
        <li className={styles.order} key={order.ref['@ref'].id}>
            <Card variant="outlined">
                <CardHeader
                    style={{
                        opacity: order.data.isComplete ? 0.6 : 1,
                    }}
                    title={
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <span
                                style={{
                                    marginRight: '6px',
                                }}
                            >
                                {!order.data.isComplete ? (
                                    `Payment ID: ${order.data.payment.paymentID}`
                                ) : (
                                    <s>
                                        Payment ID: $
                                        {order.data.payment.paymentID}
                                    </s>
                                )}
                            </span>
                            {order.data.isComplete ? (
                                <Tooltip
                                    title="This order has been completed"
                                    placement="top"
                                >
                                    <CheckCircle color="primary" />
                                </Tooltip>
                            ) : order.data.isInProgress ? (
                                <Tooltip
                                    title="This order is in progress"
                                    placement="top"
                                >
                                    <WatchLater color="primary" />
                                </Tooltip>
                            ) : null}
                        </div>
                    }
                    subheader={moment(order.ts / 1000)
                        .locale('de')
                        .format('LLL')}
                />
                <CardContent>
                    <section className={styles.address}>
                        <Typography
                            variant="h6"
                            component="h2"
                            color="textSecondary"
                        >
                            Name & Address
                        </Typography>
                        <Typography variant="body1" component="p">
                            {order.data.payment.address.recipient_name}
                        </Typography>
                        <Typography variant="body2" component="p">
                            {order.data.payment.address.line1} <br />
                            {order.data.payment.address.city},{' '}
                            {order.data.payment.address.state}{' '}
                            {order.data.payment.address.postal_code}
                        </Typography>
                    </section>
                    <section>
                        <Typography
                            variant="h6"
                            component="h2"
                            color="textSecondary"
                        >
                            Designs
                        </Typography>
                        <List cart={order.data.cart as Cart} />
                    </section>

                    <Spinner isSpinning={isLoadingOriginals} />
                </CardContent>

                <CardActions disableSpacing>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}
                    >
                        <Button
                            aria-label="download"
                            color="primary"
                            startIcon={<SaveAlt />}
                            onClick={() => downloadOriginals(order)}
                            disabled={
                                order.data.cart.items.reduce(
                                    (total, item) =>
                                        total + (item.originals?.length ?? 0),
                                    0
                                ) === 0
                            }
                        >
                            Download Images
                        </Button>
                        <Button
                            aria-label="mark in progress"
                            color="primary"
                            startIcon={
                                order.data.isInProgress ? (
                                    <CheckBox />
                                ) : (
                                    <CheckBoxOutlineBlank />
                                )
                            }
                            onClick={() => updateOrderStatus(order)}
                            disabled={order.data.isInProgress}
                        >
                            In Progress
                        </Button>
                        <Button
                            aria-label="mark complete"
                            color="primary"
                            startIcon={
                                order.data.isComplete ? (
                                    <CheckBox />
                                ) : (
                                    <CheckBoxOutlineBlank />
                                )
                            }
                            onClick={() => updateOrderStatus(order, true)}
                            disabled={
                                !order.data.isInProgress ||
                                order.data.isComplete
                            }
                        >
                            Complete
                        </Button>
                    </div>
                </CardActions>
            </Card>
        </li>
    );
};

export default Order;
