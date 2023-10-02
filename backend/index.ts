import DotEnv from 'dotenv'
DotEnv.config()

import express from 'express'
import cors from 'cors'
import { initRouterV1 } from './src/routes/index.routes'
import { initDB } from './src/configs/database.config'
import morgan from 'morgan'
import { loadFromJson } from './scripts/loadCompanies'

initDB().then(() => {
  loadFromJson('scripts/parsedCompanies.json')
})

const app = express()
const bodyParser = require('body-parser')

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
//app.use(bodyParser.json(setupForStripeWebhooks))
app.use(bodyParser.json({ type: 'application/*+json' }))
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }))
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }))
app.use(express.urlencoded({ extended: true }))

initRouterV1(app)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/form.html')
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`)
})
