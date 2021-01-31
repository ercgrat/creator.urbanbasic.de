export function formatPrice(value: number): string {
    return value.toLocaleString('de-DE', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(0)}%`;
}
