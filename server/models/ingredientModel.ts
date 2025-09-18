import mongoose from 'mongoose'
import { Species } from './productModel'

const ingredientSchema = new mongoose.Schema({
	name: { type: String, required: true },
	ratings: [
		{
			species: {
				type: String,
				enum: ['cat', 'dog'],
				required: true,
			},
			healthRating: Number, // e.g. 10 to -10 scale, (null if unknown)
			notes: String,
		}
	],
})

const IngredientModel = mongoose.model('Ingredient', ingredientSchema)

interface IngredientEntry {
	id: string
	name: string
	ratings: {
		id: string
		species: Species
		healthRating: number | null
		notes: string | null
	}[]
}

interface IngredientInfo {
	id: string
	species: Species
	healthRating: number | null
	notes: string | null
}

interface FilterOptions {
	id?: string
	name?: string
	species?: string
	rating?: number | null
	minRating?: number
	maxRating?: number
}

/**
 * Ingredient class to manage ingredient data and interactions with the database.
 */
class Ingredient implements IngredientInfo {
	private _id?: string
	private _name: string
	private _species: Species
	private _healthRating: number | null
	private _notes: string | null

	private constructor(id: string, name: string, species: Species, healthRating: number | null, notes: string | null) {
		this._id = id
		this._name = name
		this._species = species
		this._healthRating = healthRating
		this._notes = notes
	}

	get id() {
		return this._id ?? ''
	}

	get name() {
		return this._name
	}

	get species() {
		return this._species
	}

	get healthRating() {
		return this._healthRating
	}

	get notes() {
		return this._notes
	}

	//////////////////////
	/// STATIC METHODS ///
	//////////////////////

	/**
	 * Returns the Ingredient mongoose model.
	 * 
	 * @returns {Promise<mongoose.Model>} The Ingredient mongoose model.
	 */
	static async getModel() {
		return IngredientModel
	}

	/**
	 * Adds a new ingredient to the database.
	 * 
	 * @param {string} name - The name of the ingredient.
	 * @param {IngredientEntry['ratings']} ratings - An array of rating objects for the ingredient.
	 * - `species` {Species} - The species for the rating.
	 * - `healthRating` {Number} - The health rating (10 to -10 scale).
	 * - `notes` {String} - Any additional details about the ingredient.
	 * @throws Will throw an error if the ingredient already exists.
	 */
	static async add(name: string, ratings: IngredientEntry['ratings']) {
		// Check if the ingredient already exists.
		const existing = await IngredientModel.findOne({ name })

		// If it exists, throw an error.
		if (existing) {
			throw new Error('Ingredient already exists')
		}

		// If no ratings provided, initialize as empty array
		if (!ratings) ratings = []

		// Create and save the new ingredient.
		const ingredient = new IngredientModel({ name, ratings })
		await ingredient.save()
	}

	/**
	 * Finds ingredients based on query parameters.
	 * 
	 * @param {Object} filters - An object containing filter criteria.
	 * - `id`: The id of the ingredient.
	 * - `name`: The name of the ingredient.
	 * - `species`: The species (e.g., cat or dog) for the rating.
	 * - `rating`: The health rating. (null will return all missing ratings)
	 * - `minRating`: Minimum health rating.
	 * - `maxRating`: Maximum health rating.
	 * @returns An array of matching ingredient documents.
	 * If no filters are provided, returns all ingredients.
	 */
	static async find({ id, name, species, rating, minRating, maxRating }: FilterOptions) {
		// If id is provided, find by id.
		if (id) return await IngredientModel.findById(id)

		// Build the query object based on provided filters.
		const query: Record<string, any> = {}

		if (name !== undefined) query.name = new RegExp(name, 'i') // Case-insensitive regex search
		if (species !== undefined) query['ratings.species'] = species
		if (rating !== undefined) {
			if (rating === null) {
				query['ratings.healthRating'] = { $eq: null }
			} else {
				query['ratings.healthRating'] = rating
			}
		} else {
			if (minRating !== undefined) query['ratings.healthRating'] = { $gte: minRating }
			if (maxRating !== undefined) query['ratings.healthRating'] = { $lte: maxRating }
		}

		// Execute the query.
		return await IngredientModel.find(query)
	}

	/**
	 * Fetches the rating for a single ingredient for a given species.
	 *
	 * @param {Object} ingredient - The ingredient document to fetch the rating from.
	 * @param {string} species - The species for which to fetch the rating ('cat' or 'dog').
	 * @returns An instance of the Ingredient class with the rating for the specified species.
	 * @throws Will throw an error if no rating is found for the specified species.
	 */
	static async getOne(ingredient: IngredientEntry, species: Species) {
		// Find the index of the rating for the specified species.
		const index = ingredient.ratings.findIndex(r => r.species === species)

		// If rating doesn't exist, throw an error.
		if (index === -1) throw new Error('No rating found for species: ' + species)

		// Return a new Ingredient instance with the rating for the specified species.
		return new Ingredient(
			ingredient.id,
			ingredient.name,
			ingredient.ratings[index].species,
			ingredient.ratings[index].healthRating,
			ingredient.ratings[index].notes
		)
	}

	/**
	 * Fetches ratings for multiple ingredients for a given species.
	 *
	 * @param {IngredientEntry[]} ingredients - An array of ingredient documents to fetch ratings from.
	 * @param {string} species - The species for which to fetch the ratings ('cat' or 'dog').
	 * @returns An array of Ingredient instances with ratings for the specified species.
	 * Ingredients without a rating for the specified species are skipped.
	 */
	static async getAll(ingredients: IngredientEntry[], species: Species) {
		const results: Ingredient[] = []

		for (const ingredient of ingredients) {
			try {
				const fetched = await Ingredient.getOne(ingredient, species)
				results.push(fetched)
			} catch (error) {
				// If no rating found for the species, skip this ingredient.
				continue
			}
		}

		return results
	}

	/**
	 * Updates an existing ingredient's details.
	 * 
	 * @param {string} id - The id of the ingredient to update.
	 * @param {Object} updates - An object containing the fields to update.
	 * - `name` {String} - The new name of the ingredient.
	 * - `ratings` {Array} - An array of new ratings to add or update.
	 * >- `species` {Species} - The species for the rating.
	 * >- `healthRating` {Number} - The health rating (10 to -10 scale).
	 * >- `notes` {String} - Any additional details about the ingredient.
	 * @returns The updated ingredient document.
	 * @throws Will throw an error if the ingredient is not found or if no updates are provided.
	 */
	static async update(id: string, updates: Partial<IngredientEntry>) {
		const { name, ratings } = updates

		// Find the ingredient by id.
		const ingredient = await IngredientModel.findById(id)

		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		// Prepare the update object.
		const update: Record<string, any> = {}

		if (name !== undefined) update.name = name
		if (ratings !== undefined) update.ratings = ratings

		// If no updates are provided, throw an error.
		if (Object.keys(update).length === 0) {
			throw new Error('No updates provided')
		}

		// Update and return the ingredient.
		return await IngredientModel.findByIdAndUpdate(id, update, { new: true })
	}

	/**
	 * Adds a new ingredient or updates an existing one based on the name.
	 * If the ingredient exists, updates its rating for the specified species.
	 * If it doesn't exist, creates a new ingredient with the provided details.
	 * 
	 * @param {string} name - The name of the ingredient.
	 * @param {string} species - The species for the rating ('cat' or 'dog').
	 * @param {number} healthRating - The health rating (10 to -10 scale).
	 * @param {string} notes - Any additional details about the rating.
	 * @returns The created or updated ingredient document.
	 */
	static async push(name: string, species: Species, healthRating?: number | null, notes?: string | null) {
		// Find the ingredient by name.
		const ingredient = await IngredientModel.findOne({ name })

		// TODO: if `healthRating` is null, use llm to determine rating based on `name` and `species`.

		// If ingredient doesn't exist, add it.
		if (!ingredient) {
			const newIngredient = new IngredientModel({
				name,
				ratings: [{ 
					species, 
					healthRating: healthRating ?? null, 
					notes: notes ?? null
				}],
			})
			return await newIngredient.save()
		}

		// Check if a rating for the same species already exists. If so, update the rating and notes.
		const existingRating = ingredient.ratings.find(r => r.species === species)
		if (existingRating) {
			const update: Record<string, any> = {}

			if (healthRating !== undefined) update.healthRating = healthRating
			if (notes !== undefined) update.notes = notes

			Object.assign(existingRating, update)

			ingredient.markModified('ratings')
		} else {
			// If no existing rating for the species, add a new rating.
			ingredient.ratings.push({ 
				species,
				healthRating: healthRating ?? null,
				notes: notes ?? null
			})
		}

		// Save and return the updated ingredient.
		return await ingredient.save()
	}

	/**
	 * Adds or updates multiple ingredients in bulk.
	 *
	 * @param {Array} ingredients - An array of ingredient objects to add or update.
	 * Each object should contain:
	 * - `name` {String} - The name of the ingredient.
	 * - `species` {Species} - The species for the rating ('cat' or 'dog').
	 * - `healthRating` {Number} - The health rating (10 to -10 scale). Optional.
	 * - `notes` {String} - Any additional details about the rating. Optional.
	 * @returns An array of promises for each add/update operation.
	 */
	static async pushMany(ingredients: ({name: string, species: Species, healthRating?: number | null, notes?: string | null}[] 
		| {names: string[], species: Species})) {
		
		if (Array.isArray(ingredients)) {
			return ingredients.map(async (ing) => {
				return await Ingredient.push(ing.name, ing.species, ing.healthRating, ing.notes)
			})
		} else {
			const { names, species } = ingredients
			return names.map(async (name) => {
				return await Ingredient.push(name, species)
			})
		}
	}

	/**
	 * Adds a new rating to an existing ingredient.
	 *
	 * @param {string} id - The id of the ingredient to add a rating to.
	 * @param {Object} rating - An object containing the rating details.
	 * - `species` {Species} - The species for the rating.
	 * - `healthRating` {Number} - The health rating (10 to -10 scale).
	 * - `notes` {String} - Any additional details about the rating.
	 * @returns The updated ingredient document with the new rating added.
	 * @throws Will throw an error if the ingredient is not found or if a rating for the same species already exists.
	 */
	static async addRating(id: any, { species, healthRating, notes }: any) {
		// Find the ingredient by id.
		const ingredient = await IngredientModel.findById(id)

		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		// Check if a rating for the same species already exists.
		if (ingredient.ratings.some(r => r.species === species)) {
			throw new Error(`Rating for species '${species}' already exists`)
		}

		// Add the new rating.
		ingredient.ratings.push({ species, healthRating, notes })
		await ingredient.save()

		return await IngredientModel.findById(id)
	}

	/**
	 * Updates an existing rating for a specific species within an ingredient.
	 * 
	 * @param {string} id - The id of the ingredient containing the rating to update.
	 * @param {string} species - The species of the rating to update ('cat' or 'dog').
	 * @param {Object} updates - An object containing the fields to update.
	 * - `healthRating` {Number} - The new health rating (10 to -10 scale). Optional.
	 * - `notes` {String} - The new notes for the rating. Optional.
	 * @returns The updated ingredient document with the modified rating.
	 * @throws Will throw an error if the ingredient or rating is not found, or if no updates are provided.
	 */
	static async updateRating(id: any, species: string, { healthRating, notes }: any) {
		// Find the ingredient by id.
		const ingredient = await IngredientModel.findById(id)
		
		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		// Find the rating for the specified species.
		const rating = ingredient.ratings.find(r => r.species === species)

		// If rating doesn't exist, throw an error.
		if (!rating) {
			throw new Error(`Rating for species '${species}' not found`)
		}

		// Update the rating fields if provided.
		const update: Record<string, any> = {}

		if (healthRating !== undefined) update.healthRating = healthRating
		if (notes !== undefined) update.notes = notes

		// If no updates are provided, throw an error.
		if (Object.keys(update).length === 0) {
			throw new Error('No updates provided')
		}

		// Apply the updates to the rating.
		Object.assign(rating, update)

		// Save and return the updated ingredient.
		return await ingredient.save()
	}

	static async removeRating(id: any, species: string) {
		// Find the ingredient by id.
		const ingredient = await IngredientModel.findById(id)
		
		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		// Find the index of the rating for the specified species.
		const ratingIndex = ingredient.ratings.findIndex(r => r.species === species)

		// If rating doesn't exist, throw an error.
		if (ratingIndex === -1) {
			throw new Error(`Rating for species '${species}' not found`)
		}

		// Remove the rating from the ingredient.
		ingredient.ratings.splice(ratingIndex, 1)
		return await ingredient.save()
	}

	/**
	 * Merges two ingredients with the same name by combining their ratings.
	 * The duplicate ingredient is deleted after merging.
	 * 
	 * @param {string} primaryId - The id of the primary ingredient to keep.
	 * @param {string} duplicateId - The id of the duplicate ingredient to merge and delete.
	 * @returns The updated primary ingredient document.
	 * @throws Will throw an error if either ingredient is not found.
	 */
	static async mergeDuplicates(primaryId: any, duplicateId: any) {
		// Find both ingredients by their ids.
		const primary = await IngredientModel.findById(primaryId)
		const duplicate = await IngredientModel.findById(duplicateId)

		// If either ingredient doesn't exist, throw an error.
		if (!primary || !duplicate) {
			throw new Error('One or both ingredients not found')
		}

		// Merge ratings, avoiding duplicates based on species and healthRating.
		duplicate.ratings.forEach(dr => {
			// Check if a rating for the same species already exists in primary.
			const exists = primary.ratings.some(pr => pr.species === dr.species)

			// If a rating for the species doesn't exist in primary, add it.
			if (!exists) primary.ratings.push(dr)
		})

		// Save the updated primary ingredient.
		await primary.save()

		// Delete the duplicate ingredient.
		await IngredientModel.findByIdAndDelete(duplicateId)

		return primary
	}

	/**
	 * Deletes an ingredient from the database.
	 * @param {string} id - The id of the ingredient to delete.
	 * @returns The deleted ingredient document.
	 * @throws Will throw an error if the ingredient is not found.
	 */
	static async delete(id: any) {
		// Find and delete the ingredient by id.
		const ingredient = await IngredientModel.findByIdAndDelete(id)

		// If ingredient doesn't exist, throw an error.
		if (!ingredient) {
			throw new Error('Ingredient not found')
		}

		return ingredient
	}
}

module.exports = Ingredient
