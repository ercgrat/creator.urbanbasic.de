import { useEffect, useState } from 'react';
import netlifyIdentity from 'netlify-identity-widget';
import React from 'react';

export const IdentityContext = React.createContext<
    [netlifyIdentity.User | null, string | undefined]
>([null, undefined]);

export default function useIdentity(): [
    netlifyIdentity.User | null,
    string | undefined
] {
    const [user, setUser] = useState<netlifyIdentity.User | null>(null);
    const [token, setToken] = useState<string>();

    useEffect(() => {
        netlifyIdentity.on('init', (user) => {
            setUser(user);
        });
        netlifyIdentity.on('login', (user) => {
            setUser(user);
            netlifyIdentity.refresh().then((token) => {
                setToken(token);
            });
        });
        netlifyIdentity.on('logout', () => {
            setUser(null);
        });

        netlifyIdentity.init();
    }, [setUser]);

    return [user, token];
}
