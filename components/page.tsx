import styles from './page.module.scss';
import Link from 'next/link';
import React, { useContext } from 'react';
import { CartContext } from '../hooks/useCart';
import { Button, Card, CardContent } from '@material-ui/core';
import moment from 'moment';

function CartAction() {
    return (
        <i className="fas fa-shopping-bag" style={{ marginRight: '12px' }}></i>
    );
}

const Page: React.FC = ({ children }) => {
    const { cart } = useContext(CartContext);

    return (
        <div className={styles.container}>
            <header>
                <nav className={styles.nav}>
                    <Link href="/">
                        <img
                            src="/images/logo.png"
                            alt="Create Your Own Style"
                            className={styles.logo}
                        ></img>
                    </Link>
                    <ul className={styles.navActions}>
                        <li>
                            <a
                                href="/cart"
                                aria-label="cart"
                                className={styles.cartLink}
                            >
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CartAction />}
                                    size="large"
                                >
                                    {cart.getSize()}
                                </Button>
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className={styles.main}>
                <Card>
                    <CardContent>{children}</CardContent>
                </Card>
            </main>
            <footer className={styles.footer}>
                <p>
                    Zurück zu{' '}
                    <a href="https://urbanbasic.de" target="_blank">
                        urbanbasic.de
                    </a>
                </p>
                <p>
                    Dieser Designer wurde entwickelt und programmiert von{' '}
                    <a href="https://linkedin.com/in/ercgrat" target="_blank">
                        Eric Gratta
                    </a>
                    , Long Island, NY, USA
                </p>
                <br />
                <p>© {moment().format('YYYY')} Urban Basic</p>
            </footer>
        </div>
    );
};

export default Page;
