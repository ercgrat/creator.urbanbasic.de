import React from "react";
import { ColorMap, Design, DesignColor } from "../../model/Cart";

export default React.memo(function ShirtUnderlay(props: {
  shirtPosition: string;
  color: DesignColor;
  className?: string;
}) {
  let heatheredImage = "url(/images/heather.png) ";
  if (props.color !== DesignColor.oxfordGrey) {
    heatheredImage = "";
  }

  return (
    <>
      <div
        className={props.className}
        style={{
          position: "relative",
          background: `${heatheredImage} center center / 100% 100% no-repeat ${
            ColorMap[props.color].color
          }`,
          zIndex: 0,
          top: '1px',
          height: 'calc(100% - 1px)'
        }}
      ></div>
      <div
        className={props.className}
        style={{
          position: "absolute",
          top: 0,
          background: `url(/images/tshirt-${props.shirtPosition}.png) center center / 100% 100% no-repeat`,
          zIndex: 1,
        }}
      />
    </>
  );
});
