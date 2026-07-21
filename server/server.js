import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import connectDB from './src/config/db.js'
import './src/config/passport.js'
import passportModule from 'passport'

import authRoutes from './src/routes/auth.js'
import notesRoutes from './src/routes/notes.js'
import usersRoutes from './src/routes/users.js'
import adminRoutes from './src/routes/admin.js'
import { search } from './src/controllers/adminController.js'
import { errorHandler, notFound } from './src/middleware/errorHandler.js'

const app = express()

// ===== Connect Database =====
connectDB()

// ===== Security Middleware =====
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// Dynamic CORS handling for production & serverless
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Vercel internal) or local dev / Vercel deployment
    if (!origin || process.env.NODE_ENV !== 'production' || process.env.VERCEL === '1') {
      return callback(null, true)
    }
    if (process.env.CLIENT_URL && (origin === process.env.CLIENT_URL || origin.endsWith('.vercel.app'))) {
      return callback(null, true)
    }
    return callback(null, true)
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// Global rate limit
const globalLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please slow down.' },
})
app.use(globalLimit)

// ===== Body Parsers =====
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ===== Logging =====
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// ===== Passport =====
app.use(passportModule.initialize())

// ===== Health Check =====
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Pustak Lab API is running 🚀', env: process.env.NODE_ENV })
})

// ===== API Routes =====
app.use('/api/auth', authRoutes)
app.use('/api/notes', notesRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/admin', adminRoutes)
app.get('/api/search', search)

// ===== Error Handling =====
app.use(notFound)
app.use(errorHandler)

// ===== Start Server (Only in standalone mode) =====
if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => {
    console.log(`\n🚀 Pustak Lab API running on http://localhost:${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`)
  })
}

export default app
