export const STORAGE_KEYS = {
    CART_STORAGE_KEY: 'cart',
    DESIGN_STORAGE_KEY: 'design'
};

export const lambda = (func: string, method: ('POST' | 'GET'), body: object): Promise<Response> => {
    return fetch(`/.netlify/functions/${func}`, {
        method,
        body: JSON.stringify(body)
    });
}