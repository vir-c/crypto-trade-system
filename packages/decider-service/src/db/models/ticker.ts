import mongoose, { Schema, Document } from 'mongoose'
import { IPrice, PriceSchema } from './price'

export interface ITicker extends Document {
    exchange: string
    date?: Date
    priceList: IPrice[]
}

const TickerSchema = new Schema({
    exchange: String,
    date: { type: Date, default: Date.now },
    priceList: [PriceSchema],
})

export const TickerModel = mongoose.model<ITicker>('Ticker', TickerSchema)
