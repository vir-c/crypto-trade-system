import util from 'util'

export class Log {
    static error(error: Error, message?: string) {
        const errorStr = util.inspect(error, { depth: null })

        console.log(message ? `${message} : ${errorStr}` : errorStr)

        return errorStr
    }
}
