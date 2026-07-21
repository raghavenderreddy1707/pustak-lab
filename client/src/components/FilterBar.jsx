import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { MATERIAL_TYPES, SEMESTERS, cn } from '@/utils'
import { searchAPI } from '@/api'

const UNIVERSITIES = [
  'Anna University', 'Mumbai University', 'Delhi University',
  'VTU', 'JNTU', 'Pune University', 'Osmania University',
  'Bangalore University', 'Calcutta University', 'Other'
]

const COURSES = [
  'B.Tech / B.E.', 'B.Sc', 'BCA', 'BBA', 'B.Com',
  'M.Tech / M.E.', 'M.Sc', 'MCA', 'MBA', 'M.Com', 'PhD', 'Other'
]

function SelectFilter({ label, value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'input h-9 text-sm pr-8 appearance-none cursor-pointer',
          value ? 'text-slate-900 dark:text-white border-primary-400 dark:border-primary-500' : ''
        )}
      >
        <option value="">{placeholder || label}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

export default function FilterBar({ onChange }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    university: searchParams.get('university') || '',
    course: searchParams.get('course') || '',
    subject: searchParams.get('subject') || '',
    semester: searchParams.get('semester') || '',
    materialType: searchParams.get('materialType') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => k !== 'sort' && v !== '')
    .length

  const updateFilter = (key, val) => {
    const next = { ...filters, [key]: val }
    setFilters(next)

    // Sync to URL params
    const params = new URLSearchParams(searchParams)
    if (val) {
      params.set(key, val)
    } else {
      params.delete(key)
    }
    setSearchParams(params, { replace: true })
    onChange?.(next)
  }

  const clearAll = () => {
    const cleared = { university: '', course: '', subject: '', semester: '', materialType: '', sort: 'newest' }
    setFilters(cleared)
    const params = new URLSearchParams(searchParams)
    ;['university', 'course', 'subject', 'semester', 'materialType'].forEach(k => params.delete(k))
    setSearchParams(params, { replace: true })
    onChange?.(cleared)
  }

  return (
    <div className="card p-3 mb-5">
      {/* Sort + toggle row */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn('btn-secondary btn-sm gap-1.5', showFilters && 'border-primary-400 text-primary-600 dark:text-primary-400')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="badge badge-primary text-xs px-1.5 py-0">{activeFilterCount}</span>
          )}
        </button>

        {/* Sort */}
        <div className="relative ml-auto">
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="input h-9 text-sm pr-8 appearance-none cursor-pointer w-auto"
          >
            <option value="newest">Most Recent</option>
            <option value="downloads">Most Downloaded</option>
            <option value="upvotes">Highest Rated</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {activeFilterCount > 0 && (
          <button onClick={clearAll} className="btn-ghost btn-sm text-danger-600 dark:text-danger-400">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 animate-slide-down">
          <SelectFilter
            label="University"
            value={filters.university}
            onChange={(v) => updateFilter('university', v)}
            options={UNIVERSITIES}
            placeholder="All Universities"
          />
          <SelectFilter
            label="Course"
            value={filters.course}
            onChange={(v) => updateFilter('course', v)}
            options={COURSES}
            placeholder="All Courses"
          />
          <div className="relative">
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => updateFilter('subject', e.target.value)}
              placeholder="Subject…"
              className="input h-9 text-sm"
            />
          </div>
          <SelectFilter
            label="Semester"
            value={filters.semester}
            onChange={(v) => updateFilter('semester', v)}
            options={SEMESTERS}
            placeholder="All Semesters"
          />
          <SelectFilter
            label="Type"
            value={filters.materialType}
            onChange={(v) => updateFilter('materialType', v)}
            options={MATERIAL_TYPES}
            placeholder="All Types"
          />
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {Object.entries(filters)
            .filter(([k, v]) => k !== 'sort' && v)
            .map(([k, v]) => (
              <span key={k} className="badge badge-primary gap-1">
                {v}
                <button onClick={() => updateFilter(k, '')} className="ml-0.5 hover:text-danger-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  )
}
