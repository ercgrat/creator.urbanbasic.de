import { Button, makeStyles } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import Link from 'next/link';
import React from 'react';

type Props = {
    buttonRootStyles?: Partial<React.CSSProperties>;
    variant?: React.ComponentProps<typeof Button>['variant'];
};
const NewDesignLink: React.FC<Props> = ({
    buttonRootStyles,
    variant = 'contained',
}) => {
    const classes = makeStyles({
        root: buttonRootStyles ?? {},
    })();

    return (
        <Link href="/">
            <Button
                variant={variant}
                size="large"
                color="primary"
                classes={{ root: classes.root }}
                startIcon={<Add />}
            >
                Neues design
            </Button>
        </Link>
    );
};
export default React.memo(NewDesignLink);
