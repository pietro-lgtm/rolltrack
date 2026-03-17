import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ImagePlus, Shield, Users, Swords } from 'lucide-react'
import { api } from '../api/client'
import type { Group, GroupType } from '../types'

const groupTypes: { value: GroupType; label: string; description: string; icon: typeof Shield }[] = [
  { value: 'academy', label: 'Academy', description: 'Official academy group', icon: Shield },
  { value: 'friend', label: 'Friends', description: 'Casual training group', icon: Users },
  { value: 'comp_team', label: 'Comp Team', description: 'Competition training team', icon: Swords },
]

export default function GroupCreate() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<GroupType>('friend')
  const [academyLink, setAcademyLink] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || submitting) return

    setSubmitting(true)
    try {
      const group = await api.post<Group>('/groups', {
        name: name.trim(),
        description: description.trim(),
        type,
        academyId: type === 'academy' ? academyLink : undefined,
      })
      navigate(`/groups/${group.id}`)
    } catch {
      // handle error
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-full pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate('/groups')}
          className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-white hover:bg-navy-700 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Create Group</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 space-y-6">
        {/* Banner upload */}
        <div className="relative h-36 bg-navy-800 rounded-2xl border-2 border-dashed border-navy-600 flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors overflow-hidden">
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <ImagePlus size={28} />
            <span className="text-xs font-medium">Add Banner Image</span>
          </div>
        </div>

        {/* Avatar upload */}
        <div className="flex items-center gap-4 -mt-12 ml-4 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-navy-700 border-4 border-navy-900 flex items-center justify-center cursor-pointer hover:bg-navy-600 transition-colors">
            <ImagePlus size={24} className="text-gray-500" />
          </div>
          <span className="text-xs text-gray-500 mt-8">Group avatar</span>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name..."
            required
            className="w-full px-4 py-3 bg-navy-800 rounded-xl border border-navy-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this group about?"
            rows={3}
            className="w-full px-4 py-3 bg-navy-800 rounded-xl border border-navy-600 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
        </div>

        {/* Type selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 block">Group Type</label>
          <div className="space-y-2">
            {groupTypes.map(({ value, label, description: desc, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  type === value
                    ? 'bg-accent/10 border-accent/40'
                    : 'bg-navy-800 border-navy-600 hover:border-navy-500'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  type === value ? 'bg-accent/20 text-accent' : 'bg-navy-700 text-gray-400'
                }`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${type === value ? 'text-accent' : 'text-white'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Academy link (only for academy type) */}
        {type === 'academy' && (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Link to Academy</label>
            <input
              type="text"
              value={academyLink}
              onChange={(e) => setAcademyLink(e.target.value)}
              placeholder="Search for your academy..."
              className="w-full px-4 py-3 bg-navy-800 rounded-xl border border-navy-600 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!name.trim() || submitting}
          className="w-full py-4 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl text-base font-bold text-navy-900 transition-colors shadow-lg shadow-accent/20"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            'Create Group'
          )}
        </button>
      </form>
    </div>
  )
}
