

export const tradeDate = (date: number | undefined) => {
    return date ? new Date(date).toISOString().replace(/T/, '-').replace(/\..+/, '') : "";
}