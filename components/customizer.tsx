import styles from './customizer.module.scss';
import { Button, TextField, FormControl, Select, InputLabel, MenuItem } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fabric } from 'fabric';
import { Dispatch, useEffect, useRef, useState } from 'react';

enum ItemType {
    text,
    image
}

class Item {
    id: number;
    type: ItemType;
    value: string;

    constructor(id: number, type: ItemType, value: string) {
        this.id = id;
        this.type = type;
        this.value = value;
    }
}

export default function Customizer() {

    const canvasRef = useRef(null);
    const textRef = useRef(null);
    let canvas: fabric.Canvas, setCanvas: Dispatch<fabric.Canvas>;
    [canvas, setCanvas] = useState(null);
    const [items, setItems] = useState([]);
    const [itemCounter, setItemCounter] = useState(0);
    let currentObject: fabric.Object, setCurrentObject: Dispatch<fabric.Object>;
    [currentObject, setCurrentObject] = useState(null);

    useEffect(() => {
        const effectCanvas = new fabric.Canvas('canvas', {
            width: canvasRef.current.clientWidth,
            height: canvasRef.current.clientHeight
        });
        setCanvas(effectCanvas);
        items.forEach((item: Item) => {
            switch (item.type) {
                case ItemType.text:
                    addText(item.value);
                    break;
            }
        });
        effectCanvas.on('selection:cleared', () => {
            removeUnusedObjects(effectCanvas);
            setCurrentObject(null);
        });
        effectCanvas.on('selection:created', (event) => {
            setCurrentObject(event.target);
        });
        effectCanvas.on('selection:updated', (event) => {
            removeUnusedObjects(effectCanvas);
            setCurrentObject(event.target);
        });
    }, [canvasRef]);

    useEffect(() => {
        if (currentObject) {
            switch (currentObject.type) {
                case 'text':
                    const obj = currentObject as fabric.Text;
                    setCustomTextareas(obj.get('text'));
                    break;
            }
        }
    }, [currentObject]);

    function addText(value?: string) {
        const id = itemCounter;
        const item = new Item(id, ItemType.text, value || '');
        const newItems = items.slice();
        newItems.push(item);

        const textObject = new fabric.Text(value || '', {
            data: id,
            left: canvasRef.current.clientWidth / 2,
            top: canvasRef.current.clientHeight / 2,
            transparentCorners: false,
            fontSize: 20,
            fontFamily: 'Fira Sans'
        });
        textObject.setControlsVisibility({
            bl: false, br: false, mb: false, ml: false, mr: false, mt: false, tl: false, tr: false
        });
        
        setCustomTextareas(value);
        setItemCounter(itemCounter + 1);
        setItems(newItems);

        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        canvas.renderAll();
    }

    function setCustomTextareas(value) {
        if (textRef.current) {
            const textareas = (textRef.current as HTMLElement).getElementsByTagName('textarea');
            for (let i = 0; i < textareas.length; i++) {
                textareas[i].value = value;
            }
        }
    }

    function textChanged(event) {
        const value = event.target.value;
        if (currentObject) {
            const obj = currentObject as fabric.Text;
            obj.set('text', value);
            canvas.renderAll();
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

    return (
        <div className={styles.container}>
            <div className={styles.editor}>
                <img src="/images/white-front.jpg" className={styles.shirtImage}></img>
                <div className={styles.canvasContainer} ref={canvasRef}>
                    <canvas id="canvas" className={styles.canvas}></canvas>
                </div>
            </div>
            <div className={styles.settings}>
                <label className={styles.label}>Text</label>
                <Button color="primary" startIcon={<AddIcon />} variant="outlined"
                    onClick={() => addText()}>Add text</Button>
                {
                    currentObject && currentObject.isType('text') ?
                        <section>
                            <div className={styles.textConfiguration}>
                                <FormControl variant="outlined" className={styles.formControl} size="small">
                                    <InputLabel id="font-select">Font</InputLabel>
                                    <Select
                                        labelId="font-select"
                                        value="Fira Sans"
                                    >
                                        <MenuItem value="Fira Sans">Fira Sans</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <TextField ref={textRef} placeholder="Enter text here" variant="outlined" multiline onChange={textChanged} />
                        </section> :
                        null
                }
            </div>
        </div>
    );
}