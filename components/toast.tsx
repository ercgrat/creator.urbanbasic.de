import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";

export default function Toast(props: {
    isToastOpen: boolean,
    onClose: () => void,
    children: React.ReactNode,
    severity: 'error' | 'success'
}) {

    return (
        <Snackbar
            anchorOrigin={
                {
                    vertical: 'top',
                    horizontal: 'center'
                }
            }
            open={props.isToastOpen}
            autoHideDuration={3000}
            onClose={props.onClose}>
            <Alert
                variant="filled"
                onClose={props.onClose}
                severity={props.severity}
            >
                {props.children}
            </Alert>
        </Snackbar>
    );
}