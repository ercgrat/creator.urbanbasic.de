import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import ColorRadioGroup from './colorRadioGroup';
import ImageAdder from './imageAdder';
import PositionRadioGroup from './positionRadioGroup';
import { Button, withStyles } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DesignColor, DesignSize, DesignProduct } from '../../model/Cart';
import ShirtUnderlay from '../cart/shirtUnderlay';
import React from 'react';
import ProductSelect from './productSelect';
import { renderObjects } from '../../utils/canvas';

export interface IDesignData {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;
}

export const CANVAS_WIDTH = 168;
export const CANVAS_HEIGHT = 252;

type Props = {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    product: DesignProduct;
    onDesignChanged: (data: Partial<IDesignData>) => void;
    forceUpdateCanvas: number; // Dummy value used to trigger the canvas rerender useEffect
};

const Customizer: React.FC<Props> = ({
    frontObjects,
    backObjects,
    color,
    onDesignChanged,
    forceUpdateCanvas,
}) => {
    const frontCanvasRef = useRef<HTMLDivElement>(null);
    const backCanvasRef = useRef<HTMLDivElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas>(
        new fabric.Canvas(null)
    );
    const [selectedObject, setSelectedObject] = useState<
        fabric.Object | undefined
    >();
    const [shirtPosition, setShirtPosition] = useState<'front' | 'back'>(
        'front'
    );
    const previousShirtPosition = useRef<string>();
    const previousForceUpdateCanvas = useRef<number>();
    const [hoveredColor, setHoveredColor] = useState<DesignColor | null>(null);

    const getObjects = useCallback(() => {
        return shirtPosition === 'front' ? frontObjects : backObjects;
    }, [backObjects, frontObjects, shirtPosition]);

    const getCanvasRef = useCallback(() => {
        return shirtPosition === 'front' ? frontCanvasRef : backCanvasRef;
    }, [shirtPosition]);

    const setObjects = useCallback(
        (objects: fabric.Object[]) => {
            const currentData = {} as Partial<IDesignData>;
            if (shirtPosition === 'front') {
                currentData.frontObjects = objects;
            } else {
                currentData.backObjects = objects;
            }
            onDesignChanged(currentData);
        },
        [onDesignChanged, shirtPosition]
    );

    const deleteSelectedObject = useCallback(() => {
        if (selectedObject) {
            canvas?.remove(selectedObject);
            setSelectedObject(undefined);
        }
    }, [canvas, selectedObject]);

    useEffect(() => {
        /**
         * Rerender the canvas when force updated
         */
        if (previousForceUpdateCanvas.current !== forceUpdateCanvas) {
            previousForceUpdateCanvas.current = forceUpdateCanvas;
            canvas.clear();

            (async () => {
                await renderObjects(canvas, getObjects());
                canvas.renderAll();
            })();
        }

        /**
         * Discard and reconstruct the canvas when flipping sides or on force update.
         */
        if (previousShirtPosition.current !== shirtPosition) {
            previousShirtPosition.current = shirtPosition;
            const effectCanvas = new fabric.Canvas(`${shirtPosition}Canvas`, {
                width: getCanvasRef().current?.clientWidth ?? 0,
                height: getCanvasRef().current?.clientHeight ?? 0,
                selection: false,
                preserveObjectStacking: true,
            });

            (async () => {
                await renderObjects(effectCanvas, getObjects());
                effectCanvas.renderAll();
                setObjects(effectCanvas.getObjects());
            })();

            effectCanvas.on('selection:cleared', () => {
                removeUnusedObjects(effectCanvas);
                setSelectedObject(undefined);
            });
            effectCanvas.on('selection:created', (event) => {
                setSelectedObject(event.target as fabric.Object);
            });
            effectCanvas.on('selection:updated', (event) => {
                setSelectedObject(event.target as fabric.Object);
            });

            setCanvas(effectCanvas);
            setSelectedObject(undefined);
        }
    }, [
        shirtPosition,
        getCanvasRef,
        getObjects,
        setObjects,
        forceUpdateCanvas,
        canvas,
    ]);

    useEffect(() => {
        /**
         * Delete the currently selected canvas object whenever the delete key is pressed in the application.
         */
        const listener = (event: KeyboardEvent) => {
            if (event.key === 'Delete') {
                deleteSelectedObject();
            }
        };
        window.addEventListener('keydown', listener);

        return () => {
            window.removeEventListener('keydown', listener);
        };
    }, [deleteSelectedObject, selectedObject, setSelectedObject]);

    useEffect(() => {
        /**
         * Every time an object is added or removed from the canvas,
         * record the current objects and emit the latest state of the design.
         */
        if (canvas) {
            setObjects(canvas.getObjects());
        }
    }, [selectedObject, setObjects, canvas]);

    function removeUnusedObjects(canvas?: fabric.Canvas) {
        canvas?.forEachObject((obj) => {
            switch (obj.type) {
                case 'text':
                    {
                        const textObj = obj as fabric.Text;
                        if (!textObj.text || textObj.text.length === 0) {
                            canvas.remove(textObj);
                        }
                    }
                    break;
            }
        });
    }

    const changeProduct = useCallback(
        (
            event: React.ChangeEvent<{
                name?: string;
                value: unknown;
            }>
        ) => {
            onDesignChanged({
                product: DesignProduct[event.target.value as DesignProduct],
            });
        },
        [onDesignChanged]
    );

    const changeColor = useCallback(
        (event: React.SyntheticEvent, color: DesignColor) => {
            onDesignChanged({
                color: DesignColor[color],
            });
        },
        [onDesignChanged]
    );

    const changeHoveredColor = useCallback(
        (color: DesignColor, active: boolean) => {
            if (active) {
                setHoveredColor(DesignColor[color]);
            } else {
                setHoveredColor(null);
            }
        },
        [setHoveredColor]
    );

    const changePosition = useCallback(
        (event: React.SyntheticEvent, position: string) => {
            removeUnusedObjects(canvas);
            setObjects(canvas?.getObjects() ?? []);
            canvas?.dispose();
            const englishPosition = position === 'Vorne' ? 'front' : 'back';
            setShirtPosition(englishPosition);
        },
        [setShirtPosition, setObjects, canvas]
    );

    const DeleteButton = withStyles({
        root: {
            marginTop: '24px',
            borderColor: '#f44336',
            color: '#f44336',
        },
    })(Button);

    return (
        <div className={styles.container}>
            <div className={styles.editPane}>
                <div className={styles.editor}>
                    <ShirtUnderlay
                        className={styles.shirtImage}
                        shirtPosition={shirtPosition}
                        color={hoveredColor || color}
                    />
                    {shirtPosition === 'front' ? (
                        <div
                            className={styles.canvasContainer}
                            ref={frontCanvasRef}
                            style={{
                                left: '8px',
                            }}
                        >
                            <canvas
                                id="frontCanvas"
                                className={styles.canvas}
                            ></canvas>
                        </div>
                    ) : (
                        <div
                            className={styles.canvasContainer}
                            ref={backCanvasRef}
                            style={{
                                left: '-8px',
                            }}
                        >
                            <canvas
                                id="backCanvas"
                                className={styles.canvas}
                            ></canvas>
                        </div>
                    )}
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <PositionRadioGroup onChange={changePosition} />
                </div>
            </div>
            <div className={styles.settings}>
                <label className={styles.label}>Artikel</label>
                <ProductSelect onChange={changeProduct}></ProductSelect>
                <label className={styles.label}>Farbe</label>
                <ColorRadioGroup
                    onChange={changeColor}
                    onHover={changeHoveredColor}
                />
                <label className={styles.label}>Text</label>
                <TextConfiguration
                    canvas={canvas}
                    selectedObject={selectedObject}
                />
                <label className={styles.label}>Bild</label>
                <ImageAdder
                    canvas={canvas}
                    shirtPosition={shirtPosition}
                    frontObjects={frontObjects}
                    backObjects={backObjects}
                />
                {selectedObject && (
                    <section>
                        <DeleteButton
                            startIcon={<DeleteForeverIcon />}
                            variant="outlined"
                            onClick={deleteSelectedObject}
                        >
                            Auswahl löschen
                        </DeleteButton>
                    </section>
                )}
            </div>
        </div>
    );
};

export default React.memo(Customizer);
