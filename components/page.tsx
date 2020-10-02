import styles from './page.module.scss';
import Link from 'next/link';

export default function Page({ children }) {
    return (
        <div className={styles.container}>
            <header>
                <nav className={styles.nav}>
                    <Link href="/"><img src="/images/logo.png" alt="Create Your Own Style" className={styles.logo}></img></Link>
                    <ul className={styles.navActions}>
                        <li>
                            <Link href="/cart">
                                <div>
                                    <i className="fas fa-shopping-bag"></i>
                                    <p>3</p>
                                </div>
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
            <main className={styles.main}>
                {children}
            </main>
            <footer className={styles.footer}>
                <p><i>This page is part of <a href="https://urbanbasic.de" target="_blank">urbanbasic.de</a>, where you'll find our custom designs for sale. Made with love in Cologne.</i></p>
                <p><i>Developed by <a href="https://linkedin.com/in/ercgrat" target="_blank">Eric Gratta</a> on Long Island, NY.</i></p>
            </footer>
        </div>
    );
}