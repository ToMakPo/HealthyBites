import { Router } from 'express'
import productRouter from './products'

const router = Router()

router.use('/products', productRouter)

router.use('/', (req, res) => {
	res.send('Welcome to the HealthyBites API. VVV')
})

export default router
