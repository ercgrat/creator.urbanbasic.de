import { changeDpiDataUrl } from 'changedpi';
import { fabric } from 'fabric';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
} from '../components/customizer/customizer';

export const readImage = async (file: Blob): Promise<string> => {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target?.result as string);
        };

        reader.readAsDataURL(file);
    });
};

export const addImage = async (file: Blob): Promise<HTMLImageElement> => {
    return new Promise<HTMLImageElement>((resolve) => {
        const image = new Image();
        image.onload = function () {
            resolve(image);
        };

        readImage(file).then((src) => {
            image.src = src;
        });
    });
};

export const renderObjects = async (
    canvas: fabric.Canvas,
    objects: fabric.Object[]
): Promise<void> => {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve) => {
        // Need to await in sequence (instead of Promise.all) to preserve the order of canvas elements
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            if (object.isType('image')) {
                const image = await addImage(object.get('data') as Blob);
                const imageObject = object as fabric.Image;
                imageObject.setElement(image);
                canvas.add(imageObject);
            } else {
                canvas.add(object);
            }
        }

        resolve();
    });
};

export const getDataURLForCanvas = (canvas: fabric.Canvas): string => {
    return changeDpiDataUrl(
        canvas.toDataURL({
            enableRetinaScaling: true,
            multiplier: 5,
        }),
        300
    );
};

type CanvasImageData = {
    frontDataURL: string;
    backDataURL: string;
};
export const getDataURLsForObjects = async (
    frontObjects: fabric.Object[],
    backObjects: fabric.Object[]
): Promise<CanvasImageData> => {
    const frontCanvas = new fabric.Canvas(document.createElement('canvas'), {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        preserveObjectStacking: true,
    });
    const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        preserveObjectStacking: true,
    });
    await renderObjects(frontCanvas, frontObjects);
    await renderObjects(backCanvas, backObjects);
    const frontDataURL = getDataURLForCanvas(frontCanvas);
    const backDataURL = getDataURLForCanvas(backCanvas);
    return {
        frontDataURL,
        backDataURL,
    };
};

export const getDesignExceedsDataLimit = async (
    frontObjects: fabric.Object[],
    backObjects: fabric.Object[]
): Promise<boolean> => {
    const { frontDataURL, backDataURL } = await getDataURLsForObjects(
        frontObjects,
        backObjects
    );
    const blobSize = new Blob([frontDataURL, backDataURL]).size;
    return blobSize > 5500000; // 5.5MB
};
