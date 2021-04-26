import { Schema, Document } from 'mongoose'
import { PriceData } from '../../exchange/exchange.interface'

export interface IPrice extends PriceData {}

export const PriceSchema: Schema = new Schema({
    symbol: String,
    lastPrice: Number, //last price
    priceChangePercent: Number, //percentage price change 24
    avgPrice: Number, //avg price 24 hr
    volume: Number, //volume,
    quoteVolume: Number, // volume in target currency
    highPrice: Number, //high price in 24 hr
    lowPrice: Number, //24 hr
    count: Number, // number of trades in last 24 hr
})
