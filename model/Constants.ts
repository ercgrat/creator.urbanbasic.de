export const STORAGE_KEYS = {
    CART_IDENTIFIER_KEY: 'cart',
    DESIGN_STORAGE_KEY: 'design',
};

export function formatPrice(value: number): string {
    return value.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
    });
}
