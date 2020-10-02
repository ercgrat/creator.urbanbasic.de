import '@fortawesome/fontawesome-free/css/all.css';
import 'antd/dist/antd.css';
import '../styles/global.scss';
import Head from 'next/head';
import { CartContext, useCart } from '../hooks/useCart';
import React from 'react';


export default function App({ Component, pageProps }) {
    const [cart, dispatcher] = useCart();

    return (<CartContext.Provider value={{ cart, dispatcher }}>
        <Head>
            <title>Creator</title>
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap" rel="stylesheet"></link>
        </Head>
        <Component {...pageProps} />
    </CartContext.Provider>);
}