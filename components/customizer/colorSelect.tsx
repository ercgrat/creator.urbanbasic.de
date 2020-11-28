import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    makeStyles,
    FormControlClassKey,
} from '@material-ui/core';
import { useEffect, useState, useRef } from 'react';
import { ColorChangeHandler, ChromePicker } from 'react-color';
import OutsideClickDetector from './outsideClickDetector';
import styles from './colorSelect.module.scss';

const useStyles = makeStyles({
    root: {
        display: 'none',
        pointerEvents: 'none',
    },
});

type Props = {
    selectedColor: string;
    onChange: ColorChangeHandler;
    classes: Partial<Record<FormControlClassKey, string>>;
};
const ColorSelect: React.FC<Props> = (props) => {
    const classes = useStyles();
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>();

    useEffect(() => {
        if (!isOpen) {
            const popoverRootList = document.getElementsByClassName(
                'MuiPopover-root'
            );
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
        <FormControl variant="outlined" size="small" classes={props.classes}>
            <InputLabel>Color</InputLabel>
            <Select
                className={styles.colorSelect}
                value={props.selectedColor}
                MenuProps={{
                    classes: { paper: classes.root },
                    PopoverClasses: { root: classes.root },
                }}
                onOpen={openPicker}
                onClose={() => {
                    'Do nothing here to prevent the select from closing';
                }}
                label="Color"
            >
                {
                    <MenuItem value={props.selectedColor}>
                        <div
                            style={{
                                backgroundColor: props.selectedColor,
                                width: '19px',
                                height: '19px',
                            }}
                        ></div>
                    </MenuItem>
                }
            </Select>
            <OutsideClickDetector
                className={`${styles.colorPickerContainer} ${
                    isOpen ? styles.open : ''
                }`}
                onOutsideClick={closePicker}
                disabled={!isOpen}
                innerRef={pickerRef as React.RefObject<HTMLDivElement>}
            >
                <ChromePicker
                    disableAlpha
                    color={props.selectedColor}
                    onChange={props.onChange}
                />
            </OutsideClickDetector>
        </FormControl>
    );
};

export default ColorSelect;
