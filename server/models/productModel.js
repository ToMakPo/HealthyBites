const mongoose = require('mongoose')
const Ingredient = require('./ingredientModel')

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
			type: String, // e.g. bag, case, can
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
			minAge: Number, // years
			maxAge: Number,
			minWeight: Number, // lbs
			maxWeight: Number,
			minServing: Number, // cups or cans per day
			maxServing: Number,
		}
	],
})

const ProductModel = mongoose.model('Product', productSchema)

/**
 * Product class to handle product-related operations.
 */
class Product {
	/**
	 * Gets the Product mongoose model.
	 * 
	 * @returns {Promise<mongoose.Model>} The Product mongoose model.
	 */
	static async getModel() {
		return ProductModel
	}

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
	 * - `type:` {String} - The type of packaging (e.g., bag, case, can)
	 * - `price:` {Number} - The price of the product for this size.
	 * - `count:` {Number} - The quantity of units in this size.
	 * - `unit:` {'lb' | 'can'} - The unit of measurement.
	 * - `links:` {String[]} - URLs to purchase or learn more about this product.
	 * @param {Array} feedingChart - Feeding chart details.
	 * - `minAge` {Number} - The minimum age of the pet (in years).
	 * - `maxAge` {Number} - The maximum age of the pet (in years).
	 * - `minWeight` {Number} - The minimum weight of the pet (in lbs).
	 * - `maxWeight` {Number} - The maximum weight of the pet (in lbs).
	 * - `minServing` {Number} - The minimum serving size (cups or cans per day).
	 * - `maxServing` {Number} - The maximum serving size (cups or cans per day).
	 * @returns The newly created product document.
	 * @throws Will throw an error if a product with the same brand, flavor, species, age, and form already exists.
	 */
	static async add(brand, flavor, species, age, form, ingredients, sizes, feedingChart) {
		// Check if a product with the same brand, flavor, species, age, and form already exists.
		const existingProduct = await ProductModel.findOne({ brand, flavor, species, age, form })

		// If it exists, throw an error.
		if (existingProduct) {
			throw new Error('Product already exists')
		}

		// Create and save the new product.
		const newProduct = new ProductModel({ brand, flavor, species, age, form, ingredients, sizes, feedingChart })

		// Loop through ingredients and add missing ones to the Ingredient collection.
		for (const ingredientName of ingredients) {
			await Ingredient.push(ingredientName, species, null, null)
		}

		// Save and return the new product.
		return await newProduct.save()
	}

	/**
	 * Retrieves products based on provided filters.
	 *
	 * @param {Object} filters - An object containing filter criteria. Possible filters include:
	 * - `id`: The id of the product.
	 * - `brand`: The brand of the product.
	 * - `flavor`: The flavor of the product.
	 * - `species`: The species (e.g., cat or dog) for the product.
	 * - `age`: The age category (e.g., adult or young) for the product.
	 * - `form`: The form of the product (e.g., dry or wet).
	 * @returns A list of products matching the provided filters.
	 * If no filters are provided, returns all products.
	 */
	static async find({ id, brand, flavor, species, age, form }) {
		// If id is provided, find by id.
		if (id) return await ProductModel.findById(id)
		
		// Build the query object based on provided filters.
		const query = {}

		if (brand !== undefined) query.brand = brand
		if (flavor !== undefined) query.flavor = flavor
		if (species !== undefined) query.species = species
		if (age !== undefined) query.age = { $in: [age, 'all'] }
		if (form !== undefined) query.form = form

		// Execute the query and return the results.
		return await ProductModel.find(query)
	}

	/**
	 * Updates an existing product's details.
	 *
	 * @param {string} id - The ID of the product to update.
	 * @param {Object} updates - An object containing the fields to update.
	 * - `brand` {String} - The new brand of the product.
	 * - `flavor` {String} - The new flavor of the product.
	 * - `species` {String} - The new species (e.g., cat or dog) for the product.
	 * - `age` {String} - The new age category (e.g., adult or young) for the product.
	 * - `form` {String} - The new form of the product (e.g., dry or wet).
	 * - `ingredients` {Array} - The new list of ingredients in the product.
	 * - `sizes` {Array} - The new list of available sizes with details.
	 * >- `type` {String} - The type of packaging (e.g., bag, case, can).
	 * >- `price` {Number} - The price of the product for this size.
	 * >- `count` {Number} - The quantity of units in this size.
	 * >- `unit` {'lb' | 'can'} - The unit of measurement.
	 * >- `links` {String[]} - URLs to purchase or learn more about this product.
	 * - `feedingChart` {Array} - The new feeding chart details.
	 * >- `minAge` {Number} - The minimum age of the pet (in years).
	 * >- `maxAge` {Number} - The maximum age of the pet (in years).
	 * >- `minWeight` {Number} - The minimum weight of the pet (in lbs).
	 * >- `maxWeight` {Number} - The maximum weight of the pet (in lbs).
	 * >- `minServing` {Number} - The minimum serving size (cups or cans per day).
	 * >- `maxServing` {Number} - The maximum serving size (cups or cans per day).
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
		if (ingredients) {
			update.ingredients = ingredients

			// Loop through ingredients and add missing ones to the Ingredient collection.
			for (const ingredientName of ingredients) {
				await Ingredient.push(ingredientName, species || product.species, null, null)
			}
		}
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
	 * Adds a new size option to an existing product.
	 * 
	 * @param {string} productId - The ID of the product to which the size will be added.
	 * @param {Object} sizeDetails - An object containing the details of the size to add.
	 * - `type` {String} - The type of packaging (e.g., bag, case, can).
	 * - `price` {Number} - The price of the product for this size.
	 * - `count` {Number} - The quantity of units in this size.
	 * - `unit` {'lb' | 'can'} - The unit of measurement.
	 * - `links` {String[]} - URLs to purchase or learn more about this product.
	 * @returns The updated product document with the new size added.
	 * @throws Will throw an error if the product is not found or if size details are incomplete.
	 */
	static async addSize(productId, { type, price, count, unit, links }) {
		// Find the product by id.
		const product = await ProductModel.findById(productId)

		// If product doesn't exist, throw an error.
		if (!product) {
			throw new Error('Product not found')
		}

		// Validate size details.
		if (!type || !price || !count || !unit || !links) {
			throw new Error('Incomplete size details')
		}

		// Add the new size to the product.
		product.sizes.push({ type, price, count, unit, links })

		// Save the updated product.
		return await product.save()
	}

	/**
	 * Updates an existing size option of a product.
	 *
	 * @param {string} productId - The ID of the product containing the size to update.
	 * @param {string} sizeId - The ID of the size to update.
	 * @param {Object} updates - An object containing the fields to update.
	 * - `type` {String} - The new type of packaging (e.g., bag, case, can). Optional.
	 * - `price` {Number} - The new price of the product for this size. Optional.
	 * - `count` {Number} - The new quantity of units in this size. Optional.
	 * - `unit` {'lb' | 'can'} - The new unit of measurement. Optional.
	 * - `links` {String[]} - The new URLs to purchase or learn more about this product. Optional.
	 * @return The updated product document with the modified size.
	 * @throws Will throw an error if the product or size is not found, or if no updates are provided.
	 */
	static async updateSize(productId, sizeId, { type, price, count, unit, links }) {
		// Find the product by id.
		const product = await ProductModel.findById(productId)
		
		// If product doesn't exist, throw an error.
		if (!product) {
			throw new Error('Product not found')
		}

		// Find the size by id within the product's sizes array.
		const size = product.sizes.id(sizeId)

		// If size doesn't exist, throw an error.
		if (!size) {
			throw new Error('Size not found')
		}

		// Update size details if provided.
		const update = {}

		if (type) update.type = type
		if (price) update.price = price
		if (count) update.count = count
		if (unit) update.unit = unit
		if (links) update.links = links

		// If no updates are provided, throw an error.
		if (Object.keys(update).length === 0) {
			throw new Error('No updates provided')
		}

		// Apply the updates to the size.
		Object.assign(size, update)

		// Save and return the updated product.
		return await product.save()
	}

	/**
	 * Removes a size option from a product.
	 * 
	 * @param {string} productId - The ID of the product from which the size will be removed.
	 * @param {string} sizeId - The ID of the size to remove.
	 * @returns The updated product document with the size removed.
	 * @throws Will throw an error if the product or size is not found.
	 */
	static async removeSize(productId, sizeId) {
		// Find the product by id.
		const product = await ProductModel.findById(productId)

		// If product doesn't exist, throw an error.
		if (!product) {
			throw new Error('Product not found')
		}

		// Find the size by id within the product's sizes array.
		const size = product.sizes.id(sizeId)

		// If size doesn't exist, throw an error.
		if (!size) {
			throw new Error('Size not found')
		}

		// Remove the size from the product's sizes array.
		size.remove()

		// Save the updated product.
		return await product.save()
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

module.exports = Product
