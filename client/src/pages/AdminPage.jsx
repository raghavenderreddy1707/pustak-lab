import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Shield, Users, BookOpen, Download, Flag, Trash2,
  CheckCircle, BarChart3, Eye, Clock, AlertTriangle, Loader2
} from 'lucide-react'
import { adminAPI } from '@/api'
import { formatNumber, formatDate, cn } from '@/utils'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notes', label: 'All Notes', icon: BookOpen },
  { id: 'reports', label: 'Reports', icon: Flag },
  { id: 'users', label: 'Users', icon: Users },
]

function StatCard({ label, value, icon: Icon, color, change }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span className={`text-xs font-medium ${change >= 0 ? 'text-success-500' : 'text-danger-500'}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <div className="stat-number">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('analytics')
  const [deletingId, setDeletingId] = useState(null)

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminAPI.getAnalytics(),
    select: (d) => d.data.data,
    enabled: activeTab === 'analytics',
  })

  const { data: allNotes, isLoading: notesLoading, refetch: refetchNotes } = useQuery({
    queryKey: ['admin-notes'],
    queryFn: () => adminAPI.getQueue({ limit: 50 }),
    select: (d) => d.data.data.data,
    enabled: activeTab === 'notes',
  })

  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminAPI.getReports(),
    select: (d) => d.data.data,
    enabled: activeTab === 'reports',
  })

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers(),
    select: (d) => d.data.data.data,
    enabled: activeTab === 'users',
  })

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note permanently?')) return
    setDeletingId(id)
    try {
      await adminAPI.deleteNote(id)
      toast.success('Note deleted')
      refetchNotes()
    } catch {
      toast.error('Failed to delete note')
    } finally {
      setDeletingId(null)
    }
  }

  const handleResolveReport = async (id, action) => {
    try {
      await adminAPI.resolveReport(id, { action })
      toast.success(`Report ${action === 'dismiss' ? 'dismissed' : 'resolved'}`)
      refetchReports()
    } catch {
      toast.error('Failed to resolve report')
    }
  }

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their content?')) return
    try {
      await adminAPI.deleteUser(id)
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
    }
  }

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white shadow-glow">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Platform management and moderation</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {analyticsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={formatNumber(analytics?.totalUsers || 0)} icon={Users} color="bg-primary-50 dark:bg-primary-900/30 text-primary-600" />
                <StatCard label="Total Notes" value={formatNumber(analytics?.totalNotes || 0)} icon={BookOpen} color="bg-amber-50 dark:bg-amber-900/30 text-amber-600" />
                <StatCard label="Total Downloads" value={formatNumber(analytics?.totalDownloads || 0)} icon={Download} color="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600" />
                <StatCard label="Pending Reports" value={analytics?.pendingReports || 0} icon={Flag} color="bg-danger-100 dark:bg-red-900/30 text-danger-600" />
              </div>

              <div className="card p-5">
                <h3 className="font-display font-semibold mb-4 text-slate-900 dark:text-white">
                  Platform Overview
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Notes This Week', value: analytics?.notesThisWeek || 0, icon: BookOpen },
                    { label: 'New Users This Week', value: analytics?.usersThisWeek || 0, icon: Users },
                    { label: 'Downloads This Week', value: analytics?.downloadsThisWeek || 0, icon: Download },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <s.icon className="w-5 h-5 text-primary-500 mb-2" />
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatNumber(s.value)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ALL NOTES */}
      {activeTab === 'notes' && (
        <div className="animate-fade-in">
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">All Notes</h3>
              <span className="badge badge-slate">{allNotes?.length || 0} notes</span>
            </div>
            {notesLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {allNotes?.map((note) => (
                  <div key={note._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{note.title}</p>
                      <p className="text-xs text-slate-400">{note.university} · {note.subject} · {formatDate(note.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-shrink-0">
                      <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{note.downloadCount || 0}</span>
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{note.viewCount || 0}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      disabled={deletingId === note._id}
                      className="btn-danger btn-sm"
                    >
                      {deletingId === note._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
                {allNotes?.length === 0 && (
                  <div className="text-center py-12 text-slate-400">No notes found</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORTS */}
      {activeTab === 'reports' && (
        <div className="animate-fade-in space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Pending Reports</h3>
          {reportsLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)
          ) : reports?.length === 0 ? (
            <div className="card p-16 text-center">
              <CheckCircle className="w-10 h-10 text-success-500 mx-auto mb-3" />
              <h4 className="font-semibold text-slate-900 dark:text-white">All clear!</h4>
              <p className="text-sm text-slate-400 mt-1">No pending reports</p>
            </div>
          ) : (
            reports.map((report) => (
              <div key={report._id} className="card p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {report.noteId?.title || 'Note'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Reported by {report.reportedBy?.name} · {formatDate(report.createdAt)}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5">
                      {report.reason}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolveReport(report._id, 'delete')}
                      className="btn-danger btn-sm"
                    >
                      Delete Note
                    </button>
                    <button
                      onClick={() => handleResolveReport(report._id, 'dismiss')}
                      className="btn-secondary btn-sm"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="animate-fade-in card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">Registered Users</h3>
          </div>
          {usersLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {users?.map((u) => (
                <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 overflow-hidden">
                    {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email} · {u.university}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-slate'}`}>
                      {u.role}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="btn-ghost btn-icon text-slate-400 hover:text-danger-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
