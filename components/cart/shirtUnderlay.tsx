import React, { useEffect, useState } from 'react';
import { ColorMap, DesignColor } from '../../model/Cart';

export default React.memo(function ShirtUnderlay(props: {
    shirtPosition: string;
    color: DesignColor;
    className?: string;
}) {
    const [heatheredImage, setHeatheredImage] = useState('');

    const [color, setColor] = useState('');
    const shirtUrl = `/images/tshirt-${props.shirtPosition}.png`;
    useEffect(() => {
        // Wait until the shirt image loads before applying color or heathering
        // This prevents the big square flash of color when changing sides and shirts

        // If switching shirt sides, hide the color background
        if (ColorMap[props.color].color === color) {
            setColor('');
        }
        setHeatheredImage('');
        const img = new Image();
        const listener = () => {
            setColor(ColorMap[props.color].color);
            if (props.color === DesignColor.oxfordGrey) {
                setHeatheredImage('url(/images/heather.png) ');
            }
        };
        img.addEventListener('load', listener);
        img.src = shirtUrl;

        return () => {
            img.removeEventListener('load', listener);
        };
    }, [shirtUrl, props.color]);

    return (
        <>
            <div
                className={props.className}
                style={{
                    position: 'relative',
                    background: `${heatheredImage} center center / 100% 100% no-repeat ${color}`,
                    zIndex: 0,
                    top: '1px',
                    height: 'calc(100% - 1px)',
                }}
            ></div>
            <div
                className={props.className}
                style={{
                    position: 'absolute',
                    top: 0,
                    background: `url(${shirtUrl}) center center / 100% 100% no-repeat`,
                    zIndex: 1,
                }}
            />
        </>
    );
});
