import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, UserCheck, UserX, Check, X } from 'lucide-react'
import { api } from '../api/client'
import Avatar from '../components/Avatar'
import BeltBadge from '../components/BeltBadge'
import SearchInput from '../components/ui/SearchInput'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import type { User, Friendship } from '../types'

interface FriendWithUser extends Friendship {
  friend?: User
}

export default function FriendsList() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends')
  const [friends, setFriends] = useState<FriendWithUser[]>([])
  const [requests, setRequests] = useState<FriendWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setLoading(true)
      try {
        const [friendsRes, requestsRes] = await Promise.allSettled([
          api.get<{ data: FriendWithUser[] }>('/friends'),
          api.get<{ data: FriendWithUser[] }>('/friends/requests'),
        ])
        if (cancelled) return
        if (friendsRes.status === 'fulfilled') setFriends(friendsRes.value.data)
        if (requestsRes.status === 'fulfilled') setRequests(requestsRes.value.data)
      } catch {
        // handled by empty states
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  const filteredFriends = useMemo(() => {
    if (!searchQuery) return friends
    const q = searchQuery.toLowerCase()
    return friends.filter(
      (f) =>
        f.friend?.name.toLowerCase().includes(q) ||
        f.friend?.academy?.toLowerCase().includes(q)
    )
  }, [friends, searchQuery])

  const handleAccept = async (friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      await api.post(`/friends/${friendshipId}/accept`)
      const accepted = requests.find((r) => r.id === friendshipId)
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId))
      if (accepted) {
        setFriends((prev) => [{ ...accepted, status: 'accepted' }, ...prev])
      }
    } catch {
      // handle error silently
    } finally {
      setActionLoading(null)
    }
  }

  const handleDecline = async (friendshipId: string) => {
    setActionLoading(friendshipId)
    try {
      await api.del(`/friends/${friendshipId}`)
      setRequests((prev) => prev.filter((r) => r.id !== friendshipId))
    } catch {
      // handle error silently
    } finally {
      setActionLoading(null)
    }
  }

  const tabs = [
    { key: 'friends' as const, label: 'Friends', count: friends.length },
    { key: 'requests' as const, label: 'Requests', count: requests.length },
  ]

  return (
    <div className="min-h-dvh bg-navy-900">
      {/* Header */}
      <div className="bg-navy-800 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Friends</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-navy-700 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? 'bg-navy-600 text-white'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key
                      ? 'bg-accent text-navy-900'
                      : 'bg-navy-600 text-gray-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <LoadingSpinner size="lg" className="py-12" />
        ) : activeTab === 'friends' ? (
          <>
            {/* Search */}
            <SearchInput
              onChange={setSearchQuery}
              placeholder="Search friends..."
              className="mb-4"
            />

            {filteredFriends.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title={searchQuery ? 'No results' : 'No friends yet'}
                message={
                  searchQuery
                    ? 'Try a different search term'
                    : 'Add training partners to see their activity'
                }
              />
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((friendship) => {
                  const friend = friendship.friend
                  if (!friend) return null

                  return (
                    <div
                      key={friendship.id}
                      className="bg-navy-800 rounded-xl p-3 flex items-center gap-3"
                    >
                      <Avatar
                        name={friend.name}
                        beltRank={friend.beltRank}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {friend.name}
                          </span>
                          <BeltBadge rank={friend.beltRank} />
                        </div>
                        {friend.academy && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {friend.academy}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0">
                        <UserCheck size={16} className="text-green-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {requests.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="No pending requests"
                message="When someone sends you a friend request, it will appear here"
              />
            ) : (
              <div className="space-y-2">
                {requests.map((request) => {
                  const friend = request.friend
                  if (!friend) return null
                  const isLoading = actionLoading === request.id

                  return (
                    <div
                      key={request.id}
                      className="bg-navy-800 rounded-xl p-3 flex items-center gap-3"
                    >
                      <Avatar
                        name={friend.name}
                        beltRank={friend.beltRank}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">
                            {friend.name}
                          </span>
                          <BeltBadge rank={friend.beltRank} />
                        </div>
                        {friend.academy && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {friend.academy}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleAccept(request.id)}
                          disabled={isLoading}
                          className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleDecline(request.id)}
                          disabled={isLoading}
                          className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
