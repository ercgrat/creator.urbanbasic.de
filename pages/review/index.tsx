import { Button } from '@material-ui/core';
import netlifyIdentity from 'netlify-identity-widget';
import { useContext, useEffect } from 'react';
import Page from '../../components/page';
import { IdentityContext } from '../../hooks/useIdentity';

export default function Review() {

    const user = useContext(IdentityContext);

    useEffect(() => {
        /** Launch login popup if there is no user cookie */
        netlifyIdentity.on('init', user => {
            if (!user) {
                login();
            }
        });
    }, []);

    useEffect(() => {
        if (user) {
            
        }
    }, [user]);

    function login() {
        netlifyIdentity.open('login');
    }

    function logout() {
        netlifyIdentity.logout();
        login();
    }

    return (
        <Page>
            {
                user ? 
                <Button
                    onClick={logout}
                    color='primary'
                    variant='contained'>
                        Logout
                </Button> :
                <Button
                    onClick={login}
                    color='primary'
                    variant='contained'>
                    Login
                </Button>
            }
        </Page>
    );
}