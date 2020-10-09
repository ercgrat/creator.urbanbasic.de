import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { Dispatch, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import ColorRadioGroup from './colorRadioGroup';
import SizeRadioGroup from './sizeRadioGroup';
import ImageAdder from './imageAdder';
import PositionRadioGroup from './positionRadioGroup';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { Button, withStyles } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DesignColor, DesignSize } from '../../model/Cart';
import React from 'react';

export interface IDesignData {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    width: number;
    height: number;
    color: DesignColor;
    size: DesignSize;
}

export default React.memo(function Customizer(props: { onDesignChanged?: (data: IDesignData) => void }) {

    const frontCanvasRef = useRef(null);
    const backCanvasRef = useRef(null);
    let canvas: fabric.Canvas, setCanvas: Dispatch<fabric.Canvas>;
    [canvas, setCanvas] = useState(null);
    let frontObjects: fabric.Object[], setFrontObjects: Dispatch<fabric.Object[]>;
    [frontObjects, setFrontObjects] = useState([]);
    let backObjects: fabric.Object[], setBackObjects: Dispatch<fabric.Object[]>;
    [backObjects, setBackObjects] = useState([]);
    let selectedObject: fabric.Object, setSelectedObject: Dispatch<fabric.Object>;
    [selectedObject, setSelectedObject] = useState(null);
    let color: string, setColor: Dispatch<string>;
    [color, setColor] = useState('white');
    let size: string, setSize: Dispatch<string>;
    [size, setSize] = useState('m');
    let shirtPosition: string, setShirtPosition: Dispatch<string>;
    [shirtPosition, setShirtPosition] = useState('front');

    const canvasUtils = useCanvasUtils();

    useEffect(() => {
        /**
         * Discard and reconstruct the canvas when flipping sides.
         */
        const effectCanvas = new fabric.Canvas(`${shirtPosition}Canvas`, {
            width: getCanvasRef().current.clientWidth,
            height: getCanvasRef().current.clientHeight,
            selection: false
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
    });

    useEffect(() => {
        /**
         * Every time an object is added or removed from the canvas, or the color or size change,
         * record the current objects and emit the latest state of the design.
         */
        if (canvas) {
            setObjects(canvas.getObjects());

            if (props.onDesignChanged) {
                props.onDesignChanged({
                    frontObjects: shirtPosition === 'front' ? canvas.getObjects() : frontObjects,
                    backObjects: shirtPosition === 'front' ? backObjects : canvas.getObjects(),
                    width: getCanvasRef().current.clientWidth,
                    height: getCanvasRef().current.clientHeight,
                    color: (color as DesignColor),
                    size: (size as DesignSize)
                });
            }
        }
    }, [selectedObject, color, size]);

    function getCanvasRef() {
        return shirtPosition === 'front' ? frontCanvasRef : backCanvasRef;
    }

    function getObjects() {
        return shirtPosition === 'front' ? frontObjects : backObjects;
    }

    function setObjects(objects: fabric.Object[]) {
        if (shirtPosition === 'front') {
            setFrontObjects(objects);
        } else {
            setBackObjects(objects);
        }
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

    function changeColor(event: React.SyntheticEvent, color: string) {
        setColor(color);
    }

    function changeSize(event: React.SyntheticEvent, size: string) {
        setSize(size);
    }

    function changePosition(event: React.SyntheticEvent, position: string) {
        setShirtPosition(position);
    }

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
                <img src={`/images/${color}-${shirtPosition}.jpg`} className={styles.shirtImage}></img>
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
                <label className={styles.label}>Color</label>
                <ColorRadioGroup onChange={changeColor} />
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