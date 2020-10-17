import styles from './page.module.scss';
import Link from 'next/link';
import React, { useContext } from 'react';
import { CartContext } from '../hooks/useCart';
import { Button, Card, CardContent } from '@material-ui/core';

function CartAction() {
    return (
        <i className="fas fa-shopping-bag" style={{ marginRight: "12px" }}></i>
    );
}

export default function Page({ children }) {
    const { cart } = useContext(CartContext);

    return (
        <div className={styles.container}>
            <header>
                <nav className={styles.nav}>
                    <a href="/"><img src="/images/logo.png" alt="Create Your Own Style" className={styles.logo}></img></a>
                    <ul className={styles.navActions}>
                        <li>
                            <a href="/cart" aria-label="cart" className={styles.cartLink}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<CartAction />}
                                    size="large">
                                    {cart.getSize()}
                                </Button>
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className={styles.main}>
                <Card>
                    <CardContent>
                        {children}
                    </CardContent>
                </Card>
            </main>
            <footer className={styles.footer}>
                <p>This page is part of <a href="https://urbanbasic.de" target="_blank">urbanbasic.de</a>, where you'll find our custom designs for sale. Made with love in Cologne.</p>
                <p>Developed by <a href="https://linkedin.com/in/ercgrat" target="_blank">Eric Gratta</a> on Long Island, NY.</p>
                <br />
                <p>© 2020 Urban Basic</p>
            </footer>
        </div>
    );
}