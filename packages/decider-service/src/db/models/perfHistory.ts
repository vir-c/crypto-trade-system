import { Document, model, Schema } from 'mongoose'

export type SymbolPerf = {
    symbol: string
    pl: number
}

export const SymbolPerfSchema: Schema = new Schema({
    symbol: String,
    pl: Number,
})

export type PerfHistory = {
    perfHistory: SymbolPerf[]
}

export interface IPerfHistory extends PerfHistory, Document {}

export const PerfHistorySchema: Schema = new Schema({
    perfHistory: [SymbolPerfSchema],
})

export const PerfHistoryModel = model<IPerfHistory>('PerfHistory', PerfHistorySchema)
