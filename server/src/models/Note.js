import mongoose from 'mongoose'

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  university: { type: String, required: true, trim: true },
  course: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  semester: { type: String, required: true, trim: true },
  materialType: {
    type: String,
    required: true,
    enum: ['Notes', 'Question Paper', 'Assignment', 'Lab Manual', 'Cheat Sheet'],
  },
  tags: [{ type: String, lowercase: true, trim: true }],
  fileUrl: { type: String, required: true },
  filePath: { type: String },  // Supabase storage path for deletion
  fileSize: { type: Number, default: 0 },
  fileType: { type: String },
  fileHash: { type: String, index: true }, // for duplicate detection
  thumbnailUrl: { type: String, default: '' },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'flagged'],
    default: process.env.AUTO_PUBLISH === 'false' ? 'pending' : 'approved',
  },
  downloadCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

// Text index for full-text search
noteSchema.index({
  title: 'text',
  description: 'text',
  subject: 'text',
  tags: 'text',
  university: 'text',
})

noteSchema.index({ status: 1, createdAt: -1 })
noteSchema.index({ downloadCount: -1 })
noteSchema.index({ university: 1, course: 1, subject: 1, semester: 1 })
noteSchema.index({ uploadedBy: 1 })

export default mongoose.model('Note', noteSchema)
