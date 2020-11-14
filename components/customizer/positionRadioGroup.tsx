import React from 'react';
import ThemedRadioGroup from '../themedRadioGroup';

export default React.memo(function PositionRadioGroup(props: { onChange }) {
    return (
        <ThemedRadioGroup
            values={['Vorne', 'Hinten']}
            defaultValue='Vorne'
            label='shirtPosition'
            onChange={props.onChange} />
    );
});