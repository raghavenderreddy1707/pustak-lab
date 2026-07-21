import { useQuery } from '@tanstack/react-query'
import { Trophy, Medal, Upload, Download, ThumbsUp, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usersAPI } from '@/api'
import { formatNumber, getBadgeInfo } from '@/utils'

export default function LeaderboardPage() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => usersAPI.getLeaderboard(),
    select: (d) => d.data.data,
  })

  const getRankStyle = (rank) => {
    if (rank === 1) return { icon: '🥇', bg: 'bg-gradient-to-r from-amber-400/20 to-amber-300/10 border-amber-300/50' }
    if (rank === 2) return { icon: '🥈', bg: 'bg-gradient-to-r from-slate-300/20 to-slate-200/10 border-slate-300/50' }
    if (rank === 3) return { icon: '🥉', bg: 'bg-gradient-to-r from-orange-300/20 to-orange-200/10 border-orange-300/50' }
    return { icon: `#${rank}`, bg: '' }
  }

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-glow-amber">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-slate-900 dark:text-white mb-2">
          Top Contributors
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          The most active students sharing study materials across universities. Earn points by uploading quality notes!
        </p>
      </div>

      {/* How to earn points */}
      <div className="card p-5 mb-8 bg-gradient-to-r from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20 border-primary-100 dark:border-primary-800/30">
        <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-3">How contributor scores work</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { action: 'Upload a note', points: '+2 pts' },
            { action: 'Note downloaded', points: '+1 pt' },
            { action: 'Receive upvote', points: '+0.5 pt' },
            { action: 'Account created', points: '+1 pt' },
          ].map((item) => (
            <div key={item.action} className="text-center">
              <div className="badge-primary badge mb-1 mx-auto w-fit">{item.points}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{item.action}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-primary-100 dark:border-primary-800/30 flex gap-4 flex-wrap">
          {[
            { emoji: '🥉', label: 'Bronze', req: '5+ points' },
            { emoji: '🥈', label: 'Silver', req: '20+ points' },
            { emoji: '🥇', label: 'Gold', req: '50+ points' },
          ].map((b) => (
            <span key={b.label} className="text-xs text-slate-500 dark:text-slate-400">
              {b.emoji} {b.label}: {b.req}
            </span>
          ))}
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">All-Time Leaderboard</h2>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : leaderboard?.length === 0 ? (
          <div className="text-center py-16">
            <Medal className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400">No contributors yet — be the first!</p>
            <Link to="/upload" className="btn-primary mt-4">Upload Notes</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {leaderboard?.map((user, idx) => {
              const rank = idx + 1
              const { icon, bg } = getRankStyle(rank)
              const badge = getBadgeInfo(user.contributionScore)

              return (
                <div
                  key={user._id}
                  className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${rank <= 3 ? `border-l-2 ${bg}` : ''}`}
                >
                  {/* Rank */}
                  <div className="w-10 text-center flex-shrink-0">
                    {typeof icon === 'string' && icon.startsWith('#') ? (
                      <span className="text-sm font-medium text-slate-400">{icon}</span>
                    ) : (
                      <span className="text-xl">{icon}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : user.name?.[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${user._id}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                      {user.name}
                    </Link>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                      <Building2 className="w-3 h-3" />
                      {user.university}
                    </div>
                  </div>

                  {/* Badge */}
                  <span className="badge badge-amber hidden sm:inline-flex">
                    {badge.emoji} {badge.label}
                  </span>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                    <span className="flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" />
                      {user.noteCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {formatNumber(user.totalUpvotes || 0)}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-slate-900 dark:text-white">{user.contributionScore}</div>
                    <div className="text-xs text-slate-400">pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
