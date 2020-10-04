import { sizes } from '../../model/Products';
import ThemedRadioGroup from '../themedRadioGroup';

export default function SizeRadioGroup({ onChange }) {
    return (
        <ThemedRadioGroup
            values={sizes}
            defaultValue='m'
            label='size'
            onChange={onChange} />
    );
}