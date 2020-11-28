import { Button, IconButton, TextField } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import React from 'react';
import { CartItem } from '../../model/Cart';
import { formatPrice } from '../../model/Constants';
import Design from './design';
import styles from './item.module.scss';

export default React.memo(function Item(props: {
    item: CartItem;
    isEditable?: boolean;
    onQuantityChange?: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void;
    onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}) {
    return (
        <div className={styles.listItem}>
            <div className={styles.product}>
                <Design
                    shirtPosition="front"
                    color={props.item.design.color}
                    imageSrc={props.item.design.frontDataURL}
                />
                <Design
                    shirtPosition="back"
                    color={props.item.design.color}
                    imageSrc={props.item.design.backDataURL}
                />
            </div>
            <div>
                <span className={styles.listItemLabel}>Size: </span>
                {props.item.design.size}
            </div>
            <div>
                <span className={styles.listItemLabel}>Price: </span>
                {formatPrice(props.item.price)}
            </div>
            <div>
                <span className={styles.listItemLabel}>Quantity: </span>
                {props.isEditable ? (
                    <TextField
                        className={styles.quantity}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        value={props.item.quantity}
                        onChange={props.onQuantityChange}
                    />
                ) : (
                    props.item.quantity
                )}
            </div>
            <div>
                <span className={styles.listItemLabel}>Total price: </span>
                {formatPrice(props.item.getTotalPrice())}
            </div>
            {props.isEditable ? (
                <div>
                    <div className={styles.iconDelete}>
                        <IconButton
                            className={styles.iconDelete}
                            aria-label="delete"
                            onClick={props.onDelete}
                        >
                            <DeleteForeverIcon />
                        </IconButton>
                    </div>
                    <div className={styles.fullDelete}>
                        <Button
                            className={styles.fullDelete}
                            aria-label="delete"
                            onClick={props.onDelete}
                            startIcon={<DeleteForeverIcon />}
                        >
                            Artikel löschen
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
});
