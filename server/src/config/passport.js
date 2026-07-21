import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

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
          const email = profile.emails?.[0]?.value
          if (!email) return done(new Error('No email from Google'), null)

          // Find or create user
          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })

          if (!user) {
            user = await User.create({
              name: profile.displayName,
              email,
              googleId: profile.id,
              avatarUrl: profile.photos?.[0]?.value || '',
              contributionScore: 1,
            })
          } else if (!user.googleId) {
            // Link Google account to existing email user
            user.googleId = profile.id
            if (!user.avatarUrl && profile.photos?.[0]?.value) {
              user.avatarUrl = profile.photos[0].value
            }
            await user.save()
          }

          return done(null, user)
        } catch (err) {
          return done(err, null)
        }
      }
    )
  )
} else {
  console.warn('⚠️ Google OAuth environment variables not set. Google login is disabled.')
}

export default passport
