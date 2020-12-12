import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/global.scss';
import Head from 'next/head';
import { CartContext, useCart } from '../hooks/useCart';
import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import useIdentity, { IdentityContext } from '../hooks/useIdentity';
import { enableMapSet } from 'immer';
enableMapSet();

const App: React.FC<{
    Component: React.ComponentType;
    pageProps: React.PropsWithChildren<unknown>;
}> = ({ Component, pageProps }) => {
    const [cart, cartDispatcher] = useCart();
    const user = useIdentity();

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        jssStyles?.parentElement?.removeChild(jssStyles);
    }, []);

    const theme = createMuiTheme({
        typography: {
            fontFamily: [
                'Fira Sans',
                'Droid Sans',
                'Helvetica Neue',
                'sans-serif',
            ].join(','),
        },
        palette: {
            primary: {
                main: '#74b6c7',
                contrastText: 'white',
            },
            secondary: {
                main: '#d89507',
            },
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <Head>
                <title>Creator</title>
                <link rel="icon" href="/favicon.png" />
                <link rel="prefetch" href={`/images/tshirt-front.png`}></link>
                <link rel="prefetch" href={`/images/tshirt-back.png`}></link>
                <link rel="prefetch" href={`/images/heather.png`}></link>
                <meta
                    name="keywords"
                    content="T-Shirt gestalten, T-Shirt Druck, Urban Basic, Printservice, Textildruck, Köln, Geschenk, Jungesellenabschied, Teamshirts, Arbeitsbekleidung, DIY, T-Shirts bedrucken"
                ></meta>
            </Head>
            <IdentityContext.Provider value={user}>
                <CartContext.Provider value={{ cart, cartDispatcher }}>
                    <Component {...pageProps} />
                </CartContext.Provider>
            </IdentityContext.Provider>
        </ThemeProvider>
    );
};

export default App;
