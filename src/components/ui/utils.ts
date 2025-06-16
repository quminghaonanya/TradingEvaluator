

export const tradeDate = (date: number | undefined) => {
    return date ? new Date(date).toISOString().replace(/T/, '-').replace(/\..+/, '') : "";
}


export function formatNumber(num: number, decimals = 2): string {
    return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}