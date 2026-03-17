import { useEffect, useState } from 'react'
import { Crown, ShieldCheck, Users as UsersIcon } from 'lucide-react'
import { api } from '../../api/client'
import type { GroupMember } from '../../types'
import Avatar from '../Avatar'
import BeltBadge from '../BeltBadge'

interface GroupMembersProps {
  groupId: string
  members?: GroupMember[]
}

const roleConfig = {
  owner: { icon: Crown, label: 'Owner', color: 'text-yellow-400' },
  admin: { icon: ShieldCheck, label: 'Admin', color: 'text-accent' },
  member: { icon: null, label: 'Member', color: 'text-gray-500' },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export default function GroupMembers({ groupId, members: membersProp }: GroupMembersProps) {
  const [members, setMembers] = useState<GroupMember[]>(membersProp || [])
  const [loading, setLoading] = useState(!membersProp)

  useEffect(() => {
    if (membersProp) {
      setMembers(membersProp)
      setLoading(false)
      return
    }
    async function load() {
      try {
        // Members are part of the group detail response
        const group = await api.get<{ members: GroupMember[] }>(`/groups/${groupId}`)
        setMembers(group.members || [])
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId, membersProp])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <UsersIcon size={32} className="mx-auto text-gray-600 mb-3" />
        <p className="text-gray-400 text-sm">No members yet</p>
      </div>
    )
  }

  // Sort: owners first, then admins, then members
  const sorted = [...members].sort((a, b) => {
    const order = { owner: 0, admin: 1, member: 2 }
    return order[a.role] - order[b.role]
  })

  return (
    <div className="space-y-2">
      {sorted.map((member) => {
        const role = roleConfig[member.role]
        const RoleIcon = role.icon

        return (
          <div
            key={member.id}
            className="flex items-center gap-3 bg-navy-800 rounded-xl p-3 border border-navy-700"
          >
            {member.user && (
              <Avatar name={member.user.name} beltRank={member.user.beltRank} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-white truncate">
                  {member.user?.name || 'Unknown'}
                </span>
                {member.user && <BeltBadge rank={member.user.beltRank} />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`flex items-center gap-1 text-xs ${role.color}`}>
                  {RoleIcon && <RoleIcon size={12} />}
                  <span>{role.label}</span>
                </div>
                <span className="text-[10px] text-gray-600">Joined {formatDate(member.joinedAt)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
