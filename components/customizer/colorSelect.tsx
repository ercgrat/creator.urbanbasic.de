import { FormControl, InputLabel, Select, MenuItem, makeStyles, FormControlClassKey } from '@material-ui/core';
import { useEffect, useState, useRef } from 'react';
import { ColorChangeHandler, ChromePicker } from 'react-color';
import OutsideClickDetector from './outsideClickDetector';
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
    const formRef = useRef();
    const pickerRef = useRef();

    useEffect(() => {
        const resizeListener = () => {
            /** If the window is narrow, shift the picker over so that it fits within the window. */
            if (formRef.current && pickerRef.current) {
                const formRect = (formRef.current as HTMLElement).getBoundingClientRect();
                const picker = pickerRef.current as HTMLElement;
                const adjustedLeft = ((window.innerWidth - picker.clientWidth) - formRect.left) - 24;
                picker.style.left = `${Math.min(0, adjustedLeft)}px`;
            }
        };
        window.addEventListener('resize', resizeListener);

        return () => {
            window.removeEventListener('resize', resizeListener);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            const popoverRootList = document.getElementsByClassName('MuiPopover-root');
            if (popoverRootList.length > 0) {
                // Programmatically click the accessibility popover that opens when you expand a MUI Select control
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
        <FormControl variant="outlined" size="small" classes={props.classes} innerRef={formRef}>
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
                disabled={!isOpen}
                innerRef={pickerRef}>
                <ChromePicker
                    disableAlpha
                    color={props.selectedColor}
                    onChange={props.onChange}
                />
            </OutsideClickDetector>
        </FormControl>
    );
}