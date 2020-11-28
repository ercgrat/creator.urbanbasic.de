import styles from './customizer.module.scss';
import { fabric } from 'fabric';
import { useCallback, useEffect, useRef, useState } from 'react';
import TextConfiguration from './textConfiguration';
import ColorRadioGroup from './colorRadioGroup';
import ImageAdder from './imageAdder';
import PositionRadioGroup from './positionRadioGroup';
import useCanvasUtils from '../../hooks/useCanvasUtils';
import { Button, withStyles } from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DesignColor, DesignSize, DesignProduct } from '../../model/Cart';
import ShirtUnderlay from '../cart/shirtUnderlay';
import React from 'react';
import ProductSelect from './productSelect';

export interface IDesignData {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    size: DesignSize;
    product: DesignProduct;
}

export const CANVAS_WIDTH = 168;
export const CANVAS_HEIGHT = 252;

export default React.memo(function Customizer(props: {
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    color: DesignColor;
    product: DesignProduct;
    onDesignChanged: (data: Partial<IDesignData>) => void;
}) {
    const frontCanvasRef = useRef<HTMLDivElement>(null);
    const backCanvasRef = useRef<HTMLDivElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas>(
        new fabric.Canvas(null)
    );
    const [selectedObject, setSelectedObject] = useState<
        fabric.Object | undefined
    >();
    const [shirtPosition, setShirtPosition] = useState<string>('front');
    const [hoveredColor, setHoveredColor] = useState<DesignColor | null>(null);

    const canvasUtils = useCanvasUtils();

    useEffect(() => {
        /**
         * Discard and reconstruct the canvas when flipping sides.
         */
        const effectCanvas = new fabric.Canvas(`${shirtPosition}Canvas`, {
            width: getCanvasRef().current?.clientWidth ?? 0,
            height: getCanvasRef().current?.clientHeight ?? 0,
            selection: false,
            preserveObjectStacking: true,
        });

        (async () => {
            await canvasUtils.renderObjects(effectCanvas, getObjects());
            effectCanvas.renderAll();
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
    }, [shirtPosition]);

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
    }, [selectedObject, setSelectedObject]);

    useEffect(() => {
        /**
         * Every time an object is added or removed from the canvas, or the color changes,
         * record the current objects and emit the latest state of the design.
         */
        if (canvas) {
            setObjects(canvas.getObjects());

            if (props.onDesignChanged) {
                props.onDesignChanged({
                    frontObjects:
                        shirtPosition === 'front'
                            ? canvas.getObjects()
                            : props.frontObjects,
                    backObjects:
                        shirtPosition === 'front'
                            ? props.backObjects
                            : canvas.getObjects(),
                });
            }
        }
    }, [selectedObject]);

    function getCanvasRef() {
        return shirtPosition === 'front' ? frontCanvasRef : backCanvasRef;
    }

    function getObjects() {
        return shirtPosition === 'front'
            ? props.frontObjects
            : props.backObjects;
    }

    function setObjects(objects: fabric.Object[]) {
        const currentData = {} as Partial<IDesignData>;
        if (shirtPosition === 'front') {
            currentData.frontObjects = objects;
        } else {
            currentData.backObjects = objects;
        }
        props.onDesignChanged(currentData);
    }

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

    function deleteSelectedObject() {
        if (selectedObject) {
            canvas?.remove(selectedObject);
            setSelectedObject(undefined);
        }
    }

    const changeProduct = useCallback(
        (
            event: React.ChangeEvent<{
                name?: string;
                value: unknown;
            }>
        ) => {
            props.onDesignChanged({
                product: DesignProduct[event.target.value as DesignProduct],
            });
        },
        [props.product]
    );

    const changeColor = useCallback(
        (event: React.SyntheticEvent, color: DesignColor) => {
            props.onDesignChanged({
                color: DesignColor[color],
            });
        },
        [props.color, canvas, frontCanvasRef, backCanvasRef]
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
                        color={hoveredColor || props.color}
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
                <ImageAdder canvas={canvas} />
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
});
