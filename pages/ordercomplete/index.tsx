import { Button, makeStyles } from "@material-ui/core";
import Link from "next/link";
import React from "react";
import Page from "../../components/page";
import styles from "./index.module.scss";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#efefef",
  },
  footerButton: {
    margin: "0px 12px",
  },
});

export default function OrderComplete() {
  const classes = useStyles();
  return (
    <Page>
      <p className={styles.hero}>Vielen Dank für Deine Bestellung! 👕🌟</p>
      <footer className={styles.footer}>
        <Link href="https://urbanbasic.de">
          <Button variant="contained" size="large" className={classes.root}>
            Zurück zu Urban Basic
          </Button>
        </Link>
        <Link href="/">
          <Button
            variant="contained"
            size="large"
            color="primary"
            classes={{ root: classes.footerButton }}
          >
            Neu starten
          </Button>
        </Link>
      </footer>
    </Page>
  );
}
