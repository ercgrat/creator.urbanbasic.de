import AddPhotoAlternateIcon from '@material-ui/icons/AddPhotoAlternate';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { fabric } from 'fabric';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './imageAdder.module.scss';

export default React.memo(function ImageAdder(props: { canvas }) {

    const canvasUtils = useCanvasUtils();
    const onDrop = useCallback(async acceptedFiles => {
        const file = acceptedFiles[0];
        const image: HTMLImageElement = await canvasUtils.addImage(file);
        const imageObject = new fabric.Image(image, {
            transparentCorners: false
        });
        imageObject.scaleToHeight(100);
        imageObject.scaleToWidth(100);
        imageObject.set('data', file);
        props.canvas.centerObject(imageObject);
        props.canvas.add(imageObject);
        props.canvas.setActiveObject(imageObject);
        props.canvas.renderAll();
    }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <section>
            <div {...getRootProps()} className={styles.dropzone}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the files here...</p> :
                        <p><AddPhotoAlternateIcon /> Drag and drop files here, or click to add</p>
                }
            </div>
        </section>
    );
});