import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import './database'

import routes from './routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(cors())
app.use(express.json());
app.use('/', routes)

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})