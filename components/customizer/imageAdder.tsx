import { Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { ICustomizerConfigProps } from '../../model/Customizer';
import { fabric } from 'fabric';

export default function ImageAdder(props: { config: ICustomizerConfigProps }) {
    const { canvas } = props.config;

    async function addImage() {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = '.png, .jpg, .jpeg';

        imageInput.onchange = function (event: InputEvent) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const image = new Image();
                image.onload = function () {
                    const imageObject = new fabric.Image(image);
                    imageObject.scaleToHeight(100);
                    imageObject.scaleToWidth(100);
                    canvas.centerObject(imageObject);
                    canvas.add(imageObject);
                    canvas.renderAll();
                };

                image.src = event.target.result as string;
            };

            const file: Blob = (event.target as any).files[0];
            reader.readAsDataURL(file);
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