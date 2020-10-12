import React from 'react';
import { DesignSize } from '../../model/Cart';
import ThemedRadioGroup from '../themedRadioGroup';

export default React.memo(function SizeRadioGroup(props: { onChange }) {
    return (
        <ThemedRadioGroup
            values={Object.keys(DesignSize)}
            defaultValue='m'
            label='size'
            onChange={props.onChange} />
    );
});