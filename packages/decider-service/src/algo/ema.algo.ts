import { map, range, compose, reduce, sum, zipWith, __ } from 'ramda'
/*
For 6
[
  0.21869995029546582,
  0.1913624565085326,
  0.17009996134091787,
  0.15308996520682608,
  0.13917269564256918,
  0.1275749710056884
]
*/

//const getWeightFn = (n) => (x) => 1 / (n * 4 + x)
//ema
const getWeightFn = (n) => (x) => (2 / (n + 1)) * Math.pow(1 - 2 / (n + 1), x)

const getWeightsN = (n) => compose(map(getWeightFn(n)), range(0))(n)
const divideBy = (s) => (x) => x / s //https://ramdajs.com/docs/#divide
const multiply = (x, y) => x * y

//normalize array
const norm = (w) => map(compose(divideBy, sum)(w))(w)

function getWeights(size: number): number[] {
    return compose(norm, getWeightsN)(size)
}

/**
 * calculates weighted moving average with given weights
 * @param nums number array to calculate EMA for
 * @param ws weight to consider
 * @returns weighted moving average
 */
function getWMA(nums: number[], ws: number[]): number {
    return sum(zipWith(multiply, nums, ws))
}

const percentchange = (base: number, now: number) => ((now - base) / base) * 100

export type AlgoStrategy = (priceList: number[]) => number

/**
 * calculates WMA changes between time intervals
 * @param {number[]} priceList
 * @returns {number}
 */
function createAlgoStrategy(periodShort: number, periodLong: number, periodMed?: number): AlgoStrategy {
    const wShort = getWeights(periodShort)
    const wLong = getWeights(periodLong)
    const wMed = periodMed ? getWeights(periodMed) : null

    return (priceList: number[]) => {
        const emaShort = getWMA(priceList, wShort)
        const emaLong = getWMA(priceList, wLong)

        if (!periodMed) return percentchange(emaLong, emaShort)
        else {
            const emaMed = getWMA(priceList, wMed)
            return 0.6 * percentchange(emaMed, emaShort) + 0.4 * percentchange(emaLong, emaShort)
        }
    }
}

/**
 * calculates WMA change for a given asset symbol
 */
function assetEMAChange(priceList: number[], wmaStrategy: AlgoStrategy): number {
    return wmaStrategy(priceList)
}

export { getWMA, getWeights, createAlgoStrategy, assetEMAChange }
