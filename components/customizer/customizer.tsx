import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { Dispatch, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import { CustomizerItem, CustomizerItemType } from '../../model/Customizer';
import ColorRadioGroup from './colorRadioGroup';

const PX_PER_CM = 38; // Approximately, it's actually 37.795275591

export default function Customizer() {

    const canvasRef = useRef(null);
    let canvas: fabric.Canvas, setCanvas: Dispatch<fabric.Canvas>;
    [canvas, setCanvas] = useState(null);
    let items: CustomizerItem[], setItems: Dispatch<CustomizerItem[]>;
    [items, setItems] = useState([]);
    let itemCounter: number, setItemCounter: Dispatch<number>;
    [itemCounter, setItemCounter] = useState(0);
    let selectedObject: fabric.Object, setSelectedObject: Dispatch<fabric.Object>;
    [selectedObject, setSelectedObject] = useState(null);
    let color: string, setColor: Dispatch<string>;
    [color, setColor] = useState('white');
    let shirtPosition: string, setShirtPosition: Dispatch<string>;
    [shirtPosition, setShirtPosition] = useState('front');

    useEffect(() => {
        const effectCanvas = new fabric.Canvas('canvas', {
            width: canvasRef.current.clientWidth,
            height: canvasRef.current.clientHeight
        });
        setCanvas(effectCanvas);

        items.forEach((item: CustomizerItem) => {
            switch (item.type) {
                case CustomizerItemType.text:
                    addObject(CustomizerItemType.text, item.value);
                    break;
            }
        });

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

        return () => {
            canvas && canvas.off();
        };
    }, [canvasRef]);

    function addObject(type: CustomizerItemType, value: any) {
        const item = new CustomizerItem(itemCounter, type, value);
        const newItems = items.slice();
        newItems.push(item);
        setItemCounter(itemCounter + 1);
        setItems(newItems);
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

    function changeColor(event: React.SyntheticEvent, color: string) {
        setColor(color);
    }

    return (
        <div className={styles.container}>
            <div className={styles.editor}>
                <img src={`/images/${color}-${shirtPosition}.jpg`} className={styles.shirtImage}></img>
                <div className={styles.canvasContainer} ref={canvasRef}>
                    <canvas id="canvas" className={styles.canvas}></canvas>
                </div>
            </div>
            <div className={styles.settings}>
                <label className={styles.label}>Color</label>
                <ColorRadioGroup onChange={changeColor} />
                <label className={styles.label}>Text</label>
                <TextConfiguration config={{ canvas, canvasRef, selectedObject, addObject }} />
            </div>
        </div>
    );
}