import { Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fabric } from 'fabric';
import { useRef, useEffect } from 'react';
import { CustomizerItemType, ICustomizerConfigProps } from '../model/Customizer';
import styles from './textConfiguration.module.scss';

export default function TextConfiguration(props: { config: ICustomizerConfigProps }) {
    const { canvas, canvasRef, selectedObject, addObject } = props.config;
    const textRef = useRef(null);
    
    useEffect(() => {
        if (selectedObject) {
            switch (selectedObject.type) {
                case 'text':
                    const obj = selectedObject as fabric.Text;
                    setCustomTextareas(obj.get('text'));
                    break;
            }
        }
    }, [selectedObject]);

    function addText(value: string = '') {
        const textObject = new fabric.Text(value, {
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

        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        canvas.renderAll();

        addObject(CustomizerItemType.text, value);
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
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('text', value);
            canvas.renderAll();
        }
    }

    return (
        <section>
            <Button color="secondary" startIcon={<AddIcon />} variant="outlined"
                onClick={() => addText()}>Add text</Button>
            {
                selectedObject && selectedObject.isType('text') ?
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
        </section>
    );
}