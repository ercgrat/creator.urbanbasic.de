import { DesignSize } from '../../model/Cart';
import ThemedRadioGroup from '../themedRadioGroup';

export default function SizeRadioGroup({ onChange }) {
    return (
        <ThemedRadioGroup
            values={Object.keys(DesignSize)}
            defaultValue='m'
            label='size'
            onChange={onChange} />
    );
}