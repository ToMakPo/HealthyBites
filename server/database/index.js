// MongoDB connection and products collection setup
const mongoose = require('mongoose')
const productSchema = require('./productSchema')
const ingredientSchema = require('./ingredientSchema')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthyBites'

mongoose.connect(MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
	console.log('Connected to MongoDB')
})

const Product = mongoose.model('Product', productSchema)
const Ingredient = mongoose.model('Ingredient', ingredientSchema)

module.exports = { db, Product, Ingredient }
