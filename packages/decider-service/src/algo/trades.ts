import { ITicker } from '../db/models'
import * as EMA from './ema.algo'
import * as MACD from './macd.algo'
import * as RSI from './rsi.algo'
import * as MACD_EMA from './macd-ema.algo'

export enum ALGO_STRATEGY {
    EMA = 'EMA',
    MACD = 'MACD',
    RSI = 'RSI',
    MACD_EMA = 'MACD_EMA',
}

/**
 * returns 15 symbols that have strong updward indication according to WMA algo
 * @param tickers
 * @param assets list of symbols that are currently held
 * @returns
 */
function getGoodTrades(tickers: ITicker[], algoStrategy: ALGO_STRATEGY): string[] {
    switch (algoStrategy) {
        case 'EMA':
            return EMA.getGoodTrades(tickers)
        case 'MACD':
            return MACD.getGoodTrades(tickers)
        case 'RSI':
            return RSI.getGoodTrades(tickers)
        case 'MACD_EMA':
            return MACD_EMA.getGoodTrades(tickers)
    }
}

/**
 *
 * @param tickers
 * @param symbol
 * @param algoStrategy
 * @returns {boolean}
 */
function shouldSellAsset(tickers: ITicker[], symbol: string, algoStrategy: ALGO_STRATEGY): boolean {
    switch (algoStrategy) {
        case 'EMA':
            return EMA.shouldSellAsset(tickers, symbol)
        case 'MACD':
            return MACD.shouldSellAsset(tickers, symbol)
        case 'RSI':
            return RSI.shouldSellAsset(tickers, symbol)
        case 'MACD_EMA':
            return MACD_EMA.shouldSellAsset(tickers, symbol)
    }
}

export { getGoodTrades, shouldSellAsset }
