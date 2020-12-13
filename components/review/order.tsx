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
import React, { useCallback } from 'react';
import { Order as OrderModel } from '../../model/Order';
import List from '../../components/cart/list';
import styles from './order.module.scss';

type Props = {
    order: OrderModel;
    updateOrderStatus: (order: OrderModel, isComplete?: boolean) => void;
};
const Order: React.FC<Props> = ({ order, updateOrderStatus }) => {
    /*const {
        data: rawOriginalsData,
        execute: loadOriginals,
        isLoading: isLoadingOriginals,
    } = useLambda<IFaunaObject<IOriginal>[], undefined>();*/

    /*const downloadOriginals = useCallback(
        (order: IFaunaObject<IOrder>) => {
            const originals: string[] = [];
            order.data.cart.items.forEach((item) => {
                item.originals?.forEach((original) => {
                    originals.push(original);
                });
            });

            loadOriginals(`original/${originals.join(',')}`, 'GET');
        },
        [loadOriginals]
    );*/

    const downloadDesigns = useCallback((order: OrderModel) => {
        order.cart.items.forEach((item, index) => {
            const frontLink = document.createElement('a');
            frontLink.setAttribute('href', item.design.frontDataURL);
            frontLink.setAttribute(
                'download',
                `order-${order.id}-${index}-front`
            );
            frontLink.click();

            const backLink = document.createElement('a');
            backLink.setAttribute('href', item.design.backDataURL);
            backLink.setAttribute(
                'download',
                `order-${order.id}-${index}-back`
            );
            backLink.click();
        });
    }, []);

    /*useEffect(() => {
        if (rawOriginalsData) {
            rawOriginalsData.forEach((original) => {
                const link = document.createElement('a');
                link.setAttribute('href', original.data.src);
                link.setAttribute('download', original.ref['@ref'].id);
                link.click();
            });
        }
    }, [rawOriginalsData]);*/

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
                        <List cart={order.cart} />
                    </section>

                    {/* <Spinner isSpinning={isLoadingOriginals} /> */}
                </CardContent>

                <CardActions disableSpacing>
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/*<Button
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
                          </Button>*/}
                        <Button
                            aria-label="download"
                            color="primary"
                            startIcon={<SaveAlt />}
                            onClick={() => downloadDesigns(order)}
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
