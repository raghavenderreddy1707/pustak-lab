import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Upload, BookMarked, Star, Download,
  ThumbsUp, Eye, Trash2, FileText, Plus, TrendingUp
} from 'lucide-react'
import { notesAPI } from '@/api'
import { useAuthStore } from '@/store'
import NoteCard, { NoteCardSkeleton } from '@/components/NoteCard'
import { formatNumber, formatDate, getBadgeInfo, cn } from '@/utils'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'uploads', label: 'My Uploads', icon: Upload },
  { id: 'bookmarks', label: 'Bookmarks', icon: BookMarked },
  { id: 'stats', label: 'My Stats', icon: TrendingUp },
]

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'uploads'

  const { data: myNotes, isLoading: notesLoading, refetch: refetchNotes } = useQuery({
    queryKey: ['my-notes'],
    queryFn: () => notesAPI.getMyNotes(),
    select: (d) => d.data.data.data,
    enabled: activeTab === 'uploads',
  })

  const { data: bookmarks, isLoading: bookmarksLoading } = useQuery({
    queryKey: ['my-bookmarks'],
    queryFn: () => notesAPI.getMyBookmarks(),
    select: (d) => d.data.data.data,
    enabled: activeTab === 'bookmarks',
  })

  const handleDelete = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return
    try {
      await notesAPI.delete(noteId)
      toast.success('Note deleted')
      refetchNotes()
    } catch {
      toast.error('Failed to delete note')
    }
  }

  const badge = getBadgeInfo(user?.contributionScore || 0)

  const totalDownloads = myNotes?.reduce((sum, n) => sum + (n.downloadCount || 0), 0) || 0
  const totalUpvotes = myNotes?.reduce((sum, n) => sum + (n.upvotes?.length || 0), 0) || 0
  const totalViews = myNotes?.reduce((sum, n) => sum + (n.viewCount || 0), 0) || 0

  return (
    <div className="container-app py-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-bold shadow-glow flex-shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Hi, {user?.name?.split(' ')[0]} 👋
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500 dark:text-slate-400">{user?.university}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="text-sm font-medium" style={{ background: 'linear-gradient(135deg, #cd7f32, #a05a1a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {badge.emoji} {badge.label}
              </span>
            </div>
          </div>
        </div>
        <Link to="/upload" className="btn-primary">
          <Plus className="w-4 h-4" /> Upload Notes
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSearchParams({ tab: tab.id })}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:block">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* MY UPLOADS TAB */}
      {activeTab === 'uploads' && (
        <div>
          {notesLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}
            </div>
          ) : myNotes?.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                No uploads yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-5">
                Share your first study material and start helping fellow students!
              </p>
              <Link to="/upload" className="btn-primary">
                <Upload className="w-4 h-4" /> Upload Your First Note
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {myNotes.length} note{myNotes.length !== 1 ? 's' : ''} uploaded
              </p>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
                {myNotes.map((note) => (
                  <div key={note._id} className="relative">
                    <NoteCard note={note} />
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-danger-500 hover:bg-danger-600 text-white flex items-center justify-center shadow-sm transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* BOOKMARKS TAB */}
      {activeTab === 'bookmarks' && (
        <div>
          {bookmarksLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}
            </div>
          ) : bookmarks?.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-5xl mb-4">🔖</div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                No bookmarks yet
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-5">
                Bookmark notes while browsing to save them here for quick access.
              </p>
              <Link to="/browse" className="btn-primary">
                <FileText className="w-4 h-4" /> Browse Notes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
              {bookmarks.map((note) => (
                <NoteCard key={note._id} note={{ ...note, isBookmarked: true }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Notes Uploaded" value={myNotes?.length || 0} icon={Upload} color="bg-primary-50 dark:bg-primary-900/30 text-primary-600" />
            <StatCard label="Total Downloads" value={formatNumber(totalDownloads)} icon={Download} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" />
            <StatCard label="Total Upvotes" value={formatNumber(totalUpvotes)} icon={ThumbsUp} color="bg-amber-50 dark:bg-amber-900/30 text-amber-600" />
            <StatCard label="Total Views" value={formatNumber(totalViews)} icon={Eye} color="bg-violet-50 dark:bg-violet-900/30 text-violet-600" />
          </div>

          {/* Contribution badge */}
          <div className="card p-6">
            <h3 className="font-display font-semibold mb-4 text-slate-900 dark:text-white">Contributor Level</h3>
            <div className="flex items-center gap-4">
              <div className="text-5xl">{badge.emoji}</div>
              <div>
                <div className="font-bold text-xl text-slate-900 dark:text-white">{badge.label}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Score: {user?.contributionScore || 0} points
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {user?.contributionScore < 5
                    ? `Upload ${5 - (user?.contributionScore || 0)} more notes to reach Bronze Contributor`
                    : user?.contributionScore < 20
                    ? `Upload ${20 - (user?.contributionScore || 0)} more notes to reach Silver Contributor`
                    : user?.contributionScore < 50
                    ? `Upload ${50 - (user?.contributionScore || 0)} more notes to reach Gold Contributor`
                    : 'You have reached the highest contributor level! 🏆'}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Progress to next level</span>
                <span>{Math.min(user?.contributionScore || 0, 50)}/50</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${Math.min(((user?.contributionScore || 0) / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
