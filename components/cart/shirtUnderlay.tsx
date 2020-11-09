import React from "react";
import { ColorMap, DesignColor } from "../../model/Cart";

export default React.memo(function ShirtUnderlay(props: {
  shirtPosition: string;
  color: DesignColor;
  className?: string;
}) {
  return (
    <div
      className={props.className}
      style={{
        background: `url(/images/tshirt-${
          props.shirtPosition
        }.png) center center / 100% 100% no-repeat ${
          ColorMap[props.color].color
        }`,
      }}
    />
  );
});
