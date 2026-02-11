import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface InternalLinkSuggestion {
  id: string;
  fromPostId: string;
  fromPostTitle: string;
  toPostId: string;
  toPostTitle: string;
  anchorText: string;
  relevanceScore: number; // 0-100
  context: string; // Surrounding text
  applied: boolean;
}

interface InternalLinkingProps {
  blogId: string;
  currentPostId: string;
  currentContent: string;
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
  }>;
  onApplyLink: (suggestion: InternalLinkSuggestion) => void;
  onDismissLink: (suggestionId: string) => void;
}

// Algorithm to find internal linking opportunities
export function findLinkOpportunities(
  currentContent: string,
  currentPostId: string,
  posts: Array<{ id: string; title: string; slug: string; excerpt: string }>
): InternalLinkSuggestion[] {
  const suggestions: InternalLinkSuggestion[] = [];
  const contentLower = currentContent.toLowerCase();
  
  posts.forEach(post => {
    if (post.id === currentPostId) return; // Don't link to self
    
    const titleLower = post.title.toLowerCase();
    const titleWords = titleLower.split(/\s+/).filter(w => w.length > 3);
    
    // Check if post title appears in content
    if (contentLower.includes(titleLower)) {
      const index = contentLower.indexOf(titleLower);
      const context = currentContent.substring(
        Math.max(0, index - 50),
        Math.min(currentContent.length, index + titleLower.length + 50)
      );
      
      suggestions.push({
        id: `link-${Date.now()}-${post.id}`,
        fromPostId: currentPostId,
        fromPostTitle: '',
        toPostId: post.id,
        toPostTitle: post.title,
        anchorText: post.title,
        relevanceScore: 90, // High score for exact title match
        context,
        applied: false,
      });
    }
    
    // Check for individual keywords from title
    titleWords.forEach(word => {
      if (contentLower.includes(word) && word.length > 4) {
        const occurrences = (contentLower.match(new RegExp(word, 'g')) || []).length;
        
        if (occurrences > 0 && !suggestions.find(s => s.toPostId === post.id)) {
          const index = contentLower.indexOf(word);
          const context = currentContent.substring(
            Math.max(0, index - 40),
            Math.min(currentContent.length, index + word.length + 40)
          );
          
          suggestions.push({
            id: `link-${Date.now()}-${post.id}-${word}`,
            fromPostId: currentPostId,
            fromPostTitle: '',
            toPostId: post.id,
            toPostTitle: post.title,
            anchorText: word,
            relevanceScore: Math.min(70, 40 + occurrences * 10),
            context,
            applied: false,
          });
        }
      }
    });
  });
  
  // Sort by relevance score
  return suggestions.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);
}

export default function InternalLinking({
  blogId,
  currentPostId,
  currentContent,
  posts,
  onApplyLink,
  onDismissLink,
}: InternalLinkingProps) {
  const [suggestions, setSuggestions] = useState<InternalLinkSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'existing'>('suggestions');
  const [existingLinks, setExistingLinks] = useState<InternalLinkSuggestion[]>([]);

  useEffect(() => {
    if (currentContent && posts.length > 0) {
      setIsAnalyzing(true);
      
      // Simulate analysis delay
      setTimeout(() => {
        const opportunities = findLinkOpportunities(currentContent, currentPostId, posts);
        setSuggestions(opportunities);
        setIsAnalyzing(false);
      }, 500);
    }
  }, [currentContent, currentPostId, posts]);

  const handleApply = (suggestion: InternalLinkSuggestion) => {
    onApplyLink(suggestion);
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setExistingLinks(prev => [...prev, { ...suggestion, applied: true }]);
  };

  const handleDismiss = (suggestionId: string) => {
    onDismissLink(suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Internal Links
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {suggestions.filter(s => !s.applied).length} suggestions
            </span>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-4 mt-3">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'suggestions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Suggestions ({suggestions.filter(s => !s.applied).length})
          </button>
          <button
            onClick={() => setActiveTab('existing')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'existing'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Applied ({existingLinks.length})
          </button>
        </div>
      </div>

      <div className="p-4">
        {isAnalyzing ? (
          <div className="text-center py-8">
            <svg className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Analyzing content for linking opportunities...</p>
          </div>
        ) : activeTab === 'suggestions' ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.filter(s => !s.applied).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <p className="font-medium">No linking opportunities found</p>
                <p className="text-sm mt-1">Write more content to discover internal linking suggestions</p>
              </div>
            ) : (
              suggestions.filter(s => !s.applied).map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getScoreColor(suggestion.relevanceScore)}`}>
                          {suggestion.relevanceScore}% match
                        </span>
                        <span className="text-sm text-gray-500">→</span>
                        <span className="text-sm font-medium text-blue-600 truncate">
                          {suggestion.toPostTitle}
                        </span>
                      </div>
                      
                      <div className="bg-gray-50 rounded p-2 mb-3">
                        <p className="text-sm text-gray-600">
                          "...{suggestion.context}..."
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Link text:</span>
                        <code className="bg-gray-100 px-2 py-0.5 rounded">{suggestion.anchorText}</code>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-4">
                      <button
                        onClick={() => handleApply(suggestion)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                        title="Apply link"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDismiss(suggestion.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Dismiss"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {existingLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No internal links applied yet</p>
                <p className="text-sm mt-1">Apply suggestions from the Suggestions tab</p>
              </div>
            ) : (
              existingLinks.map((link) => (
                <div
                  key={link.id}
                  className="border border-gray-200 rounded-lg p-4 bg-green-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="font-medium text-gray-900">{link.anchorText}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-blue-600">{link.toPostTitle}</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Applied</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 <strong>Why internal links matter:</strong> They improve SEO, help readers discover related content, 
          and distribute page authority throughout your site.
        </p>
      </div>
    </div>
  );
}

export type { InternalLinkSuggestion };