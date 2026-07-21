import express from 'express'
import { protect, requireAdmin } from '../middleware/auth.js'
import {
  getAnalytics, getQueue, approveNote, adminDeleteNote,
  getUsers, deleteUser, getReports, resolveReport, search,
} from '../controllers/adminController.js'

const router = express.Router()

// All admin routes require auth + admin role
router.use(protect, requireAdmin)

router.get('/analytics', getAnalytics)
router.get('/queue', getQueue)
router.put('/notes/:id/approve', approveNote)
router.delete('/notes/:id', adminDeleteNote)
router.get('/users', getUsers)
router.delete('/users/:id', deleteUser)
router.get('/reports', getReports)
router.put('/reports/:id/resolve', resolveReport)

export default router
