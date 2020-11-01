import { FormControl, Select } from "@material-ui/core";
import React from "react";
import { DesignProduct, ProductMap } from '../../model/Cart';
import { formatPrice } from "../../utils";

export default React.memo(function ProductSelect(props: {
    onChange
}) {
    return (
        <FormControl variant='outlined' size='small'>
            <Select value={DesignProduct.tshirt} onChange={props.onChange} native>
                {
                    Object.keys(DesignProduct).map(productKey => {
                        const product = ProductMap[productKey];
                        return <option key={productKey} value={productKey}>{
                            `${product.name} - ${formatPrice(product.oneSidedPrice)}/${formatPrice(product.twoSidedPrice)}`
                        }</option>
                    })
                }
            </Select>
        </FormControl>
    )
});