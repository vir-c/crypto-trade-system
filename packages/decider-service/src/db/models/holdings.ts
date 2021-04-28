import { Document, model, Schema } from 'mongoose'

export type Holdings = {
    date?: Date
    assets: string[]
    totalPL: number
}

export interface IHoldings extends Holdings, Document {}

export const HoldingsSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    assets: [String],
    totalPL: Number,
})

export const HoldingsModel = model<IHoldings>('Holdings', HoldingsSchema)
