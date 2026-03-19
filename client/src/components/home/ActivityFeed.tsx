import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { api } from '../../api/client'
import type { TrainingSession } from '../../types'
import SessionCard from '../SessionCard'

interface FeedResponse {
  data: any[]
  total: number
  limit: number
  offset: number
}

function mapServerSession(s: any): TrainingSession {
  // Fields are auto-converted from snake_case to camelCase + aliases by api client
  return {
    id: s.id,
    userId: s.userId,
    user: s.userName ? {
      id: s.userId,
      name: s.userName,
      email: '',
      avatar: s.userAvatarUrl || undefined,
      beltRank: s.userBeltRank || 'white',
      stripes: s.userStripes || 0,
    } : undefined,
    type: s.type || 'class',
    gi: s.gi,
    duration: s.duration || 0,
    classTime: s.classTime,
    sparringTime: s.sparringTime,
    notes: s.notes,
    photo: s.photo,
    feeling: s.feeling,
    academyName: s.academyName,
    createdAt: s.startedAt || s.createdAt,
    likes: s.likes ?? 0,
    liked: (s.likedByMe ?? 0) > 0,
    comments: s.comments ?? 0,
  }
}

export default function ActivityFeed() {
  const [items, setItems] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  const fetchFeed = (newOffset: number) => {
    setLoading(true)
    api
      .get<FeedResponse>(`/feed?offset=${newOffset}&limit=${limit}`)
      .then((res) => {
        const rawData = Array.isArray(res) ? res : res?.data || []
        const sessions = rawData.map(mapServerSession)
        if (newOffset === 0) {
          setItems(sessions)
        } else {
          setItems((prev) => [...prev, ...sessions])
        }
        setHasMore(sessions.length === limit)
      })
      .catch(() => {
        setItems([])
        setHasMore(false)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchFeed(0)
  }, [])

  const handleLoadMore = () => {
    const nextOffset = offset + limit
    setOffset(nextOffset)
    fetchFeed(nextOffset)
  }

  if (loading && items.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-800 rounded-2xl p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-700 rounded w-32" />
                <div className="h-2 bg-gray-700 rounded w-24" />
              </div>
            </div>
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <Users size={28} className="text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-300 mb-1">
          No Activity Yet
        </h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Follow your training partners to see their sessions in your feed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}

      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}
