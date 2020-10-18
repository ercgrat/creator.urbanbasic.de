import Page from '../components/page';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { CartActionType, CartContext } from '../hooks/useCart';
import { fabric } from 'fabric';
import Customizer, { CANVAS_HEIGHT, CANVAS_WIDTH, IDesignData } from '../components/customizer/customizer';
import Divider from '../components/divider';
import useCanvasUtils from '../hooks/useCanvasUtils';
import { Design, DesignColor, DesignProduct, DesignSize, ICart } from '../model/Cart';
import styles from './index.module.scss';
import Spinner from '../components/spinner';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import AddShoppingCartIcon from '@material-ui/icons/AddShoppingCart';
import router from 'next/router';
import useLambda, { IFaunaObject } from '../hooks/useLambda';
import { Cart } from '../model/Cart';

const useStyles = makeStyles({
    root: {
        backgroundColor: 'rgb(242, 242, 242)',
        borderBottom: 'solid 1px rgb(215, 210, 209)',
        fontWeight: 500,
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    modalFooterButton: {
        marginLeft: '6px'
    }
});

export default function Home() {

    const [frontObjects, setFrontObjects] = useState<fabric.Object[]>([]);
    const [backObjects, setBackObjects] = useState<fabric.Object[]>([]);
    const [color, setColor] = useState<DesignColor>(DesignColor.white);
    const [product, setProduct] = useState<DesignProduct>(DesignProduct.tshirt);
    const [isSizeDialogOpen, setIsSizeDialogOpen] = useState<boolean>(false);
    const defaultQuantityMap = {};
    Object.keys(DesignSize).map(key => defaultQuantityMap[key] = 0);
    const [quantityMap, setQuantityMap] = useState<{ [key: string]: number }>(defaultQuantityMap);
    const canvasUtils = useCanvasUtils();
    const { cart, cartDispatcher } = useContext(CartContext);
    const classes = useStyles();
    const { execute: updateCart, isLoading: isCartUpdating } = useLambda<IFaunaObject<ICart>>();

    const onDesignChanged = useCallback((data: Partial<IDesignData>) => {
        if (data.frontObjects) {
            setFrontObjects(data.frontObjects);
        }
        if (data.backObjects) {
            setBackObjects(data.backObjects);
        }
        if (data.color) {
            setColor(data.color);
        }
        if (data.product) {
            setProduct(data.product);
        }
    }, [setFrontObjects, setBackObjects, setColor, setProduct]);

    useEffect(() => {
        const listener = (event: BeforeUnloadEvent) => {
            if (designHasData()) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', listener);

        return () => {
            window.removeEventListener('beforeunload', listener);
        };
    }, [frontObjects, backObjects]);

    function designHasData() {
        return frontObjects.length !== 0 || backObjects.length !== 0;
    }

    function onQuantityChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, size: string) {
        let quantity = Number(event.target.value);
        const newQuantityMap = Object.assign({}, quantityMap);
        if (event.target.value.length === 0) { quantity = undefined; }
        else if (quantity < 0) { quantity = 0; }
        else if (quantity > 999) { quantity = 999; }
        newQuantityMap[size] = quantity;
        setQuantityMap(newQuantityMap);
    }

    function isAddToCartEnabled() {
        // Button is enabled if any size has at least 1 quantity
        return Object.keys(quantityMap).reduce((sum, key) => sum + quantityMap[key], 0) > 0;
    }

    async function addToCart() {
        if (!designHasData()) { return; }
        const frontCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            preserveObjectStacking: true
        });
        const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            preserveObjectStacking: true
        });
        await canvasUtils.renderObjects(frontCanvas, frontObjects);
        await canvasUtils.renderObjects(backCanvas, backObjects);
        const frontImageBlob = frontCanvas.toDataURL();
        const backImageBlob = backCanvas.toDataURL();
        const originals = [];
        for (let i = 0; i < frontObjects.length; i++) {
            const object = frontObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(object.get('data') as Blob);
                originals.push(original);
            }
        }
        for (let i = 0; i < backObjects.length; i++) {
            const object = backObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(object.get('data') as Blob);
                originals.push(original);
            }
        }

        const selectedSizes = Object.keys(DesignSize).filter(size => quantityMap[size] && quantityMap[size] > 0);
        let newCart = new Cart(cart.id, cart.getItems().slice(), cart.getShipping());
        for (let i = 0; i < selectedSizes.length; i++) {
            const size = selectedSizes[i];
            const design = new Design(frontImageBlob, backImageBlob, color, DesignSize[size], product);
            newCart.addDesign(design, quantityMap[size]);
            await updateCart(`cart/${newCart.id}`, 'PUT', { cart: newCart, originals })
                .then(rawCartData => newCart = Cart.constructCartFromDatabase(newCart.id, rawCartData.data));
        }

        cartDispatcher({
            type: CartActionType.replace,
            value: newCart
        });

        router.push('/cart');
    }

    return (
        <Page>
            <header className={styles.header}>
                <h1 className={styles.heading}>Designer</h1>
            </header>
            <Customizer
                frontObjects={frontObjects}
                backObjects={backObjects}
                color={color}
                product={product}
                onDesignChanged={onDesignChanged} />
            <Divider />
            <footer className={styles.footer}>
                <Button
                    disabled={!designHasData()}
                    variant="contained"
                    color="primary"
                    startIcon={<AddShoppingCartIcon />}
                    size="large"
                    onClick={() => setIsSizeDialogOpen(true)}>
                    Add to Cart
                </Button>
            </footer>
            <Dialog
                open={isSizeDialogOpen}
                scroll='body'
                aria-labelledby="scroll-dialog-title"
                aria-describedby="scroll-dialog-description"
            >
                <DialogTitle
                    id="scroll-dialog-title"
                    disableTypography
                    classes={{ root: classes.root }}
                >
                    <Typography variant='h5' component='h2'>Size and Quantity</Typography>
                    <IconButton onClick={() => {
                        setIsSizeDialogOpen(false);
                        setQuantityMap(defaultQuantityMap);
                    }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <ul className={styles.sizeList}>
                        {
                            Object.keys(DesignSize).map(size => (
                                <li className={styles.sizeItem} key={size}>
                                    <Typography variant='h6' component='b'>
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
                                        value={quantityMap[size]}
                                        onChange={(event) => onQuantityChange(event, size)}
                                    />
                                </li>
                            ))
                        }
                    </ul>
                    <footer className={`${styles.footer} ${styles.modalFooter}`}>
                        <Button onClick={() => setIsSizeDialogOpen(false)} color="default">
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={!isAddToCartEnabled()}
                            startIcon={<CheckCircleIcon />}
                            onClick={addToCart}
                            classes={{ root: classes.modalFooterButton }}>
                            Save and Continue
                        </Button>
                    </footer>
                    <Spinner isSpinning={isCartUpdating} />
                </DialogContent>
            </Dialog>
        </Page>
    )
};