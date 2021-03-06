import { FormControl, RadioGroup, Radio, makeStyles } from '@material-ui/core';
import React from 'react';
import { DesignColor, ColorMap } from '../../model/Cart';
import Tooltip from '../tooltip';

const useRadioGroupStyles = makeStyles({
    radioGroup: {
        display: 'flex',
        flexDirection: 'row',
    },
});

const useRadioStyles = function (color: DesignColor) {
    const icon = {
        border: 'none',
        borderRadius: '50%',
        width: 33,
        height: 33,
        backgroundColor: ColorMap[color].color,
        margin: '6px',
        'input:hover ~ &': {
            boxShadow: '0px 0px 0px 3px rgba(116,182,199,0.3)',
        },
    };

    if (color === 'white') {
        icon.border = 'solid 2px rgb(0,0,0,0.3)';
    }

    return makeStyles({
        root: {
            padding: '0px',
            backgroundColor: 'transparent',
        },
        rootSelected: {
            backgroundColor: 'transparent',
        },
        icon,
        checkedIcon: Object.assign(
            { ...icon },
            {
                border: 'none',
                boxShadow: '0px 0px 0px 3px rgb(116,182,199)',
                'input:hover ~ &': {
                    boxShadow: '0px 0px 0px 3px rgb(116,182,199)',
                },
            }
        ),
    })();
};

function ColorRadio(props: {
    color: DesignColor;
    onHover?: (color: DesignColor, active: boolean) => void;
}) {
    const classes = useRadioStyles(props.color);

    return (
        <Tooltip title={ColorMap[props.color].name} placement="top">
            <Radio
                onMouseEnter={() => props.onHover?.(props.color, true)}
                onMouseLeave={() => props.onHover?.(props.color, false)}
                value={props.color}
                classes={{ root: classes.root, checked: classes.rootSelected }}
                icon={<span className={classes.icon} />}
                checkedIcon={<span className={classes.checkedIcon} />}
                color="primary"
            />
        </Tooltip>
    );
}

export default React.memo(function ColorRadioGroup(props: {
    onChange?: (
        event: React.ChangeEvent<HTMLInputElement>,
        value: DesignColor
    ) => void;
    onHover?: (color: DesignColor, active: boolean) => void;
}) {
    const classes = useRadioGroupStyles();
    return (
        <FormControl component="fieldset">
            <RadioGroup
                className={classes.radioGroup}
                defaultValue="white"
                aria-label="color"
                name="color-radios"
                onChange={
                    props.onChange as (
                        event: React.ChangeEvent<HTMLInputElement>,
                        value: string
                    ) => void
                }
            >
                {Object.keys(DesignColor).map((color) => (
                    <ColorRadio
                        key={color}
                        color={color as DesignColor}
                        onHover={props.onHover}
                    />
                ))}
            </RadioGroup>
        </FormControl>
    );
});
