import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { Dispatch, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import ColorRadioGroup from './colorRadioGroup';
import SizeRadioGroup from './sizeRadioGroup';
import ImageAdder from './imageAdder';
import PositionRadioGroup from './positionRadioGroup';
import { imageUtils } from '../../hooks/useCanvasUtils';

export default function Customizer() {

    const frontCanvasRef = useRef(null);
    const backCanvasRef = useRef(null);
    let canvas: fabric.Canvas, setCanvas: Dispatch<fabric.Canvas>;
    [canvas, setCanvas] = useState(null);
    let frontObjects: fabric.Object[], setFrontObjects: Dispatch<fabric.Object[]>;
    [frontObjects, setFrontObjects] = useState([]);
    let backObjects: fabric.Object[], setBackObjects: Dispatch<fabric.Object[]>;
    [backObjects, setBackObjects] = useState([]);
    let itemCounter: number, setItemCounter: Dispatch<number>;
    [itemCounter, setItemCounter] = useState(0);
    let selectedObject: fabric.Object, setSelectedObject: Dispatch<fabric.Object>;
    [selectedObject, setSelectedObject] = useState(null);
    let color: string, setColor: Dispatch<string>;
    [color, setColor] = useState('white');
    let size: string, setSize: Dispatch<string>;
    [size, setSize] = useState('m');
    let shirtPosition: string, setShirtPosition: Dispatch<string>;
    [shirtPosition, setShirtPosition] = useState('front');
    
    const canvasUtils = imageUtils();

    useEffect(() => {
        const effectCanvas = new fabric.Canvas(`${shirtPosition}Canvas`, {
            width: getCanvasRef().current.clientWidth,
            height: getCanvasRef().current.clientHeight
        });

        getObjects().forEach(async (object) => {
            if (object.isType('image')) {
                const image = await canvasUtils.addImage(object.get('data') as Blob);
                const imageObject = object as fabric.Image;
                imageObject.setElement(image);
                effectCanvas.add(imageObject);
            } else {
                effectCanvas.add(object);
            }
        });
        effectCanvas.renderAll();

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
                setObjects(effectCanvas.getObjects());
                effectCanvas.dispose();
            }
        };
    }, [shirtPosition]);

    useEffect(() => {
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Delete') {
                deleteSelectedObject();
            }
        };
        document.addEventListener('keydown', listener);

        return () => {
            document.removeEventListener('keydown', listener);
        }
    });

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
            </div>
        </div>
    );
}