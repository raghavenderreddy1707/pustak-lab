import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import {
  generateAccessToken,
  generateRefreshToken,
} from '../middleware/auth.js'
import {
  generateToken,
  sendPasswordResetEmail,
  sendResponse,
  createError,
} from '../utils/helpers.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, university, course } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(createError('Email already registered. Please sign in.', 409))
    }

    const user = new User({
      name,
      email,
      passwordHash: password,
      university: university || '',
      course: course || '',
      contributionScore: 1,
    })
    await user.save()

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    user.refreshTokens.push(refreshToken)
    await user.save()

    sendResponse(res, 201, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }, 'Account created successfully')
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+passwordHash +refreshTokens')
    if (!user || !(await user.comparePassword(password))) {
      return next(createError('Invalid email or password', 401))
    }

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    // Keep only last 5 refresh tokens
    if (user.refreshTokens.length >= 5) user.refreshTokens.shift()
    user.refreshTokens.push(refreshToken)
    await user.save()

    sendResponse(res, 200, {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    }, 'Logged in successfully')
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body
    if (!token) return next(createError('Refresh token required', 400))

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select('+refreshTokens')

    if (!user || !user.refreshTokens.includes(token)) {
      return next(createError('Invalid refresh token', 401))
    }

    const accessToken = generateAccessToken(user._id)
    sendResponse(res, 200, { accessToken })
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(createError('Invalid or expired refresh token', 401))
    }
    next(err)
  }
}

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body
    if (token) {
      const decoded = jwt.decode(token)
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, {
          $pull: { refreshTokens: token },
        })
      }
    }
    sendResponse(res, 200, null, 'Logged out successfully')
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
    sendResponse(res, 200, user)
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })

    // Always respond with success to prevent email enumeration
    if (!user) {
      return sendResponse(res, 200, null, 'If that email exists, a reset link has been sent.')
    }

    const token = generateToken()
    user.resetPasswordToken = token
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset/${token}`
    await sendPasswordResetEmail(email, resetUrl)

    sendResponse(res, 200, null, 'Reset link sent to your email')
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/reset-password/:token
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user) {
      return next(createError('Invalid or expired reset token', 400))
    }

    user.passwordHash = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    user.refreshTokens = []
    await user.save()

    sendResponse(res, 200, null, 'Password updated successfully')
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/google/callback (handled by passport, just finalize here)
export const googleCallback = async (req, res, next) => {
  try {
    const user = req.user
    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    if (user.refreshTokens.length >= 5) user.refreshTokens.shift()
    user.refreshTokens.push(refreshToken)
    await user.save()

    // Redirect to frontend with tokens
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
    res.redirect(
      `${clientUrl}/auth?accessToken=${accessToken}&refreshToken=${refreshToken}`
    )
  } catch (err) {
    next(err)
  }
}
