import {
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    makeStyles,
    TextField,
    Typography,
} from '@material-ui/core';
import { AddShoppingCart, Close } from '@material-ui/icons';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
    Cart,
    DesignMetadata as DesignMetadata,
    DesignColor,
    DesignProduct,
    DesignSize,
    ICart,
    ICartItem,
    ProductMap,
} from '../../../model/Cart';
import { formatPercent, formatPrice } from '../../../utils';
import PricePerUnitRow from './PricePerUnitRow';
import Spinner from '../../spinner';
import produce from 'immer';
import { fabric } from 'fabric';
import router from 'next/router';
import {
    CartActionType,
    CartContext,
    ICartUpdateRequest,
} from '../../../hooks/useCart';
import useLambda from '../../../hooks/useLambda';
import styles from './index.module.scss';
import { S3_BUCKET, URLS } from '../../../utils/const';
import { IFaunaObject } from '../../../model/lambda';
import { getDataURLsForObjects } from '../../../utils/canvas';
import S3Client from 'aws-sdk/clients/s3';

const useStyles = makeStyles({
    root: {
        backgroundColor: 'rgb(242, 242, 242)',
        borderBottom: 'solid 1px rgb(215, 210, 209)',
        fontWeight: 500,
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalFooterButton: {
        marginLeft: '6px',
    },
});

type Props = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    designHasData: () => boolean;
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    product: DesignProduct;
};

const SizeAndQuantityModal: React.FC<Props> = ({
    isOpen,
    setIsOpen,
    designHasData,
    frontObjects,
    backObjects,
    color,
    product,
}) => {
    const defaultQuantityMap = new Map<string, number>();
    Object.keys(DesignSize).map((key) => defaultQuantityMap.set(key, 0));
    const [quantityMap, setQuantityMap] = useState<Map<string, number>>(
        defaultQuantityMap
    );
    const [totalPrice, setTotalPrice] = useState<string>(formatPrice(0));
    const { cart, cartDispatcher } = useContext(CartContext);
    const { execute: updateCart } = useLambda<
        IFaunaObject<ICart>,
        ICartUpdateRequest
    >();
    const { execute: createCartItem } = useLambda<
        IFaunaObject<ICartItem>,
        ICartItem
    >();
    const classes = useStyles();
    const [isUpdatingCart, setIsUpdatingCart] = useState<boolean>(false);
    const [spinnerMessage, setSpinnerMessage] = useState<string>('');

    const isAddToCartEnabled = useCallback(() => {
        // Button is enabled if any size has at least 1 quantity
        let sum = 0;
        for (const value of quantityMap.values()) {
            sum += value;
        }
        return sum > 0;
    }, [quantityMap]);

    const onQuantityChange = useCallback(
        (
            event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
            size: string
        ) => {
            let quantity: number | undefined = Number(event.target.value);
            if (event.target.value.length === 0) {
                quantity = undefined;
            } else if (quantity < 0) {
                quantity = 0;
            } else if (quantity > 999) {
                quantity = 999;
            }
            setQuantityMap(
                produce((draftMap: Map<string, number>) => {
                    if (quantity !== undefined) {
                        draftMap.set(size, quantity);
                    } else {
                        draftMap.delete(size);
                    }
                })
            );
        },
        [setQuantityMap]
    );

    useEffect(() => {
        const ppu =
            frontObjects.length > 0 && backObjects.length > 0
                ? ProductMap[product].twoSidedPrice
                : ProductMap[product].oneSidedPrice;
        let totalQuantity = 0;
        quantityMap.forEach((value) => {
            totalQuantity += value;
        });
        setTotalPrice(formatPrice(totalQuantity * ppu));
    }, [backObjects.length, frontObjects.length, product, quantityMap]);

    const addToCart = useCallback(async () => {
        if (!designHasData()) {
            return;
        }
        setIsUpdatingCart(true);

        const selectedSizes = Object.keys(DesignSize).filter((size) => {
            const quantity = quantityMap.get(size);
            return quantity && quantity > 0;
        }) as DesignSize[];

        const designData = await getDataURLsForObjects(
            frontObjects,
            backObjects
        );

        // Use the cart ID and a counter as the S3 object key
        const s3ObjectKey = `${cart.id}-${cart.s3KeyCounter}`;
        const upload = new S3Client.ManagedUpload({
            params: {
                Bucket: S3_BUCKET,
                Key: s3ObjectKey,
                Body: Buffer.from(JSON.stringify(designData), 'binary'),
            },
            service: new S3Client({
                useAccelerateEndpoint: true,
            }),
        });
        upload.on('httpUploadProgress', (progress) => {
            const percentDone = formatPercent(progress.loaded / progress.total);
            setSpinnerMessage(percentDone);
        });
        upload
            .promise()
            .then(async () => {
                setSpinnerMessage('✔️');
                let newCart = new Cart(
                    cart.id,
                    cart.s3KeyCounter + 1, // Increment for every design
                    cart.getItems().slice()
                );

                const newCartItemIDs: string[] = [];
                for (let i = 0; i < selectedSizes.length; i++) {
                    const size: DesignSize = selectedSizes[i];
                    const design = new DesignMetadata(
                        s3ObjectKey,
                        frontObjects.length > 0,
                        backObjects.length > 0,
                        color,
                        DesignSize[size],
                        product
                    );

                    // Create a cart item
                    const cartItem = newCart.addDesign(
                        design,
                        quantityMap.get(size)
                    );
                    const cartItemResponse = await createCartItem(
                        URLS.CART_ITEM.CREATE(),
                        'POST',
                        cartItem.getPayload()
                    );
                    cartItem.id = cartItemResponse.ref['@ref'].id;
                    newCartItemIDs.push(cartItem.id);
                }

                const cartData = await updateCart(
                    URLS.CART.UPDATE(newCart.id ?? '0'),
                    'PUT',
                    {
                        s3KeyCounter: newCart.s3KeyCounter,
                        itemIds: newCart.getItemIds(),
                    }
                );

                newCart = await Cart.constructCartFromDatabase(
                    cartData.ref['@ref'].id,
                    cartData.data.s3KeyCounter,
                    cartData.data.itemIds
                );

                newCart
                    .getItems()
                    .filter(
                        (item) => item.id && newCartItemIDs.includes(item.id)
                    )
                    .forEach((item) => {
                        item.clientFrontDataURL = designData.frontDataURL;
                        item.clientBackDataURL = designData.backDataURL;
                    });

                cartDispatcher({
                    type: CartActionType.initializeFromDB,
                    value: newCart,
                });

                router.push('/cart');
            })
            .catch(() => {
                alert('Something went wrong. Please try again.');
            })
            .finally(() => {
                setIsUpdatingCart(false);
                setSpinnerMessage('');
            });
    }, [
        designHasData,
        frontObjects,
        backObjects,
        cart,
        cartDispatcher,
        quantityMap,
        color,
        product,
        createCartItem,
        updateCart,
    ]);

    return (
        <Dialog
            open={isOpen}
            scroll="body"
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle
                id="scroll-dialog-title"
                disableTypography
                classes={{ root: classes.root }}
            >
                <Typography variant="h5" component="h2">
                    Größe und Anzahl
                </Typography>
                <IconButton
                    onClick={() => {
                        setIsOpen(false);
                        setQuantityMap(defaultQuantityMap);
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <ul className={styles.sizeList}>
                    {Object.keys(DesignSize).map((size) => (
                        <li className={styles.sizeItem} key={size}>
                            <Typography variant="h6" component="b">
                                {size.toUpperCase()}
                            </Typography>
                            <TextField
                                className={styles.quantity}
                                type="number"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                variant="outlined"
                                size="small"
                                value={quantityMap.get(size)}
                                onChange={(event) =>
                                    onQuantityChange(event, size)
                                }
                            />
                        </li>
                    ))}
                </ul>
                <PricePerUnitRow
                    className={styles.priceLabelModal}
                    product={product}
                    frontObjects={frontObjects}
                    backObjects={backObjects}
                />
                <div className={styles.priceLabelModal}>
                    <Typography variant="h6" component="span">
                        Total:{' '}
                        <span className={styles.price}>{totalPrice}</span>
                    </Typography>
                </div>
                <footer className={`${styles.footer} ${styles.modalFooter}`}>
                    <Button onClick={() => setIsOpen(false)} color="default">
                        ZURÜCK
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        disabled={!isAddToCartEnabled()}
                        startIcon={<AddShoppingCart />}
                        onClick={addToCart}
                        classes={{ root: classes.modalFooterButton }}
                    >
                        IN DEN WARENKORB
                    </Button>
                </footer>
                <Spinner isSpinning={isUpdatingCart} message={spinnerMessage} />
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(SizeAndQuantityModal);
