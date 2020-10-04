import { FormControl, FormControlLabel, RadioGroup, Radio, makeStyles } from '@material-ui/core';

const useRadioGroupStyles = makeStyles({
    radioGroup: {
        'display': 'flex',
        'flex-direction': 'row',
        'flex-wrap': 'wrap'
    }
});

const useRadioStyles = function () {
    const icon = {
        height: 36,
        padding: '12px 30px',
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
            border: 'solid 1px #5c7d84',
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

function ThemedRadio({ value }) {
    const classes = useRadioStyles();

    return (
        <FormControlLabel
            value={value}
            control={
                <Radio
                    value={value}
                    classes={{ root: classes.iconRoot, checked: classes.iconRootSelected }}
                    icon={<span className={classes.icon} />}
                    checkedIcon={<span className={classes.checkedIcon} />}
                    color="primary"
                />
            }
            label={value}
            classes={{ root: classes.radioRoot, label: classes.label }} />

    );
}

export default function ThemedRadioGroup(props: { onChange, values: string[], defaultValue: string, label: string }) {
    const classes = useRadioGroupStyles();
    return (
        <FormControl component="fieldset">
            <RadioGroup
                className={classes.radioGroup}
                defaultValue={props.defaultValue}
                aria-label={props.label}
                name={`${props.label}-radios`}
                onChange={props.onChange}>
                {
                    props.values.map(value => (
                        <ThemedRadio key={value} value={value} />
                    ))
                }
            </RadioGroup>
        </FormControl>
    );
}