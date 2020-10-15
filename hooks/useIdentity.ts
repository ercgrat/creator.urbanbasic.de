import { Dispatch, useEffect, useState } from "react";
import netlifyIdentity from 'netlify-identity-widget';
import React from "react";

export const IdentityContext = React.createContext<netlifyIdentity.User>(null);

export default function useIdentity(): netlifyIdentity.User {

    let user: netlifyIdentity.User, setUser: Dispatch<netlifyIdentity.User>;
    [user, setUser] = useState<netlifyIdentity.User>(null);

    useEffect(() => {
        netlifyIdentity.on('init', user => {
            setUser(user);
        });
        netlifyIdentity.on('login', user => {
            setUser(user);
        });
        netlifyIdentity.on('logout', () => {
            setUser(null);
        });

        netlifyIdentity.init();
    }, [setUser]);

    return user;
}