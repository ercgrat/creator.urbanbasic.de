import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { fabric } from 'fabric';
import React from 'react';

export default React.memo(function ImageAdder(props: { canvas }) {

    const canvasUtils = useCanvasUtils();

    async function addImage() {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = '.png, .jpg, .jpeg';

        imageInput.onchange = async function (event: InputEvent) {
            const file: Blob = (event.target as any).files[0];
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
        };

        imageInput.click();
    }

    return (
        <section>
            <Button color="secondary" startIcon={<AddIcon />} variant="outlined"
                onClick={addImage}>Add image</Button>
        </section>
    );
});