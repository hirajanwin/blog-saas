import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface BrokenLink {
  id: string;
  url: string;
  text: string;
  postId: string;
  postTitle: string;
  status: 'broken' | 'redirect' | 'slow';
  statusCode?: number;
  lastChecked: string;
}

interface BrokenLinkCheckerProps {
  posts: Array<{
    id: string;
    title: string;
    content: string;
  }>;
  onFixLink: (linkId: string, newUrl: string) => void;
  onIgnoreLink: (linkId: string) => void;
}

export default function BrokenLinkChecker({
  posts,
  onFixLink,
  onIgnoreLink,
}: BrokenLinkCheckerProps) {
  const [brokenLinks, setBrokenLinks] = useState<BrokenLink[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedLink, setSelectedLink] = useState<BrokenLink | null>(null);
  const [fixUrl, setFixUrl] = useState('');

  const scanForBrokenLinks = async () => {
    setIsScanning(true);
    setScanProgress(0);
    setBrokenLinks([]);

    const foundLinks: BrokenLink[] = [];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content, 'text/html');
      const links = doc.querySelectorAll('a[href]');

      for (const link of links) {
        const url = link.getAttribute('href') || '';
        const text = link.textContent || '';

        // Skip internal links and anchors
        if (url.startsWith('/') || url.startsWith('#') || url.startsWith('mailto:')) {
          continue;
        }

        // Simulate checking the link
        const status = await checkLink(url);
        
        if (status !== 'ok') {
          foundLinks.push({
            id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url,
            text,
            postId: post.id,
            postTitle: post.title,
            status,
            lastChecked: new Date().toISOString(),
          });
        }
      }

      setScanProgress(Math.round(((i + 1) / posts.length) * 100));
    }

    setBrokenLinks(foundLinks);
    setIsScanning(false);
  };

  const checkLink = async (url: string): Promise<'ok' | 'broken' | 'redirect' | 'slow'> => {
    // Simulate link checking with random results for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        const rand = Math.random();
        if (rand > 0.85) resolve('broken');
        else if (rand > 0.75) resolve('redirect');
        else if (rand > 0.70) resolve('slow');
        else resolve('ok');
      }, 100);
    });
  };

  const handleFix = () => {
    if (selectedLink && fixUrl) {
      onFixLink(selectedLink.id, fixUrl);
      setBrokenLinks(prev => prev.filter(l => l.id !== selectedLink.id));
      setSelectedLink(null);
      setFixUrl('');
    }
  };

  const handleIgnore = (linkId: string) => {
    onIgnoreLink(linkId);
    setBrokenLinks(prev => prev.filter(l => l.id !== linkId));
  };

  const getStatusIcon = (status: BrokenLink['status']) => {
    switch (status) {
      case 'broken':
        return <span className="text-red-500 text-lg">❌</span>;
      case 'redirect':
        return <span className="text-yellow-500 text-lg">⚠️</span>;
      case 'slow':
        return <span className="text-orange-500 text-lg">🐌</span>;
    }
  };

  const getStatusLabel = (status: BrokenLink['status']) => {
    switch (status) {
      case 'broken':
        return 'Broken (404)';
      case 'redirect':
        return 'Redirect (301/302)';
      case 'slow':
        return 'Slow Response';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Broken Link Checker
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Scan all posts for broken, redirected, or slow external links
            </p>
          </div>
          <Button
            onClick={scanForBrokenLinks}
            disabled={isScanning}
          >
            {isScanning ? 'Scanning...' : 'Scan All Posts'}
          </Button>
        </div>
      </div>

      {/* Progress */}
      {isScanning && (
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Scanning posts...</span>
            <span className="text-sm text-blue-700">{scanProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {!isScanning && brokenLinks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">No broken links found!</p>
            <p className="text-sm mt-1">Click "Scan All Posts" to check for issues</p>
          </div>
        )}

        {brokenLinks.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Found {brokenLinks.length} issue{brokenLinks.length !== 1 ? 's' : ''}
              </span>
              <div className="flex space-x-4">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                  {brokenLinks.filter(l => l.status === 'broken').length} broken
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                  {brokenLinks.filter(l => l.status === 'redirect').length} redirects
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-1"></span>
                  {brokenLinks.filter(l => l.status === 'slow').length} slow
                </span>
              </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {brokenLinks.map((link) => (
                <div
                  key={link.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(link.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          link.status === 'broken' ? 'bg-red-100 text-red-700' :
                          link.status === 'redirect' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {getStatusLabel(link.status)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {link.text}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        URL: {link.url}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        In: "{link.postTitle}"
                      </p>

                      {selectedLink?.id === link.id ? (
                        <div className="mt-3 space-y-2">
                          <input
                            type="url"
                            value={fixUrl}
                            onChange={(e) => setFixUrl(e.target.value)}
                            placeholder="Enter corrected URL"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleFix} className="flex-1">
                              Save Fix
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setSelectedLink(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLink(link);
                              setFixUrl(link.url);
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Fix Link
                          </button>
                          <button
                            onClick={() => handleIgnore(link.id)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Ignore
                          </button>
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Visit →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600">
          💡 <strong>Why this matters:</strong> Broken links hurt your SEO and user experience. 
          We recommend scanning monthly to catch issues early.
        </p>
      </div>
    </div>
  );
}

export type { BrokenLink };