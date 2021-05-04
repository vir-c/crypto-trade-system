import { Schema } from 'mongoose'

export type PriceData = {
    symbol: string
    lastPrice: number //last price
    priceChangePercent: number //percentage price change 24
    avgPrice24hr: number //avg price 24 hr
    avgPrice5min: number //avg price 5 min
    volume: number //volume,
    quoteVolume: number // volume in target currency
    highPrice: number //high price in 24 hr
    lowPrice: number //24 hr
    count: number // number of trades in last 24 hr
}

export interface IPrice extends PriceData {}

export const PriceSchema: Schema = new Schema({
    symbol: String,
    lastPrice: Number, //last price
    priceChangePercent: Number, //percentage price change 24
    avgPrice24hr: Number, //avg price 24 hr
    avgPrice5min: Number, //avg price 5 min
    volume: Number, //volume,
    quoteVolume: Number, // volume in target currency
    highPrice: Number, //high price in 24 hr
    lowPrice: Number, //24 hr
    count: Number, // number of trades in last 24 hr
})
