import { config as conf } from './base'

if (process.env.APP_ENV != 'prod') {
    require('./local')
}

export const config = conf
