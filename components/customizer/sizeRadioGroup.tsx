import { FormControl, FormControlLabel, RadioGroup, Radio, makeStyles } from '@material-ui/core';
import { sizes } from '../../model/Products';

const useRadioGroupStyles = makeStyles({
    radioGroup: {
        'display': 'flex',
        'flex-direction': 'row',
        'flex-wrap': 'nowrap'
    }
});

const useRadioStyles = function () {
    const icon = {
        borderRadius: '1%',
        width: 36,
        height: 36,
        color: 'white',
        backgroundColor: '#74b6c7',
        border: 'solid 1px rgba(0,0,0,0.3)'
    } as any;

    return makeStyles({
        iconRoot: {
            padding: '0'
        },
        iconRootSelected: {
        },
        icon,
        checkedIcon: Object.assign({ ...icon }, {
            border: 'none',
            backgroundColor: '#5c7d84'
        }),
        radioRoot: {
            position: 'relative',
            margin: 0
        },
        label: {
            position: 'absolute',
            color: 'white',
            fontWeight: 'bold',
            left: 0,
            right: 0,
            textAlign: 'center'
        }
    })();
};

function SizeRadio({ size }) {
    const classes = useRadioStyles();

    return (
        <FormControlLabel
            value={size}
            control={
                <Radio
                    value={size}
                    classes={{ root: classes.iconRoot, checked: classes.iconRootSelected }}
                    icon={<span className={classes.icon} />}
                    checkedIcon={<span className={classes.checkedIcon} />}
                    color="primary"
                />
            }
            label={size}
            classes={ { label: classes.label } }/>

    );
}

export default function SizeRadioGroup({ onChange }) {
    const classes = useRadioGroupStyles();
    return (
        <FormControl component="fieldset">
            <RadioGroup className={classes.radioGroup} defaultValue="m" aria-label="size" name="size-radios"
                onChange={onChange}>
                {
                    sizes.map(size => (
                        <SizeRadio key={size} size={size} />
                    ))
                }
            </RadioGroup>
        </FormControl>
    );
}