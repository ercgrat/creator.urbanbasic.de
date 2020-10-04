import { Button, FormControl, InputLabel, Select, MenuItem, TextField, makeStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fabric } from 'fabric';
import { useRef, useEffect, useState } from 'react';
import { ColorResult } from 'react-color';
import ColorSelect from './colorSelect';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import styles from './textConfiguration.module.scss';

const useStyles = makeStyles({
    withMargin: {
        margin: '6px 6px 6px 0px'
    }
});

export default function TextConfiguration({ canvas, selectedObject }) {
    const textRef = useRef(null);
    const [fontColor, setFontColor] = useState('black');
    const [textAlign, setTextAlign] = useState('left');

    useEffect(() => {
        if (selectedObject) {
            switch (selectedObject.type) {
                case 'text':
                    const obj = selectedObject as fabric.Text;
                    setCustomTextareas(obj.get('text'));
                    let color = obj.get('fill') as string;
                    color = (!color || color === 'rgb(0,0,0)') ? 'black' : color;
                    setFontColor(color);
                    setTextAlign(obj.get('textAlign'));
                    break;
            }
        }

        setTimeout(() => {
            if (textRef.current) {
                (textRef.current as HTMLElement).getElementsByTagName('textarea')[0].focus()
            }
        }, 0);
    }, [selectedObject]);

    function addText(value: string = '') {
        setCustomTextareas(value);
        addTextObject(value);
    }

    function addTextObject(value: string = '') {
        const textObject = new fabric.Text(value, {
            transparentCorners: false,
            fontSize: 20,
            fontFamily: 'Fira Sans'
        });

        canvas.centerObject(textObject);
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
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('text', value);
            canvas.renderAll();
        }
    }

    function alignChanged(event) {
        const value = event.target.value;
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('textAlign', value);
            canvas.renderAll();
        }
        setTextAlign(value);
    }

    function colorChanged(pickerResults: ColorResult) {
        const value = pickerResults.hex;
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('fill', value);
            canvas.renderAll();
        }
        setFontColor(value);
    }

    const muiStyles = useStyles();

    return (
        <section>
            <Button color="secondary" startIcon={<AddIcon />} variant="outlined"
                onClick={() => addText()}>Add text</Button>
            {
                selectedObject && selectedObject.isType('text') ?
                    <section>
                        <div className={styles.textConfiguration}>
                            <FormControl
                                variant="outlined"
                                size="small"
                                classes={{ root: muiStyles.withMargin }}>
                                <InputLabel>Font</InputLabel>
                                <Select
                                    value="Fira Sans"
                                    label="Font"
                                >
                                    <MenuItem value="Fira Sans">Fira Sans</MenuItem>
                                </Select>
                            </FormControl>
                            <ColorSelect
                                selectedColor={fontColor}
                                onChange={colorChanged}
                                classes={{ root: muiStyles.withMargin }} />
                            <FormControl
                                variant="outlined"
                                size="small"
                                classes={{ root: muiStyles.withMargin }}>
                                <InputLabel>Align</InputLabel>
                                <Select defaultValue="left"
                                    value={textAlign}
                                    onChange={alignChanged}
                                    style={{ fontSize: '15px' }}
                                    label="Align">
                                    <MenuItem value="left"><FormatAlignLeftIcon fontSize="inherit" /></MenuItem>
                                    <MenuItem value="center"><FormatAlignCenterIcon fontSize="inherit" /></MenuItem>
                                    <MenuItem value="right"><FormatAlignRightIcon fontSize="inherit" /></MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <TextField
                            ref={textRef}
                            placeholder="Enter text here"
                            variant="outlined"
                            multiline
                            onChange={textChanged}
                            fullWidth />
                    </section> :
                    null
            }
        </section>
    );
}