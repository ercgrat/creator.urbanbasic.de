import { Backdrop, CircularProgress, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles({
    backdrop: {
        zIndex: 1
    },
    circle: {
        strokeLinecap: 'round'
    }
});

export default React.memo(function Spinner(props: { isSpinning: boolean }) {
    const classes = useStyles();

    return (
        <Backdrop
            open={props.isSpinning}
            className={classes.backdrop}>
            <CircularProgress
                color='secondary'
                size={200}
                thickness={3}
                classes={{
                    circle: classes.circle
                }} />
        </Backdrop>
    );
});