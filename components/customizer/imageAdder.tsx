import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import { fabric } from 'fabric';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    addImage,
    getDesignExceedsDataLimit,
    renderObjects,
} from '../../utils/canvas';
import Spinner from '../spinner';
import styles from './imageAdder.module.scss';

type Props = {
    canvas: fabric.Canvas;
    shirtPosition: 'front' | 'back';
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
};

const ImageAdder: React.FC<Props> = ({
    canvas,
    shirtPosition,
    frontObjects,
    backObjects,
}) => {
    const [isAddingImage, setIsAddingImage] = useState<boolean>(false);

    const onDrop = useCallback(
        (acceptedFiles) => {
            setIsAddingImage(true);
            const file = acceptedFiles[0];
            addImage(file).then((image) => {
                const imageObject = new fabric.Image(image, {
                    transparentCorners: false,
                });
                imageObject.scaleToHeight(100);
                imageObject.scaleToWidth(100);
                imageObject.set('data', file);

                const localFrontObjects = frontObjects.slice();
                const localBackObjects = backObjects.slice();
                if (shirtPosition === 'front') {
                    localFrontObjects.push(imageObject);
                } else {
                    localBackObjects.push(imageObject);
                }
                getDesignExceedsDataLimit(localFrontObjects, localBackObjects)
                    .then(async (isDataLimitExceeded) => {
                        if (!isDataLimitExceeded) {
                            canvas.centerObject(imageObject);
                            canvas.add(imageObject);
                            canvas.setActiveObject(imageObject);
                            canvas.renderAll();
                        } else {
                            alert(
                                'Dein Design übersteigt die zulässige Dateigröße. Bitte verwende Dateien mit einer geringeren Gesamtgröße. Weiter Infos findest Du in unseren FAQs.'
                            );
                            // Re-render the canvas to fix resizers on the canvas objects
                            canvas.clear();
                            let renderPromise;
                            if (shirtPosition === 'front') {
                                renderPromise = renderObjects(
                                    canvas,
                                    frontObjects
                                );
                            } else {
                                renderPromise = renderObjects(
                                    canvas,
                                    backObjects
                                );
                            }
                            renderPromise.then(() => canvas.renderAll());
                        }
                    })
                    .finally(() => {
                        setIsAddingImage(false);
                    });
            });
        },
        [backObjects, canvas, frontObjects, shirtPosition]
    );
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/jpeg,image/png',
    });

    return (
        <section>
            <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Dateien hier ablegen...</p>
                ) : (
                    <p>
                        <AddPhotoAlternateIcon /> Datei hier ablegen oder zum
                        Öffnen klicken
                    </p>
                )}
            </div>
            <Spinner isSpinning={isAddingImage} />
        </section>
    );
};

export default React.memo(ImageAdder);
