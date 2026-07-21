import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search, Upload, BookOpen, Star, TrendingUp, Users,
  Download, ArrowRight, Zap, Shield, BookMarked
} from 'lucide-react'
import NoteCard, { NoteCardSkeleton } from '@/components/NoteCard'
import { notesAPI } from '@/api'
import { formatNumber } from '@/utils'

const STATS = [
  { label: 'Notes Shared', value: '10,000+', icon: BookOpen, color: 'text-primary-500' },
  { label: 'Students Helped', value: '50,000+', icon: Users, color: 'text-amber-500' },
  { label: 'Downloads', value: '200,000+', icon: Download, color: 'text-emerald-500' },
  { label: 'Universities', value: '100+', icon: Star, color: 'text-violet-500' },
]

const FEATURES = [
  {
    icon: '📤',
    title: 'Upload Instantly',
    desc: 'Share your notes in seconds — PDFs, docs, slides, handwritten scans, all supported.',
    color: 'from-primary-500/10 to-primary-500/5',
  },
  {
    icon: '🔍',
    title: 'Smart Discovery',
    desc: 'Find exactly what you need using cascading filters: university → course → subject → semester.',
    color: 'from-amber-500/10 to-amber-500/5',
  },
  {
    icon: '⬇️',
    title: 'Free Downloads',
    desc: 'Every note is free to download. No paywalls, no hidden fees, ever.',
    color: 'from-emerald-500/10 to-emerald-500/5',
  },
  {
    icon: '🏆',
    title: 'Earn Recognition',
    desc: 'Build your contributor reputation. Earn Bronze → Silver → Gold badges as you upload.',
    color: 'from-violet-500/10 to-violet-500/5',
  },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: trendingData, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-notes'],
    queryFn: () => notesAPI.getTrending(),
    select: (d) => d.data.data,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero-gradient relative overflow-hidden py-20 md:py-28 lg:py-36">
        <div className="container-app text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs font-medium mb-6 border border-primary-100 dark:border-primary-800/50 animate-fade-in">
            <Zap className="w-3 h-3" />
            100% Free · Crowdsourced by Students
          </div>

          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-slate-900 dark:text-white mb-6 text-balance leading-tight animate-slide-up">
            Your Campus Library,{' '}
            <span className="gradient-text">Now Online</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 text-balance animate-fade-in">
            Upload, discover, and download study materials shared by students across universities —
            notes, question papers, assignments, lab manuals & more.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex max-w-xl mx-auto gap-2 mb-8 animate-slide-up">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by subject, topic, or university…"
                className="input pl-11 h-12 text-base shadow-sm"
              />
            </div>
            <button type="submit" className="btn-primary h-12 px-6 text-base">
              Search
            </button>
          </form>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
            <Link to="/browse" className="btn-primary btn-lg">
              <BookOpen className="w-5 h-5" />
              Browse Notes
            </Link>
            <Link to="/auth?mode=register" className="btn-secondary btn-lg">
              <Upload className="w-5 h-5" />
              Start Uploading
            </Link>
          </div>
        </div>

        {/* Decorative gradient circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-400/10 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* ===== STATS ===== */}
      <section className="py-10 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center p-4">
                <stat.icon className={`w-7 h-7 mb-2 ${stat.color}`} />
                <div className="font-display font-bold text-2xl md:text-3xl text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRENDING ===== */}
      <section className="section">
        <div className="container-app">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                Trending This Week
              </h2>
            </div>
            <Link to="/browse?sort=downloads" className="btn-ghost btn-sm text-primary-600 dark:text-primary-400">
              See all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingLoading
              ? Array.from({ length: 8 }).map((_, i) => <NoteCardSkeleton key={i} />)
              : trendingData?.map((note) => <NoteCard key={note._id} note={note} />)
            }
          </div>

          {!trendingLoading && (!trendingData || trendingData.length === 0) && (
            <div className="text-center py-16 card">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
                No notes yet — be the first!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Upload your study materials and help fellow students.
              </p>
              <Link to="/upload" className="btn-primary">
                <Upload className="w-4 h-4" /> Upload Now
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section bg-slate-50 dark:bg-slate-900/50">
        <div className="container-app">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-slate-900 dark:text-white mb-3">
              Everything a student needs
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Built by students, for students — the features you actually need, not corporate fluff.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((feat) => (
              <div
                key={feat.title}
                className={`card p-5 bg-gradient-to-br ${feat.color} hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="text-3xl mb-3">{feat.icon}</div>
                <h3 className="font-display font-semibold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section">
        <div className="container-app">
          <div className="card p-8 md:p-12 text-center bg-gradient-to-br from-primary-600 to-primary-700 border-0">
            <BookMarked className="w-12 h-12 text-primary-200 mx-auto mb-4" />
            <h2 className="font-display font-bold text-3xl text-white mb-3">
              Start contributing today
            </h2>
            <p className="text-primary-200 max-w-md mx-auto mb-6">
              Join thousands of students already sharing their best study materials. It's free, always.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth?mode=register"
                className="btn bg-white hover:bg-primary-50 text-primary-700 font-semibold btn-lg shadow-sm">
                Create Free Account
              </Link>
              <Link to="/browse"
                className="btn border border-primary-400 hover:bg-primary-500/20 text-white btn-lg">
                Browse Without Signing In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
