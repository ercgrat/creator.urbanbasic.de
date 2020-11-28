import { FormControl, Select } from '@material-ui/core';
import React from 'react';
import { DesignProduct, Product, ProductMap } from '../../model/Cart';

type Props = {
    onChange: (
        event: React.ChangeEvent<{ name?: string; value: unknown }>
    ) => void;
};
const ProductSelect: React.FC<Props> = (props) => {
    return (
        <FormControl variant="outlined" size="small">
            <Select
                value={DesignProduct.tshirt}
                onChange={props.onChange}
                native
            >
                {Object.keys(DesignProduct).map((productKey) => {
                    const product = ProductMap[
                        productKey as DesignProduct
                    ] as Product;
                    return (
                        <option
                            key={productKey}
                            value={productKey}
                            title={product.name}
                        >
                            {product.name}
                        </option>
                    );
                })}
            </Select>
        </FormControl>
    );
};

export default React.memo(ProductSelect);
