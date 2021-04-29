import { Log } from '../../../../shared/node'
import { ITicker } from '../db/models'

const fs = require('fs')
const readline = require('readline')

function getTickers(filePath: string): Promise<ITicker[]> {
    return new Promise((resolve, reject) => {
        try {
            const tickers: ITicker[] = []
            const rl = readline.createInterface({
                input: fs.createReadStream(filePath),
                terminal: false,
            })

            rl.on('line', (line) => {
                tickers.push(JSON.parse(line))
            })

            rl.on('close', () => {
                resolve(tickers)
            })
        } catch (error) {
            Log.error(error, 'File Read failed... ')
        }
    })
}

export default {
    getTickers,
}
