import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, trim: true, maxlength: 500 },
  status: { type: String, enum: ['pending', 'resolved', 'dismissed'], default: 'pending' },
  resolvedAt: Date,
}, { timestamps: true })

reportSchema.index({ status: 1, createdAt: -1 })

export default mongoose.model('Report', reportSchema)
