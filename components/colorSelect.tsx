import { FormControl, InputLabel, Select, MenuItem, makeStyles, FormControlClassKey } from '@material-ui/core';
import { useEffect, useRef, useState } from 'react';
import { ColorChangeHandler, SketchPicker, ChromePicker } from 'react-color';
import OutsideClickDetector from './blurDetector';
import styles from './colorSelect.module.scss';

const useStyles = makeStyles({
    root: {
        display: 'none',
        pointerEvents: 'none'
    }
});

export default function ColorSelect(props: { selectedColor: string, onChange: ColorChangeHandler, classes: Partial<Record<FormControlClassKey, string>> }) {

    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            const popoverRootList = document.getElementsByClassName('MuiPopover-root');
            if (popoverRootList.length > 0) {
                (popoverRootList[0].firstElementChild as HTMLElement).click();
            }
        }
    }, [isOpen]);

    function openPicker() {
        setIsOpen(true);
    }

    function closePicker() {
        setIsOpen(false);
    }

    return (
        <FormControl variant="outlined" size="small" classes={props.classes}>
            <InputLabel>Color</InputLabel>
            <Select
                className={styles.colorSelect}
                value={props.selectedColor}
                MenuProps={{ classes: { paper: classes.root }, PopoverClasses: { root: classes.root } }}
                onOpen={openPicker}
                onClose={() => { }}
                label="Color"
            >
                {
                    <MenuItem value={props.selectedColor}>
                        <div style={{ backgroundColor: props.selectedColor, width: '19px', height: '19px' }}></div>
                    </MenuItem>
                }
            </Select>
            <OutsideClickDetector
                className={`${styles.colorPickerContainer} ${isOpen ? styles.open : ''}`}
                onOutsideClick={closePicker}
                disabled={!isOpen}>
                <ChromePicker
                    disableAlpha
                    color={props.selectedColor}
                    onChange={props.onChange}
                />
            </OutsideClickDetector>
        </FormControl>
    );
}