import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  Instagram,
  Calendar,
  DollarSign,
  CircleDot,
  Clock,
  ExternalLink,
  Navigation,
} from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Users, Shield, UserPlus, Check, XCircle } from 'lucide-react'
import type { Academy, ClassScheduleEntry } from '../types'

interface AcademyMember {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  beltRank: string
  stripes: number
  role: string
  status: string
}

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const academyIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    width: 14px;
    height: 14px;
    background: #3b82f6;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const classTypeColors: Record<string, string> = {
  'Fundamentals': 'bg-blue-500/20 text-blue-400',
  'Advanced': 'bg-purple-500/20 text-purple-400',
  'No-Gi': 'bg-orange-500/20 text-orange-400',
  'Gi': 'bg-cyan-500/20 text-cyan-400',
  'Open Mat': 'bg-green-500/20 text-green-400',
  'Competition': 'bg-red-500/20 text-red-400',
  'Kids': 'bg-yellow-500/20 text-yellow-400',
}

function getClassColor(type: string): string {
  return classTypeColors[type] || 'bg-gray-500/20 text-gray-400'
}

export default function AcademyDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [academy, setAcademy] = useState<(Academy & { myMembership?: { role: string; status: string }; memberCount?: number; isClaimed?: boolean; claimedByUserId?: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<AcademyMember[]>([])
  const [showMembers, setShowMembers] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Academy>(`/academies/${id}`)
        setAcademy(data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const loadMembers = async () => {
    try {
      const res = await api.get<{ data: AcademyMember[] }>(`/academies/${id}/members`)
      setMembers(res.data || [])
    } catch {}
  }

  const handleClaim = async () => {
    setActionLoading(true)
    try {
      await api.post(`/academies/${id}/claim`)
      const data = await api.get<Academy>(`/academies/${id}`)
      setAcademy(data as any)
    } catch {} finally { setActionLoading(false) }
  }

  const handleJoin = async () => {
    setActionLoading(true)
    try {
      await api.post(`/academies/${id}/join`)
      const data = await api.get<Academy>(`/academies/${id}`)
      setAcademy(data as any)
    } catch {} finally { setActionLoading(false) }
  }

  const handleMemberAction = async (memberId: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/academies/${id}/members/${memberId}`, { status })
      loadMembers()
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!academy) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">Academy not found</p>
        <button onClick={() => navigate('/map')} className="text-accent text-sm">
          Back to Map
        </button>
      </div>
    )
  }

  // Group class schedule by day
  const scheduleByDay: Record<string, ClassScheduleEntry[]> = {}
  if (academy.classSchedule) {
    academy.classSchedule.forEach((entry) => {
      if (!scheduleByDay[entry.day]) scheduleByDay[entry.day] = []
      scheduleByDay[entry.day].push(entry)
    })
  }

  return (
    <div className="min-h-full pb-24">
      {/* Mini Map */}
      <div className="relative h-48 overflow-hidden">
        <MapContainer
          center={[academy.lat, academy.lng]}
          zoom={15}
          className="w-full h-full z-0"
          zoomControl={false}
          attributionControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          <Marker position={[academy.lat, academy.lng]} icon={academyIcon} />
        </MapContainer>
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-navy-900 to-transparent z-[400]" />

        {/* Back button */}
        <button
          onClick={() => navigate('/map')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-navy-800 transition-colors z-[500]"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Route Buttons */}
      <div className="px-4 -mt-2 relative z-10 flex gap-3">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${academy.lat},${academy.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-700 text-white rounded-xl text-sm font-medium hover:bg-navy-600 transition-colors border border-navy-500/30"
        >
          <Navigation size={16} />
          Google Maps
        </a>
        <a
          href={`https://waze.com/ul?ll=${academy.lat},${academy.lng}&navigate=yes`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-700 text-white rounded-xl text-sm font-medium hover:bg-navy-600 transition-colors border border-navy-500/30"
        >
          <ExternalLink size={16} />
          Waze
        </a>
      </div>

      {/* Academy info */}
      <div className="px-4 -mt-8 relative z-10">
        <div className="bg-navy-800 rounded-2xl p-5 border border-navy-600 shadow-xl">
          <h1 className="text-2xl font-bold text-white">{academy.name}</h1>

          {academy.affiliation && (
            <span className="inline-block mt-2 px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
              {academy.affiliation}
            </span>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <MapPin size={16} className="text-gray-500 flex-shrink-0" />
              <span>{academy.address}</span>
            </div>

            {academy.phone && (
              <a href={`tel:${academy.phone}`} className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors">
                <Phone size={16} className="text-gray-500 flex-shrink-0" />
                <span>{academy.phone}</span>
              </a>
            )}

            {academy.website && (
              <a
                href={academy.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors"
              >
                <Globe size={16} className="text-gray-500 flex-shrink-0" />
                <span className="truncate">{academy.website}</span>
                <ExternalLink size={12} className="text-gray-500 flex-shrink-0" />
              </a>
            )}

            {academy.instagram && (
              <a
                href={`https://instagram.com/${academy.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-accent transition-colors"
              >
                <Instagram size={16} className="text-gray-500 flex-shrink-0" />
                <span>{academy.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Class Schedule */}
      {academy.classSchedule && academy.classSchedule.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-accent" />
            Class Schedule
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-navy-600 overflow-hidden">
            {days.map((day) => {
              const entries = scheduleByDay[day]
              if (!entries || entries.length === 0) return null
              return (
                <div key={day} className="flex items-start border-b border-navy-700 last:border-b-0">
                  <div className="w-14 py-3 px-3 text-xs font-bold text-gray-400 uppercase flex-shrink-0">
                    {day}
                  </div>
                  <div className="flex-1 py-2 px-2 space-y-1.5">
                    {entries.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Clock size={12} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-300">{entry.time}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getClassColor(entry.type)}`}>
                          {entry.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Open Mat Schedule */}
      {academy.schedule?.openMats && academy.schedule.openMats.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Calendar size={18} className="text-green-400" />
            Open Mat
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-green-500/20 p-4 space-y-2">
            {academy.schedule.openMats.map((slot, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-gray-300">{slot}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drop-in pricing */}
      {academy.dropInPrice != null && (
        <div className="px-4 mt-6">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <DollarSign size={18} className="text-blue-400" />
            Drop-In
          </h2>
          <div className="bg-navy-800 rounded-2xl border border-navy-600 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Single drop-in</p>
              <p className="text-2xl font-bold text-white">${academy.dropInPrice}</p>
            </div>
            <div className="px-3 py-1 bg-blue-500/10 rounded-lg">
              <span className="text-xs text-blue-400 font-medium">Walk-ins welcome</span>
            </div>
          </div>
        </div>
      )}

      {/* Membership Actions */}
      <div className="px-4 mt-6 space-y-3">
        {!academy.myMembership && !academy.isClaimed && (
          <button
            onClick={handleClaim}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/30 transition-colors ring-1 ring-purple-500/30 disabled:opacity-50"
          >
            <Shield size={16} />
            Claim This Academy
          </button>
        )}

        {!academy.myMembership && academy.isClaimed && (
          <button
            onClick={handleJoin}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-colors ring-1 ring-blue-500/30 disabled:opacity-50"
          >
            <UserPlus size={16} />
            Request to Join
          </button>
        )}

        {academy.myMembership?.status === 'pending' && (
          <div className="py-3 text-center text-sm text-yellow-400 bg-yellow-500/10 rounded-xl ring-1 ring-yellow-500/20">
            Membership pending approval
          </div>
        )}

        {academy.myMembership?.status === 'approved' && (
          <div className="flex items-center justify-center gap-2 py-3 text-sm text-green-400 bg-green-500/10 rounded-xl ring-1 ring-green-500/20">
            <Check size={16} />
            {academy.myMembership.role === 'moderator' ? 'Moderator' : 'Member'}
          </div>
        )}

        {/* Members button */}
        <button
          onClick={() => { setShowMembers(!showMembers); if (!showMembers) loadMembers(); }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-navy-800 text-gray-300 rounded-xl text-sm font-medium hover:bg-navy-700 transition-colors"
        >
          <Users size={16} />
          Members {academy.memberCount ? `(${academy.memberCount})` : ''}
        </button>

        {/* Members list */}
        {showMembers && (
          <div className="bg-navy-800 rounded-xl border border-navy-600 overflow-hidden">
            {members.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-500">No members yet</div>
            ) : (
              members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 border-b border-navy-700 last:border-b-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
                    {m.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{m.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{m.beltRank} belt {m.role === 'moderator' ? '· Moderator' : ''}</div>
                  </div>
                  {m.status === 'pending' && academy.myMembership?.role === 'moderator' && (
                    <div className="flex gap-1.5">
                      <button onClick={() => handleMemberAction(m.id, 'approved')} className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 hover:bg-green-500/30">
                        <Check size={14} />
                      </button>
                      <button onClick={() => handleMemberAction(m.id, 'rejected')} className="w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30">
                        <XCircle size={14} />
                      </button>
                    </div>
                  )}
                  {m.status === 'pending' && academy.myMembership?.role !== 'moderator' && (
                    <span className="text-xs text-yellow-400">Pending</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Check In CTA */}
      <div className="px-4 mt-6">
        <button
          onClick={() => navigate('/record', { state: { academyId: academy.id, academyName: academy.name } })}
          className="w-full flex items-center justify-center gap-2 py-4 bg-accent hover:bg-accent/90 rounded-2xl text-base font-bold text-navy-900 transition-colors shadow-lg shadow-accent/20"
        >
          <CircleDot size={20} />
          Check In
        </button>
      </div>
    </div>
  )
}
