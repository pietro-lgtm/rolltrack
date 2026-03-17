import { useEffect, useState } from 'react'
import { Calendar } from 'lucide-react'
import { api } from '../../api/client'
import type { GroupEvent } from '../../types'
import EventCard from './EventCard'

interface GroupEventsProps {
  groupId: string
}

export default function GroupEvents({ groupId }: GroupEventsProps) {
  const [events, setEvents] = useState<GroupEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: GroupEvent[] }>(`/events?group_id=${groupId}`)
        setEvents(res.data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar size={32} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">No upcoming events</p>
      </div>
    )
  }

  // Sort by start time ascending (upcoming first)
  const sorted = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  return (
    <div className="space-y-3">
      {sorted.map((event) => (
        <EventCard key={event.id} event={event} groupId={groupId} />
      ))}
    </div>
  )
}
