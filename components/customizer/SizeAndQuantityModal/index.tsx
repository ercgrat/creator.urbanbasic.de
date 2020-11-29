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
import React, { useContext, useState } from 'react';
import {
    Cart,
    Design,
    DesignColor,
    DesignProduct,
    DesignSize,
    ICart,
    ProductMap,
} from '../../../model/Cart';
import { formatPrice } from '../../../utils';
import PricePerUnitRow from './PricePerUnitRow';
import Spinner from '../../spinner';
import produce from 'immer';
import useCanvasUtils from '../../../hooks/useCanvasUtils';
import { fabric } from 'fabric';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../customizer';
import router from 'next/router';
import {
    CartActionType,
    CartContext,
    ICartRequest,
} from '../../../hooks/useCart';
import useLambda, { IFaunaObject } from '../../../hooks/useLambda';
import styles from './index.module.scss';

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
    const canvasUtils = useCanvasUtils();
    const { cart, cartDispatcher } = useContext(CartContext);
    const { execute: updateCart, isLoading: isCartUpdating } = useLambda<
        IFaunaObject<ICart>,
        ICartRequest
    >();
    const classes = useStyles();

    function isAddToCartEnabled() {
        // Button is enabled if any size has at least 1 quantity
        let sum = 0;
        for (const value of quantityMap.values()) {
            sum += value;
        }
        return sum > 0;
    }

    function onQuantityChange(
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
        size: string
    ) {
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
    }

    async function addToCart() {
        if (!designHasData()) {
            return;
        }
        const frontCanvas = new fabric.Canvas(
            document.createElement('canvas'),
            {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                preserveObjectStacking: true,
            }
        );
        const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            preserveObjectStacking: true,
        });
        await canvasUtils.renderObjects(frontCanvas, frontObjects);
        await canvasUtils.renderObjects(backCanvas, backObjects);
        const frontImageBlob = frontCanvas.toDataURL();
        const backImageBlob = backCanvas.toDataURL();
        const originals = [];
        for (let i = 0; i < frontObjects.length; i++) {
            const object = frontObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(
                    object.get('data') as Blob
                );
                originals.push(original);
            }
        }
        for (let i = 0; i < backObjects.length; i++) {
            const object = backObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(
                    object.get('data') as Blob
                );
                originals.push(original);
            }
        }

        const selectedSizes = Object.keys(DesignSize).filter((size) => {
            const quantity = quantityMap.get(size);
            return quantity && quantity > 0;
        }) as DesignSize[];
        let newCart = new Cart(
            cart.id,
            cart.getItems().slice(),
            cart.getShipping()
        );
        for (let i = 0; i < selectedSizes.length; i++) {
            const size: DesignSize = selectedSizes[i];
            const design = new Design(
                frontObjects.length > 0,
                frontImageBlob,
                backObjects.length > 0,
                backImageBlob,
                color,
                DesignSize[size],
                product
            );
            newCart.addDesign(design, quantityMap.get(size));
            await updateCart(`cart/${newCart.id}`, 'PUT', {
                cart: newCart,
                originals,
            }).then(
                (rawCartData) =>
                    (newCart = Cart.constructCartFromDatabase(
                        newCart.id ?? '0',
                        rawCartData.data
                    ))
            );
        }

        cartDispatcher({
            type: CartActionType.initializeFromDB,
            value: newCart,
        });

        router.push('/cart');
    }

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
                        <span className={styles.price}>
                            {(() => {
                                const ppu =
                                    frontObjects.length > 0 &&
                                    backObjects.length > 0
                                        ? ProductMap[product].twoSidedPrice
                                        : ProductMap[product].oneSidedPrice;
                                const totalQuantity = Object.values(
                                    quantityMap
                                ).reduce(
                                    (sum, current) =>
                                        sum + (Number(current) || 0),
                                    0
                                );
                                return formatPrice(totalQuantity * ppu);
                            })()}
                        </span>
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
                <Spinner isSpinning={isCartUpdating} />
            </DialogContent>
        </Dialog>
    );
};

export default React.memo(SizeAndQuantityModal);
