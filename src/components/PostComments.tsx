import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  comment: string;
  position?: { from: number; to: number };
  resolved: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface PostCommentsProps {
  postId: string;
  comments: Comment[];
  currentUserId: string;
  onAddComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onResolveComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export default function PostComments({
  postId,
  comments,
  currentUserId,
  onAddComment,
  onResolveComment,
  onDeleteComment,
}: PostCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<{ from: number; to: number } | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  const activeComments = comments.filter(c => !c.resolved);
  const resolvedComments = comments.filter(c => c.resolved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    onAddComment({
      userId: currentUserId,
      userName: 'Current User', // In real app, get from auth
      comment: newComment,
      position: selectedPosition || undefined,
      resolved: false,
    });

    setNewComment('');
    setSelectedPosition(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment) => (
    <div
      key={comment.id}
      className={`p-4 rounded-lg border ${
        comment.resolved
          ? 'bg-gray-50 border-gray-200 opacity-75'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.userName}</span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
              {comment.resolved && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Resolved
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {!comment.resolved && (
                <button
                  onClick={() => onResolveComment(comment.id)}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Resolve
                </button>
              )}
              {comment.userId === currentUserId && (
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Position indicator */}
          {comment.position && (
            <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
              📍 Selection at position {comment.position.from}-{comment.position.to}
            </div>
          )}

          {/* Comment text */}
          <p className="mt-2 text-gray-700 text-sm">{comment.comment}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Comments ({activeComments.length})
        </h3>
        {resolvedComments.length > 0 && (
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showResolved ? 'Hide' : 'Show'} resolved ({resolvedComments.length})
          </button>
        )}
      </div>

      {/* Comments list */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {activeComments.length === 0 && resolvedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet</p>
            <p className="text-sm mt-1">Be the first to share your feedback!</p>
          </div>
        ) : (
          <>
            {activeComments.map(renderComment)}
            
            {showResolved && resolvedComments.length > 0 && (
              <>
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-sm text-gray-500">Resolved Comments</span>
                  </div>
                </div>
                {resolvedComments.map(renderComment)}
              </>
            )}
          </>
        )}
      </div>

      {/* Add comment form */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-3">
          {selectedPosition && (
            <div className="flex items-center justify-between text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded">
              <span>💬 Commenting on selected text</span>
              <button
                type="button"
                onClick={() => setSelectedPosition(null)}
                className="text-blue-700 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
          )}
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              💡 Tip: Select text in the editor to comment on specific sections
            </span>
            <Button
              type="submit"
              disabled={!newComment.trim()}
              size="sm"
            >
              Add Comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export type { Comment };