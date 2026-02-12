import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Clock, 
  MousePointer,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  MoreHorizontal
} from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  topPosts: {
    id: string
    title: string
    views: number
    avgTime: number
    bounceRate: number
  }[]
  trafficSources: {
    source: string
    sessions: number
    percentage: number
  }[]
  dailyStats: {
    date: string
    views: number
    uniqueViews: number
  }[]
  deviceStats: {
    device: string
    sessions: number
    percentage: number
  }[]
  geoStats: {
    country: string
    sessions: number
    percentage: number
  }[]
}

interface ContentAnalyticsProps {
  teamId: string
  blogId?: string
  dateRange?: '7d' | '30d' | '90d' | 'custom'
}

export default function ContentAnalytics({ 
  teamId, 
  blogId, 
  dateRange = '30d' 
}: ContentAnalyticsProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [selectedRange, setSelectedRange] = useState(dateRange)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [teamId, blogId, selectedRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        teamId,
        range: selectedRange
      })
      
      if (blogId) {
        params.append('blogId', blogId)
      }

      const response = await fetch(`/api/analytics?${params}`)
      
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAnalytics()
    setRefreshing(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    const minutes = Math.floor(seconds / 60)
    const secs = Math.round(seconds % 60)
    return `${minutes}m ${secs}s`
  }

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return {
        icon: <ArrowUpRight className="w-4 h-4" />,
        className: 'text-green-600',
        label: `+${change}%`
      }
    }
    if (change < 0) {
      return {
        icon: <ArrowDownRight className="w-4 h-4" />,
        className: 'text-red-600',
        label: `${change}%`
      }
    }
    return {
      icon: null,
      className: 'text-gray-600',
      label: '0%'
    }
  }

  // Mock data for demonstration
  const mockData: AnalyticsData = {
    totalViews: 45892,
    uniqueViews: 23451,
    avgTimeOnPage: 245,
    bounceRate: 42.3,
    topPosts: [
      { id: '1', title: 'Getting Started with AI Content Creation', views: 12453, avgTime: 320, bounceRate: 28.5 },
      { id: '2', title: '10 SEO Tips for Bloggers in 2026', views: 8921, avgTime: 280, bounceRate: 35.2 },
      { id: '3', title: 'How to Build a Successful Blog', views: 6543, avgTime: 410, bounceRate: 22.1 },
      { id: '4', title: 'Content Marketing Best Practices', views: 4321, avgTime: 195, bounceRate: 48.3 },
      { id: '5', title: 'Monetizing Your Blog', views: 3892, avgTime: 175, bounceRate: 52.1 }
    ],
    trafficSources: [
      { source: 'Organic Search', sessions: 18234, percentage: 62.4 },
      { source: 'Direct', sessions: 5234, percentage: 17.9 },
      { source: 'Social Media', sessions: 4123, percentage: 14.1 },
      { source: 'Referral', sessions: 1567, percentage: 5.4 },
      { source: 'Email', sessions: 234, percentage: 0.8 }
    ],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 2000) + 500,
      uniqueViews: Math.floor(Math.random() * 1000) + 200
    })),
    deviceStats: [
      { device: 'Desktop', sessions: 14523, percentage: 61.9 },
      { device: 'Mobile', sessions: 7823, percentage: 33.4 },
      { device: 'Tablet', sessions: 1105, percentage: 4.7 }
    ],
    geoStats: [
      { country: 'United States', sessions: 12453, percentage: 53.1 },
      { country: 'United Kingdom', sessions: 3421, percentage: 14.6 },
      { country: 'Canada', sessions: 2134, percentage: 9.1 },
      { country: 'Australia', sessions: 1567, percentage: 6.7 },
      { country: 'Germany', sessions: 1234, percentage: 5.3 }
    ]
  }

  const displayData = data || mockData

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Content Analytics</h1>
          <p className="text-muted-foreground">
            Track your content performance and audience engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center rounded-lg border bg-background">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  selectedRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total Views
              <Eye className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(displayData.totalViews)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Unique Visitors
              <MousePointer className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(displayData.uniqueViews)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+8.3%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Avg. Time on Page
              <Clock className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatTime(displayData.avgTimeOnPage)}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Bounce Rate
              <ArrowUpRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{displayData.bounceRate}%</div>
            <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
              <TrendingUp className="w-4 h-4 rotate-90" />
              <span>+2.1%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {displayData.dailyStats.slice(-14).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary/80 rounded-t hover:bg-primary transition-colors"
                    style={{ 
                      height: `${(day.views / Math.max(...displayData.dailyStats.map(d => d.views))) * 200}px`,
                      minHeight: '4px'
                    }}
                    title={`${day.date}: ${day.views} views`}
                  />
                  <span className="text-xs text-muted-foreground transform -rotate-45 origin-left whitespace-nowrap">
                    {day.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-sm" />
                <span className="text-muted-foreground">Total Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary/30 rounded-sm" />
                <span className="text-muted-foreground">Unique Visitors</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.trafficSources.map((source, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium truncate">
                    {source.source}
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                  <div className="w-20 text-right text-sm">
                    <span className="font-semibold">{formatNumber(source.sessions)}</span>
                    <span className="text-muted-foreground ml-1">({source.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Posts */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Top Performing Content</CardTitle>
            <Button variant="ghost" size="sm">View All</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayData.topPosts.map((post, index) => (
                <div 
                  key={post.id} 
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{post.title}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatNumber(post.views)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(post.avgTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        {post.bounceRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Device & Geo */}
        <div className="space-y-6">
          {/* Devices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.deviceStats.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        {device.device === 'Desktop' && '💻'}
                        {device.device === 'Mobile' && '📱'}
                        {device.device === 'Tablet' && '📱'}
                      </div>
                      <span className="font-medium">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{device.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Geographic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {displayData.geoStats.slice(0, 5).map((geo, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{geo.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${geo.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {geo.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}