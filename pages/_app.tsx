import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/global.scss';
import Head from 'next/head';
import { CartContext, useCart } from '../hooks/useCart';
import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import { DesignColor } from '../model/Cart';


export default function App({ Component, pageProps }) {
    const [cart, dispatcher] = useCart();

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        if (jssStyles) {
            jssStyles.parentElement.removeChild(jssStyles);
        }
    }, []);
    
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
                <link rel="icon" href="/favicon.png" />
                {
                    Object.keys(DesignColor).map(color => (<React.Fragment key={color}>
                        <link rel="prefetch" href={`/images/${color}-front.jpg`}></link>
                        <link rel="prefetch" href={`/images/${color}-back.jpg`}></link>
                    </React.Fragment>))
                }
                <link href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;700&display=swap" rel="stylesheet"></link>
            </Head>
            <CartContext.Provider value={{ cart, cartDispatcher: dispatcher }}>
                <Component {...pageProps} />
            </CartContext.Provider>
        </ThemeProvider>
    );
}