import { Button, makeStyles } from '@material-ui/core';
import Link from 'next/link';
import React from 'react';
import NewDesignLink from '../../components/NewDesignLink';
import Page from '../../components/page';
import styles from './index.module.scss';

const useStyles = makeStyles({
    root: {
        backgroundColor: '#efefef',
    },
});

const OrderComplete: React.FC = () => {
    const classes = useStyles();
    return (
        <Page>
            <p className={styles.hero}>
                Vielen Dank für Deine Bestellung! 👕🌟
            </p>
            <footer className={styles.footer}>
                <Link href="https://urbanbasic.de">
                    <Button
                        variant="contained"
                        size="large"
                        className={classes.root}
                    >
                        Zurück zu Urban Basic
                    </Button>
                </Link>
                <NewDesignLink
                    buttonRootStyles={{
                        margin: '0px 12px',
                    }}
                />
            </footer>
        </Page>
    );
};

export default OrderComplete;
