import mongoose, { Document, Schema } from 'mongoose'

export enum TradeType {
    BUY = 'BUY',
    SELL = 'SELL',
}

export type Trade = {
    symbol: string
    date: Date
    price: number
    quantity: number
    tradeValue: number //$ value of trade
    tradeType: TradeType
    profitOrLoss?: number //profit or loss on SELL
}

export interface ITrade extends Trade, Document {}

export const TradeSchema: Schema = new Schema({
    symbol: String,
    date: Date,
    price: Number,
    quantity: Number,
    tradeValue: Number,
    tradeType: {
        type: String,
        enum: [TradeType.BUY, TradeType.SELL],
    },
    profitOrLoss: Number,
})

export const TradeModel = mongoose.model<ITrade>('Trade', TradeSchema)
