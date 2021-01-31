import '@fortawesome/fontawesome-free/css/all.css';
import '../styles/global.scss';
import Head from 'next/head';
import { CartContext, useCart } from '../hooks/useCart';
import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import useIdentity, { IdentityContext } from '../hooks/useIdentity';
import { enableMapSet } from 'immer';
import ErrorBoundary from '../components/ErrorBoundary';
import AWS from 'aws-sdk';
enableMapSet();

const App: React.FC<{
    Component: React.ComponentType;
    pageProps: React.PropsWithChildren<unknown>;
}> = ({ Component, pageProps }) => {
    const [cart, cartDispatcher, isCartLoading] = useCart();
    const user = useIdentity();

    React.useEffect(() => {
        // Remove the server-side injected CSS.
        const jssStyles = document.querySelector('#jss-server-side');
        jssStyles?.parentElement?.removeChild(jssStyles);

        // Establish AWS credentials
        const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ?? '';
        const secretAccessKey =
            process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ?? '';
        AWS.config.credentials = {
            accessKeyId,
            secretAccessKey,
        };
        AWS.config.region = 'eu-central-1';
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
                <link
                    rel="preload"
                    href={`/images/tshirt-front.webp`}
                    as="image"
                ></link>
                <link
                    rel="prefetch"
                    href={`/images/tshirt-back.webp`}
                    as="image"
                ></link>
                <link
                    rel="preload"
                    href={`/images/heather.webp`}
                    as="image"
                ></link>
                <link
                    rel="preload"
                    href={`/fonts/FiraSans.ttf`}
                    as="font"
                ></link>
                <meta
                    name="keywords"
                    content="T-Shirt gestalten, T-Shirt Druck, Urban Basic, Printservice, Textildruck, Köln, Geschenk, Jungesellenabschied, Teamshirts, Arbeitsbekleidung, DIY, T-Shirts bedrucken"
                ></meta>
            </Head>
            <ErrorBoundary>
                <IdentityContext.Provider value={user}>
                    <CartContext.Provider
                        value={{ cart, cartDispatcher, isCartLoading }}
                    >
                        <Component {...pageProps} />
                    </CartContext.Provider>
                </IdentityContext.Provider>
            </ErrorBoundary>
        </ThemeProvider>
    );
};

export default App;
