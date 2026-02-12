import React, { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

interface InternalLinkingSuggestionsProps {
  blogId: string;
  content: string;
  onLinkClick: (url: string) => void;
}

export function InternalLinkingSuggestions({ blogId, content, onLinkClick }: InternalLinkingSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedContent] = useDebounce(content, 1000);

  useEffect(() => {
    if (debouncedContent && debouncedContent.length > 50) {
      setIsLoading(true);
      fetch('/api/ai/suggest-internal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId, content: debouncedContent }),
      })
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.suggestions || []);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [debouncedContent, blogId]);

  if (!isLoading && suggestions.length === 0) {
    return <div className="p-4 text-sm text-gray-500">Writing more will generate internal link suggestions.</div>;
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Internal Link Suggestions</h3>
      {isLoading && <div>Loading...</div>}
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} className="mb-2">
            <button
              onClick={() => onLinkClick(suggestion.url)}
              className="text-blue-500 hover:underline text-left"
            >
              {suggestion.text}
            </button>
            <p className="text-sm text-gray-500">Relevance: {suggestion.relevance}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
