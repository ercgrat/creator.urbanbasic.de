import Page from '../components/page';
import { Button } from '@material-ui/core';
import { Dispatch, useCallback, useContext, useState } from 'react';
import { CartActionType, CartContext } from '../hooks/useCart';
import { fabric } from 'fabric';
import Customizer from '../components/customizer/customizer';
import Divider from '../components/divider';
import { IDesignData } from '../components/customizer/customizer';
import useCanvasUtils from '../hooks/useCanvasUtils';
import { Design } from '../model/Cart';
import ClearIcon from '@material-ui/icons/Clear';
import styles from './index.module.scss';

export default function Home() {

    let designData: IDesignData, setDesignData: Dispatch<IDesignData>;
    [designData, setDesignData] = useState(null);
    const canvasUtils = useCanvasUtils();
    const { cartDispatcher } = useContext(CartContext);

    const onDesignChanged = useCallback((data: IDesignData) => {
        setDesignData(data);
    }, [setDesignData]);

    async function addToCart() {
        if (!designData) { return; }
        const frontCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: designData.width,
            height: designData.height
        });
        const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: designData.width,
            height: designData.height
        });
        await canvasUtils.renderObjects(frontCanvas, designData.frontObjects);
        await canvasUtils.renderObjects(backCanvas, designData.backObjects);
        const frontImageBlob = frontCanvas.toDataURL();
        const backImageBlob = backCanvas.toDataURL();
        cartDispatcher({
            type: CartActionType.add,
            value: new Design(frontImageBlob, backImageBlob, designData.color, designData.size)
        });
    }

    return (
        <Page>
            <header className={styles.header}>
                <h1 className={styles.heading}>Designer</h1>
                <Button startIcon={<ClearIcon />} size="medium">Clear Design</Button>
            </header>
            <Customizer onDesignChanged={onDesignChanged} />
            <Divider />
            <footer className={styles.footer}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<i className="fas fa-shopping-bag" style={{ marginRight: "12px" }}></i>}
                    size="large"
                    onClick={addToCart}>
                    Add to Cart
                </Button>
            </footer>
        </Page>
    )
};