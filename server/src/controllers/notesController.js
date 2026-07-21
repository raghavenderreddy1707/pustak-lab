import Note from '../models/Note.js'
import Bookmark from '../models/Bookmark.js'
import Comment from '../models/Comment.js'
import Report from '../models/Report.js'
import User from '../models/User.js'
import { uploadToSupabase, deleteFromSupabase } from '../config/supabase.js'
import { hashFile, sendResponse, createError } from '../utils/helpers.js'

// GET /api/notes
export const getNotes = async (req, res, next) => {
  try {
    const {
      q, university, course, subject, semester, materialType,
      sort = 'newest', page = 1, limit = 12
    } = req.query

    const query = { status: 'approved' }

    // Full-text search
    if (q) {
      query.$text = { $search: q }
    }

    // Filters
    if (university) query.university = { $regex: university, $options: 'i' }
    if (course) query.course = { $regex: course, $options: 'i' }
    if (subject) query.subject = { $regex: subject, $options: 'i' }
    if (semester) query.semester = semester
    if (materialType) query.materialType = materialType

    // Sorting
    const sortMap = {
      newest: { createdAt: -1 },
      downloads: { downloadCount: -1 },
      upvotes: { 'upvotes.length': -1 },
    }
    const sortOption = q
      ? { score: { $meta: 'textScore' }, ...sortMap[sort] }
      : sortMap[sort] || { createdAt: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const total = await Note.countDocuments(query)

    const notes = await Note.find(query)
      .select('-filePath')
      .populate('uploadedBy', 'name university avatarUrl')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .lean()

    // If user is authenticated, add bookmark/upvote status
    let bookmarkedIds = new Set()
    let upvotedIds = new Set()
    if (req.user) {
      const [bookmarks] = await Promise.all([
        Bookmark.find({ userId: req.user._id }).select('noteId').lean(),
      ])
      bookmarkedIds = new Set(bookmarks.map((b) => b.noteId.toString()))
      upvotedIds = new Set(
        notes.filter((n) => n.upvotes.some((id) => id.toString() === req.user._id.toString()))
          .map((n) => n._id.toString())
      )
    }

    const enriched = notes.map((n) => ({
      ...n,
      isBookmarked: bookmarkedIds.has(n._id.toString()),
      hasUpvoted: upvotedIds.has(n._id.toString()),
    }))

    sendResponse(res, 200, {
      data: enriched,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      total,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/notes/trending
export const getTrending = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const notes = await Note.find({
      status: 'approved',
      createdAt: { $gte: weekAgo },
    })
      .select('-filePath')
      .populate('uploadedBy', 'name university avatarUrl')
      .sort({ downloadCount: -1, viewCount: -1 })
      .limit(8)
      .lean()

    // If no trending this week, fallback to all-time most downloaded
    if (notes.length < 4) {
      const fallback = await Note.find({ status: 'approved' })
        .select('-filePath')
        .populate('uploadedBy', 'name university avatarUrl')
        .sort({ downloadCount: -1 })
        .limit(8)
        .lean()
      return sendResponse(res, 200, fallback)
    }

    sendResponse(res, 200, notes)
  } catch (err) {
    next(err)
  }
}

// GET /api/notes/my
export const getMyNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const notes = await Note.find({ uploadedBy: req.user._id })
      .select('-filePath')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
    sendResponse(res, 200, { data: notes })
  } catch (err) {
    next(err)
  }
}

// GET /api/notes/bookmarks
export const getBookmarks = async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate({
        path: 'noteId',
        select: '-filePath',
        populate: { path: 'uploadedBy', select: 'name university avatarUrl' },
      })
      .sort({ createdAt: -1 })
      .lean()

    const notes = bookmarks.map((b) => ({ ...b.noteId, isBookmarked: true })).filter(Boolean)
    sendResponse(res, 200, { data: notes })
  } catch (err) {
    next(err)
  }
}

// GET /api/notes/:id
export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
      .select('-filePath')
      .populate('uploadedBy', 'name university avatarUrl contributionScore')

    if (!note || (note.status !== 'approved' && req.user?._id?.toString() !== note.uploadedBy?._id?.toString() && req.user?.role !== 'admin')) {
      return next(createError('Note not found', 404))
    }

    // Increment view count
    note.viewCount += 1
    await note.save()

    // Check bookmark/upvote status
    let isBookmarked = false
    let hasUpvoted = false
    if (req.user) {
      const bookmark = await Bookmark.findOne({ userId: req.user._id, noteId: note._id })
      isBookmarked = !!bookmark
      hasUpvoted = note.upvotes.some((id) => id.toString() === req.user._id.toString())
    }

    sendResponse(res, 200, {
      ...note.toObject(),
      isBookmarked,
      hasUpvoted,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/upload
export const uploadNote = async (req, res, next) => {
  try {
    if (!req.file) return next(createError('No file uploaded', 400))

    const {
      title, description, university, course, subject,
      semester, materialType, tags: tagsRaw,
    } = req.body

    let tags = []
    try {
      tags = JSON.parse(tagsRaw || '[]')
    } catch {
      tags = []
    }

    // Compute file hash for duplicate detection
    const fileHash = hashFile(req.file.buffer)
    const existingNote = await Note.findOne({ fileHash, uploadedBy: req.user._id })
    if (existingNote) {
      return next(createError('You have already uploaded this exact file.', 409))
    }

    // Upload to Supabase
    const { filePath, publicUrl } = await uploadToSupabase(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      'notes'
    )

    const status = process.env.AUTO_PUBLISH === 'false' ? 'pending' : 'approved'

    const note = await Note.create({
      title,
      description,
      university,
      course,
      subject,
      semester,
      materialType,
      tags: tags.slice(0, 10),
      fileUrl: publicUrl,
      filePath,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      fileHash,
      uploadedBy: req.user._id,
      status,
    })

    // Increment contribution score
    await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: 2 } })

    sendResponse(res, 201, note, 'Note uploaded successfully')
  } catch (err) {
    next(err)
  }
}

// DELETE /api/notes/:id
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return next(createError('Note not found', 404))

    const isOwner = note.uploadedBy.toString() === req.user._id.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return next(createError('Not authorized to delete this note', 403))
    }

    // Delete from Supabase storage
    if (note.filePath) await deleteFromSupabase(note.filePath)

    // Delete related data
    await Promise.all([
      note.deleteOne(),
      Bookmark.deleteMany({ noteId: note._id }),
      Comment.deleteMany({ noteId: note._id }),
      Report.deleteMany({ noteId: note._id }),
    ])

    // Deduct contribution score
    if (isOwner) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { contributionScore: -2 } })
    }

    sendResponse(res, 200, null, 'Note deleted')
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/:id/download
export const downloadNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    ).select('fileUrl title')

    if (!note) return next(createError('Note not found', 404))

    // Increment contribution score for uploader
    await User.findOneAndUpdate(
      { _id: note.uploadedBy },
      { $inc: { contributionScore: 0.1 } }
    )

    sendResponse(res, 200, { fileUrl: note.fileUrl })
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/:id/upvote
export const upvoteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return next(createError('Note not found', 404))

    const userId = req.user._id
    const alreadyUpvoted = note.upvotes.some((id) => id.toString() === userId.toString())

    if (alreadyUpvoted) {
      note.upvotes.pull(userId)
    } else {
      note.upvotes.push(userId)
      // Add contribution score to uploader
      await User.findByIdAndUpdate(note.uploadedBy, { $inc: { contributionScore: 0.5 } })
    }
    await note.save()

    sendResponse(res, 200, {
      upvoted: !alreadyUpvoted,
      upvoteCount: note.upvotes.length,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/:id/bookmark
export const toggleBookmark = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const existing = await Bookmark.findOne({ userId, noteId: id })
    if (existing) {
      await existing.deleteOne()
      return sendResponse(res, 200, { bookmarked: false })
    }

    await Bookmark.create({ userId, noteId: id })
    sendResponse(res, 200, { bookmarked: true })
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/:id/report
export const reportNote = async (req, res, next) => {
  try {
    const { reason } = req.body
    await Report.create({
      noteId: req.params.id,
      reportedBy: req.user._id,
      reason,
    })
    sendResponse(res, 201, null, 'Report submitted. Thank you for helping us maintain quality.')
  } catch (err) {
    next(err)
  }
}

// GET /api/notes/:id/comments
export const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ noteId: req.params.id })
      .populate('userId', 'name avatarUrl university')
      .sort({ createdAt: -1 })
      .lean()
    sendResponse(res, 200, comments)
  } catch (err) {
    next(err)
  }
}

// POST /api/notes/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body
    const comment = await Comment.create({
      noteId: req.params.id,
      userId: req.user._id,
      text,
    })
    const populated = await comment.populate('userId', 'name avatarUrl university')
    sendResponse(res, 201, populated)
  } catch (err) {
    next(err)
  }
}

// DELETE /api/notes/:noteId/comments/:commentId
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return next(createError('Comment not found', 404))

    const isOwner = comment.userId.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin') {
      return next(createError('Not authorized', 403))
    }

    await comment.deleteOne()
    sendResponse(res, 200, null, 'Comment deleted')
  } catch (err) {
    next(err)
  }
}
