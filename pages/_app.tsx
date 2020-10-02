import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/global.scss';
import Head from 'next/head';
import { CartContext, useCart } from '../hooks/useCart';
import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';


export default function App({ Component, pageProps }) {
    const [cart, dispatcher] = useCart();
    const theme = createMuiTheme({
        typography: {
            fontFamily: [
                'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'
            ].join(','),
        },
        palette: {
            primary: {
                main: "#74b6c7"
            },
            secondary: {
                main: "#d89507"
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>Creator</title>
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap" rel="stylesheet"></link>
            </Head>
            <CartContext.Provider value={{ cart, dispatcher }}>
                <Component {...pageProps} />
            </CartContext.Provider>
        </ThemeProvider>
    );
}