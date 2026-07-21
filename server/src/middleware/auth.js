import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const generateAccessToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  })

export const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  })

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokens')
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' })
    }
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
}

export const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return next()

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await User.findById(decoded.id).select('-passwordHash -refreshTokens')
    req.user = user || null
  } catch {
    req.user = null
  }
  next()
}

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' })
  }
  next()
}
