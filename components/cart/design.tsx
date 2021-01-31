import React from 'react';
import { DesignColor } from '../../model/Cart';
import ShirtUnderlay from './shirtUnderlay';
import styles from './design.module.scss';
import { CircularProgress } from '@material-ui/core';

export default React.memo(function Design(props: {
    shirtPosition: 'front' | 'back';
    color: DesignColor;
    imageSrc?: string;
    progress?: number;
}) {
    return (
        <div className={styles.imageContainer}>
            <ShirtUnderlay
                className={styles.image}
                shirtPosition={props.shirtPosition}
                color={props.color}
            />
            {props.imageSrc ? (
                <img className={styles.design} src={props.imageSrc}></img>
            ) : (
                <CircularProgress
                    className={styles.design}
                    variant="determinate"
                    value={props.progress}
                />
            )}
        </div>
    );
});
