import User from '../models/User.js'
import Note from '../models/Note.js'
import { sendResponse, createError } from '../utils/helpers.js'

// GET /api/users/:id
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return next(createError('User not found', 404))

    const [notes, stats] = await Promise.all([
      Note.find({ uploadedBy: user._id, status: 'approved' })
        .select('-filePath')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      Note.aggregate([
        { $match: { uploadedBy: user._id, status: 'approved' } },
        {
          $group: {
            _id: null,
            totalNotes: { $sum: 1 },
            totalDownloads: { $sum: '$downloadCount' },
            totalViews: { $sum: '$viewCount' },
            totalUpvotes: { $sum: { $size: '$upvotes' } },
          },
        },
      ]),
    ])

    sendResponse(res, 200, {
      user,
      notes,
      stats: stats[0] || { totalNotes: 0, totalDownloads: 0, totalViews: 0, totalUpvotes: 0 },
    })
  } catch (err) {
    next(err)
  }
}

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, university, course, bio, avatarUrl } = req.body

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, university, course, bio, avatarUrl },
      { new: true, runValidators: true }
    )

    sendResponse(res, 200, updated, 'Profile updated')
  } catch (err) {
    next(err)
  }
}

// GET /api/users/leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name university avatarUrl contributionScore course')
      .sort({ contributionScore: -1 })
      .limit(50)
      .lean()

    // Add note count and upvotes to each user
    const enriched = await Promise.all(
      users.map(async (user) => {
        const [noteCount, upvoteAgg] = await Promise.all([
          Note.countDocuments({ uploadedBy: user._id, status: 'approved' }),
          Note.aggregate([
            { $match: { uploadedBy: user._id } },
            { $group: { _id: null, totalUpvotes: { $sum: { $size: '$upvotes' } } } },
          ]),
        ])
        return {
          ...user,
          noteCount,
          totalUpvotes: upvoteAgg[0]?.totalUpvotes || 0,
        }
      })
    )

    sendResponse(res, 200, enriched)
  } catch (err) {
    next(err)
  }
}
