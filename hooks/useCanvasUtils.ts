export function imageUtils() {
    return {
        addImage: async (file: Blob) => {
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
    }
}