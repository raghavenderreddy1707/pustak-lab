import express from 'express'
import rateLimit from 'express-rate-limit'
import { protect, optionalProtect } from '../middleware/auth.js'
import { upload, handleUploadError } from '../middleware/upload.js'
import {
  getNotes, getTrending, getNoteById, uploadNote, deleteNote,
  downloadNote, upvoteNote, toggleBookmark, reportNote,
  getComments, addComment, deleteComment, getMyNotes, getBookmarks,
} from '../controllers/notesController.js'

const router = express.Router()

// Rate limits
const uploadLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: { success: false, message: 'Too many uploads. Please wait an hour.' },
})
const commentLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  message: { success: false, message: 'Too many comments. Please slow down.' },
})

// Public or optional-auth
router.get('/', optionalProtect, getNotes)
router.get('/trending', getTrending)
router.get('/my', protect, getMyNotes)
router.get('/bookmarks', protect, getBookmarks)
router.get('/:id', optionalProtect, getNoteById)

// Protected
router.post('/upload', protect, uploadLimit, upload.single('file'), handleUploadError, uploadNote)
router.delete('/:id', protect, deleteNote)
router.post('/:id/download', protect, downloadNote)
router.post('/:id/upvote', protect, upvoteNote)
router.post('/:id/bookmark', protect, toggleBookmark)
router.post('/:id/report', protect, reportNote)
router.get('/:id/comments', getComments)
router.post('/:id/comments', protect, commentLimit, addComment)
router.delete('/:noteId/comments/:commentId', protect, deleteComment)

export default router
