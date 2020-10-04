import ThemedRadioGroup from '../themedRadioGroup';

export default function PositionRadioGroup({ onChange }) {
    return (
        <ThemedRadioGroup
            values={['front', 'back']}
            defaultValue='front'
            label='shirtPosition'
            onChange={onChange} />
    );
}