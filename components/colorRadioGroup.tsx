import { FormControl, RadioGroup, Radio, makeStyles } from '@material-ui/core';
import colors from '../model/Colors';

const useRadioGroupStyles = makeStyles({
    radioGroup: {
        'display': 'flex',
        'flex-direction': 'row',
        'flex-wrap': 'nowrap'
    }
});

const useRadioStyles = function (color: string) {
    const icon = {
        borderRadius: '50%',
        width: 33,
        height: 33,
        backgroundColor: color,
        'input:hover ~ &': {
            boxShadow: '0px 0px 0px 3px rgba(116,182,199,0.3)'
        },
    } as any;

    if (color === 'white') {
        icon.border = 'solid 2px rgb(0,0,0,0.3)'
    }

    return makeStyles({
        root: {
            padding: '3px 6px',
            backgroundColor: 'transparent'
        },
        rootSelected: {
            backgroundColor: 'transparent'
        },
        icon,
        checkedIcon: Object.assign({...icon}, {
            border: 'none',
            boxShadow: '0px 0px 0px 3px rgb(116,182,199)',
            'input:hover ~ &': {
                boxShadow: '0px 0px 0px 3px rgb(116,182,199)'
            }
        })
    })();
};

// Inspired by blueprintjs
function ColorRadio({ color }) {
    const classes = useRadioStyles(color);

    return (
        <Radio
            value={color}
            classes={{ root: classes.root, checked: classes.rootSelected }}
            icon={<span className={classes.icon} />}
            checkedIcon={<span className={classes.checkedIcon} />}
            disableRipple

        />
    );
}

export default function ColorRadioGroup({ onChange }) {
    const classes = useRadioGroupStyles();
    return (
        <FormControl component="fieldset">
            <RadioGroup className={classes.radioGroup} defaultValue="white" aria-label="color" name="color-radios"
                onChange={onChange}>
                {
                    colors.map(color => (
                        <ColorRadio key={color} color={color} />
                    ))
                }
            </RadioGroup>
        </FormControl>
    );
}