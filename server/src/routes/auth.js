import express from 'express'
import passport from 'passport'
import { body } from 'express-validator'
import {
  register, login, refreshToken, logout, getMe,
  forgotPassword, resetPassword, googleCallback,
} from '../controllers/authController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const validateRegister = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
]

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]

router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/refresh', refreshToken)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.post('/forgot-password', body('email').isEmail(), forgotPassword)
router.post('/reset-password/:token',
  body('password').isLength({ min: 6 }),
  resetPassword
)

// Google OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/api/auth/google/failed', session: false }),
  googleCallback
)
router.get('/google/failed', (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/auth?error=google_failed`)
})

export default router
