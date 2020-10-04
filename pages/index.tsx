import Page from '../components/page';
import { Divider, Button, makeStyles } from '@material-ui/core';
import { Dispatch, useContext, useState } from 'react';
import { CartActionType, CartContext } from '../hooks/useCart';
import { fabric } from 'fabric';
import Customizer from '../components/customizer/customizer';
import { IDesignData } from '../components/customizer/customizer';
import useCanvasUtils from '../hooks/useCanvasUtils';
import { Design } from '../model/Cart';

const useStyles = makeStyles({
    divider: {
        margin: '0 -24px'
    },
    footer: {
        margin: '0px -24px -24px -24px',
        padding: '12px 24px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'row-reverse'
    }
});

export default function Home() {

    const styles = useStyles();
    let designData: IDesignData, setDesignData: Dispatch<IDesignData>;
    [designData, setDesignData]= useState(null);
    const canvasUtils = useCanvasUtils();
    const { cart, cartDispatcher } = useContext(CartContext);

    function onDesignChanged(data: IDesignData) {
        setDesignData(data);
    }

    async function addToCart() {
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
            <Customizer onDesignChanged={onDesignChanged} />
            <Divider className={styles.divider} />
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