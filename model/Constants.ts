export const STORAGE_KEYS = {
    CART_IDENTIFIER_KEY: 'cart',
    DESIGN_STORAGE_KEY: 'design'
};

export function formatPrice(value: number) {
    return `${value.toFixed(2).replace('.', ',')} €`;
}