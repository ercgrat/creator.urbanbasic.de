import {
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    makeStyles,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { fabric } from 'fabric';
import { useRef, useEffect, useState } from 'react';
import { ColorResult } from 'react-color';
import ColorSelect from './colorSelect';
import FormatAlignLeftIcon from '@material-ui/icons/FormatAlignLeft';
import FormatAlignCenterIcon from '@material-ui/icons/FormatAlignCenter';
import FormatAlignRightIcon from '@material-ui/icons/FormatAlignRight';
import styles from './textConfiguration.module.scss';
import React from 'react';

const useStyles = makeStyles({
    fontSelect: {
        flexGrow: 1,
        margin: '6px 6px 6px 0px',
    },
    colorSelect: {
        margin: '6px 6px 6px 0px',
    },
    alignSelect: {
        margin: '6px 0px',
    },
});

const useFonts = (font: string) => {
    return makeStyles({
        selectRoot: {
            fontFamily: `'${font}'`,
            height: '19px',
        },
        itemRoot: {
            fontFamily: `'${font}'`,
        },
    });
};

const fonts = [
    'Agent Orange',
    'Black Casper',
    'Capture It',
    'Capture It 2',
    'Chunk Five',
    'Chunk Five Print',
    'DejaVu Serif',
    'Digital Dream',
    'Eraser',
    'Finger Paint',
    'Fipps',
    'Fira Sans',
    'Graduate',
    'Hamburger',
    'HVD Peace',
    'Impact',
    'League Gothic',
    'Londrina Sketch',
    'Luckiest Guy',
    'Megrim',
    'Pacifico',
    'Quicksand',
    'SF Distant Galaxy Alternate',
    'SF Distant Galaxy Alt Outline',
    'Shrikhand',
];

export default React.memo(function TextConfiguration(props: {
    canvas: fabric.Canvas;
    selectedObject?: fabric.Object;
}) {
    const { canvas, selectedObject } = props;
    const textRef = useRef<HTMLDivElement>(null);
    const [font, setFont] = useState('Fira Sans');
    const [fontColor, setFontColor] = useState('black');
    const [textAlign, setTextAlign] = useState('left');

    const itemStyles = new Map<
        string,
        Record<'selectRoot' | 'itemRoot', string>
    >();
    for (let i = 0; i < fonts.length; i++) {
        const font = fonts[i];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        itemStyles.set(font, useFonts(font)());
    }

    useEffect(() => {
        if (selectedObject) {
            switch (selectedObject.type) {
                case 'text':
                    {
                        const obj = selectedObject as fabric.Text;
                        setCustomTextareas(obj.get('text') ?? '');
                        setFont(obj.get('fontFamily') ?? 'inherit');
                        let color = obj.get('fill') as string;
                        color =
                            !color || color === 'rgb(0,0,0)' ? 'black' : color;
                        setFontColor(color);
                        setTextAlign(obj.get('textAlign') ?? 'left');
                    }
                    break;
            }
        }

        setTimeout(() => {
            if (textRef.current) {
                (textRef.current as HTMLElement)
                    .getElementsByTagName('textarea')[0]
                    .focus();
            }
        }, 0);
    }, [selectedObject]);

    function addText(value = '') {
        setCustomTextareas(value);
        addTextObject(value);
    }

    function addTextObject(value = '') {
        const textObject = new fabric.Text(value, {
            transparentCorners: false,
            fontSize: 20,
            fontFamily: 'Fira Sans',
        });

        canvas.centerObject(textObject);
        canvas.add(textObject);
        canvas.setActiveObject(textObject);
        canvas.renderAll();
    }

    function setCustomTextareas(value: string) {
        if (textRef.current) {
            const textareas = (textRef.current as HTMLElement).getElementsByTagName(
                'textarea'
            );
            for (let i = 0; i < textareas.length; i++) {
                textareas[i].value = value;
            }
        }
    }

    function textChanged(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const value = event.target.value;
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('text', value);
            canvas.renderAll();
        }
    }

    function fontChanged(
        event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
    ) {
        const value = event.target.value as string;
        if (selectedObject) {
            const obj = selectedObject as fabric.Text;
            obj.set('fontFamily', value);
            canvas.renderAll();
        }
        setFont(value);
    }

    function alignChanged(
        event: React.ChangeEvent<{ name?: string | undefined; value: unknown }>
    ) {
        const value = event.target.value as string;
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
            <Button
                color="secondary"
                startIcon={<AddIcon />}
                variant="outlined"
                onClick={() => addText()}
            >
                TEXT HINZUFÜGEN
            </Button>
            {selectedObject && selectedObject.isType('text') ? (
                <section>
                    <div className={styles.textConfiguration}>
                        <FormControl
                            variant="outlined"
                            size="small"
                            classes={{ root: muiStyles.fontSelect }}
                        >
                            <InputLabel>Stil</InputLabel>
                            <Select
                                value={font}
                                label="Stil"
                                onChange={fontChanged}
                                classes={{
                                    root: itemStyles.get(font)?.selectRoot,
                                }}
                            >
                                {fonts.map((font) => (
                                    <MenuItem
                                        key={font}
                                        value={font}
                                        classes={{
                                            root: itemStyles.get(font)
                                                ?.itemRoot,
                                        }}
                                    >
                                        {font}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <ColorSelect
                            selectedColor={fontColor}
                            onChange={colorChanged}
                            classes={{ root: muiStyles.colorSelect }}
                        />
                        <FormControl
                            variant="outlined"
                            size="small"
                            classes={{ root: muiStyles.alignSelect }}
                        >
                            <InputLabel>Satz</InputLabel>
                            <Select
                                defaultValue="left"
                                value={textAlign}
                                onChange={alignChanged}
                                style={{ fontSize: '15px' }}
                                label="Satz"
                            >
                                <MenuItem value="left">
                                    <FormatAlignLeftIcon fontSize="inherit" />
                                </MenuItem>
                                <MenuItem value="center">
                                    <FormatAlignCenterIcon fontSize="inherit" />
                                </MenuItem>
                                <MenuItem value="right">
                                    <FormatAlignRightIcon fontSize="inherit" />
                                </MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <TextField
                        ref={textRef}
                        placeholder="Text bitte hier eingeben"
                        variant="outlined"
                        multiline
                        onChange={textChanged}
                        fullWidth
                    />
                </section>
            ) : null}
        </section>
    );
});
