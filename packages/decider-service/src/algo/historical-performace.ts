/**
 * For some symbols the volatility cycles will produce trade signal that may generally lead to loss
 * Invest in symbols who have historically given better profits and avoid symbols that generated loss
 *
 */

const perfHistorytMap: Map<string, number> = new Map()

const updatePerf = (symbol: string, pl: number) => {
    if (!perfHistorytMap.has(symbol)) perfHistorytMap.set(symbol, 0)

    perfHistorytMap.set(symbol, perfHistorytMap.get(symbol) + pl)
}

const getPerf = (symbol: string): number => {
    return perfHistorytMap.get(symbol) || 0
}

const sortByPerf = (symbols: string[]) => {
    return symbols.sort((s1, s2) => -1 * (getPerf(s1) - getPerf(s2)))
}

const printPerfHistory = () => {
    let s = ''
    perfHistorytMap.forEach((v, k) => {
        s += ` ${k}:${v}, `
    })

    console.log(s)
}

const getAll = (): { symbol: string; pl: number }[] => {
    const allSymbolsPL = []
    perfHistorytMap.forEach((val, key) => allSymbolsPL.push({ symbol: key, pl: val }))

    return allSymbolsPL
}

export const symbolPerfHistory = {
    updatePerf,
    sortByPerf,
    printPerfHistory,
    getAll,
}
