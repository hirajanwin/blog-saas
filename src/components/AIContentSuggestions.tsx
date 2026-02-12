import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Users, Target, Lightbulb, Zap } from 'lucide-react'

interface Suggestion {
  id: string
  type: 'headline' | 'outline' | 'keywords' | 'seo' | 'engagement'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  effort: 'easy' | 'medium' | 'hard'
}

export default function AIContentSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')

  const mockSuggestions: Suggestion[] = [
    {
      id: '1',
      type: 'headline',
      title: 'Add numbers to your headline',
      description: 'Headlines with numbers get 73% more shares. Try: "7 Ways to Boost Your Productivity"',
      impact: 'high',
      effort: 'easy'
    },
    {
      id: '2',
      type: 'seo',
      title: 'Include long-tail keywords',
      description: 'Add "for beginners" and "step by step" to capture more search traffic',
      impact: 'medium',
      effort: 'easy'
    },
    {
      id: '3',
      type: 'engagement',
      title: 'Add a question in the first paragraph',
      description: 'Questions increase reader engagement by 36% and reduce bounce rate',
      impact: 'medium',
      effort: 'easy'
    },
    {
      id: '4',
      type: 'outline',
      title: 'Structure with subheadings',
      description: 'Break content into scannable sections with H2/H3 tags for better readability',
      impact: 'high',
      effort: 'medium'
    },
    {
      id: '5',
      type: 'keywords',
      title: 'Target featured snippets',
      description: 'Add a definition list or FAQ section to capture Google featured snippets',
      impact: 'high',
      effort: 'medium'
    },
    {
      id: '6',
      type: 'engagement',
      title: 'Add social proof elements',
      description: 'Include statistics, testimonials, or case studies to build credibility',
      impact: 'medium',
      effort: 'medium'
    }
  ]

  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setSuggestions(mockSuggestions)
      setLoading(false)
    }, 1000)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'headline': return <Zap className="w-4 h-4" />
      case 'seo': return <TrendingUp className="w-4 h-4" />
      case 'engagement': return <Users className="w-4 h-4" />
      case 'outline': return <Target className="w-4 h-4" />
      case 'keywords': return <Lightbulb className="w-4 h-4" />
      default: return <Sparkles className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'headline': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'seo': return 'bg-green-100 text-green-800 border-green-200'
      case 'engagement': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'outline': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'keywords': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const filteredSuggestions = activeFilter === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.type === activeFilter)

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Content Suggestions</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Content Suggestions</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {suggestions.length} suggestions
          </span>
        </div>
        <button 
          onClick={() => {
            setLoading(true)
            setTimeout(() => setLoading(false), 1000)
          }}
          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {['headline', 'seo', 'engagement', 'outline', 'keywords'].map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors capitalize ${
              activeFilter === type 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredSuggestions.map(suggestion => (
          <div 
            key={suggestion.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg border ${getTypeColor(suggestion.type)}`}>
                {getTypeIcon(suggestion.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(suggestion.impact)}`}>
                    {suggestion.impact} impact
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEffortColor(suggestion.effort)}`}>
                    {suggestion.effort} effort
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getTypeColor(suggestion.type)}`}>
                    {suggestion.type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSuggestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Sparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No suggestions found for this filter.</p>
        </div>
      )}
    </div>
  )
}