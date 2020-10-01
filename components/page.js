import styles from './page.module.scss';
import Link from 'next/link';

export default function Page({ children }) {
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <img src="/images/logo.png" alt="Create Your Own Style" className={styles.logo}></img>
                <Link href="/cart"><i className="fas fa-shopping-cart"></i></Link>
            </nav>
            <main className={styles.main}>
                { children }
            </main>
        </div>
    );
}