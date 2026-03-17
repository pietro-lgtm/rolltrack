import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { Academy } from '../types'
import { Search, MapPin, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function MapPage() {
  const navigate = useNavigate()
  const [academies, setAcademies] = useState<Academy[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Academy | null>(null)
  const [filters, setFilters] = useState<Record<string, boolean>>({
    open_mat: false,
    drop_in: false,
    gi: false,
    nogi: false,
  })

  const fetchAcademies = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      const res = await api.get<{ data: Academy[] }>(`/academies?${params}`)
      setAcademies(res.data || [])
    } catch {
      // keep current
    }
  }, [query])

  useEffect(() => {
    fetchAcademies()
  }, [fetchAcademies])

  const filterLabels: Record<string, string> = {
    open_mat: '🥋 Open Mat',
    drop_in: '💰 Drop-Ins',
    gi: 'Gi',
    nogi: 'No-Gi',
  }

  const filtered = academies.filter((a) => {
    const active = Object.entries(filters).filter(([, v]) => v).map(([k]) => k)
    if (active.length === 0) return true
    for (const f of active) {
      if (f === 'open_mat' && (a as any).has_open_mat) return true
      if (f === 'drop_in' && (a as any).allows_drop_ins) return true
      // gi/nogi are not academy-level filters, just show all
      if (f === 'gi' || f === 'nogi') continue
    }
    // If only gi/nogi filters active, show all
    if (active.every(f => f === 'gi' || f === 'nogi')) return true
    return false
  })

  return (
    <div className="flex flex-col h-full -mb-20">
      {/* Search bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search academies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
        {Object.entries(filterLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filters[key]
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Academy list */}
      <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {filtered.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <MapPin size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No academies found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {filtered.map((academy) => (
          <button
            key={academy.id}
            onClick={() => setSelected(selected?.id === academy.id ? null : academy)}
            className="w-full text-left bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white">{academy.name}</h3>
                <p className="text-sm text-gray-400 mt-0.5">{academy.address}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {academy.affiliation && (
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded-full text-gray-300">
                      {academy.affiliation}
                    </span>
                  )}
                  {academy.openMatDays && academy.openMatDays.length > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-400 rounded-full">
                      Open Mat
                    </span>
                  )}
                  {academy.dropInPrice != null && academy.dropInPrice > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-900/50 text-yellow-400 rounded-full">
                      Drop-in ${academy.dropInPrice}
                    </span>
                  )}
                </div>
              </div>
              <MapPin size={20} className="text-blue-400 ml-3 mt-1 flex-shrink-0" />
            </div>

            {/* Expanded details */}
            {selected?.id === academy.id && (
              <div className="mt-3 pt-3 border-t border-gray-700 space-y-2">
                {academy.openMatDays && academy.openMatDays.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Open Mat Days</p>
                    <p className="text-sm text-gray-300 mt-0.5">{academy.openMatDays.join(', ')}</p>
                  </div>
                )}
                {academy.phone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p className="text-sm text-gray-300 mt-0.5">{academy.phone}</p>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/map/academy/${academy.id}`)
                  }}
                  className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
