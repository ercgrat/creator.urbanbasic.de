import { Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';

type Props = {
    isToastOpen: boolean;
    onClose: () => void;
    severity: 'error' | 'success';
};
const Toast: React.FC<Props> = ({
    isToastOpen,
    onClose,
    children,
    severity,
}) => {
    return (
        <Snackbar
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            open={isToastOpen}
            autoHideDuration={3000}
            onClose={onClose}
        >
            <Alert variant="filled" onClose={onClose} severity={severity}>
                {children}
            </Alert>
        </Snackbar>
    );
};

export default Toast;
