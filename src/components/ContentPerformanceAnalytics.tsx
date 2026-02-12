import { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MousePointerClick,
  Clock,
  Share2,
  Heart,
  MessageSquare,
  Calendar,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

interface ContentMetrics {
  id: string
  title: string
  views: number
  uniqueVisitors: number
  avgTimeOnPage: number
  bounceRate: number
  shares: number
  likes: number
  comments: number
  conversionRate: number
  date: Date
  category: string
}

interface TimeSeriesData {
  date: string
  views: number
  visitors: number
}

const mockContent: ContentMetrics[] = [
  { id: '1', title: '10 SEO Tips for 2024', views: 15420, uniqueVisitors: 12300, avgTimeOnPage: 245, bounceRate: 35.2, shares: 234, likes: 567, comments: 45, conversionRate: 4.2, date: new Date('2024-02-01'), category: 'SEO' },
  { id: '2', title: 'How to Write Viral Content', views: 12340, uniqueVisitors: 9870, avgTimeOnPage: 312, bounceRate: 28.5, shares: 456, likes: 892, comments: 67, conversionRate: 5.8, date: new Date('2024-02-03'), category: 'Content' },
  { id: '3', title: 'Email Marketing Guide', views: 8920, uniqueVisitors: 7200, avgTimeOnPage: 198, bounceRate: 42.1, shares: 123, likes: 345, comments: 23, conversionRate: 3.1, date: new Date('2024-02-05'), category: 'Marketing' },
  { id: '4', title: 'Social Media Strategy', views: 18900, uniqueVisitors: 15200, avgTimeOnPage: 278, bounceRate: 31.8, shares: 678, likes: 1234, comments: 89, conversionRate: 6.2, date: new Date('2024-02-08'), category: 'Social Media' },
  { id: '5', title: 'Blogging for Beginners', views: 23450, uniqueVisitors: 18900, avgTimeOnPage: 420, bounceRate: 25.3, shares: 890, likes: 1567, comments: 134, conversionRate: 7.5, date: new Date('2024-02-10'), category: 'Blogging' }
]

const timeSeriesData: TimeSeriesData[] = [
  { date: '2024-01-01', views: 1200, visitors: 800 },
  { date: '2024-01-02', views: 1500, visitors: 950 },
  { date: '2024-01-03', views: 1800, visitors: 1200 },
  { date: '2024-01-04', views: 2100, visitors: 1400 },
  { date: '2024-01-05', views: 1900, visitors: 1300 },
  { date: '2024-01-06', views: 2200, visitors: 1500 },
  { date: '2024-01-07', views: 2600, visitors: 1800 }
]

const trafficSources = [
  { name: 'Organic Search', value: 45, color: '#3b82f6' },
  { name: 'Social Media', value: 28, color: '#10b981' },
  { name: 'Direct', value: 15, color: '#f59e0b' },
  { name: 'Referral', value: 8, color: '#8b5cf6' },
  { name: 'Email', value: 4, color: '#ef4444' }
]

export default function ContentPerformanceAnalytics() {
  const [dateRange, setDateRange] = useState('7d')
  const [category, setCategory] = useState('all')

  const totalViews = mockContent.reduce((acc, item) => acc + item.views, 0)
  const totalVisitors = mockContent.reduce((acc, item) => acc + item.uniqueVisitors, 0)
  const avgTimeOnPage = mockContent.reduce((acc, item) => acc + item.avgTimeOnPage, 0) / mockContent.length
  const avgConversionRate = mockContent.reduce((acc, item) => acc + item.conversionRate, 0) / mockContent.length

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return change.toFixed(1)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Content Performance Analytics</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="SEO">SEO</option>
            <option value="Content">Content</option>
            <option value="Marketing">Marketing</option>
            <option value="Social Media">Social Media</option>
            <option value="Blogging">Blogging</option>
          </select>

          <button className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-purple-600">Total Views</div>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-900">{formatNumber(totalViews)}</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            +12.5%
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-blue-600">Unique Visitors</div>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-900">{formatNumber(totalVisitors)}</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            +8.3%
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-green-600">Avg Time on Page</div>
            <Clock className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-900">{formatTime(Math.floor(avgTimeOnPage))}</div>
          <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
            <ArrowUpRight className="w-3 h-3" />
            +15.2%
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-orange-600">Conversion Rate</div>
            <MousePointerClick className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-900">{avgConversionRate.toFixed(1)}%</div>
          <div className="flex items-center gap-1 text-sm text-red-600 mt-1">
            <ArrowDownRight className="w-3 h-3" />
            -2.1%
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <h4 className="font-medium text-gray-900 mb-4">Traffic Overview</h4>
          <div className="bg-gray-50 rounded-lg p-4 h-64 flex items-end justify-around">
            {timeSeriesData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="flex gap-1 items-end h-40">
                  <div 
                    className="w-8 bg-purple-500 rounded-t"
                    style={{ height: `${(data.views / 3000) * 100}%` }}
                  ></div>
                  <div 
                    className="w-8 bg-purple-300 rounded-t"
                    style={{ height: `${(data.visitors / 3000) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{data.date.split('-')[2]}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-300 rounded"></div>
              <span className="text-sm text-gray-600">Visitors</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Traffic Sources</h4>
          <div className="space-y-3">
            {trafficSources.map(source => (
              <div key={source.name} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: source.color }}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{source.name}</span>
                    <span className="text-sm font-medium text-gray-900">{source.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="rounded-full h-2"
                      style={{ 
                        width: `${source.value}%`,
                        backgroundColor: source.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-4">Top Performing Content</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-600">Content</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Category</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Views</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Visitors</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Time</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Bounce</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Conversion</th>
                <th className="pb-3 text-sm font-medium text-gray-600">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {mockContent
                .filter(c => category === 'all' || c.category === category)
                .sort((a, b) => b.views - a.views)
                .map(content => (
                  <tr key={content.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{content.title}</div>
                      <div className="text-xs text-gray-500">{content.date.toLocaleDateString()}</div>
                    </td>
                    <td className="py-4">
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {content.category}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{formatNumber(content.views)}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{formatNumber(content.uniqueVisitors)}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-gray-900">{formatTime(content.avgTimeOnPage)}</div>
                    </td>
                    <td className="py-4">
                      <div className={`font-medium ${content.bounceRate < 30 ? 'text-green-600' : content.bounceRate < 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {content.bounceRate}%
                      </div>
                    </td>
                    <td className="py-4">
                      <div className={`font-medium ${content.conversionRate > 5 ? 'text-green-600' : content.conversionRate > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {content.conversionRate}%
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {content.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3 h-3" /> {content.shares}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {content.comments}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Performance Insights</h4>
            <p className="text-sm text-gray-600 mt-1">Your content performance is trending upward with a 12.5% increase in views.</p>
          </div>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  )
}