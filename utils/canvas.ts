import { changeDpiDataUrl } from 'changedpi';
import { fabric } from 'fabric';
import {
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
} from '../components/customizer/customizer';

const CM_IN_PIXELS_AT_300_PPI = 118;
const PLATEN_WIDTH_IN_CM = 35.5;
const PLATEN_HEIGHT_IN_CM = 40.6;
const PLATEN_WIDTH_IN_PIXELS = PLATEN_WIDTH_IN_CM * CM_IN_PIXELS_AT_300_PPI;
const PLATEN_HEIGHT_IN_PIXELS = PLATEN_HEIGHT_IN_CM * CM_IN_PIXELS_AT_300_PPI;

export const readImage = (file: Blob): Promise<string> => {
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = function (event) {
            resolve(event.target?.result as string);
        };

        reader.readAsDataURL(file);
    });
};

export const addImage = (file: Blob): Promise<HTMLImageElement> => {
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

export const renderObjects = (
    canvas: fabric.Canvas,
    objects: fabric.Object[]
): Promise<void> => {
    return new Promise<void>((resolve) => {
        const addImagePromiseArray = [];
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            if (object.isType('image')) {
                addImagePromiseArray.push(
                    addImage(object.get('data') as Blob).then((image) => {
                        const imageObject = object as fabric.Image;
                        imageObject.setElement(image);
                        canvas.add(imageObject);
                    })
                );
            } else {
                canvas.add(object);
            }
        }
        Promise.all(addImagePromiseArray).then(() => resolve());
    });
};

export const isClientLargeCanvasCompatible = async (): Promise<boolean> => {
    if (typeof window !== 'undefined') {
        const canvasSize = (await import('canvas-size')).default;
        console.log(canvasSize.maxHeight(PLATEN_HEIGHT_IN_PIXELS));
        console.log(
            canvasSize.test({
                width: PLATEN_WIDTH_IN_PIXELS,
                height: PLATEN_HEIGHT_IN_PIXELS,
            })
        );
        return canvasSize.test({
            width: PLATEN_WIDTH_IN_PIXELS,
            height: PLATEN_HEIGHT_IN_PIXELS,
        });
    }
    return false;
};

export const getDataURLForCanvas = (canvas: fabric.Canvas): string => {
    return changeDpiDataUrl(
        canvas.toDataURL({
            multiplier: PLATEN_WIDTH_IN_PIXELS / CANVAS_WIDTH,
            quality: 1,
            enableRetinaScaling: true,
        }),
        300
    );
};

export type CanvasImageData = {
    frontDataURL: string;
    backDataURL: string;
};
export const getDataURLsForObjects = (
    frontObjects: fabric.Object[],
    backObjects: fabric.Object[]
): Promise<CanvasImageData> => {
    return new Promise((resolve) => {
        const frontCanvas = new fabric.Canvas(
            document.createElement('canvas'),
            {
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                preserveObjectStacking: true,
            }
        );
        const backCanvas = new fabric.Canvas(document.createElement('canvas'), {
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            preserveObjectStacking: true,
        });
        const renderPromiseArray = [
            renderObjects(frontCanvas, frontObjects),
            renderObjects(backCanvas, backObjects),
        ];
        Promise.all(renderPromiseArray).then(() => {
            const frontDataURL = getDataURLForCanvas(frontCanvas);
            const backDataURL = getDataURLForCanvas(backCanvas);
            resolve({
                frontDataURL,
                backDataURL,
            });
        });
    });
};

export const getDesignExceedsDataLimit = (
    frontObjects: fabric.Object[],
    backObjects: fabric.Object[]
): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        getDataURLsForObjects(frontObjects, backObjects)
            .then((imageData) => {
                const blobSize = new Blob([
                    imageData.frontDataURL,
                    imageData.backDataURL,
                ]).size;
                resolve(blobSize > 100000000); // 100MB
            })
            .catch((err) => {
                reject(err);
            });
    });
};
