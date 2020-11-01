import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import ColorRadioGroup from './colorRadioGroup';
import SizeRadioGroup from './sizeRadioGroup';
import ImageAdder from './imageAdder';
import PositionRadioGroup from './positionRadioGroup';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { Button, withStyles } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DesignColor, DesignSize, DesignProduct, ColorMap } from '../../model/Cart';
import ShirtUnderlay from '../shirtUnderlay';
import React from 'react';
import ProductSelect from './productSelect';

export interface IDesignData {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;
}

export const CANVAS_WIDTH = 168;
export const CANVAS_HEIGHT = 252;

export default React.memo(function Customizer(props: {
    frontObjects: fabric.Object[],
    backObjects: fabric.Object[],
    color: DesignColor,
    size: DesignSize,
    product: DesignProduct,
    onDesignChanged?: (data: Partial<IDesignData>) => void
}) {

    const frontCanvasRef = useRef(null);
    const backCanvasRef = useRef(null);
    let canvas: fabric.Canvas, setCanvas: Dispatch<fabric.Canvas>;
    [canvas, setCanvas] = useState(null);
    let selectedObject: fabric.Object, setSelectedObject: Dispatch<fabric.Object>;
    [selectedObject, setSelectedObject] = useState(null);
    let shirtPosition: string, setShirtPosition: Dispatch<string>;
    [shirtPosition, setShirtPosition] = useState('front');
    let hoveredColor: DesignColor, setHoveredColor: Dispatch<DesignColor>;
    [hoveredColor, setHoveredColor] = useState<DesignColor>(null);

    const canvasUtils = useCanvasUtils();

    useEffect(() => {
        /**
         * Discard and reconstruct the canvas when flipping sides.
         */
        const effectCanvas = new fabric.Canvas(`${shirtPosition}Canvas`, {
            width: getCanvasRef().current.clientWidth,
            height: getCanvasRef().current.clientHeight,
            selection: false,
            preserveObjectStacking: true
        });

        (async () => {
            await canvasUtils.renderObjects(effectCanvas, getObjects());
            effectCanvas.renderAll();
        })();

        effectCanvas.on('selection:cleared', () => {
            removeUnusedObjects(effectCanvas);
            setSelectedObject(null);
        });
        effectCanvas.on('selection:created', (event) => {
            setSelectedObject(event.target);
        });
        effectCanvas.on('selection:updated', (event) => {
            setSelectedObject(event.target);
        });

        setCanvas(effectCanvas);
        setSelectedObject(null);

        return () => {
            if (effectCanvas) {
                removeUnusedObjects(effectCanvas);
                effectCanvas.dispose();
            }
        };
    }, [shirtPosition]);

    useEffect(() => {
        /**
         * Delete the currently selected canvas object whenever the delete key is pressed in the application.
         */
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Delete') {
                deleteSelectedObject();
            }
        };
        window.addEventListener('keydown', listener);

        return () => {
            window.removeEventListener('keydown', listener);
        }
    }, [selectedObject, setSelectedObject]);

    useEffect(() => {
        /**
         * Every time an object is added or removed from the canvas, or the color or size change,
         * record the current objects and emit the latest state of the design.
         */
        if (canvas) {
            setObjects(canvas.getObjects());

            if (props.onDesignChanged) {
                props.onDesignChanged({
                    frontObjects: shirtPosition === 'front' ? canvas.getObjects() : props.frontObjects,
                    backObjects: shirtPosition === 'front' ? props.backObjects : canvas.getObjects()
                });
            }
        }
    }, [selectedObject]);

    function getCanvasRef() {
        return shirtPosition === 'front' ? frontCanvasRef : backCanvasRef;
    }

    function getObjects() {
        return shirtPosition === 'front' ? props.frontObjects : props.backObjects;
    }

    function setObjects(objects: fabric.Object[]) {
        const currentData = {} as Partial<IDesignData>;
        if (shirtPosition === 'front') {
            currentData.frontObjects = objects;
        } else {
            currentData.backObjects = objects;
        }
        props.onDesignChanged(currentData);
    }

    function removeUnusedObjects(canvas) {
        canvas.forEachObject(obj => {
            switch (obj.type) {
                case 'text':
                    let textObj = obj as fabric.Text;
                    if (!textObj.text || textObj.text.length === 0) {
                        canvas.remove(textObj);
                    }
                    break;
            }
        });
    }

    function deleteSelectedObject() {
        if (selectedObject) {
            canvas.remove(selectedObject);
            setSelectedObject(null);
        }
    }

    const changeProduct = useCallback((event: React.SyntheticEvent, product: string) => {
        props.onDesignChanged({
            product: DesignProduct[product]
        });
    }, [props.product]);

    const changeColor = useCallback((event: React.SyntheticEvent, color: string) => {
        props.onDesignChanged({
            color: DesignColor[color]
        });
    }, [props.color, canvas, frontCanvasRef, backCanvasRef]);

    const changeHoveredColor = useCallback((color: DesignColor, active: boolean) => {
        if (active) {
            setHoveredColor(DesignColor[color]);
        } else {
            setHoveredColor(null);
        }
    }, [setHoveredColor]);

    const changeSize = useCallback((event: React.SyntheticEvent, size: string) => {
        props.onDesignChanged({
            size: DesignSize[size]
        });
    }, [props.size, canvas, frontCanvasRef, backCanvasRef]);

    const changePosition = useCallback((event: React.SyntheticEvent, position: string) => {
        setShirtPosition(position);
    }, [setShirtPosition]);

    const DeleteButton = withStyles({
        root: {
            marginTop: '24px',
            borderColor: '#f44336',
            color: '#f44336'
        }
    })(Button);

    return (
        <div className={styles.container}>
            <div className={styles.editor}>

                <ShirtUnderlay className={styles.shirtImage} shirtPosition={shirtPosition} color={ColorMap[hoveredColor || props.color].color} />
                {
                    shirtPosition === 'front' ?
                        <div className={styles.canvasContainer} ref={frontCanvasRef}>
                            <canvas id="frontCanvas" className={styles.canvas}></canvas>
                        </div> :
                        <div className={styles.canvasContainer} ref={backCanvasRef}>
                            <canvas id="backCanvas" className={styles.canvas}></canvas>
                        </div>
                }
                <PositionRadioGroup onChange={changePosition} />
            </div>
            <div className={styles.settings}>
                <label className={styles.label}>Product</label>
                <ProductSelect onChange={changeProduct}></ProductSelect>
                <label className={styles.label}>Color</label>
                <ColorRadioGroup onChange={changeColor} onHover={changeHoveredColor} />
                <label className={styles.label}>Size</label>
                <SizeRadioGroup onChange={changeSize} />
                <label className={styles.label}>Text</label>
                <TextConfiguration canvas={canvas} selectedObject={selectedObject} />
                <label className={styles.label}>Image</label>
                <ImageAdder canvas={canvas} />
                {
                    selectedObject && <section>
                        <DeleteButton
                            startIcon={<DeleteForeverIcon />}
                            variant='outlined'
                            onClick={deleteSelectedObject}>
                            Delete Selection
                            </DeleteButton>
                    </section>
                }
            </div>
        </div>
    );
});