import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: { type: String },
  googleId: { type: String, sparse: true },
  university: { type: String, trim: true, default: '' },
  course: { type: String, trim: true, default: '' },
  bio: { type: String, maxlength: 500, default: '' },
  avatarUrl: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  contributionScore: { type: Number, default: 1 },
  refreshTokens: [{ type: String }],
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next()
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  next()
})

userSchema.methods.comparePassword = function (candidatePassword) {
  if (!this.passwordHash) return false
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.passwordHash
  delete obj.refreshTokens
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

userSchema.index({ email: 1 })
userSchema.index({ contributionScore: -1 })

export default mongoose.model('User', userSchema)
