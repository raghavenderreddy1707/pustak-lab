import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, BookOpen } from 'lucide-react'
import NoteCard, { NoteCardSkeleton } from '@/components/NoteCard'
import FilterBar from '@/components/FilterBar'
import { notesAPI, searchAPI } from '@/api'
import { cn } from '@/utils'

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [allNotes, setAllNotes] = useState([])

  const query = searchParams.get('q') || ''
  const university = searchParams.get('university') || ''
  const course = searchParams.get('course') || ''
  const subject = searchParams.get('subject') || ''
  const semester = searchParams.get('semester') || ''
  const materialType = searchParams.get('materialType') || ''
  const sort = searchParams.get('sort') || 'newest'

  const filters = { q: query, university, course, subject, semester, materialType, sort, page, limit: 12 }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['notes', filters],
    queryFn: () => notesAPI.getAll(filters),
    select: (d) => d.data.data,
    keepPreviousData: true,
  })

  // Reset page on filter change
  useEffect(() => {
    setPage(1)
    setAllNotes([])
  }, [query, university, course, subject, semester, materialType, sort])

  // Accumulate notes for infinite scroll
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setAllNotes(data.data)
      } else {
        setAllNotes(prev => [...prev, ...data.data])
      }
    }
  }, [data, page])

  const hasMore = data ? page < data.totalPages : false
  const total = data?.total || 0

  const handleFilterChange = useCallback(() => {
    setPage(1)
    setAllNotes([])
  }, [])

  return (
    <div className="container-app py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="page-title">Browse Notes</h1>
        {query ? (
          <p className="page-subtitle">
            Showing results for "<strong>{query}</strong>"
            {total > 0 && <span className="text-slate-400"> — {total} notes found</span>}
          </p>
        ) : (
          <p className="page-subtitle">
            {total > 0 ? `${total} notes available` : 'Discover study materials from students across India'}
          </p>
        )}
      </div>

      {/* Filters */}
      <FilterBar onChange={handleFilterChange} />

      {/* Note Grid */}
      {isLoading && page === 1 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <NoteCardSkeleton key={i} />)}
        </div>
      ) : allNotes.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-white mb-2">
            No notes found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            {query
              ? `We couldn't find notes matching "${query}". Try different keywords or clear filters.`
              : 'No notes match these filters. Try adjusting your selection.'}
          </p>
          <button
            onClick={() => {
              setSearchParams({})
              setPage(1)
              setAllNotes([])
            }}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allNotes.map((note) => (
              <NoteCard key={note._id} note={note} />
            ))}
            {/* Loading more skeletons */}
            {isFetching && page > 1 && Array.from({ length: 4 }).map((_, i) => (
              <NoteCardSkeleton key={`sk-${i}`} />
            ))}
          </div>

          {/* Load more */}
          {hasMore && !isFetching && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage(p => p + 1)}
                className="btn-secondary px-8"
              >
                Load More Notes
              </button>
            </div>
          )}

          {!hasMore && allNotes.length > 0 && (
            <p className="text-center text-sm text-slate-400 mt-8">
              You've seen all {total} notes 🎉
            </p>
          )}
        </>
      )}
    </div>
  )
}
