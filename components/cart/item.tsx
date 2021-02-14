import { Button, IconButton, TextField } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import React, { useEffect, useState } from 'react';
import { CartItem } from '../../model/Cart';
import { formatPrice } from '../../utils';
import Design from './design';
import styles from './item.module.scss';
import S3Client from 'aws-sdk/clients/s3';
import { S3_BUCKET } from '../../utils/const';
import { CanvasImageData } from '../../utils/canvas';

type Props = {
    item: CartItem;
    isEditable?: boolean;
    onQuantityChange?: (
        event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
    ) => void;
    onDelete?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onDataLoaded?: (item: CartItem, data: CanvasImageData) => void;
};
const Item: React.FC<Props> = ({
    item,
    isEditable,
    onQuantityChange,
    onDelete,
    onDataLoaded,
}) => {
    const [frontDataURL, setFrontDataURL] = useState<string | undefined>(
        item.clientFrontDataURL
    );
    const [backDataURL, setBackDataURL] = useState<string | undefined>(
        item.clientBackDataURL
    );
    const [progress, setProgress] = useState<number>(0);

    useEffect(() => {
        if (!frontDataURL && !backDataURL) {
            const download = new S3Client({
                useAccelerateEndpoint: true,
            }).getObject({
                Bucket: S3_BUCKET,
                Key: item.design.s3ObjectKey,
            });
            download.on('httpDownloadProgress', (progress) => {
                setProgress((progress.loaded / progress.total) * 100);
            });
            download.promise().then((data) => {
                const canvasImageData: CanvasImageData = JSON.parse(
                    data.Body?.toString('utf-8') ?? '{}'
                );
                setFrontDataURL(canvasImageData.frontDataURL);
                setBackDataURL(canvasImageData.backDataURL);
                onDataLoaded?.(item, canvasImageData);
            });
        }
    }, [backDataURL, frontDataURL, item, onDataLoaded]);

    return (
        <div className={styles.listItem}>
            <div className={styles.product}>
                <Design
                    shirtPosition="front"
                    color={item.design.color}
                    imageSrc={frontDataURL}
                    progress={progress}
                />
                <Design
                    shirtPosition="back"
                    color={item.design.color}
                    imageSrc={backDataURL}
                    progress={progress}
                />
            </div>
            <div>
                <span className={styles.listItemLabel}>Size: </span>
                {item.design.size}
            </div>
            <div>
                <span className={styles.listItemLabel}>Price: </span>
                {formatPrice(item.price)}
            </div>
            <div>
                <span className={styles.listItemLabel}>Quantity: </span>
                {isEditable ? (
                    <TextField
                        className={styles.quantity}
                        type="number"
                        InputLabelProps={{
                            shrink: true,
                        }}
                        variant="outlined"
                        size="small"
                        value={item.quantity}
                        onChange={onQuantityChange}
                    />
                ) : (
                    item.quantity
                )}
            </div>
            <div>
                <span className={styles.listItemLabel}>Total price: </span>
                {formatPrice(item.getTotalPrice())}
            </div>
            {isEditable ? (
                <div>
                    <div className={styles.iconDelete}>
                        <IconButton
                            className={styles.iconDelete}
                            aria-label="delete"
                            onClick={onDelete}
                        >
                            <DeleteForeverIcon />
                        </IconButton>
                    </div>
                    <div className={styles.fullDelete}>
                        <Button
                            className={styles.fullDelete}
                            aria-label="delete"
                            onClick={onDelete}
                            startIcon={<DeleteForeverIcon />}
                        >
                            Artikel löschen
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default React.memo(Item);
