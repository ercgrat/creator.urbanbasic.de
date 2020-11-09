import { Tooltip as MuiTooltip, withStyles } from "@material-ui/core";
import React from "react";

const StyledTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: 11,
    marginBottom: "0px",
  },
}))(MuiTooltip);

export default React.memo(function Tooltip(
  props: React.ComponentProps<typeof StyledTooltip>
) {
  return <StyledTooltip {...props} />;
});
