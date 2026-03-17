import type { BeltRank } from '../types'

const beltColors: Record<BeltRank, string> = {
  white: 'bg-white text-black',
  blue: 'bg-blue-600 text-white',
  purple: 'bg-purple-600 text-white',
  brown: 'bg-amber-800 text-white',
  black: 'bg-black text-white border border-gray-600',
}

interface BeltBadgeProps {
  rank: BeltRank
  stripes?: number
  size?: 'sm' | 'md'
}

export default function BeltBadge({ rank, stripes = 0, size = 'sm' }: BeltBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold capitalize ${beltColors[rank]} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {rank}
      {stripes > 0 && (
        <span className="flex gap-px ml-0.5">
          {Array.from({ length: Math.min(stripes, 4) }).map((_, i) => (
            <span
              key={i}
              className={`inline-block w-1 h-2.5 rounded-sm ${
                rank === 'white' ? 'bg-gray-400' : 'bg-white/70'
              }`}
            />
          ))}
        </span>
      )}
    </span>
  )
}
