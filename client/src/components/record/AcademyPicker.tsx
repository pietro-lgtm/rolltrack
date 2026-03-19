import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, X, Star } from 'lucide-react'
import { api } from '../../api/client'
import type { Academy } from '../../types'

interface AcademyPickerProps {
  value: Academy | null
  onChange: (academy: Academy | null) => void
}

const FAVORITES_KEY = 'rolltrack_favorite_academies'

function getFavorites(): Academy[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorite(academy: Academy) {
  const favs = getFavorites().filter((a) => a.id !== academy.id)
  favs.unshift(academy)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs.slice(0, 5)))
}

export default function AcademyPicker({ value, onChange }: AcademyPickerProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Academy[]>([])
  const [favorites, setFavorites] = useState<Academy[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    const timeout = setTimeout(() => {
      api
        .get<{ data: Academy[] }>(`/academies?q=${encodeURIComponent(query)}`)
        .then((res) => setResults(res.data))
        .catch(() => {
          setResults([])
        })
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (academy: Academy) => {
    onChange(academy)
    saveFavorite(academy)
    setFavorites(getFavorites())
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange(null)
    setQuery('')
  }

  // Show selected academy as chip
  if (value) {
    return (
      <div className="flex items-center gap-2 bg-navy-800 rounded-xl px-3 py-2.5">
        <MapPin size={16} className="text-blue-400 shrink-0" />
        <span className="text-sm text-white flex-1 truncate">{value.name}</span>
        <button
          onClick={handleClear}
          className="w-6 h-6 rounded-full bg-navy-700 flex items-center justify-center hover:bg-navy-600 transition-colors"
        >
          <X size={12} className="text-gray-400" />
        </button>
      </div>
    )
  }

  const showDropdown = isOpen && (query.length >= 2 || favorites.length > 0)

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 bg-navy-800 rounded-xl px-3 py-2.5">
        <Search size={16} className="text-gray-500 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search academy..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        {loading && (
          <div className="w-4 h-4 border-2 border-gray-600 border-t-blue-400 rounded-full animate-spin" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-navy-800 rounded-xl border border-navy-600 shadow-xl shadow-black/40 overflow-hidden max-h-60 overflow-y-auto">
          {/* Favorites section */}
          {favorites.length > 0 && query.length < 2 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                Recent
              </div>
              {favorites.map((academy) => (
                <button
                  key={`fav-${academy.id}`}
                  onClick={() => handleSelect(academy)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-navy-700 transition-colors text-left"
                >
                  <Star size={14} className="text-yellow-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-white truncate">
                      {academy.name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">
                      {academy.address}
                    </div>
                  </div>
                </button>
              ))}
              {query.length >= 2 && results.length > 0 && (
                <div className="border-t border-navy-600" />
              )}
            </>
          )}

          {/* Search results */}
          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="px-3 py-4 text-sm text-gray-500 text-center">
              No academies found
            </div>
          )}
          {results.map((academy) => (
            <button
              key={academy.id}
              onClick={() => handleSelect(academy)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-navy-700 transition-colors text-left"
            >
              <MapPin size={14} className="text-gray-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-white truncate">
                  {academy.name}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {academy.address}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
