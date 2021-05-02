const dotenv = require('dotenv')
const path = require('path')

const envPath = path.join(__dirname, '../../envs/.env')
dotenv.config({ path: envPath })

console.log('Env variables defined...')
