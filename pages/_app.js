import '../styles/global.scss';
import '@fortawesome/fontawesome-free/css/all.css';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
    return (<div>
        <Head>
            <title>Creator</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
    </div>);
}