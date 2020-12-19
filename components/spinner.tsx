import {
    Backdrop,
    Box,
    CircularProgress,
    makeStyles,
    Typography,
} from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles({
    backdrop: {
        zIndex: 1,
    },
    circle: {
        strokeLinecap: 'round',
    },
});

type Props = {
    isSpinning: boolean;
    message?: string;
};

const Spinner: React.FC<Props> = ({ isSpinning, message }) => {
    const classes = useStyles();

    return (
        <Backdrop open={isSpinning} className={classes.backdrop}>
            <Box position="relative" display="inline-flex">
                <CircularProgress
                    color="secondary"
                    size={200}
                    thickness={3}
                    classes={{
                        circle: classes.circle,
                    }}
                />
                {message && (
                    <Box
                        top={0}
                        left={0}
                        bottom={0}
                        right={0}
                        position="absolute"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Typography
                            variant="h1"
                            component="div"
                            color="secondary"
                        >
                            {message}
                        </Typography>
                    </Box>
                )}
            </Box>
        </Backdrop>
    );
};

export default React.memo(Spinner);
