import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.use(cors())

app.get('/', (req: any, res: { send: (arg0: string) => void }) => {
	res.send('Hello from HealthyBites server!')
})

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`)
})