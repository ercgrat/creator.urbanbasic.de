import React from "react";
import { DesignColor } from "../../model/Cart";
import ShirtUnderlay from './shirtUnderlay';
import styles from './design.module.scss';

export default React.memo(function Design(props: {
    shirtPosition: 'front' | 'back',
    color: DesignColor,
    imageSrc: string
}) {
    return (
        <div className={styles.imageContainer}>
            <ShirtUnderlay className={styles.image} shirtPosition='front' color={props.color} />
            <img className={styles.design} src={props.imageSrc}></img>
        </div>
    );
});