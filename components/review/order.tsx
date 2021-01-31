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
import React, { useCallback, useState } from 'react';
import { Order as OrderModel } from '../../model/Order';
import List from '../../components/cart/list';
import styles from './order.module.scss';
import { CanvasImageData } from '../../utils/canvas';
import { CartItem } from '../../model/Cart';

type Props = {
    order: OrderModel;
    updateOrderStatus: (order: OrderModel, isComplete?: boolean) => void;
    frontDataUrl?: string;
    backDataUrl?: string;
};
const Order: React.FC<Props> = ({ order, updateOrderStatus }) => {
    const [designMap, setDesignMap] = useState(
        new Map<string, CanvasImageData>()
    );

    const downloadDesigns = useCallback(
        (order: OrderModel) => {
            order.cart.items.forEach((item, index) => {
                const frontLink = document.createElement('a');
                frontLink.setAttribute(
                    'href',
                    designMap.get(item.id ?? '0')?.frontDataURL ?? ''
                );
                frontLink.setAttribute(
                    'download',
                    `order-${order.id}-${index}-front`
                );
                frontLink.click();

                const backLink = document.createElement('a');
                backLink.setAttribute(
                    'href',
                    designMap.get(item.id ?? '0')?.backDataURL ?? ''
                );
                backLink.setAttribute(
                    'download',
                    `order-${order.id}-${index}-back`
                );
                backLink.click();
            });
        },
        [designMap]
    );

    const onDataLoaded = useCallback(
        (item: CartItem, data: CanvasImageData) => {
            setDesignMap((prevMap) => {
                const map = new Map(prevMap);
                map.set(item.id ?? '0', data);
                return map;
            });
        },
        []
    );

    return (
        <li className={styles.order} key={order.id}>
            <Card variant="outlined">
                <CardHeader
                    style={{
                        opacity: order.isComplete ? 0.6 : 1,
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
                                {!order.isComplete ? (
                                    `Payment ID: ${order.payment.paymentID}`
                                ) : (
                                    <s>
                                        Payment ID: ${order.payment.paymentID}
                                    </s>
                                )}
                            </span>
                            {order.isComplete ? (
                                <Tooltip
                                    title="This order has been completed"
                                    placement="top"
                                >
                                    <CheckCircle color="primary" />
                                </Tooltip>
                            ) : order.isInProgress ? (
                                <Tooltip
                                    title="This order is in progress"
                                    placement="top"
                                >
                                    <WatchLater color="primary" />
                                </Tooltip>
                            ) : null}
                        </div>
                    }
                    subheader={order.created_at.locale('de').format('LLL')}
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
                            {order.payment.address.recipient_name}
                        </Typography>
                        <Typography variant="body2" component="p">
                            {order.payment.address.line1} <br />
                            {order.payment.address.city},{' '}
                            {order.payment.address.state}{' '}
                            {order.payment.address.postal_code}
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
                        <List cart={order.cart} onDataLoaded={onDataLoaded} />
                    </section>
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
                            onClick={() => downloadDesigns(order)}
                            disabled={order.cart.items.some(
                                (item) => !designMap.get(item.id ?? '0')
                            )}
                        >
                            Download Designs
                        </Button>
                        <Button
                            aria-label="mark in progress"
                            color="primary"
                            startIcon={
                                order.isInProgress ? (
                                    <CheckBox />
                                ) : (
                                    <CheckBoxOutlineBlank />
                                )
                            }
                            onClick={() => updateOrderStatus(order)}
                            disabled={order.isInProgress}
                        >
                            In Progress
                        </Button>
                        <Button
                            aria-label="mark complete"
                            color="primary"
                            startIcon={
                                order.isComplete ? (
                                    <CheckBox />
                                ) : (
                                    <CheckBoxOutlineBlank />
                                )
                            }
                            onClick={() => updateOrderStatus(order, true)}
                            disabled={!order.isInProgress || order.isComplete}
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
