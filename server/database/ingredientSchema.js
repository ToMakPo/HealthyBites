const mongoose = require('mongoose')

const ingredientSchema = new mongoose.Schema({
	name: { type: String, required: true },
	ratings: [
		{
			species: {
				type: String,
				enum: ['cat', 'dog'],
				required: true,
			},
			healthRating: {
				type: Number, // e.g. 1-5 scale
				required: true,
			},
			notes: String,
		}
	],
})

const IngredientModel = mongoose.model('Ingredient', ingredientSchema)

class Ingredient {
	/**
	 * Adds a new ingredient to the database.
	 * 
	 * @param {string} name - The name of the ingredient.
	 * @param {Array} ratings - An array of rating objects for the ingredient.
	 * @returns The created ingredient document.
	 * @throws Will throw an error if the ingredient already exists.
	 */
	static async add({ name, ratings }) {
		// Check if the ingredient already exists.
		const existing = await IngredientModel.findOne({ name })

		// If it exists, throw an error.
		if (existing) {
			throw new Error('Ingredient already exists')
		}

		// Create and save the new ingredient.
		const ingredient = new IngredientModel({ name, ratings })
		return await ingredient.save()
	}

	/**
	 * Finds ingredients based on query parameters.
	 * 
	 * @param {Object} filters - An object containing filter criteria.
	 * @param {number} filters.id - The id of the ingredient. Optional.
	 * @param {string} filters.name - The name of the ingredient. Optional.
	 * @param {string} filters.species - The species (e.g., cat or dog) for the rating. Optional.
	 * @param {number} filters.minRating - Minimum health rating. Optional.
	 * @param {number} filters.maxRating - Maximum health rating. Optional.
	 * @returns An array of matching ingredient documents.
	 * 
	 * If no filters are provided, returns all ingredients.
	 */
	static async find({ id, name, species, minRating, maxRating }) {
		// If id is provided, find by id.
		if (id) return await IngredientModel.findById(id)

		// Build the query object based on provided filters.
		const query = {}

		if (name) query.name = new RegExp(name, 'i') // Case-insensitive regex search
		if (species) query['ratings.species'] = species
		if (minRating !== undefined) query['ratings.healthRating'] = { $gte: minRating }
		if (maxRating !== undefined) query['ratings.healthRating'] = { $lte: maxRating }

		// Execute the query and return the results.
		return await IngredientModel.find(query)
	}

	/**
	 * Updates an existing ingredient's details.
	 * 
	 * @param {string} id - The id of the ingredient to update.
	 * @param {Object} updates - An object containing the fields to update.
	 * @param {string} updates.name - The new name of the ingredient. Optional.
	 * @param {Array} updates.ratings - An array of new ratings to add or update. Optional.
	 * @returns The updated ingredient document.
	 * @throws Will throw an error if the ingredient is not found or if no updates are provided.
	 */
	static async update(id, { name, ratings }) {
		// Find the ingredient by id.
		const ingredient = await IngredientModel.findById(id)

		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		// Prepare the update object.
		const update = {}

		if (name) update.name = name
		if (ratings) update.ratings = ratings // This will replace existing ratings; modify as needed for partial updates

		// If no updates are provided, throw an error.
		if (Object.keys(update).length === 0) {
			throw new Error('No updates provided')
		}

		// Update and return the ingredient.
		return await IngredientModel.findByIdAndUpdate(id, update, { new: true })
	}

	/**
	 * Deletes an ingredient from the database.
	 * @param {string} id - The id of the ingredient to delete.
	 * @returns The deleted ingredient document.
	 * @throws Will throw an error if the ingredient is not found.
	 */
	static async delete(id) {
		// Find and delete the ingredient by id.
		const ingredient = await IngredientModel.findByIdAndDelete(id)

		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		return ingredient
	}
}

module.exports = { ingredientSchema, Ingredient }
