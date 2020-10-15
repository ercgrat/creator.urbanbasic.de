import netlifyIdentity from 'netlify-identity-widget';

export const STORAGE_KEYS = {
    CART_STORAGE_KEY: 'cart',
    DESIGN_STORAGE_KEY: 'design'
};

export const lambda = (func: string, method: ('POST' | 'GET'), body?: object, token?: netlifyIdentity.Token): Promise<Response> => {
    return fetch(`/.netlify/functions/${func}`, {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: token ? [
            ['Authorization', `Bearer ${token}`]
        ] : null
    });
};

export interface IFaunaObject<T> {
    ref: {
        '@ref': {
            id: 'string'
        }
    },
    data: T,
    ts: number
}