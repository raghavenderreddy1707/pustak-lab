import express from 'express'
import { protect } from '../middleware/auth.js'
import { getProfile, updateProfile, getLeaderboard } from '../controllers/usersController.js'

const router = express.Router()

router.get('/leaderboard', getLeaderboard)
router.get('/:id', getProfile)
router.put('/profile', protect, updateProfile)

export default router
