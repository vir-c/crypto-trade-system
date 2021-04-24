export interface IExchange {
    getTickers: () => Promise<[TickerData]>
}

export type TickerData = {
    symbol: string
    lastPrice: number
    priceChange?: number
    avgPrice?: number
    volume?: number
    quoteVolume?: number
    highPrice?: Number
    lowPrice?: Number
    count?: Number
}
