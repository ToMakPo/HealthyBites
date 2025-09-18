import { Router, Request, Response } from 'express'
import Product, {FilterOptions as ProductFilterOptions} from '../../models/productModel'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
	// Get the filters from query parameters.
	const {id, brand, flavor, species, lifeStage, foodType} = req.query

	// Build the filter object.
	const filters: ProductFilterOptions = {}

	if (id !== undefined) filters.id = String(id)
	if (brand !== undefined) filters.brand = String(brand)
	if (flavor !== undefined) filters.flavor = String(flavor)
	if (species !== undefined) filters.species = species as ProductFilterOptions['species']
	if (lifeStage !== undefined) filters.lifeStage = lifeStage as ProductFilterOptions['lifeStage']
	if (foodType !== undefined) filters.foodType = foodType as ProductFilterOptions['foodType']

	// Fetch products from the database based on filters.
	const products = await Product.find(filters)

	// Return the products as JSON.
	res.json(products)
})

router.post('/', async (req: Request, res: Response) => {
	const {brand, flavor, species, lifeStage, foodType, ingredients, sizes, feedingChart} = req.body 

	Product.add(brand, flavor, species, lifeStage, foodType, ingredients, sizes, feedingChart)
		.then(product => res.status(201).json(product))
		.catch(err => res.status(400).json({error: err.message}))
})



export default router