import multer from 'multer'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'image/webp',
]

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG'), false)
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
})

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 100MB.',
      })
    }
    return res.status(400).json({ success: false, message: err.message })
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
  next()
}
