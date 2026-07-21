import Note from '../models/Note.js'
import User from '../models/User.js'
import Report from '../models/Report.js'
import Bookmark from '../models/Bookmark.js'
import Comment from '../models/Comment.js'
import { deleteFromSupabase } from '../config/supabase.js'
import { sendResponse, createError } from '../utils/helpers.js'

// GET /api/admin/analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [
      totalUsers, totalNotes, pendingReports,
      usersThisWeek, notesThisWeek,
      downloadsAgg, downloadsWeekAgg,
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments({ status: 'approved' }),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      Note.countDocuments({ status: 'approved', createdAt: { $gte: weekAgo } }),
      Note.aggregate([{ $group: { _id: null, total: { $sum: '$downloadCount' } } }]),
      Note.aggregate([
        { $match: { createdAt: { $gte: weekAgo } } },
        { $group: { _id: null, total: { $sum: '$downloadCount' } } },
      ]),
    ])

    sendResponse(res, 200, {
      totalUsers,
      totalNotes,
      totalDownloads: downloadsAgg[0]?.total || 0,
      pendingReports,
      usersThisWeek,
      notesThisWeek,
      downloadsThisWeek: downloadsWeekAgg[0]?.total || 0,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/queue
export const getQueue = async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query
    const query = status ? { status } : {}

    const notes = await Note.find(query)
      .populate('uploadedBy', 'name email university')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean()

    const total = await Note.countDocuments(query)
    sendResponse(res, 200, { data: notes, total })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/notes/:id/approve
export const approveNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    )
    if (!note) return next(createError('Note not found', 404))
    sendResponse(res, 200, note, 'Note approved')
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/notes/:id
export const adminDeleteNote = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id)
    if (!note) return next(createError('Note not found', 404))

    if (note.filePath) await deleteFromSupabase(note.filePath)

    await Promise.all([
      note.deleteOne(),
      Bookmark.deleteMany({ noteId: note._id }),
      Comment.deleteMany({ noteId: note._id }),
      Report.deleteMany({ noteId: note._id }),
    ])

    sendResponse(res, 200, null, 'Note deleted')
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/users
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean()
    const total = await User.countDocuments()
    sendResponse(res, 200, { data: users, total })
  } catch (err) {
    next(err)
  }
}

// DELETE /api/admin/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return next(createError('User not found', 404))
    if (user.role === 'admin') return next(createError('Cannot delete admin users', 403))

    // Delete all their notes + files
    const notes = await Note.find({ uploadedBy: user._id })
    await Promise.all(notes.map((n) => n.filePath ? deleteFromSupabase(n.filePath) : Promise.resolve()))

    await Promise.all([
      Note.deleteMany({ uploadedBy: user._id }),
      Bookmark.deleteMany({ userId: user._id }),
      Comment.deleteMany({ userId: user._id }),
      user.deleteOne(),
    ])

    sendResponse(res, 200, null, 'User deleted')
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/reports
export const getReports = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query
    const reports = await Report.find({ status })
      .populate('noteId', 'title university')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    sendResponse(res, 200, reports)
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/reports/:id/resolve
export const resolveReport = async (req, res, next) => {
  try {
    const { action } = req.body // 'dismiss' | 'delete'
    const report = await Report.findById(req.params.id)
    if (!report) return next(createError('Report not found', 404))

    if (action === 'delete') {
      // Delete the reported note
      const note = await Note.findById(report.noteId)
      if (note) {
        if (note.filePath) await deleteFromSupabase(note.filePath)
        await Promise.all([
          note.deleteOne(),
          Bookmark.deleteMany({ noteId: note._id }),
          Comment.deleteMany({ noteId: note._id }),
        ])
      }
    }

    report.status = action === 'dismiss' ? 'dismissed' : 'resolved'
    report.resolvedAt = new Date()
    await report.save()

    // Resolve all reports for same note
    if (action === 'delete') {
      await Report.updateMany({ noteId: report.noteId }, { status: 'resolved', resolvedAt: new Date() })
    }

    sendResponse(res, 200, null, `Report ${report.status}`)
  } catch (err) {
    next(err)
  }
}

// GET /api/search
export const search = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query
    if (!q?.trim()) return sendResponse(res, 200, { data: [], total: 0 })

    const notes = await Note.find({
      $text: { $search: q },
      status: 'approved',
    }, {
      score: { $meta: 'textScore' },
    })
      .select('-filePath')
      .populate('uploadedBy', 'name university avatarUrl')
      .sort({ score: { $meta: 'textScore' } })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean()

    const total = await Note.countDocuments({ $text: { $search: q }, status: 'approved' })
    sendResponse(res, 200, { data: notes, total })
  } catch (err) {
    next(err)
  }
}
