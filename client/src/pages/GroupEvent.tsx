import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Swords,
  BookOpen,
  Trophy,
  PartyPopper,
} from 'lucide-react'
import { api } from '../api/client'
import type { GroupEvent as GroupEventType, GroupEventRsvp, EventType } from '../types'
import Avatar from '../components/Avatar'

const eventTypeConfig: Record<EventType, { icon: typeof Calendar; label: string; color: string; bg: string }> = {
  open_mat: { icon: Swords, label: 'Open Mat', color: 'text-green-400', bg: 'bg-green-500/20' },
  seminar: { icon: BookOpen, label: 'Seminar', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  competition: { icon: Trophy, label: 'Competition', color: 'text-red-400', bg: 'bg-red-500/20' },
  social: { icon: PartyPopper, label: 'Social', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  training: { icon: Swords, label: 'Training', color: 'text-blue-400', bg: 'bg-blue-500/20' },
}

function formatEventDateTime(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function GroupEvent() {
  const { id: groupId, eid: eventId } = useParams<{ id: string; eid: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<GroupEventType | null>(null)
  const [loading, setLoading] = useState(true)
  const [myRsvp, setMyRsvp] = useState<'going' | 'maybe' | 'not_going' | null>(null)
  const [rsvpLoading, setRsvpLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<GroupEventType>(`/events/${eventId}`)
        setEvent(data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId, eventId])

  async function handleRsvp(status: 'going' | 'maybe' | 'not_going') {
    if (rsvpLoading) return
    setRsvpLoading(true)
    try {
      await api.post(`/events/${eventId}/rsvp`, { status })
      setMyRsvp(status)
      // Update local RSVP count optimistically
      if (event) {
        setEvent({ ...event })
      }
    } catch {
      // handle error
    } finally {
      setRsvpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">Event not found</p>
        <button onClick={() => navigate(`/groups/${groupId}`)} className="text-accent text-sm">
          Back to Group
        </button>
      </div>
    )
  }

  const typeConfig = eventTypeConfig[event.type] || eventTypeConfig.training
  const TypeIcon = typeConfig.icon
  const { date, time } = formatEventDateTime(event.startTime)

  const goingRsvps = event.rsvps?.filter((r) => r.status === 'going') || []
  const maybeRsvps = event.rsvps?.filter((r) => r.status === 'maybe') || []
  const notGoingRsvps = event.rsvps?.filter((r) => r.status === 'not_going') || []

  const rsvpButtons: { status: 'going' | 'maybe' | 'not_going'; label: string; icon: typeof CheckCircle2; activeColor: string }[] = [
    { status: 'going', label: 'Going', icon: CheckCircle2, activeColor: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { status: 'maybe', label: 'Maybe', icon: HelpCircle, activeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { status: 'not_going', label: "Can't Make It", icon: XCircle, activeColor: 'bg-red-500/20 text-red-400 border-red-500/30' },
  ]

  function renderRsvpSection(label: string, rsvps: GroupEventRsvp[], color: string) {
    if (rsvps.length === 0) return null
    return (
      <div>
        <h3 className={`text-sm font-semibold ${color} mb-2`}>
          {label} ({rsvps.length})
        </h3>
        <div className="space-y-2">
          {rsvps.map((rsvp) => (
            <div key={rsvp.id} className="flex items-center gap-3 bg-navy-800 rounded-xl p-2.5 border border-navy-700">
              {rsvp.user && (
                <Avatar name={rsvp.user.name} beltRank={rsvp.user.beltRank} size="sm" />
              )}
              <span className="text-sm text-white">
                {rsvp.user?.name || 'Unknown'}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(`/groups/${groupId}`)}
          className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-white hover:bg-navy-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white truncate">Event Details</h1>
      </div>

      <div className="px-4 space-y-6">
        {/* Event type + title */}
        <div className="bg-navy-800 rounded-2xl p-5 border border-navy-700">
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bg} ${typeConfig.color}`}>
              <TypeIcon size={14} />
              {typeConfig.label}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-white">{event.title}</h2>

          {event.description && (
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">{event.description}</p>
          )}

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Calendar size={16} className="text-gray-500 flex-shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <Clock size={16} className="text-gray-500 flex-shrink-0" />
              <span>
                {time}
                {event.endTime && ` - ${formatEventDateTime(event.endTime).time}`}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <MapPin size={16} className="text-gray-500 flex-shrink-0" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* RSVP buttons */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Your Response</h3>
          <div className="flex gap-2">
            {rsvpButtons.map(({ status, label, icon: Icon, activeColor }) => (
              <button
                key={status}
                onClick={() => handleRsvp(status)}
                disabled={rsvpLoading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-all ${
                  myRsvp === status
                    ? activeColor
                    : 'bg-navy-800 text-gray-400 border-navy-600 hover:border-navy-500'
                }`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Attendees */}
        <div className="space-y-5">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Users size={16} />
            Attendees
          </h3>

          {renderRsvpSection('Going', goingRsvps, 'text-green-400')}
          {renderRsvpSection('Maybe', maybeRsvps, 'text-yellow-400')}
          {renderRsvpSection("Can't Make It", notGoingRsvps, 'text-red-400')}

          {goingRsvps.length === 0 && maybeRsvps.length === 0 && notGoingRsvps.length === 0 && (
            <div className="text-center py-8">
              <Users size={28} className="mx-auto text-gray-600 mb-2" />
              <p className="text-sm text-gray-500">No responses yet. Be the first!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
