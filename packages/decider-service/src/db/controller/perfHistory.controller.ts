import { PerfHistory, PerfHistoryModel, SymbolPerf } from '../models/perfHistory'

async function update(symbolPerfList: SymbolPerf[]) {
    return PerfHistoryModel.updateOne(
        {},
        { $set: { perfHistory: symbolPerfList } },
        {
            upsert: true,
        }
    )
        .then((data) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

async function get(): Promise<PerfHistory> {
    return PerfHistoryModel.findOne({})
        .then((data) => {
            return data
        })
        .catch((error: Error) => {
            throw error
        })
}

export default {
    update,
    get,
}
