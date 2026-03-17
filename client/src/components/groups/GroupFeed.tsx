import { useEffect, useState } from 'react'
import { ThumbsUp, MessageCircle, Image, Send } from 'lucide-react'
import { api } from '../../api/client'
import type { GroupPost } from '../../types'
import Avatar from '../Avatar'

interface GroupFeedProps {
  groupId: string
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

export default function GroupFeed({ groupId }: GroupFeedProps) {
  const [posts, setPosts] = useState<GroupPost[]>([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: GroupPost[] }>(`/posts?group_id=${groupId}`)
        setPosts(res.data)
      } catch {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId])

  async function handlePost() {
    if (!newPost.trim() || posting) return
    setPosting(true)
    try {
      const post = await api.post<GroupPost>('/posts', {
        group_id: groupId,
        content: newPost.trim(),
      })
      setPosts((prev) => [post, ...prev])
      setNewPost('')
    } catch {
      // handle error
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Compose area */}
      <div className="bg-navy-800 rounded-2xl p-4 border border-navy-600">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Share with your group..."
          rows={3}
          className="w-full bg-transparent text-white placeholder-gray-500 text-sm resize-none focus:outline-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-navy-600">
          <button className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors text-sm">
            <Image size={18} />
            <span>Photo</span>
          </button>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || posting}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-navy-900 transition-colors"
          >
            <Send size={14} />
            Post
          </button>
        </div>
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle size={32} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-navy-800 rounded-2xl p-4 border border-navy-700 space-y-3">
            {/* Post header */}
            <div className="flex items-center gap-3">
              {post.user && (
                <Avatar name={post.user.name} beltRank={post.user.beltRank} size="sm" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {post.user?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">{formatTimeAgo(post.createdAt)}</p>
              </div>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>

            {/* Image */}
            {post.image && (
              <div className="rounded-xl overflow-hidden">
                <img src={post.image} alt="" className="w-full object-cover max-h-64" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-2 border-t border-navy-700">
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-accent transition-colors text-sm">
                <ThumbsUp size={16} />
                <span>{post.likes ?? 0}</span>
              </button>
              <button className="flex items-center gap-1.5 text-gray-400 hover:text-accent transition-colors text-sm">
                <MessageCircle size={16} />
                <span>{post.comments ?? 0}</span>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
