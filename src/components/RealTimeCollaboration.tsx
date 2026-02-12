import { useState, useEffect, useRef } from 'react'
import { Users, MousePointer2, MessageSquare, Share2, Edit2, Eye, MoreVertical } from 'lucide-react'

interface Collaborator {
  id: string
  name: string
  email: string
  color: string
  avatar?: string
  cursor: { x: number; y: number }
  isTyping: boolean
  lastActive: Date
  permissions: 'owner' | 'editor' | 'viewer'
}

interface Comment {
  id: string
  userId: string
  userName: string
  userColor: string
  text: string
  position: { x: number; y: number }
  timestamp: Date
  resolved: boolean
}

interface ActivityEvent {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: Date
}

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', color: '#f59e0b', cursor: { x: 150, y: 200 }, isTyping: false, lastActive: new Date(), permissions: 'owner' },
  { id: '2', name: 'Mike Johnson', email: 'mike@example.com', color: '#3b82f6', cursor: { x: 300, y: 150 }, isTyping: true, lastActive: new Date(), permissions: 'editor' },
  { id: '3', name: 'Emma Davis', email: 'emma@example.com', color: '#10b981', cursor: { x: 250, y: 300 }, isTyping: false, lastActive: new Date(Date.now() - 60000), permissions: 'viewer' }
]

const mockComments: Comment[] = [
  { id: '1', userId: '2', userName: 'Mike Johnson', userColor: '#3b82f6', text: 'This section needs more detail', position: { x: 400, y: 250 }, timestamp: new Date(Date.now() - 300000), resolved: false },
  { id: '2', userId: '1', userName: 'Sarah Chen', userColor: '#f59e0b', text: 'Great intro!', position: { x: 200, y: 150 }, timestamp: new Date(Date.now() - 600000), resolved: true }
]

const mockActivity: ActivityEvent[] = [
  { id: '1', userId: '2', userName: 'Mike Johnson', action: 'edited paragraph 3', timestamp: new Date(Date.now() - 120000) },
  { id: '2', userId: '1', userName: 'Sarah Chen', action: 'added new section', timestamp: new Date(Date.now() - 300000) },
  { id: '3', userId: '3', userName: 'Emma Davis', action: 'joined the session', timestamp: new Date(Date.now() - 600000) }
]

export default function RealTimeCollaboration() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>(mockCollaborators)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [activity, setActivity] = useState<ActivityEvent[]>(mockActivity)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showComments, setShowComments] = useState(true)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [newCommentText, setNewCommentText] = useState('')
  const [showShareModal, setShowShareModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCollaborators(prev => prev.map(c => ({
        ...c,
        cursor: {
          x: Math.max(0, Math.min(800, c.cursor.x + (Math.random() - 0.5) * 20)),
          y: Math.max(0, Math.min(600, c.cursor.y + (Math.random() - 0.5) * 20))
        }
      })))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleAddComment = () => {
    if (!newCommentText.trim()) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      userId: '1',
      userName: 'Sarah Chen',
      userColor: '#f59e0b',
      text: newCommentText,
      position: { x: 300, y: 200 },
      timestamp: new Date(),
      resolved: false
    }
    
    setComments([comment, ...comments])
    setNewCommentText('')
    setSelectedComment(null)
  }

  const handleResolveComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, resolved: !c.resolved } : c
    ))
  }

  const handleRemoveCollaborator = (userId: string) => {
    setCollaborators(collaborators.filter(c => c.id !== userId))
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Real-time Collaboration</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {collaborators.length} active
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComments(!showComments)}
            className={`p-2 rounded-lg transition-colors ${showComments ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Invite
          </button>
          <button
            onClick={() => setShowShareModal(true)}
            className="text-gray-600 hover:text-gray-700"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-900">{collaborators.filter(c => c.permissions === 'editor').length}</div>
          <div className="text-sm text-green-600">Editors</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-900">{collaborators.filter(c => c.permissions === 'viewer').length}</div>
          <div className="text-sm text-blue-600">Viewers</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-orange-900">{comments.filter(c => !c.resolved).length}</div>
          <div className="text-sm text-orange-600">Open Comments</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Active Collaborators</h4>
        <div className="space-y-3">
          {collaborators.map(collaborator => (
            <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name[0]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{collaborator.name}</div>
                  <div className="text-sm text-gray-600">{collaborator.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  collaborator.permissions === 'owner' ? 'bg-purple-100 text-purple-800' :
                  collaborator.permissions === 'editor' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {collaborator.permissions}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {collaborator.isTyping && (
                  <span className="text-xs text-blue-600 animate-pulse">typing...</span>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  {formatTimeAgo(collaborator.lastActive)}
                </div>
                {collaborator.permissions !== 'owner' && (
                  <button 
                    onClick={() => handleRemoveCollaborator(collaborator.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showComments && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Comments</h4>
            <span className="text-sm text-gray-500">{comments.filter(c => !c.resolved).length} open</span>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map(comment => (
              <div 
                key={comment.id}
                className={`p-3 rounded-lg border ${comment.resolved ? 'bg-gray-50 border-gray-200 opacity-50' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-start gap-2">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
                    style={{ backgroundColor: comment.userColor }}
                  >
                    {comment.userName[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.userName}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button 
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        {comment.resolved ? 'Unresolve' : 'Resolve'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!newCommentText.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {activity.map(event => (
            <div key={event.id} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className="text-gray-900">{event.userName}</span>
              <span className="text-gray-600">{event.action}</span>
              <span className="text-gray-400 ml-auto">{formatTimeAgo(event.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Invite Collaborator</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-500 hover:text-gray-700">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permission Level</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="editor">Editor - Can edit content</option>
                  <option value="viewer">Viewer - Can only view</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Document</h3>
              <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Share Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="https://blog-saas.com/share/abc123"
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm"
                  />
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="access" value="anyone" className="text-purple-600" />
                    <span className="text-sm">Anyone with the link</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="access" value="specific" className="text-purple-600" />
                    <span className="text-sm">Specific people</span>
                  </label>
                </div>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}