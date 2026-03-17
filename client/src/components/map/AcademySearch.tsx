import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { api } from '../../api/client'
import type { Academy } from '../../types'

interface AcademySearchProps {
  onSelect: (academy: Academy) => void
}

export default function AcademySearch({ onSelect }: AcademySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Academy[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }
    setLoading(true)
    try {
      const res = await api.get<{ data: Academy[] }>(`/academies?q=${encodeURIComponent(q)}`)
      setResults(res.data)
      setIsOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(query), 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(academy: Academy) {
    onSelect(academy)
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search academies..."
          className="w-full pl-10 pr-10 py-3 bg-navy-800/90 backdrop-blur-md rounded-xl border border-navy-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-navy-800/95 backdrop-blur-md rounded-xl border border-navy-600 shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto">
          {results.map((academy) => (
            <button
              key={academy.id}
              onClick={() => handleSelect(academy)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-navy-700 transition-colors text-left border-b border-navy-700 last:border-b-0"
            >
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                <Search size={14} className="text-accent" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{academy.name}</p>
                <p className="text-xs text-gray-400 truncate">{academy.address}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && loading && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-navy-800/95 backdrop-blur-md rounded-xl border border-navy-600 shadow-2xl p-4 text-center">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      )}

      {isOpen && !loading && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-navy-800/95 backdrop-blur-md rounded-xl border border-navy-600 shadow-2xl p-4 text-center text-sm text-gray-400">
          No academies found
        </div>
      )}
    </div>
  )
}
