import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Shield, Users, Swords, Search } from 'lucide-react'
import { api } from '../api/client'
import type { Group, GroupType } from '../types'
import GroupCard from '../components/groups/GroupCard'

const discoverFilters: { key: GroupType | 'all'; label: string; icon: typeof Shield }[] = [
  { key: 'all', label: 'All', icon: Users },
  { key: 'academy', label: 'Academy', icon: Shield },
  { key: 'friend', label: 'Friends', icon: Users },
  { key: 'comp_team', label: 'Comp Team', icon: Swords },
]

export default function Groups() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<'my' | 'discover'>('my')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [discoverFilter, setDiscoverFilter] = useState<GroupType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const res = await api.get<{ data: Group[], total: number }>(`/groups?tab=${tab}`)
        setGroups(res.data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tab])

  const filteredGroups = groups.filter((g) => {
    if (tab === 'discover' && discoverFilter !== 'all') {
      const gType = g.type || (g.isAcademy ? 'academy' : 'friend')
      if (gType !== discoverFilter) return false
    }
    if (searchQuery) {
      return g.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Groups</h1>
        <button
          onClick={() => navigate('/groups/create')}
          className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-navy-900 shadow-lg shadow-accent/20 hover:bg-accent/90 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-navy-800 rounded-xl p-1 mb-6">
        {(['my', 'discover'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t
                ? 'bg-navy-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t === 'my' ? 'My Groups' : 'Discover'}
          </button>
        ))}
      </div>

      {/* Discover filters */}
      {tab === 'discover' && (
        <div className="space-y-4 mb-5">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-9 pr-4 py-2.5 bg-navy-800 rounded-xl border border-navy-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Type filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {discoverFilters.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setDiscoverFilter(key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  discoverFilter === key
                    ? 'bg-accent/20 text-accent border-accent/30'
                    : 'bg-navy-800 text-gray-400 border-navy-600 hover:border-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groups list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400 text-sm">
            {tab === 'my' ? 'You have not joined any groups yet' : 'No groups found'}
          </p>
          {tab === 'my' && (
            <button
              onClick={() => setTab('discover')}
              className="mt-4 px-6 py-2 bg-accent/20 text-accent rounded-xl text-sm font-medium hover:bg-accent/30 transition-colors"
            >
              Discover Groups
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}
