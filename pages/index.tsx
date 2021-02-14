import Page from '../components/page';
import { Button, IconButton } from '@material-ui/core';
import Tooltip from '../components/tooltip';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import Customizer, { IDesignData } from '../components/customizer/customizer';
import Divider from '../components/divider';
import { DesignColor, DesignProduct } from '../model/Cart';
import styles from './index.module.scss';
import PricePerUnitRow from '../components/customizer/SizeAndQuantityModal/PricePerUnitRow';
import SizeAndQuantityModal from '../components/customizer/SizeAndQuantityModal';
import {
    getDesignExceedsDataLimit,
    isClientLargeCanvasCompatible,
} from '../utils/canvas';
import Spinner from '../components/spinner';
import { Help } from '@material-ui/icons';

const Home: React.FC = () => {
    const [frontObjects, setFrontObjects] = useState<fabric.Object[]>([]);
    const [backObjects, setBackObjects] = useState<fabric.Object[]>([]);
    const [color, setColor] = useState<DesignColor>(DesignColor.white);
    const [product, setProduct] = useState<DesignProduct>(DesignProduct.tshirt);
    const [isSizeDialogOpen, setIsSizeDialogOpen] = useState<boolean>(false);
    const [
        isTryingToOpenSizeDialog,
        setIsTryingToOpenSizeDialog,
    ] = useState<boolean>(false);
    const previousIsSizeDialogOpenRef = useRef<boolean>();
    const [forceUpdateCanvas, setForceUpdateCanvas] = useState<number>(0); // Counter that force updates the customizer canvas
    const [showDesigner, setShowDesigner] = useState(true);
    useEffect(() => {
        (async () => {
            const value = await isClientLargeCanvasCompatible();
            setShowDesigner(value);
        })();
    }, []);

    const onDesignChanged = useCallback(
        (data: Partial<IDesignData>) => {
            if (data.frontObjects) {
                setFrontObjects(data.frontObjects);
            }
            if (data.backObjects) {
                setBackObjects(data.backObjects);
            }
            if (data.color) {
                setColor(data.color);
            }
            if (data.product) {
                setProduct(data.product);
            }
        },
        [setFrontObjects, setBackObjects, setColor, setProduct]
    );

    const designHasData = useCallback(() => {
        return frontObjects.length !== 0 || backObjects.length !== 0;
    }, [frontObjects, backObjects]);

    useEffect(() => {
        const listener = (event: BeforeUnloadEvent) => {
            if (designHasData()) {
                event.preventDefault();
                event.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', listener);

        return () => {
            window.removeEventListener('beforeunload', listener);
        };
    }, [frontObjects, backObjects, designHasData]);

    useEffect(() => {
        if (previousIsSizeDialogOpenRef.current === undefined) {
            // Don't force update canvas on initial load
            previousIsSizeDialogOpenRef.current = isSizeDialogOpen;
            return;
        }
        if (!isSizeDialogOpen) {
            // Need to re-render the canvas when size and quantity modal is cancelled otherwise the resizing widgets are broken
            setForceUpdateCanvas((forceUpdateCanvas) => forceUpdateCanvas + 1);
        }
    }, [isSizeDialogOpen]);

    const tryToLaunchSizeAndQuantityModal = useCallback(() => {
        setIsTryingToOpenSizeDialog(true);
        (async () => {
            const designExceedsDataLimit = await getDesignExceedsDataLimit(
                frontObjects,
                backObjects
            );
            if (designExceedsDataLimit) {
                alert(
                    'Dein Design übersteigt die zulässige Dateigröße. Bitte verwende Dateien mit einer geringeren Gesamtgröße. Weiter Infos findest Du in unseren FAQs.'
                );
                setForceUpdateCanvas(
                    (forceUpdateCanvas) => forceUpdateCanvas + 1
                );
            } else {
                setIsSizeDialogOpen(true);
            }
            setIsTryingToOpenSizeDialog(false);
        })();
    }, [backObjects, frontObjects]);

    return (
        <Page>
            {showDesigner ? (
                <>
                    <header className={styles.header}>
                        <h1 className={styles.heading}>Designer</h1>
                        <div>
                            <a
                                target="_blank"
                                href="https://www.urbanbasic.de/c/print-service/faqs"
                            >
                                <Tooltip title="FAQs" placement="top">
                                    <IconButton color="primary" size="medium">
                                        <Help />
                                    </IconButton>
                                </Tooltip>
                            </a>
                        </div>
                    </header>
                    <Customizer
                        frontObjects={frontObjects}
                        backObjects={backObjects}
                        color={color}
                        product={product}
                        onDesignChanged={onDesignChanged}
                        forceUpdateCanvas={forceUpdateCanvas}
                    />
                    <Divider />
                    <footer className={styles.footer}>
                        <PricePerUnitRow
                            className={styles.priceLabelMain}
                            product={product}
                            frontObjects={frontObjects}
                            backObjects={backObjects}
                        />
                        <Button
                            disabled={!designHasData()}
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={tryToLaunchSizeAndQuantityModal}
                        >
                            ZUR GRÖSSENAUSWAHL
                        </Button>
                    </footer>
                    <SizeAndQuantityModal
                        isOpen={isSizeDialogOpen}
                        setIsOpen={setIsSizeDialogOpen}
                        designHasData={designHasData}
                        frontObjects={frontObjects}
                        backObjects={backObjects}
                        color={color}
                        product={product}
                    />
                    <Spinner isSpinning={isTryingToOpenSizeDialog} />
                </>
            ) : (
                <p>
                    Leider unterstützt dieses Gerät nicht die notwendige
                    Druckauflösung. Bitte nutze diese Seite über einen
                    Desktop-Browser.
                </p>
            )}
        </Page>
    );
};

export default Home;
