import React from 'react';
import ThemedRadioGroup from '../themedRadioGroup';

export default React.memo(function PositionRadioGroup(props: { onChange }) {
    return (
        <ThemedRadioGroup
            values={['front', 'back']}
            defaultValue='front'
            label='shirtPosition'
            onChange={props.onChange} />
    );
});