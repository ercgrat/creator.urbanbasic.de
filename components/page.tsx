import styles from './page.module.scss';
import Link from 'next/link';
import { Card, Steps, Button } from 'antd';
import { useContext } from 'react';
import { CartContext } from '../hooks/useCart';
const { Step } = Steps;

function CartAction() {
    return (
        <i className="fas fa-shopping-bag" style={{ marginRight: "12px" }}></i>
    );
}

export default function Page({ children }) {
    const { cart, dispatcher } = useContext(CartContext);

    return (
        <div className={styles.container}>
            <header>
                <nav className={styles.nav}>
                    <Link href="/"><img src="/images/logo.png" alt="Create Your Own Style" className={styles.logo}></img></Link>
                    <ul className={styles.navActions}>
                        <li>
                            <Link href="/cart">
                                <Button type="primary" shape="round" icon={<CartAction />} size="large">
                                    { cart.getSize() }
                                </Button>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className={styles.main}>
                <Card title={
                    <Steps current={0}>
                        <Step title="Design" />
                        <Step title={<Link href="/cart">Review cart</Link>} />
                        <Step title="Submit order" />
                    </Steps>
                }>
                    {children}
                </Card>
            </main>
            <footer className={styles.footer}>
                <p><i>This page is part of <a href="https://urbanbasic.de" target="_blank">urbanbasic.de</a>, where you'll find our custom designs for sale. Made with love in Cologne.</i></p>
                <p><i>Developed by <a href="https://linkedin.com/in/ercgrat" target="_blank">Eric Gratta</a> on Long Island, NY.</i></p>
            </footer>
        </div>
    );
}