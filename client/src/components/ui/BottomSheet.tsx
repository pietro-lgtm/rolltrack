import { useEffect, useRef, useState, type ReactNode } from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  snapPoints?: number[]
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.5, 0.9],
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef({ startY: 0, currentY: 0, isDragging: false })
  const [translateY, setTranslateY] = useState(0)
  const [snapIndex, setSnapIndex] = useState(0)

  useEffect(() => {
    if (isOpen) {
      setSnapIndex(0)
      setTranslateY(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const getCurrentHeight = () => {
    return window.innerHeight * snapPoints[snapIndex]
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY
    dragRef.current.isDragging = true
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return
    const deltaY = e.touches[0].clientY - dragRef.current.startY
    setTranslateY(Math.max(0, deltaY))
  }

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false
    const height = getCurrentHeight()

    if (translateY > height * 0.3) {
      if (snapIndex === 0) {
        onClose()
      } else {
        setSnapIndex((prev) => Math.max(0, prev - 1))
      }
    } else if (translateY < -50 && snapIndex < snapPoints.length - 1) {
      setSnapIndex((prev) => Math.min(snapPoints.length - 1, prev + 1))
    }

    setTranslateY(0)
  }

  const handleBackdropClick = () => {
    onClose()
  }

  if (!isOpen) return null

  const sheetHeight = getCurrentHeight()

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        onClick={handleBackdropClick}
        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: `${sheetHeight}px`,
          transform: `translateY(${translateY}px)`,
          transition: dragRef.current.isDragging ? 'none' : 'transform 0.3s ease, height 0.3s ease',
        }}
        className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl shadow-xl flex flex-col"
      >
        {/* Drag handle */}
        <div className="flex justify-center py-3 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-gray-600" />
        </div>

        {/* Title */}
        {title && (
          <div className="px-5 pb-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-3 hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
