import { Typography } from '@material-ui/core';
import React from 'react';
import { DesignProduct, ProductMap } from '../../../model/Cart';
import { formatPrice } from '../../../utils';
import styles from './PricePerUnitRow.module.scss';

type Props = {
    product: DesignProduct;
    frontObjects: fabric.Object[];
    backObjects: fabric.Object[];
    className?: string;
};

const PricePerUnitRow: React.FC<Props> = ({
    product,
    frontObjects,
    backObjects,
    className,
}) => (
    <div className={className}>
        <Typography variant="h6" component="span">
            Einzelpreis:{' '}
            <span className={styles.price}>
                {formatPrice(
                    frontObjects.length > 0 && backObjects.length > 0
                        ? ProductMap[product].twoSidedPrice
                        : ProductMap[product].oneSidedPrice
                )}
            </span>
        </Typography>
    </div>
);

export default React.memo(PricePerUnitRow);
