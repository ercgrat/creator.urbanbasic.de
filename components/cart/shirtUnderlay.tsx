import React, { useEffect, useState } from 'react';
import { ColorMap, DesignColor } from '../../model/Cart';

type Props = {
    shirtPosition: string;
    color: DesignColor;
    className?: string;
};

const ShirtUnderlay: React.FC<Props> = ({
    shirtPosition,
    color,
    className,
}) => {
    const [heatheredImage, setHeatheredImage] = useState('');

    const [effectiveColor, setEffectiveColor] = useState('');
    const shirtUrl = `/images/tshirt-${shirtPosition}.webp`;
    const [previousShirtUrl, setPreviousShirtUrl] = useState<string>();
    useEffect(() => {
        // Wait until the shirt image loads before applying color or heathering
        // This prevents the big square flash of color when changing sides and shirts

        // If switching shirt sides, hide the color background
        if (
            shirtUrl !== previousShirtUrl &&
            ColorMap[color].color === effectiveColor
        ) {
            setEffectiveColor('');
            setPreviousShirtUrl(shirtUrl);
        }
        setHeatheredImage('');
        const img = new Image();
        const listener = () => {
            setEffectiveColor(ColorMap[color].color);
            if (color === DesignColor.oxfordGrey) {
                setHeatheredImage('url(/images/heather.webp) ');
            }
        };
        img.addEventListener('load', listener);
        img.src = shirtUrl;

        return () => {
            img.removeEventListener('load', listener);
        };
    }, [shirtUrl, color, effectiveColor, previousShirtUrl]);

    return (
        <>
            <div
                className={className}
                style={{
                    position: 'relative',
                    background: `${heatheredImage} center center / 100% 100% no-repeat ${effectiveColor}`,
                    zIndex: 0,
                    top: '1px',
                    height: 'calc(100% - 1px)',
                }}
            ></div>
            <div
                className={className}
                style={{
                    position: 'absolute',
                    top: 0,
                    background: `url(${shirtUrl}) center center / 100% 100% no-repeat`,
                    zIndex: 1,
                }}
            />
        </>
    );
};

export default React.memo(ShirtUnderlay);
