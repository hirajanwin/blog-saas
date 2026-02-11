import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface Revision {
  id: string;
  postId: string;
  version: number;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
  changeSummary?: string;
  wordCount: number;
}

interface RevisionHistoryProps {
  postId: string;
  revisions: Revision[];
  currentRevisionId?: string;
  onRestore: (revision: Revision) => void;
  onCompare: (revision1: Revision, revision2: Revision) => void;
}

export default function RevisionHistory({
  postId,
  revisions,
  currentRevisionId,
  onRestore,
  onCompare,
}: RevisionHistoryProps) {
  const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [expandedRevision, setExpandedRevision] = useState<string | null>(null);

  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSelectRevision = (revisionId: string) => {
    if (selectedRevisions.includes(revisionId)) {
      setSelectedRevisions(selectedRevisions.filter(id => id !== revisionId));
    } else if (selectedRevisions.length < 2) {
      setSelectedRevisions([...selectedRevisions, revisionId]);
    } else {
      // Replace the oldest selection
      setSelectedRevisions([selectedRevisions[1], revisionId]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateChanges = (current: Revision, previous?: Revision) => {
    if (!previous) return { added: 0, removed: 0 };
    
    const currentWords = current.wordCount;
    const previousWords = previous.wordCount;
    const diff = currentWords - previousWords;
    
    return {
      added: diff > 0 ? diff : 0,
      removed: diff < 0 ? Math.abs(diff) : 0,
    };
  };

  const canCompare = selectedRevisions.length === 2;

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Revision History</h3>
            <p className="text-sm text-gray-600">{revisions.length} versions saved</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Timeline
              </button>
            </div>

            {/* Compare Button */}
            {canCompare && (
              <Button
                size="sm"
                onClick={() => {
                  const rev1 = revisions.find(r => r.id === selectedRevisions[0]);
                  const rev2 = revisions.find(r => r.id === selectedRevisions[1]);
                  if (rev1 && rev2) onCompare(rev1, rev2);
                }}
              >
                Compare Selected
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Revisions List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedRevisions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No revisions yet</p>
            <p className="text-sm mt-1">Revisions are saved automatically as you edit</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedRevisions.map((revision, index) => {
              const previousRevision = sortedRevisions[index + 1];
              const changes = calculateChanges(revision, previousRevision);
              const isSelected = selectedRevisions.includes(revision.id);
              const isExpanded = expandedRevision === revision.id;
              const isCurrent = revision.id === currentRevisionId;

              return (
                <div
                  key={revision.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${isCurrent ? 'border-l-4 border-l-green-500' : ''}`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectRevision(revision.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            Version {revision.version}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {formatDate(revision.createdAt)} at {formatTime(revision.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {changes.added > 0 && (
                            <span className="text-xs text-green-600 font-medium">
                              +{changes.added} words
                            </span>
                          )}
                          {changes.removed > 0 && (
                            <span className="text-xs text-red-600 font-medium">
                              -{changes.removed} words
                            </span>
                          )}
                          {!previousRevision && (
                            <span className="text-xs text-blue-600 font-medium">
                              {revision.wordCount} words
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Author */}
                      <div className="flex items-center space-x-2 mt-1 text-sm text-gray-600">
                        {revision.author.avatar ? (
                          <img
                            src={revision.author.avatar}
                            alt={revision.author.name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                            {revision.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{revision.author.name}</span>
                        {revision.changeSummary && (
                          <span className="text-gray-500">• {revision.changeSummary}</span>
                        )}
                      </div>

                      {/* Preview */}
                      <div className="mt-2">
                        <button
                          onClick={() => setExpandedRevision(isExpanded ? null : revision.id)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {isExpanded ? 'Hide preview' : 'Show preview'}
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-2 p-3 bg-gray-50 rounded text-sm text-gray-700">
                            <div className="font-medium mb-1">{revision.title}</div>
                            <div className="line-clamp-3">
                              {revision.excerpt || revision.content.replace(/<[^>]*>/g, '').substring(0, 200)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-3 mt-3">
                        <button
                          onClick={() => onRestore(revision)}
                          disabled={isCurrent}
                          className={`text-sm font-medium ${
                            isCurrent
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          {isCurrent ? 'Current version' : 'Restore this version'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Select two revisions to compare changes. 
          Restoring a revision will create a new version with that content.
        </p>
      </div>
    </div>
  );
}

// Revision comparison component
export function RevisionCompare({
  revision1,
  revision2,
  onClose,
}: {
  revision1: Revision;
  revision2: Revision;
  onClose: () => void;
}) {
  // Simple diff highlighting (in production, use a proper diff library)
  const highlightChanges = (text1: string, text2: string) => {
    // This is a simplified version - real implementation would use diff-match-patch
    return {
      oldText: text1,
      newText: text2,
    };
  };

  const diff = highlightChanges(revision1.content, revision2.content);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Comparing Versions
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comparison */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Old Version */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Version {revision1.version}
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(revision1.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{revision1.title}</h5>
                <div 
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: diff.oldText }}
                />
              </div>
            </div>

            {/* New Version */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Version {revision2.version}
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(revision2.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">{revision2.title}</h5>
                <div 
                  className="text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: diff.newText }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { Revision };