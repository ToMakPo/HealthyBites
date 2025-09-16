const mongoose = require('mongoose')
const { Product } = require('.')

const productSchema = new mongoose.Schema({
	brand: String,
	flavor: String,
	species: {
		type: String,
		enum: ['cat', 'dog'],
		required: true,
	},
	age: {
		type: String,
		enum: ['adult', 'young', 'all'],
		required: true,
	},
	form: {
		type: String,
		enum: ['dry', 'wet'],
		required: true,
	},
	ingredients: [String],
	sizes: [
		{
			type: String,
			price: Number,
			count: Number,
			unit: {
				type: String,
				enum: ['lb', 'can'],
				required: true,
			},
			links: [String],
		},
	],
	feedingChart: [
		{
			minAge: Number,
			maxAge: Number,
			minWeight: Number,
			maxWeight: Number,
			minServing: Number,
			maxServing: Number,
		}
	],
})

ProductModel = mongoose.model('Product', productSchema)

class Product {
	/**
	 * Add a new product to the database.
	 * 
	 * @param {string} brand - The brand of the product.
	 * @param {string} flavor - The flavor of the product.
	 * @param {string} species - The species (e.g., cat or dog) for the product.
	 * @param {string} age - The age category (e.g., adult or young) for the product.
	 * @param {string} form - The form of the product (e.g., dry or wet).
	 * @param {Array} ingredients - List of ingredients in the product.
	 * @param {Array} sizes - List of available sizes with details.
	 * @param {Array} feedingChart - Feeding chart details.
	 * @returns The newly created product document.
	 * @throws Will throw an error if a product with the same brand, flavor, species, age, and form already exists.
	 */
	static async add({ brand, flavor, species, age, form, ingredients, sizes, feedingChart }) {
		// Check if a product with the same brand, flavor, species, age, and form already exists.
		const existingProduct = await ProductModel.findOne({ brand, flavor, species, age, form })

		// If it exists, throw an error.
		if (existingProduct) {
			throw new Error('Product already exists')
		}

		// Create and save the new product.
		const newProduct = new ProductModel({ brand, flavor, species, age, form, ingredients, sizes, feedingChart })
		return await newProduct.save()
	}

	/**
	 * Retrieves products based on provided filters.
	 *
	 * @param {Object} filters - An object containing filter criteria.
	 * @param {string} filters.id - The id of the product. Optional.
	 * @param {string} filters.brand - The brand of the product. Optional.
	 * @param {string} filters.flavor - The flavor of the product. Optional.
	 * @param {string} filters.species - The species (e.g., cat or dog) for the product. Optional.
	 * @param {string} filters.age - The age category (e.g., adult or young) for the product. Optional.
	 * @param {string} filters.form - The form of the product (e.g., dry or wet). Optional.
	 * @returns A list of products matching the provided filters.
	 * 
	 * If no filters are provided, returns all products.
	 */
	static async find({ id, brand, flavor, species, age, form }) {
		// If id is provided, find by id.
		if (id) return await ProductModel.findById(id)
		
		// Build the query object based on provided filters.
		const query = {}

		if (brand) query.brand = brand
		if (flavor) query.flavor = flavor
		if (species) query.species = species
		if (age) query.age = { $in: [age, 'all'] }
		if (form) query.form = form

		// Execute the query and return the results.
		return await ProductModel.find(query)
	}

	/**
	 * Updates an existing product's details.
	 *
	 * @param {string} id - The ID of the product to update.
	 * @param {Object} updates - An object containing the fields to update.
	 * @param {string} [updates.brand] - The new brand of the product. Optional.
	 * @param {string} [updates.flavor] - The new flavor of the product. Optional.
	 * @param {string} [updates.species] - The new species (e.g., cat or dog) for the product. Optional.
	 * @param {string} [updates.age] - The new age category (e.g., adult or young) for the product. Optional.
	 * @param {string} [updates.form] - The new form of the product (e.g., dry or wet). Optional.
	 * @param {Array} [updates.ingredients] - The new list of ingredients in the product. Optional.
	 * @param {Array} [updates.sizes] - The new list of available sizes with details. Optional.
	 * @param {Array} [updates.feedingChart] - The new feeding chart details. Optional.
	 * @return The updated product document.
	 * @throws Will throw an error if the product is not found or if no updates are provided.
	 */
	static async update(id, { brand, flavor, species, age, form, ingredients, sizes, feedingChart }) {
		// Find the product by id.
		const product = await ProductModel.findById(id)
		
		// If product doesn't exist, throw an error.
		if (!product) {
			throw new Error('Product not found')
		}

		// Prepare the update object.
		const update = {}

		if (brand) update.brand = brand
		if (flavor) update.flavor = flavor
		if (species) update.species = species
		if (age) update.age = age
		if (form) update.form = form
		if (ingredients) update.ingredients = ingredients
		if (sizes) update.sizes = sizes
		if (feedingChart) update.feedingChart = feedingChart

		// If no updates are provided, throw an error.
		if (Object.keys(update).length === 0) {
			throw new Error('No updates provided')
		}

		// Update and return the product.
		return await ProductModel.findByIdAndUpdate(id, update, { new: true })
	}

	/**
	 * Deletes a product from the database.
	 *
	 * @param {string} id - The ID of the product to delete.
	 * @returns The deleted product document.
	 * @throws Will throw an error if the product is not found.
	 */
	static async delete(id) {
		// Find the product by id.
		const deletedProduct = await ProductModel.findByIdAndDelete(id)

		// If product doesn't exist, throw an error.
		if (!deletedProduct) {
			throw new Error('Product not found')
		}

		// Return the deleted product.
		return deletedProduct
	}
}

module.exports = productSchema
