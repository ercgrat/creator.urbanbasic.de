import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { fabric } from 'fabric';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './imageAdder.module.scss';

type Props = {
    canvas: fabric.Canvas;
};

const ImageAdder: React.FC<Props> = (props) => {
    const canvasUtils = useCanvasUtils();
    const onDrop = useCallback(
        async (acceptedFiles) => {
            const file = acceptedFiles[0];
            const image: HTMLImageElement = await canvasUtils.addImage(file);
            const imageObject = new fabric.Image(image, {
                transparentCorners: false,
            });
            imageObject.scaleToHeight(100);
            imageObject.scaleToWidth(100);
            imageObject.set('data', file);
            props.canvas.centerObject(imageObject);
            props.canvas.add(imageObject);
            props.canvas.setActiveObject(imageObject);
            props.canvas.renderAll();
        },
        [props.canvas]
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
                    <p>Drop the files here...</p>
                ) : (
                    <p>
                        <AddPhotoAlternateIcon /> Datei hier ablegen oder zum
                        Öffnen klicken
                    </p>
                )}
            </div>
        </section>
    );
};

export default React.memo(ImageAdder);
