import { Link } from 'react-router-dom'
import { Download, ThumbsUp, Eye, BookMarked, BookmarkCheck, FileText, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { formatNumber, formatDate, getMaterialTypeColor, getMaterialTypeIcon, truncateText, cn } from '@/utils'
import { notesAPI } from '@/api'
import { useAuthStore } from '@/store'
import toast from 'react-hot-toast'

export function NoteCardSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="skeleton h-36 rounded-xl mb-3" />
      <div className="skeleton h-4 w-3/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="flex justify-between">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-12" />
      </div>
    </div>
  )
}

export default function NoteCard({ note, onBookmarkToggle }) {
  const { isAuthenticated } = useAuthStore()
  const [isBookmarked, setIsBookmarked] = useState(note.isBookmarked || false)
  const [upvotes, setUpvotes] = useState(note.upvotes?.length || 0)
  const [hasUpvoted, setHasUpvoted] = useState(note.hasUpvoted || false)
  const [loadingBookmark, setLoadingBookmark] = useState(false)

  const typeColor = getMaterialTypeColor(note.materialType)
  const typeIcon = getMaterialTypeIcon(note.materialType)

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Sign in to bookmark notes')
      return
    }
    setLoadingBookmark(true)
    try {
      const { data } = await notesAPI.bookmark(note._id)
      setIsBookmarked(data.data.bookmarked)
      toast.success(data.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed')
      onBookmarkToggle?.(note._id, data.data.bookmarked)
    } catch {
      toast.error('Failed to update bookmark')
    } finally {
      setLoadingBookmark(false)
    }
  }

  const handleUpvote = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Sign in to upvote')
      return
    }
    try {
      const { data } = await notesAPI.upvote(note._id)
      setHasUpvoted(data.data.upvoted)
      setUpvotes(data.data.upvoteCount)
    } catch {
      toast.error('Failed to upvote')
    }
  }

  return (
    <Link to={`/notes/${note._id}`} className="card-hover block group">
      {/* Thumbnail / Preview */}
      <div className="relative h-36 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 mb-3">
        {note.thumbnailUrl ? (
          <img
            src={note.thumbnailUrl}
            alt={note.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm', typeColor)}>
              {typeIcon}
            </div>
            <span className={cn('text-xs font-medium px-2.5 py-0.5 rounded-full', typeColor)}>
              {note.materialType}
            </span>
          </div>
        )}
        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          disabled={loadingBookmark}
          className={cn(
            'absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all shadow-sm',
            isBookmarked
              ? 'bg-primary-600 text-white'
              : 'bg-white/90 dark:bg-slate-800/90 text-slate-500 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800'
          )}
        >
          {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <BookMarked className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content */}
      <div className="px-1">
        {/* Type badge */}
        <div className={cn('badge text-xs mb-2', typeColor)}>
          {typeIcon} {note.materialType}
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white leading-snug mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
          {note.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
          {truncateText(note.description, 80)}
        </p>

        {/* University + Course */}
        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-2 truncate">
          <FileText className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{note.university} · {note.subject} · {note.semester}</span>
        </div>

        {/* Tags */}
        {note.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag-chip text-xs"># {tag}</span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-slate-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
            <button
              onClick={handleUpvote}
              className={cn(
                'flex items-center gap-1 hover:text-primary-500 transition-colors',
                hasUpvoted && 'text-primary-500 font-medium'
              )}
            >
              <ThumbsUp className={cn('w-3.5 h-3.5', hasUpvoted && 'fill-primary-500')} />
              {formatNumber(upvotes)}
            </button>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              {formatNumber(note.downloadCount || 0)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {formatNumber(note.viewCount || 0)}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatDate(note.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  )
}
