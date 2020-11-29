import { useCallback } from 'react';

export default function useCanvasUtils(): {
    addImage: (file: Blob) => Promise<HTMLImageElement>;
    readImage: (file: Blob) => Promise<string>;
    renderObjects: (
        canvas: fabric.Canvas,
        objects: fabric.Object[]
    ) => Promise<void>;
} {
    const readImage = useCallback(async (file: Blob) => {
        return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                resolve(event.target?.result as string);
            };

            reader.readAsDataURL(file);
        });
    }, []);

    const addImage = useCallback(
        async (file: Blob) => {
            return new Promise<HTMLImageElement>((resolve) => {
                const image = new Image();
                image.onload = function () {
                    resolve(image);
                };

                readImage(file).then((src) => {
                    image.src = src;
                });
            });
        },
        [readImage]
    );

    const renderObjects = useCallback(
        async (canvas: fabric.Canvas, objects: fabric.Object[]) => {
            // eslint-disable-next-line no-async-promise-executor
            return new Promise<void>(async (resolve) => {
                // Need to await in sequence (instead of Promise.all) to preserve the order of canvas elements
                for (let i = 0; i < objects.length; i++) {
                    const object = objects[i];
                    if (object.isType('image')) {
                        const image = await addImage(
                            object.get('data') as Blob
                        );
                        const imageObject = object as fabric.Image;
                        imageObject.setElement(image);
                        canvas.add(imageObject);
                    } else {
                        canvas.add(object);
                    }
                }

                resolve();
            });
        },
        [addImage]
    );

    return {
        addImage,
        readImage,
        renderObjects,
    };
}
