import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import connectDB from './db.js'

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Ensure DB connection
          await connectDB()

          const email = profile.emails?.[0]?.value
          if (!email) {
            console.error('❌ Google OAuth: No email in profile')
            return done(new Error('No email from Google'), null)
          }

          // Find or create user
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })
          .maxTime(10000)  // Explicit timeout

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || '',
              contributionScore: 1,
            })
            console.log(`✅ New user created via Google OAuth: ${email}`)
          } else if (!user.googleId) {
            // Link Google account to existing email user
            user.googleId = profile.id
            if (!user.avatarUrl && profile.photos?.[0]?.value) {
              user.avatarUrl = profile.photos[0].value
            }
            await user.save()
            console.log(`✅ Google account linked to existing user: ${email}`)
          }

          return done(null, user)
        } catch (err) {
          console.error('❌ Google OAuth Error:', err.message)
          return done(err, null)
        }
      }
    )
  )
  console.log('✅ Google OAuth strategy configured')
} else {
  console.warn('⚠️ Google OAuth environment variables not set. Google login is disabled.')
}

export default passport
