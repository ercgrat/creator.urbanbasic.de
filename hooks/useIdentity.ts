import { useEffect, useState } from "react";
import netlifyIdentity from 'netlify-identity-widget';
import React from "react";

export const IdentityContext = React.createContext<[netlifyIdentity.User, string]>(null);

export default function useIdentity(): [netlifyIdentity.User, string] {

    const [user, setUser] = useState<netlifyIdentity.User>(null);
    const [token, setToken] = useState<string>(null);

    useEffect(() => {
        netlifyIdentity.on('init', user => {
            setUser(user);
        });
        netlifyIdentity.on('login', user => {
            setUser(user);
            (netlifyIdentity as any).refresh().then(token => {
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