import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { 
  TrendingUp, 
  Search, 
  BarChart3, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Play,
  Settings
} from 'lucide-react'

interface SEOTask {
  id: string
  taskType: string
  priority: string
  title: string
  description: string
  impact: number
  effort: number
  status: string
  automated: boolean
  createdAt: string
  completedAt?: string
}

interface KeywordRanking {
  keyword: string
  position: number
  change: number
  url: string
  searchEngine: string
  location: string
  device: string
  trackedAt: string
}

interface CompetitorData {
  competitorDomain: string
  keyword: string
  competitorPosition: number
  ourPosition: number
  gapOpportunity: number
  competitorUrl: string
}

interface SEODashboardProps {
  teamId: string
  postId?: string
}

export default function SEODashboard({ teamId, postId }: SEODashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rankings' | 'competitors' | 'tasks'>('overview')
  const [loading, setLoading] = useState(false)
  const [tasks, setTasks] = useState<SEOTask[]>([])
  const [rankings, setRankings] = useState<KeywordRanking[]>([])
  const [competitors, setCompetitors] = useState<CompetitorData[]>([])
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    fetchSEOData()
  }, [teamId, postId])

  const fetchSEOData = async () => {
    try {
      setLoading(true)
      
      // Fetch SEO automation tasks
      const tasksResponse = await fetch(`/api/seo/automation?teamId=${teamId}&action=tasks`)
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setTasks(tasksData.tasks || [])
      }

      // Fetch keyword rankings if we have a postId
      if (postId) {
        const rankingsResponse = await fetch(`/api/seo/automation?teamId=${teamId}&postId=${postId}&action=rankings`)
        if (rankingsResponse.ok) {
          const rankingsData = await rankingsResponse.json()
          setRankings(rankingsData.rankings || [])
        }

        // Fetch competitor analysis
        const competitorsResponse = await fetch(`/api/seo/automation?teamId=${teamId}&postId=${postId}&action=analyze`)
        if (competitorsResponse.ok) {
          const competitorsData = await competitorsResponse.json()
          setCompetitors(competitorsData.competitors || [])
        }
      }
    } catch (error) {
      console.error('Error fetching SEO data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackRankings = async (keywordId: string) => {
    setIsTracking(true)
    try {
      const response = await fetch(
        `/api/seo/automation?teamId=${teamId}&keywordId=${keywordId}&action=track`
      )
      if (response.ok) {
        fetchSEOData() // Refresh data
      }
    } catch (error) {
      console.error('Error tracking rankings:', error)
    } finally {
      setIsTracking(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    if (!postId) return
    
    setLoading(true)
    try {
      const response = await fetch(
        `/api/seo/automation?teamId=${teamId}&postId=${postId}&action=recommendations`
      )
      if (response.ok) {
        fetchSEOData() // Refresh data
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskUpdate = async (taskId: string, status: string) => {
    try {
      const response = await fetch('/api/seo/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          action: 'update_task',
          data: { taskId, status }
        })
      })
      
      if (response.ok) {
        fetchSEOData()
      }
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPositionChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">SEO Automation Suite</h1>
        <p className="text-muted-foreground">
          Track rankings, analyze competitors, and optimize your content automatically
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        {postId && (
          <>
            <Button
              onClick={handleGenerateRecommendations}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Generate Recommendations
            </Button>
            <Button
              variant="outline"
              onClick={() => {/* Open keyword tracking modal */}}
              className="flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Track Keywords
            </Button>
          </>
        )}
        <Button
          variant="outline"
          onClick={() => {/* Open settings */}}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'rankings', label: 'Rankings', icon: Search },
            { id: 'competitors', label: 'Competitors', icon: TrendingUp },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter(t => t.status !== 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tasks.filter(t => t.status === 'in_progress').length} in progress
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {rankings.length > 0 
                      ? Math.round(rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length)
                      : 'N/A'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across {rankings.length} keywords
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">High-Impact Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {tasks.filter(t => t.impact > 70 && t.status !== 'completed').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready to implement
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Competitor Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competitors.filter(c => c.gapOpportunity > 70).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    High opportunity gaps
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'rankings' && (
            <div className="space-y-4">
              {rankings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Rankings Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Start tracking your keyword rankings to see performance data here.
                    </p>
                    <Button onClick={() => {/* Open keyword tracking */}}>
                      Add Keywords to Track
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                rankings.map((ranking) => (
                  <Card key={ranking.trackedAt + ranking.keyword}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold">{ranking.keyword}</div>
                            <div className="text-sm text-muted-foreground">
                              {ranking.searchEngine} • {ranking.location} • {ranking.device}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-bold">#{ranking.position}</div>
                            {ranking.change !== 0 && (
                              <div className={`text-sm ${getPositionChangeColor(ranking.change)}`}>
                                {ranking.change > 0 ? '↑' : '↓'} {Math.abs(ranking.change)}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTrackRankings(ranking.keyword)}
                            disabled={isTracking}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'competitors' && (
            <div className="space-y-4">
              {competitors.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Competitor Data</h3>
                    <p className="text-muted-foreground mb-4">
                      Analyze competitors to identify content gaps and opportunities.
                    </p>
                    <Button onClick={() => {/* Start competitor analysis */}}>
                      Run Competitor Analysis
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                competitors.map((competitor, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-semibold">{competitor.keyword}</div>
                            <div className="text-sm text-muted-foreground">
                              Competitor: {competitor.competitorDomain}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground">Position</div>
                            <div className="font-semibold">
                              Us: #{competitor.ourPosition} vs Them: #{competitor.competitorPosition}
                            </div>
                          </div>
                          <Badge className={competitor.gapOpportunity > 70 ? 'bg-green-100 text-green-800' : ''}>
                            {competitor.gapOpportunity}% Opportunity
                          </Badge>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {tasks.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No SEO Tasks</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate SEO recommendations to get optimization tasks.
                    </p>
                    <Button onClick={handleGenerateRecommendations}>
                      Generate Recommendations
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                tasks.map((task) => (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {task.automated && (
                                <Badge variant="secondary">Automated</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <BarChart3 className="w-4 h-4" />
                                Impact: {task.impact}%
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Effort: {task.effort}%
                              </span>
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-4 h-4" />
                                {task.taskType.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                          {task.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskUpdate(task.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => handleTaskUpdate(task.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}