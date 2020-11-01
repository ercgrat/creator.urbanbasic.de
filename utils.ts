export function formatPrice(value: number) {
    return `${value.toFixed(2).replace('.', ',')} €`;
}