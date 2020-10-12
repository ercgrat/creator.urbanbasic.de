import React from "react";

export default React.memo(function ShirtUnderlay(props: {
    shirtPosition: string,
    color: string,
    className?: string
}) {
    return (
        <div
            className={props.className}
            style={{
                background: `url(http://localhost:3000/images/tshirt-${props.shirtPosition}.png) center center / 100% 100% no-repeat ${props.color}`
            }} />
    );
});