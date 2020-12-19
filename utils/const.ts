export const STORAGE_KEYS = {
    CART_IDENTIFIER_KEY: 'cart',
    DESIGN_STORAGE_KEY: 'design',
};

const CART = 'cart';
const CART_ITEM = 'cart_item';
const ORDER = 'order';

export const URLS = {
    CART_ITEM: {
        CREATE: (): string => CART_ITEM,
        READ: (id: string): string => `${CART_ITEM}/${id}`,
        UPDATE: (id: string): string => `${CART_ITEM}/${id}`,
    },
    CART: {
        CREATE: (): string => CART,
        UPDATE: (id: string): string => `${CART}/${id}`,
        DELETE_ITEM: (id: string, itemId: string): string =>
            `${CART}/${id}/item/${itemId}`,
    },
    ORDER: {
        UPDATE: (id: string): string => `${ORDER}/${id}`,
    },
};

export const VAT = 0.19; // Tax
