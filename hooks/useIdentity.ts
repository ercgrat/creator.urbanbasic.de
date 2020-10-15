import { useEffect, useState } from "react";
import netlifyIdentity from 'netlify-identity-widget';
import React from "react";

export const IdentityContext = React.createContext<[netlifyIdentity.User, netlifyIdentity.Token]>(null);

export default function useIdentity(): [netlifyIdentity.User, netlifyIdentity.Token] {

    const [user, setUser] = useState<netlifyIdentity.User>(null);
    const [token, setToken] = useState<netlifyIdentity.Token>(null);

    useEffect(() => {
        netlifyIdentity.on('init', user => {
            setUser(user);
        });
        netlifyIdentity.on('login', user => {
            setUser(user);
            setToken(user.token);

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