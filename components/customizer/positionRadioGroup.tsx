import React from 'react';
import ThemedRadioGroup from '../themedRadioGroup';

type Props = {
    onChange: (event: React.SyntheticEvent, value: string) => void;
};
const PositionRadioGroup: React.FC<Props> = (props) => {
    return (
        <ThemedRadioGroup
            values={['Vorne', 'Hinten']}
            defaultValue="Vorne"
            label="shirtPosition"
            onChange={props.onChange}
        />
    );
};

export default React.memo(PositionRadioGroup);
