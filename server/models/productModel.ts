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
	lifeStage: {
		type: String,
		enum: ['adult', 'young', 'all'],
		required: true,
	},
	foodtype: {
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

export type Species = 'cat' | 'dog'
type FoodType = 'dry' | 'wet'
type LifeStage = 'adult' | 'young' | 'all'
type Unit = 'lb' | 'can'

interface ProductEntry {
	brand: string
	flavor: string
	species: Species
	lifeStage: LifeStage
	foodType: FoodType
	ingredients: string[]
	sizes: {
		type: string
		price: number
		count: number
		unit: Unit
		links: string[]
	}[]
	feedingChart: {
		minAge: number
		maxAge: number
		minWeight: number
		maxWeight: number
		minServing: number
		maxServing: number
	}[]
}

interface ProductInfo {
	id: string
	brand: string
	flavor: string
	species: Species
	lifeStage: LifeStage
	foodType: FoodType
	ingredients: ProductEntry['ingredients']
	sizes: ProductEntry['sizes']
	feedingChart: ProductEntry['feedingChart']
}

interface FilterOptions {
	id?: string
	brand?: string
	flavor?: string
	species?: string
	lifeStage?: string
	foodtype?: string
}

/**
 * Product class to manage product data and interactions with the database.
 */
class Product implements ProductInfo {
	private _id: string
	private _brand: string
	private _flavor: string
	private _species: Species
	private _lifeStage: LifeStage
	private _foodType: FoodType
	private _ingredients: ProductInfo['ingredients']
	private _sizes: ProductInfo['sizes']
	private _feedingChart: ProductInfo['feedingChart']

	private constructor(id: string, brand: string, flavor: string, species: Species, lifeStage: LifeStage, foodType: FoodType, 
	ingredients: ProductInfo['ingredients'], sizes: ProductInfo['sizes'], feedingChart: ProductInfo['feedingChart']) {
		this._id = id
		this._brand = brand
		this._flavor = flavor
		this._species = species
		this._lifeStage = lifeStage
		this._foodType = foodType
		this._ingredients = ingredients
		this._sizes = sizes
		this._feedingChart = feedingChart
	}

	get id() {
		return this._id
	}

	get brand() {
		return this._brand
	}

	get flavor() {
		return this._flavor
	}

	get species() {
		return this._species
	}

	get lifeStage() {
		return this._lifeStage
	}

	get foodType() {
		return this._foodType
	}

	get ingredients() {
		return [...this._ingredients]
	}

	get sizes() {
		return [...this._sizes]
	}

	get feedingChart() {
		return [...this._feedingChart]
	}

	get qualityScore() {
		return 0
	}

	//////////////////////
	/// STATIC METHODS ///
	//////////////////////

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
	 * @param {string} lifeStage - The target life stage of the pet (e.g., adult, young, all).
	 * @param {string} foodtype - The foodtype of the product (e.g., dry or wet).
	 * @param {Array} ingredients - List of ingredient names in the product.
	 * @param {Array} sizes - List of available sizes with details.
	 * - `type:` {String} - The type of packaging (e.g., bag, case, can)
	 * - `price:` {Number} - The price of the product for this size.
	 * - `count:` {Number} - The quantity of units in this size.
	 * - `unit:` {Unit} - The unit of measurement.
	 * - `links:` {String[]} - URLs to purchase or learn more about this product.
	 * @param {Array} feedingChart - Feeding chart details.
	 * - `minAge` {Number} - The minimum age of the pet (in years).
	 * - `maxAge` {Number} - The maximum age of the pet (in years).
	 * - `minWeight` {Number} - The minimum weight of the pet (in lbs).
	 * - `maxWeight` {Number} - The maximum weight of the pet (in lbs).
	 * - `minServing` {Number} - The minimum serving size (cups or cans per day).
	 * - `maxServing` {Number} - The maximum serving size (cups or cans per day).
	 * @returns The newly created product document.
	 * @throws Will throw an error if a product with the same brand, flavor, species, lifeStage, and foodtype already exists.
	 */
	static async add(brand: string, flavor: string, species: Species, lifeStage: LifeStage, foodtype: FoodType,
	ingredients: ProductEntry['ingredients'], sizes: ProductEntry['sizes'], feedingChart: ProductEntry['feedingChart']) {
		// Check if a product with the same brand, flavor, species, lifeStage, and foodtype already exists.
		const existingProduct = await ProductModel.findOne({ brand, flavor, species, lifeStage, foodtype })

		// If it exists, throw an error.
		if (existingProduct) {
			throw new Error('Product already exists')
		}

		// Create and save the new product.
		const newProduct = new ProductModel({ brand, flavor, species, lifeStage, foodtype, ingredients, sizes, feedingChart })

		// Push ingredients to the Ingredient collection, adding any missing ones.
		Ingredient.pushMany(ingredients, species)

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
	 * - `lifeStage`: The lifeStage category (e.g., adult or young) for the product.
	 * - `foodtype`: The foodtype of the product (e.g., dry or wet).
	 * @returns A list of products matching the provided filters.
	 * If no filters are provided, returns all products.
	 */
	static async find({ id, brand, flavor, species, lifeStage, foodtype }: FilterOptions) {
		// If id is provided, find by id.
		if (id) return await ProductModel.findById(id)
		
		// Build the query object based on provided filters.
		const query: Record<string, any> = {}

		if (brand !== undefined) query.brand = brand
		if (flavor !== undefined) query.flavor = flavor
		if (species !== undefined) query.species = species
		if (lifeStage !== undefined) query.lifeStage = { $in: [lifeStage, 'all'] }
		if (foodtype !== undefined) query.foodtype = foodtype

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
	 * - `lifeStage` {String} - The new lifeStage category (e.g., adult or young) for the product.
	 * - `foodtype` {String} - The new foodtype of the product (e.g., dry or wet).
	 * - `ingredients` {Array} - The new list of ingredients in the product.
	 * - `sizes` {Array} - The new list of available sizes with details.
	 * >- `type` {String} - The type of packaging (e.g., bag, case, can).
	 * >- `price` {Number} - The price of the product for this size.
	 * >- `count` {Number} - The quantity of units in this size.
	 * >- `unit` {Unit} - The unit of measurement.
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
	static async update(id: string, updates: Partial<ProductEntry>) {
		const { brand, flavor, species, lifeStage, foodType, ingredients, sizes, feedingChart } = updates

		// Find the product by id.
		const product = await ProductModel.findById(id)
		
		// If product doesn't exist, throw an error.
		if (!product) {
			throw new Error('Product not found')
		}

		// Prepare the update object.
		const update: Record<string, any> = {}

		if (brand !== undefined) update.brand = brand
		if (flavor !== undefined) update.flavor = flavor
		if (species !== undefined) update.species = species
		if (lifeStage !== undefined) update.lifeStage = lifeStage
		if (foodType !== undefined) update.foodType = foodType
		if (ingredients !== undefined) {
			update.ingredients = ingredients

			// Push ingredients to the Ingredient collection, adding any missing ones.
			Ingredient.pushMany(ingredients, species ?? product.species)
		}
		if (sizes !== undefined) update.sizes = sizes
		if (feedingChart !== undefined) update.feedingChart = feedingChart

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
	 * - `unit` {Unit} - The unit of measurement.
	 * - `links` {String[]} - URLs to purchase or learn more about this product.
	 * @returns The updated product document with the new size added.
	 * @throws Will throw an error if the product is not found or if size details are incomplete.
	 */
	static async addSize(productId: string, size: ProductEntry['sizes'][0]) {
		const { type, price, count, unit, links } = size

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
	 * - `unit` {Unit} - The new unit of measurement. Optional.
	 * - `links` {String[]} - The new URLs to purchase or learn more about this product. Optional.
	 * @return The updated product document with the modified size.
	 * @throws Will throw an error if the product or size is not found, or if no updates are provided.
	 */
	static async updateSize(productId: string, sizeId: string, updates: Partial<ProductEntry['sizes'][0]>) {
		const { type, price, count, unit, links } = updates

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
		const update: Record<string, any> = {}

		if (type !== undefined) update.type = type
		if (price !== undefined) update.price = price
		if (count !== undefined) update.count = count
		if (unit !== undefined) update.unit = unit
		if (links !== undefined) update.links = links

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
	static async removeSize(productId: any, sizeId: any) {
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
	static async delete(id: any) {
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
