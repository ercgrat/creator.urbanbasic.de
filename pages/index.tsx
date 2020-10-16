import Page from '../components/page';
import { Button } from '@material-ui/core';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { CartActionType, CartContext } from '../hooks/useCart';
import { fabric } from 'fabric';
import Customizer, { CANVAS_HEIGHT, CANVAS_WIDTH, IDesignData } from '../components/customizer/customizer';
import Divider from '../components/divider';
import useCanvasUtils from '../hooks/useCanvasUtils';
import { Design, DesignColor, DesignProduct, DesignSize } from '../model/Cart';
import styles from './index.module.scss';
import useToastState from '../hooks/useToastState';
import Toast from '../components/toast';

export default function Home() {

    const [frontObjects, setFrontObjects] = useState<fabric.Object[]>([]);
    const [backObjects, setBackObjects] = useState<fabric.Object[]>([]);
    const [color, setColor] = useState<DesignColor>(DesignColor.white);
    const [size, setSize] = useState<DesignSize>(DesignSize.m);
    const [product, setProduct] = useState<DesignProduct>(DesignProduct.tshirt);
    const [isToastOpen, openToast, closeToast] = useToastState();
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
        for(let i = 0; i < frontObjects.length; i++) {
            const object = frontObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(object.get('data') as Blob);
                originals.push(original);
            }
        }
        for(let i = 0; i < backObjects.length; i++) {
            const object = backObjects[i];
            if (object.isType('image')) {
                const original = await canvasUtils.readImage(object.get('data') as Blob);
                originals.push(original);
            }
        }
        cartDispatcher({
            type: CartActionType.add,
            value: [new Design(frontImageBlob, backImageBlob, color, size, product), originals]
        });

        openToast();
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
            <Toast
                isToastOpen={isToastOpen}
                onClose={closeToast}
                severity='success'
                >
                Design added to your cart!
            </Toast>
        </Page>
    )
};