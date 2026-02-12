import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Search, Loader2, FileText, Calendar, Eye } from 'lucide-react'

export const Route = createFileRoute('/search')({
  component: SearchComponent,
  head: () => ({
    title: 'Search - Blog SaaS',
    meta: [
      {
        name: 'description',
        content: 'Search for blog posts and content',
      },
    ],
  }),
});

function SearchComponent() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || query.trim().length < 2) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search for typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 3) {
        handleSearch(new Event('submit') as any)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Search</h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for posts, topics, or keywords..."
                className="w-full px-4 py-4 pl-12 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              {loading && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Press Enter or type at least 3 characters to search
            </p>
          </form>

          {/* Results */}
          {searched && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <p className="text-gray-600 mb-4">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                  </p>
                  
                  <div className="space-y-4">
                    {results.map((result) => (
                      <article
                        key={result.id}
                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <a
                          href={`/${result.teamSubdomain}/${result.blogId}/${result.slug}`}
                          className="block"
                        >
                          <h2 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {result.title}
                          </h2>
                          
                          {result.excerpt && (
                            <p className="text-gray-600 mb-3 line-clamp-2">
                              {result.excerpt}
                            </p>
                          )}

                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            {result.blog && (
                              <span className="flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                {result.blog.title}
                              </span>
                            )}
                            {result.publishedAt && (
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {new Date(result.publishedAt).toLocaleDateString()}
                              </span>
                            )}
                            {result.views > 0 && (
                              <span className="flex items-center">
                                <Eye className="w-4 h-4 mr-1" />
                                {result.views} views
                              </span>
                            )}
                            {result.readingTime && (
                              <span>{result.readingTime} min read</span>
                            )}
                          </div>
                        </a>
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          )}

          {!searched && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Start typing to search for posts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
