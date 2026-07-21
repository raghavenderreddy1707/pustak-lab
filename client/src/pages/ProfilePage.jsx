import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Building2, Upload, Download, ThumbsUp, Calendar } from 'lucide-react'
import { usersAPI } from '@/api'
import NoteCard, { NoteCardSkeleton } from '@/components/NoteCard'
import { formatNumber, formatDate, getBadgeInfo } from '@/utils'

export default function ProfilePage() {
  const { id } = useParams()

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['user-profile', id],
    queryFn: () => usersAPI.getProfile(id),
    select: (d) => d.data.data,
  })

  if (isLoading) {
    return (
      <div className="container-app py-8">
        <div className="max-w-4xl mx-auto">
          <div className="card p-6 mb-6">
            <div className="flex gap-4">
              <div className="skeleton w-20 h-20 rounded-2xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="skeleton h-6 w-48 rounded" />
                <div className="skeleton h-4 w-32 rounded" />
                <div className="skeleton h-4 w-64 rounded" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <NoteCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container-app py-20 text-center">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">User not found</h2>
        <Link to="/browse" className="btn-primary mt-4">Browse Notes</Link>
      </div>
    )
  }

  const { user, notes, stats } = profileData
  const badge = getBadgeInfo(user?.contributionScore || 0)

  return (
    <div className="container-app py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0 overflow-hidden shadow-glow">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                user.name?.[0]?.toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                <span className="badge badge-primary">{badge.emoji} {badge.label}</span>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mb-3">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> {user.university}
                </span>
                <span className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" /> {user.course}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" /> Joined {formatDate(user.createdAt)}
                </span>
              </div>

              {user.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-4 sm:flex-col text-center sm:text-right">
              {[
                { icon: Upload, label: 'Uploads', value: stats?.totalNotes || 0 },
                { icon: Download, label: 'Downloads', value: formatNumber(stats?.totalDownloads || 0) },
                { icon: ThumbsUp, label: 'Upvotes', value: formatNumber(stats?.totalUpvotes || 0) },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notes by this user */}
        <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">
          Notes by {user.name.split(' ')[0]}
        </h2>

        {notes?.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-slate-500 dark:text-slate-400">No notes uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4">
            {notes?.map((note) => <NoteCard key={note._id} note={note} />)}
          </div>
        )}
      </div>
    </div>
  )
}
