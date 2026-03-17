import { Users, Calendar as CalIcon, Shield, Building2, User } from 'lucide-react'
import type { Group } from '../../types'

interface GroupDetailsProps {
  group: Group
}

const groupTypeLabels: Record<string, string> = {
  academy: 'Academy',
  friend: 'Friend Group',
  comp_team: 'Competition Team',
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GroupDetails({ group }: GroupDetailsProps) {
  const groupType = group.type || group.groupType || 'friend'

  return (
    <div className="space-y-4">
      {/* Description */}
      {group.description && (
        <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
          <h3 className="text-sm font-semibold text-gray-300 mb-2">About</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{group.description}</p>
        </div>
      )}

      {/* Group Info Grid */}
      <div className="bg-navy-800 rounded-xl p-4 border border-navy-700 space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Group Info</h3>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
            <Shield size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-sm text-white font-medium">{groupTypeLabels[groupType] || groupType}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
            <Users size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-sm text-white font-medium">{group.memberCount} member{group.memberCount !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {group.createdAt && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
              <CalIcon size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Created</p>
              <p className="text-sm text-white font-medium">{formatDate(group.createdAt)}</p>
            </div>
          </div>
        )}

        {group.createdByName && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
              <User size={16} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Created By</p>
              <p className="text-sm text-white font-medium">{group.createdByName}</p>
            </div>
          </div>
        )}

        {group.myRole && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center">
              <Shield size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Your Role</p>
              <p className="text-sm text-white font-medium capitalize">{group.myRole}</p>
            </div>
          </div>
        )}
      </div>

      {/* Academy info */}
      {(group.isAcademy || group.academyId) && (
        <div className="bg-navy-800 rounded-xl p-4 border border-navy-700">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-accent" />
            <h3 className="text-sm font-semibold text-gray-300">Academy</h3>
          </div>
          <p className="text-sm text-gray-400">
            This group is linked to an academy. View the Schedule tab for class times.
          </p>
        </div>
      )}
    </div>
  )
}
