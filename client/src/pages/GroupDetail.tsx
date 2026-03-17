import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, Info, Calendar } from 'lucide-react'
import { api } from '../api/client'
import type { Group } from '../types'
import GroupBanner from '../components/groups/GroupBanner'
import GroupFeed from '../components/groups/GroupFeed'
import GroupEvents from '../components/groups/GroupEvents'
import GroupMembers from '../components/groups/GroupMembers'
import InviteModal from '../components/groups/InviteModal'

type Tab = 'feed' | 'events' | 'members'

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<Group>(`/groups/${id}`)
        setGroup(data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-gray-400">Group not found</p>
        <button onClick={() => navigate('/groups')} className="text-accent text-sm">
          Back to Groups
        </button>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'feed', label: 'Feed' },
    { key: 'events', label: 'Events' },
    { key: 'members', label: 'Members' },
  ]

  return (
    <div className="min-h-full pb-24">
      {/* Banner */}
      <div className="relative">
        <GroupBanner group={group} />

        {/* Back button */}
        <button
          onClick={() => navigate('/groups')}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-navy-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-navy-800 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Group name + actions */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-white">{group.name}</h1>
        {group.description && (
          <p className="text-sm text-gray-400 mt-1">{group.description}</p>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 rounded-xl text-sm font-semibold text-navy-900 transition-colors"
          >
            <UserPlus size={16} />
            Invite
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 rounded-xl text-sm font-medium text-white transition-colors">
            <Info size={16} />
            Details
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-navy-700 hover:bg-navy-600 rounded-xl text-sm font-medium text-white transition-colors">
            <Calendar size={16} />
            Schedule
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-1 bg-navy-800 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-navy-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="px-4">
        {activeTab === 'feed' && <GroupFeed groupId={group.id} />}
        {activeTab === 'events' && <GroupEvents groupId={group.id} />}
        {activeTab === 'members' && <GroupMembers groupId={group.id} />}
      </div>

      {/* Invite modal */}
      <InviteModal
        inviteCode={group.inviteCode || 'ROLLTRK'}
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
      />
    </div>
  )
}
