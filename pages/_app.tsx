import '@fortawesome/fontawesome-free/css/all.css';
import 'antd/dist/antd.css';
import '../styles/global.scss';
import Head from 'next/head';

export default function App({ Component, pageProps }) {
    return (<div>
        <Head>
            <title>Creator</title>
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Component {...pageProps} />
    </div>);
}