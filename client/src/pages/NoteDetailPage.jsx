import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Download, ThumbsUp, Eye, BookMarked, BookmarkCheck, Flag,
  Share2, Calendar, Building2, GraduationCap, BookOpen, Clock,
  Send, Trash2, FileText, Loader2, ArrowLeft
} from 'lucide-react'
import { notesAPI, commentsAPI } from '@/api'
import { useAuthStore } from '@/store'
import {
  formatNumber, formatDate, formatFileSize, getMaterialTypeColor,
  getMaterialTypeIcon, getErrorMessage, cn
} from '@/utils'
import toast from 'react-hot-toast'

function CommentItem({ comment, onDelete, canDelete }) {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {comment.userId?.name?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {comment.userId?.name || 'Anonymous'}
          </span>
          <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {comment.text}
        </p>
      </div>
      {canDelete && (
        <button
          onClick={() => onDelete(comment._id)}
          className="btn-ghost btn-icon text-slate-400 hover:text-danger-500 self-start flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

export default function NoteDetailPage() {
  const { id } = useParams()
  const { isAuthenticated, user } = useAuthStore()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasUpvoted, setHasUpvoted] = useState(false)
  const [upvoteCount, setUpvoteCount] = useState(0)
  const [reportReason, setReportReason] = useState('')
  const [showReport, setShowReport] = useState(false)

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesAPI.getById(id),
    select: (d) => {
      const n = d.data.data
      setIsBookmarked(n.isBookmarked || false)
      setHasUpvoted(n.hasUpvoted || false)
      setUpvoteCount(n.upvotes?.length || 0)
      return n
    },
  })

  const { data: comments, isLoading: commentsLoading, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentsAPI.getByNote(id),
    select: (d) => d.data.data,
  })

  const handleDownload = async () => {
    if (!isAuthenticated) {
      toast.error('Sign in to download notes')
      return
    }
    try {
      const { data } = await notesAPI.download(id)
      window.open(data.data.fileUrl, '_blank')
      toast.success('Download started!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleUpvote = async () => {
    if (!isAuthenticated) { toast.error('Sign in to upvote'); return }
    try {
      const { data } = await notesAPI.upvote(id)
      setHasUpvoted(data.data.upvoted)
      setUpvoteCount(data.data.upvoteCount)
    } catch { toast.error('Failed to upvote') }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark'); return }
    try {
      const { data } = await notesAPI.bookmark(id)
      setIsBookmarked(data.data.bookmarked)
      toast.success(data.data.bookmarked ? 'Bookmarked!' : 'Removed from bookmarks')
    } catch { toast.error('Failed to update bookmark') }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
      .then(() => toast.success('Link copied!'))
      .catch(() => toast.error('Could not copy link'))
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    if (!isAuthenticated) { toast.error('Sign in to comment'); return }
    try {
      await commentsAPI.create(id, { text: comment.trim() })
      setComment('')
      refetchComments()
      toast.success('Comment added!')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(id, commentId)
      refetchComments()
    } catch { toast.error('Failed to delete comment') }
  }

  const handleReport = async () => {
    if (!reportReason.trim()) { toast.error('Please provide a reason'); return }
    try {
      await notesAPI.report(id, { reason: reportReason })
      toast.success('Report submitted. Thank you!')
      setShowReport(false)
      setReportReason('')
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-8 w-40 mb-4 rounded-lg" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="skeleton h-64 rounded-2xl" />
              <div className="skeleton h-6 w-3/4 rounded" />
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
            </div>
            <div className="space-y-3">
              <div className="skeleton h-40 rounded-2xl" />
              <div className="skeleton h-12 rounded-xl" />
              <div className="skeleton h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="container-app py-20 text-center">
        <div className="text-5xl mb-4">📭</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">Note not found</h2>
        <Link to="/browse" className="btn-primary mt-4">Browse Notes</Link>
      </div>
    )
  }

  const typeColor = getMaterialTypeColor(note.materialType)
  const typeIcon = getMaterialTypeIcon(note.materialType)

  return (
    <div className="container-app py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Link to="/browse" className="btn-ghost btn-sm mb-6 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </Link>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Thumbnail / Preview */}
            <div className="card overflow-hidden">
              <div className="relative h-56 bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                {note.thumbnailUrl ? (
                  <img src={note.thumbnailUrl} alt={note.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow', typeColor)}>
                      {typeIcon}
                    </div>
                    <span className={cn('badge text-sm', typeColor)}>{note.materialType}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title & meta */}
            <div>
              <div className={cn('badge mb-3', typeColor)}>
                {typeIcon} {note.materialType}
              </div>
              <h1 className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white mb-3 leading-tight">
                {note.title}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                {note.description}
              </p>
            </div>

            {/* Meta info */}
            <div className="card p-4 grid grid-cols-2 gap-3">
              {[
                { icon: Building2, label: 'University', value: note.university },
                { icon: GraduationCap, label: 'Course', value: note.course },
                { icon: BookOpen, label: 'Subject', value: note.subject },
                { icon: Clock, label: 'Semester', value: note.semester },
                { icon: Calendar, label: 'Uploaded', value: formatDate(note.createdAt) },
                { icon: FileText, label: 'File Size', value: formatFileSize(note.fileSize) },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-2">
                  <item.icon className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {note.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="tag-chip"># {tag}</span>
                ))}
              </div>
            )}

            {/* Comments */}
            <div className="card p-5">
              <h2 className="font-display font-semibold text-base mb-4 text-slate-900 dark:text-white">
                Q&A · {comments?.length || 0} comments
              </h2>

              {/* Add comment */}
              <form onSubmit={handleComment} className="flex gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={isAuthenticated ? 'Ask a question or leave a comment…' : 'Sign in to comment'}
                    disabled={!isAuthenticated}
                    rows={2}
                    className="input resize-none pr-10 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(e) }
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim() || !isAuthenticated}
                    className="absolute right-2 bottom-2 btn-icon btn-primary p-1.5 disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {commentsLoading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3">
                      <div className="skeleton w-8 h-8 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-28 rounded" />
                        <div className="skeleton h-3 w-full rounded" />
                        <div className="skeleton h-3 w-3/4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">
                  No comments yet. Be the first to ask a question!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((c) => (
                    <CommentItem
                      key={c._id}
                      comment={c}
                      onDelete={handleDeleteComment}
                      canDelete={user?._id === c.userId?._id || user?.role === 'admin'}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="card p-4 space-y-3">
              <button
                onClick={handleDownload}
                className="btn-primary w-full btn-lg"
              >
                <Download className="w-5 h-5" />
                Download Free
              </button>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleUpvote}
                  className={cn(
                    'btn-secondary flex-col gap-1 py-2.5 h-auto text-xs',
                    hasUpvoted && 'border-primary-400 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                  )}
                >
                  <ThumbsUp className={cn('w-4 h-4', hasUpvoted && 'fill-primary-500 text-primary-500')} />
                  {formatNumber(upvoteCount)}
                </button>
                <button
                  onClick={handleBookmark}
                  className={cn(
                    'btn-secondary flex-col gap-1 py-2.5 h-auto text-xs',
                    isBookmarked && 'border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                  )}
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4 fill-amber-500 text-amber-500" /> : <BookMarked className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={handleShare}
                  className="btn-secondary flex-col gap-1 py-2.5 h-auto text-xs"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Statistics</h3>
              <div className="space-y-2.5">
                {[
                  { icon: Download, label: 'Downloads', value: formatNumber(note.downloadCount) },
                  { icon: Eye, label: 'Views', value: formatNumber(note.viewCount) },
                  { icon: ThumbsUp, label: 'Upvotes', value: formatNumber(upvoteCount) },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploader */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Uploaded by</h3>
              <Link to={`/profile/${note.uploadedBy?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden">
                  {note.uploadedBy?.avatarUrl ? (
                    <img src={note.uploadedBy.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    note.uploadedBy?.name?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{note.uploadedBy?.name}</div>
                  <div className="text-xs text-slate-400">{note.uploadedBy?.university}</div>
                </div>
              </Link>
            </div>

            {/* Report */}
            <div>
              {!showReport ? (
                <button
                  onClick={() => setShowReport(true)}
                  className="btn-ghost btn-sm text-slate-400 w-full"
                >
                  <Flag className="w-3.5 h-3.5" /> Report this note
                </button>
              ) : (
                <div className="card p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-danger-600">Report Note</h4>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue (e.g., copyright violation, incorrect content, duplicate)…"
                    rows={3}
                    className="input text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleReport} className="btn-danger btn-sm flex-1">Submit</button>
                    <button onClick={() => setShowReport(false)} className="btn-secondary btn-sm">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
