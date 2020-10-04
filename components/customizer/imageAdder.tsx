import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { imageUtils } from '../../hooks/useCanvasUtils';
import {fabric } from 'fabric';

export default function ImageAdder({ canvas }) {

    const canvasUtils = imageUtils();

    async function addImage() {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = '.png, .jpg, .jpeg';

        imageInput.onchange = async function (event: InputEvent) {
            const file: Blob = (event.target as any).files[0];
            const image: HTMLImageElement = await canvasUtils.addImage(file);
            const imageObject = new fabric.Image(image);
            imageObject.scaleToHeight(100);
            imageObject.scaleToWidth(100);
            imageObject.set('data', file);
            canvas.centerObject(imageObject);
            canvas.add(imageObject);
            canvas.setActiveObject(imageObject);
            canvas.renderAll();
        };

        imageInput.click();
    }

    return (
        <section>
            <Button color="secondary" startIcon={<AddIcon />} variant="outlined"
                onClick={addImage}>Add image</Button>
        </section>
    );
}