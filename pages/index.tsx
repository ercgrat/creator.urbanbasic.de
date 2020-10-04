import Page from '../components/page';
import Customizer from '../components/customizer';
import { Divider, Button, makeStyles } from '@material-ui/core';
import styles from './index.module.scss';

const useStyles = makeStyles({
    divider: {
        margin: '0 -24px'
    },
    footer: {
        margin: '0px -24px -24px -24px',
        padding: '12px 24px',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'row-reverse'
    }
});

export default function Home() {

    const styles = useStyles();

    return (
        <Page>
            <Customizer />
            <Divider className={styles.divider} />
            <footer className={styles.footer}>
                <Button variant="contained" color="primary" startIcon={<i className="fas fa-shopping-bag" style={{ marginRight: "12px" }}></i>} size="large">
                    Add to Cart
                </Button>
            </footer>
        </Page>
    )
};