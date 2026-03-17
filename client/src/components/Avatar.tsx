import { useState } from 'react'
import type { BeltRank } from '../types'

const ringColors: Record<BeltRank, string> = {
  white: 'ring-white',
  blue: 'ring-blue-500',
  purple: 'ring-purple-500',
  brown: 'ring-amber-700',
  black: 'ring-gray-400',
}

interface AvatarProps {
  name: string
  src?: string
  beltRank?: BeltRank
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses: Record<string, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export default function Avatar({ name, src, beltRank, size = 'md', className = '' }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const showImage = src && !imgError

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold ring-2 overflow-hidden ${
        beltRank ? ringColors[beltRank] : 'ring-gray-700'
      } ${showImage ? '' : 'bg-gray-700'} ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-300">{initials}</span>
      )}
    </div>
  )
}
