import { useState } from 'react';
import { Button } from '@/components/ui/Button';

type Platform = 'wordpress' | 'medium' | 'ghost' | 'html' | 'markdown';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  posts: Array<{
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    publishedAt?: string;
    author?: string;
    tags?: string[];
  }>;
}

interface MigrationToolsProps {
  blogId: string;
  onImport: (posts: ImportResult['posts']) => void;
}

export default function MigrationTools({ blogId, onImport }: MigrationToolsProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('wordpress');
  const [importMethod, setImportMethod] = useState<'file' | 'url' | 'api'>('file');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [apiCredentials, setApiCredentials] = useState({
    url: '',
    username: '',
    password: '',
    apiKey: '',
  });

  const platforms: { id: Platform; name: string; icon: string; description: string }[] = [
    {
      id: 'wordpress',
      name: 'WordPress',
      icon: '📰',
      description: 'Import from WordPress XML export or REST API',
    },
    {
      id: 'medium',
      name: 'Medium',
      icon: '📝',
      description: 'Import from Medium export ZIP or RSS feed',
    },
    {
      id: 'ghost',
      name: 'Ghost',
      icon: '👻',
      description: 'Import from Ghost JSON export',
    },
    {
      id: 'html',
      name: 'HTML Files',
      icon: '🌐',
      description: 'Import from HTML files or URLs',
    },
    {
      id: 'markdown',
      name: 'Markdown',
      icon: '📄',
      description: 'Import from Markdown files (.md)',
    },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await file.text();
      const result = await parseImportFile(content, selectedPlatform, file.name);
      setImportResult(result);
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        failed: 1,
        errors: ['Failed to parse file'],
        posts: [],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const parseImportFile = async (
    content: string,
    platform: Platform,
    filename: string
  ): Promise<ImportResult> => {
    const posts: ImportResult['posts'] = [];
    const errors: string[] = [];

    switch (platform) {
      case 'wordpress':
        if (filename.endsWith('.xml')) {
          // Parse WordPress WXR format
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/xml');
          const items = doc.querySelectorAll('item');
          
          items.forEach((item, index) => {
            try {
              const title = item.querySelector('title')?.textContent || '';
              const encoded = item.querySelector('encoded')?.textContent || '';
              const pubDate = item.querySelector('pubDate')?.textContent;
              
              posts.push({
                title,
                slug: slugify(title),
                content: encoded,
                excerpt: encoded.replace(/<[^>]*>/g, '').substring(0, 160),
                publishedAt: pubDate ? new Date(pubDate).toISOString() : undefined,
              });
            } catch (err) {
              errors.push(`Failed to parse post ${index + 1}`);
            }
          });
        }
        break;

      case 'ghost':
        try {
          const ghostData = JSON.parse(content);
          if (ghostData.db && ghostData.db[0] && ghostData.db[0].data) {
            const { posts: ghostPosts } = ghostData.db[0].data;
            ghostPosts.forEach((post: any) => {
              posts.push({
                title: post.title,
                slug: post.slug,
                content: post.html || post.mobiledoc,
                excerpt: post.excerpt || post.html?.replace(/<[^>]*>/g, '').substring(0, 160),
                publishedAt: post.published_at,
                author: post.author,
                tags: post.tags?.map((t: any) => t.name),
              });
            });
          }
        } catch (err) {
          errors.push('Invalid Ghost export format');
        }
        break;

      case 'medium':
        // Medium exports as HTML files in a zip
        // For single file uploads, try to parse as HTML
        if (content.includes('<!DOCTYPE html>')) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, 'text/html');
          const title = doc.querySelector('h1')?.textContent || '';
          const article = doc.querySelector('article') || doc.body;
          
          posts.push({
            title,
            slug: slugify(title),
            content: article.innerHTML,
            excerpt: article.textContent?.substring(0, 160),
          });
        }
        break;

      case 'markdown':
        // Parse markdown file
        const lines = content.split('\n');
        let title = '';
        let mdContent = content;
        
        // Try to extract title from first h1 or frontmatter
        if (lines[0].startsWith('# ')) {
          title = lines[0].replace('# ', '');
          mdContent = lines.slice(1).join('\n');
        }
        
        posts.push({
          title: title || 'Untitled',
          slug: slugify(title || 'untitled'),
          content: mdContent, // Would convert to HTML in production
          excerpt: mdContent.replace(/[#*`_\[\]]/g, '').substring(0, 160),
        });
        break;

      case 'html':
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const title = doc.querySelector('title')?.textContent || 
                     doc.querySelector('h1')?.textContent || 'Untitled';
        const body = doc.body.innerHTML;
        
        posts.push({
          title,
          slug: slugify(title),
          content: body,
          excerpt: doc.body.textContent?.substring(0, 160),
        });
        break;
    }

    return {
      success: posts.length > 0,
      imported: posts.length,
      failed: errors.length,
      errors,
      posts,
    };
  };

  const handleImportSelected = () => {
    if (importResult?.posts) {
      onImport(importResult.posts);
      setImportResult(null);
    }
  };

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Platform</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => setSelectedPlatform(platform.id)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedPlatform === platform.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-3xl mb-2">{platform.icon}</div>
              <div className="font-semibold text-gray-900">{platform.name}</div>
              <div className="text-sm text-gray-600 mt-1">{platform.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Import Method */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Method</h3>
        
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'file', label: 'File Upload', icon: '📁' },
            { id: 'url', label: 'RSS Feed / URL', icon: '🌐' },
            { id: 'api', label: 'API Connection', icon: '🔌' },
          ].map((method) => (
            <button
              key={method.id}
              onClick={() => setImportMethod(method.id as typeof importMethod)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                importMethod === method.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{method.icon}</span>
              <span>{method.label}</span>
            </button>
          ))}
        </div>

        {/* File Upload */}
        {importMethod === 'file' && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".xml,.json,.html,.md,.zip,.txt"
              className="hidden"
              id="import-file"
            />
            <label htmlFor="import-file" className="cursor-pointer block">
              <div className="text-4xl mb-3">📁</div>
              <p className="text-gray-600 mb-2">
                <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                Supports: WordPress XML, Ghost JSON, Medium ZIP, Markdown, HTML
              </p>
            </label>
          </div>
        )}

        {/* URL Import */}
        {importMethod === 'url' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                RSS Feed URL or Blog URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/feed.xml"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button disabled className="w-full">
              Fetch Content (Coming Soon)
            </Button>
          </div>
        )}

        {/* API Connection */}
        {importMethod === 'api' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WordPress Site URL
              </label>
              <input
                type="url"
                value={apiCredentials.url}
                onChange={(e) => setApiCredentials({ ...apiCredentials, url: e.target.value })}
                placeholder="https://yoursite.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={apiCredentials.username}
                  onChange={(e) => setApiCredentials({ ...apiCredentials, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Password
                </label>
                <input
                  type="password"
                  value={apiCredentials.password}
                  onChange={(e) => setApiCredentials({ ...apiCredentials, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button disabled className="w-full">
              Connect & Import (Coming Soon)
            </Button>
          </div>
        )}
      </div>

      {/* Import Progress */}
      {isImporting && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <svg className="animate-spin mx-auto h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-blue-900 font-medium">Parsing import file...</p>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className={`rounded-lg p-6 ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Import Results
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-green-600 font-medium">
                ✓ {importResult.imported} posts found
              </span>
              {importResult.failed > 0 && (
                <span className="text-red-600 font-medium">
                  ✗ {importResult.failed} failed
                </span>
              )}
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 rounded text-sm text-red-700">
              {importResult.errors.map((error, i) => (
                <div key={i}>• {error}</div>
              ))}
            </div>
          )}

          {/* Preview */}
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {importResult.posts.map((post, index) => (
              <div key={index} className="bg-white p-3 rounded border border-gray-200">
                <div className="font-medium text-gray-900">{post.title}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {post.excerpt?.substring(0, 100)}...
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Slug: {post.slug} • 
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'No date'}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setImportResult(null)}>
              Cancel
            </Button>
            <Button onClick={handleImportSelected}>
              Import {importResult.imported} Posts
            </Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-gray-100 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-3">How to Export from {platforms.find(p => p.id === selectedPlatform)?.name}</h4>
        <div className="text-sm text-gray-600 space-y-2">
          {selectedPlatform === 'wordpress' && (
            <>
              <p>1. Go to Tools → Export in your WordPress admin</p>
              <p>2. Select "All content" or "Posts"</p>
              <p>3. Download the .xml file</p>
              <p>4. Upload it here</p>
            </>
          )}
          {selectedPlatform === 'medium' && (
            <>
              <p>1. Go to medium.com/me/export</p>
              <p>2. Click "Export" and wait for email</p>
              <p>3. Download the .zip file</p>
              <p>4. Extract and upload HTML files</p>
            </>
          )}
          {selectedPlatform === 'ghost' && (
            <>
              <p>1. Go to Settings → Labs in Ghost admin</p>
              <p>2. Click "Export" under "Export your content"</p>
              <p>3. Download the .json file</p>
              <p>4. Upload it here</p>
            </>
          )}
          {selectedPlatform === 'markdown' && (
            <>
              <p>1. Gather your .md files</p>
              <p>2. Make sure each file has a title (H1 or frontmatter)</p>
              <p>3. Upload files individually or as a ZIP</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export type { ImportResult, Platform };