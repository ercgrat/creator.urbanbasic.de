import Page from '../components/page';
import { Button, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react';
import { CartActionType, CartContext } from '../hooks/useCart';
import { fabric } from 'fabric';
import Customizer, { CANVAS_HEIGHT, CANVAS_WIDTH, IDesignData } from '../components/customizer/customizer';
import Divider from '../components/divider';
import useCanvasUtils from '../hooks/useCanvasUtils';
import { Design, DesignColor, DesignProduct, DesignSize } from '../model/Cart';
import styles from './index.module.scss';

export default function Home() {

    let frontObjects: fabric.Object[], setFrontObjects: Dispatch<fabric.Object[]>;
    [frontObjects, setFrontObjects] = useState([]);
    let backObjects: fabric.Object[], setBackObjects: Dispatch<fabric.Object[]>;
    [backObjects, setBackObjects] = useState([]);
    let color: DesignColor, setColor: Dispatch<DesignColor>;
    [color, setColor] = useState<DesignColor>(DesignColor.white);
    let size: DesignSize, setSize: Dispatch<DesignSize>;
    [size, setSize] = useState<DesignSize>(DesignSize.m);
    let product: DesignProduct, setProduct: Dispatch<DesignProduct>;
    [product, setProduct] = useState<DesignProduct>(DesignProduct.tshirt);
    let open: boolean, setOpen: Dispatch<SetStateAction<boolean>>;
    [open, setOpen] = useState(false);
    const canvasUtils = useCanvasUtils();
    const { cartDispatcher } = useContext(CartContext);

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
        if (data.size) {
            setSize(data.size);
        }
        if (data.product) {
            setProduct(data.product);
        }
    }, [setFrontObjects, setBackObjects, setColor, setSize, setProduct]);

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

    async function addToCart() {
        if (!designHasData()) { return; }
        const frontCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT
        });
        const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT
        });
        await canvasUtils.renderObjects(frontCanvas, frontObjects);
        await canvasUtils.renderObjects(backCanvas, backObjects);
        const frontImageBlob = frontCanvas.toDataURL();
        const backImageBlob = backCanvas.toDataURL();
        cartDispatcher({
            type: CartActionType.add,
            value: new Design(frontImageBlob, backImageBlob, color, size, product)
        });

        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
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
                size={size}
                product={product}
                onDesignChanged={onDesignChanged} />
            <Divider />
            <footer className={styles.footer}>
                <Button
                    disabled={!designHasData()}
                    variant="contained"
                    color="primary"
                    startIcon={<i className="fas fa-shopping-bag" style={{ marginRight: "12px" }}></i>}
                    size="large"
                    onClick={addToCart}>
                    Add to Cart
                </Button>
            </footer>
            <Snackbar
                anchorOrigin={
                    {
                        vertical: 'top',
                        horizontal: 'center'
                    }
                }
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}>
                <Alert
                    variant="filled"
                    onClose={handleClose}
                    severity="success"
                >
                    Design added to your cart!
                </Alert>
            </Snackbar>
        </Page>
    )
};