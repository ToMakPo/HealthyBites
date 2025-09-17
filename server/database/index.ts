// MongoDB connection and products collection setup
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI: string = process.env.MONGO_URI as string

mongoose.connect(MONGO_URI)

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
	console.log('Connected to MongoDB')
})

export { db }
