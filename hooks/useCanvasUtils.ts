export default function useCanvasUtils() {

    async function addImage(file: Blob) {
        return new Promise<HTMLImageElement>((resolve) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const image = new Image();
                image.onload = function () {
                    resolve(image);
                };

                image.src = event.target.result as string;
            };

            reader.readAsDataURL(file);
        });
    }

    async function renderObjects(canvas: fabric.Canvas, objects: fabric.Object[]) {
        const self = this;
        return new Promise<string>((resolve) => {
            const promises = []
            objects.forEach((object) => {
                promises.push(new Promise(
                    async (innerResolve) => {
                        if (object.isType('image')) {
                            const image = await self.addImage(object.get('data') as Blob);
                            const imageObject = object as fabric.Image;
                            imageObject.setElement(image);
                            canvas.add(imageObject);
                        } else {
                            canvas.add(object);
                        }
                        innerResolve();
                    }
                ));
            });

            return Promise.all(promises).then(() => {
                resolve();
            });
        });
    }
    return {
        addImage,
        renderObjects
    }
}