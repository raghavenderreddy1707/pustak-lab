import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 1000 },
}, { timestamps: true })

commentSchema.index({ noteId: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)
