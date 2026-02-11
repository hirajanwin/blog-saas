import { useState, useMemo } from 'react';

interface PageView {
  id: string;
  postId: string;
  postTitle: string;
  viewedAt: string;
  referrer?: string;
  country?: string;
  device?: 'desktop' | 'mobile' | 'tablet';
}

interface AnalyticsData {
  totalViews: number;
  uniqueViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  topPosts: Array<{
    postId: string;
    title: string;
    views: number;
    uniqueViews: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
  referrers: Array<{
    source: string;
    count: number;
  }>;
  devices: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  blogId: string;
  data: AnalyticsData;
  dateRange: '7d' | '30d' | '90d' | '1y';
  onDateRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function AnalyticsDashboard({
  blogId,
  data,
  dateRange,
  onDateRangeChange,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'referrers' | 'devices'>('overview');

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Generate sparkline SVG path
  const generateSparkline = (data: number[], width: number = 100, height: number = 30) => {
    if (data.length === 0) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const StatCard = ({ title, value, change, changeType, icon }: { 
    title: string; 
    value: string | number; 
    change?: number;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${
              changeType === 'positive' ? 'text-green-600' :
              changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Privacy-friendly insights without cookies or tracking scripts
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Last</span>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as typeof dateRange)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
            <option value="90d">90 days</option>
            <option value="1y">1 year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Views"
          value={formatNumber(data.totalViews)}
          change={12.5}
          changeType="positive"
          icon="👁️"
        />
        <StatCard
          title="Unique Visitors"
          value={formatNumber(data.uniqueViews)}
          change={8.3}
          changeType="positive"
          icon="👥"
        />
        <StatCard
          title="Avg. Time on Page"
          value={formatDuration(data.avgTimeOnPage)}
          change={-2.1}
          changeType="negative"
          icon="⏱️"
        />
        <StatCard
          title="Bounce Rate"
          value={`${data.bounceRate}%`}
          change={-5.2}
          changeType="positive"
          icon="📊"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: '📈' },
              { id: 'posts', label: 'Top Posts', icon: '📝' },
              { id: 'referrers', label: 'Traffic Sources', icon: '🔗' },
              { id: 'devices', label: 'Devices', icon: '📱' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Traffic Chart */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Over Time</h3>
                <div className="h-64 flex items-end space-x-2">
                  {data.viewsByDay.map((day, index) => {
                    const maxViews = Math.max(...data.viewsByDay.map(d => d.views));
                    const height = (day.views / maxViews) * 100;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div className="relative w-full">
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all duration-300 group-hover:bg-blue-600"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {day.views} views
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 mt-2">
                          {new Date(day.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{data.topPosts.length}</div>
                  <div className="text-sm text-gray-600">Active Posts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {data.referrers.length}
                  </div>
                  <div className="text-sm text-gray-600">Traffic Sources</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {(data.totalViews / data.uniqueViews).toFixed(1)}x
                  </div>
                  <div className="text-sm text-gray-600">Views per Visitor</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Posts</h3>
              <div className="space-y-4">
                {data.topPosts.map((post, index) => (
                  <div
                    key={post.postId}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{post.title}</h4>
                        <p className="text-sm text-gray-600">
                          {formatNumber(post.views)} views • {formatNumber(post.uniqueViews)} unique
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <svg
                        className="w-24 h-8"
                        viewBox="0 0 100 30"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={generateSparkline(
                            Array.from({ length: 10 }, () => Math.floor(Math.random() * post.views / 10))
                          )}
                          fill="none"
                          stroke="#3B82F6"
                          strokeWidth="2"
                        />
                      </svg>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatNumber(post.views)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'referrers' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                {data.referrers.map((referrer) => {
                  const total = data.referrers.reduce((sum, r) => sum + r.count, 0);
                  const percentage = (referrer.count / total) * 100;
                  return (
                    <div key={referrer.source} className="flex items-center">
                      <div className="w-32 flex-shrink-0">
                        <span className="font-medium text-gray-900">{referrer.source}</span>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className="font-medium text-gray-900">{formatNumber(referrer.count)}</span>
                        <span className="text-sm text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'devices' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
              <div className="grid grid-cols-3 gap-6">
                {data.devices.map((device) => (
                  <div key={device.type} className="text-center p-6 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">
                      {device.type === 'desktop' ? '🖥️' : device.type === 'mobile' ? '📱' : '📱'}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 capitalize">{device.type}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatNumber(device.count)} visitors
                    </div>
                    <div className="text-lg font-semibold text-blue-600 mt-2">
                      {device.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900">Privacy-Friendly Analytics</h4>
            <p className="text-sm text-blue-700 mt-1">
              We don't use cookies or collect personal data. All analytics are aggregated and anonymous.
              No third-party trackers, no consent banners needed. GDPR & CCPA compliant by design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { AnalyticsData, PageView };