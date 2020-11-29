import Page from '../components/page';
import { Button } from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { fabric } from 'fabric';
import Customizer, { IDesignData } from '../components/customizer/customizer';
import Divider from '../components/divider';
import { DesignColor, DesignProduct } from '../model/Cart';
import styles from './index.module.scss';
import PricePerUnitRow from '../components/customizer/SizeAndQuantityModal/PricePerUnitRow';
import SizeAndQuantityModal from '../components/customizer/SizeAndQuantityModal';

const Home: React.FC = () => {
    const [frontObjects, setFrontObjects] = useState<fabric.Object[]>([]);
    const [backObjects, setBackObjects] = useState<fabric.Object[]>([]);
    const [color, setColor] = useState<DesignColor>(DesignColor.white);
    const [product, setProduct] = useState<DesignProduct>(DesignProduct.tshirt);
    const [isSizeDialogOpen, setIsSizeDialogOpen] = useState<boolean>(false);

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

    return (
        <Page>
            <header className={styles.header}>
                <h1 className={styles.heading}>Designer</h1>
            </header>
            <Customizer
                frontObjects={frontObjects}
                backObjects={backObjects}
                color={color}
                product={product}
                onDesignChanged={onDesignChanged}
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
                    onClick={() => setIsSizeDialogOpen(true)}
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
        </Page>
    );
};

export default Home;
