/**
 * y = (y2−y1/x2−x1)*(x – x1) + y1
 */

const getLineEq = (x: [number, number], y: [number, number]): ((arg0: number) => number) => (n) =>
    ((y[1] - y[0]) / (x[1] - x[0])) * (n - x[1]) + y[1]

const upperBound = (n: number) => Math.min(getLineEq([0.2, 0.7], [5, 2.5])(n), 5)
const lowerBound = (n: number) => Math.max(getLineEq([0.2, 0.7], [2, 0.6])(n), 0.6)

const getSmartBounds = (n: number) => [lowerBound(n), upperBound(n)]

export default {
    getSmartBounds,
}
