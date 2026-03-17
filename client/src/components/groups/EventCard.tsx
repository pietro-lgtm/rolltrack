import { useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Swords, BookOpen, Trophy, PartyPopper } from 'lucide-react'
import type { GroupEvent, EventType } from '../../types'

interface EventCardProps {
  event: GroupEvent
  groupId: string
}

const eventTypeConfig: Record<EventType, { icon: typeof Calendar; label: string; color: string }> = {
  open_mat: { icon: Swords, label: 'Open Mat', color: 'bg-green-500/20 text-green-400' },
  seminar: { icon: BookOpen, label: 'Seminar', color: 'bg-purple-500/20 text-purple-400' },
  competition: { icon: Trophy, label: 'Competition', color: 'bg-red-500/20 text-red-400' },
  social: { icon: PartyPopper, label: 'Social', color: 'bg-yellow-500/20 text-yellow-400' },
  training: { icon: Swords, label: 'Training', color: 'bg-blue-500/20 text-blue-400' },
}

function formatEventDate(dateStr: string): { date: string; time: string } {
  const d = new Date(dateStr)
  return {
    date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export default function EventCard({ event, groupId }: EventCardProps) {
  const navigate = useNavigate()
  const typeConfig = eventTypeConfig[event.type] || eventTypeConfig.training
  const Icon = typeConfig.icon
  const { date, time } = formatEventDate(event.startTime)

  const goingCount = event.goingCount ?? event.rsvps?.filter((r) => r.status === 'going').length ?? 0
  const maybeCount = event.maybeCount ?? event.rsvps?.filter((r) => r.status === 'maybe').length ?? 0

  return (
    <button
      onClick={() => navigate(`/groups/${groupId}/event/${event.id}`)}
      className="w-full bg-navy-800 rounded-2xl p-4 border border-navy-700 hover:border-navy-500 transition-colors text-left"
    >
      <div className="flex items-start gap-3">
        {/* Date column */}
        <div className="flex flex-col items-center bg-navy-700 rounded-xl px-3 py-2 min-w-[56px]">
          <span className="text-[10px] uppercase font-bold text-gray-400">
            {date.split(',')[0]}
          </span>
          <span className="text-lg font-bold text-white">
            {new Date(event.startTime).getDate()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${typeConfig.color}`}>
              <Icon size={10} />
              {typeConfig.label}
            </span>
          </div>

          <h3 className="font-semibold text-white text-sm truncate">{event.title}</h3>

          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
            <Calendar size={12} />
            <span>{date} at {time}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
              <MapPin size={12} />
              <span className="truncate">{event.location}</span>
            </div>
          )}

          {/* RSVP counts */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs">
              <Users size={12} className="text-green-400" />
              <span className="text-green-400 font-medium">{goingCount} going</span>
            </div>
            {maybeCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-yellow-400 font-medium">{maybeCount} maybe</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
