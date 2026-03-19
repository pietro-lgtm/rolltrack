import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { api } from '../api/client'
import type { Academy } from '../types'
import { Search, MapPin, X, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Fix default marker icon issue with bundlers (webpack/vite)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom colored marker
function createColoredIcon(color: string, isSelected = false) {
  const size = isSelected ? 14 : 10
  const border = isSelected ? 3 : 2
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: ${border}px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
      ${isSelected ? 'transform: scale(1.3);' : ''}
    "></div>`,
    iconSize: [size + border * 2, size + border * 2],
    iconAnchor: [(size + border * 2) / 2, (size + border * 2) / 2],
  })
}

const defaultIcon = createColoredIcon('#3b82f6')
const selectedIcon = createColoredIcon('#f59e0b', true)

// Austin, TX fallback
const FALLBACK_CENTER: [number, number] = [30.2672, -97.7431]

// Component to fly map to a position
function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 })
    }
  }, [position, map])
  return null
}

// Component to handle initial geolocation
function GeolocateOnMount({ academies }: { academies: Academy[] }) {
  const map = useMap()
  const didGeolocate = useRef(false)

  useEffect(() => {
    if (didGeolocate.current) return
    didGeolocate.current = true

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 13)
        },
        () => {
          // Fallback: fit to academies if any, else Austin
          if (academies.length > 0) {
            const bounds = L.latLngBounds(academies.map((a) => [a.lat, a.lng]))
            map.fitBounds(bounds, { padding: [40, 40] })
          }
        },
        { timeout: 5000 }
      )
    }
  }, [map, academies])

  return null
}

export default function MapPage() {
  const navigate = useNavigate()
  const [academies, setAcademies] = useState<Academy[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Academy | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [filters, setFilters] = useState<Record<string, boolean>>({
    open_mat: false,
    drop_in: false,
    gi: false,
    nogi: false,
  })
  const listRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})

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

  const filtered = useMemo(() => {
    return academies.filter((a) => {
      const active = Object.entries(filters).filter(([, v]) => v).map(([k]) => k)
      if (active.length === 0) return true
      for (const f of active) {
        if (f === 'open_mat' && (a as any).has_open_mat) return true
        if (f === 'drop_in' && (a as any).allows_drop_ins) return true
        if (f === 'gi' || f === 'nogi') continue
      }
      if (active.every((f) => f === 'gi' || f === 'nogi')) return true
      return false
    })
  }, [academies, filters])

  // When a marker is tapped, highlight that academy card and scroll to it
  function handleMarkerClick(academy: Academy) {
    setSelected(academy)
    const el = cardRefs.current[academy.id]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // When an academy card is tapped, center map on it
  function handleCardClick(academy: Academy) {
    if (selected?.id === academy.id) {
      setSelected(null)
      setFlyTarget(null)
    } else {
      setSelected(academy)
      setFlyTarget([academy.lat, academy.lng])
    }
  }

  return (
    <div className="flex flex-col h-full -mb-20">
      {/* Map section (~55% of screen) */}
      <div className="relative" style={{ height: '55vh', minHeight: '280px' }}>
        <MapContainer
          center={FALLBACK_CENTER}
          zoom={12}
          className="w-full h-full z-0"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <GeolocateOnMount academies={filtered} />
          <FlyToPosition position={flyTarget} />

          {filtered.map((academy) => (
            <Marker
              key={academy.id}
              position={[academy.lat, academy.lng]}
              icon={selected?.id === academy.id ? selectedIcon : defaultIcon}
              eventHandlers={{
                click: () => handleMarkerClick(academy),
              }}
            >
              <Popup>
                <div className="text-sm font-semibold">{academy.name}</div>
                {academy.affiliation && (
                  <div className="text-xs text-gray-400">{academy.affiliation}</div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Add Academy FAB */}
        <button
          onClick={() => navigate('/map/academy/create')}
          className="absolute bottom-4 right-4 z-[1000] w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 hover:bg-blue-400 transition-colors"
        >
          <Plus size={24} />
        </button>

        {/* Search bar floating over the map */}
        <div className="absolute top-3 left-3 right-3 z-[1000]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search academies..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900/90 backdrop-blur-sm rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700/50 shadow-lg"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 mt-2 overflow-x-auto hide-scrollbar">
            {Object.entries(filterLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilters((f) => ({ ...f, [key]: !f[key] }))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shadow-md ${
                  filters[key]
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900/80 backdrop-blur-sm text-gray-300 hover:bg-gray-700 border border-gray-700/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Academy list below the map */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 space-y-3 py-4">
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
            ref={(el) => { cardRefs.current[academy.id] = el }}
            onClick={() => handleCardClick(academy)}
            className={`w-full text-left rounded-xl p-4 transition-colors ${
              selected?.id === academy.id
                ? 'bg-blue-900/40 ring-1 ring-blue-500/50'
                : 'bg-gray-800 hover:bg-gray-750'
            }`}
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
