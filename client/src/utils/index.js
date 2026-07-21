import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs) => twMerge(clsx(inputs))

export const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const secs = Math.floor(diff / 1000)
  const mins = Math.floor(secs / 60)
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  if (secs < 60) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

export const getMaterialTypeColor = (type) => {
  const map = {
    'Notes': 'type-notes',
    'Question Paper': 'type-paper',
    'Assignment': 'type-assignment',
    'Lab Manual': 'type-lab',
    'Cheat Sheet': 'type-cheat',
  }
  return map[type] || 'type-notes'
}

export const getMaterialTypeIcon = (type) => {
  const map = {
    'Notes': '📝',
    'Question Paper': '📄',
    'Assignment': '✏️',
    'Lab Manual': '🔬',
    'Cheat Sheet': '⚡',
  }
  return map[type] || '📝'
}

export const getBadgeInfo = (score) => {
  if (score >= 50) return { label: 'Gold Contributor', color: 'badge-gold', emoji: '🥇' }
  if (score >= 20) return { label: 'Silver Contributor', color: 'badge-silver', emoji: '🥈' }
  if (score >= 5) return { label: 'Bronze Contributor', color: 'badge-bronze', emoji: '🥉' }
  return { label: 'Newcomer', color: '', emoji: '🌱' }
}

export const MATERIAL_TYPES = [
  'Notes',
  'Question Paper',
  'Assignment',
  'Lab Manual',
  'Cheat Sheet',
]

export const SEMESTERS = [
  '1st Semester', '2nd Semester', '3rd Semester', '4th Semester',
  '5th Semester', '6th Semester', '7th Semester', '8th Semester',
]

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '…'
}

export const getErrorMessage = (err) => {
  return err?.response?.data?.message
    || err?.message
    || 'Something went wrong. Please try again.'
}
