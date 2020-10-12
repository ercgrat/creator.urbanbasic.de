import { Button, makeStyles } from "@material-ui/core";
import Link from "next/link";
import React from "react";
import Page from "../../components/page";
import styles from './index.module.scss';

const useStyles = makeStyles({
    root: {
        backgroundColor: '#efefef'
    }
});

export default function OrderComplete() {
    const classes = useStyles();
    return (
        <Page>
            <p className={styles.hero}>
                Thank you for your order! 👕🌟
            </p>
            <footer className={styles.footer}>
                <Link href='https://urbanbasic.de'>
                    <Button
                        variant='contained'
                        size='large'
                        className={classes.root}
                    >
                        Back to Urban Basic
                </Button>
                </Link>
                <Link href='/'>
                    <Button
                        variant='contained'
                        size='large'
                        color='primary'
                    >
                        Start Over
                </Button>
                </Link>
            </footer>
        </Page>
    );
}