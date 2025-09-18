import { Router } from 'express'
import apiRouter from './apis'

const router = Router()

router.use('/api', apiRouter)

router.get('/', (req, res) => {
	res.send('Welcome to the HealthyBites Server. XXX')
})

export default router
