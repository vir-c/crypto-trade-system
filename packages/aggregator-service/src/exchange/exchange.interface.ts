export interface IExchange {
    getTickers: () => Promise<PriceData[]>
}

export type PriceData = {
    symbol: string
    lastPrice: number
    priceChangePercent?: number
    avgPrice24hr?: number
    avgPrice5min?: number
    volume?: number
    quoteVolume?: number
    highPrice?: Number
    lowPrice?: Number
    count?: Number
}
