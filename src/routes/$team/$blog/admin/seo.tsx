import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDbFromContext, getTeamBySubdomain, mockTeam, mockBlog } from "@/lib/db"
import { posts, blogs } from "@/lib/db/schema"
import { eq, and } from 'drizzle-orm'
import { useState } from 'react'
import { 
  Search, 
  Globe, 
  Link2, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  BarChart3,
  RefreshCw
} from 'lucide-react'

export const Route = createFileRoute('/$team/$blog/admin/seo')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const db = getDbFromContext(context);
    if (!db) {
      const t = mockTeam(team);
      return { team: t, blog: mockBlog(blog, t.id), seoStats: { totalPosts: 0, withMetaTitle: 0, withMetaDescription: 0, withFocusKeyword: 0, withOgImage: 0, avgSeoScore: 0, highScore: 0, mediumScore: 0, lowScore: 0 }, issues: [], posts: [] };
    }

    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    const blogData = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, blog))
      .limit(1);
    
    if (!blogData[0]) {
      throw new Error('Blog not found');
    }

    // Get all posts with SEO data
    const allPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.blogId, blog));

    // Calculate SEO statistics
    const seoStats = {
      totalPosts: allPosts.length,
      withMetaTitle: allPosts.filter(p => p.metaTitle).length,
      withMetaDescription: allPosts.filter(p => p.metaDescription).length,
      withFocusKeyword: allPosts.filter(p => p.focusKeyword).length,
      withOgImage: allPosts.filter(p => p.ogImage).length,
      avgSeoScore: allPosts.length > 0 
        ? Math.round(allPosts.reduce((sum, p) => sum + (p.seoScore || 0), 0) / allPosts.length)
        : 0,
      highScore: allPosts.filter(p => (p.seoScore || 0) >= 80).length,
      mediumScore: allPosts.filter(p => (p.seoScore || 0) >= 60 && (p.seoScore || 0) < 80).length,
      lowScore: allPosts.filter(p => (p.seoScore || 0) < 60).length,
    };

    // Find SEO issues
    const issues = [];
    allPosts.forEach(post => {
      if (!post.metaTitle) {
        issues.push({ type: 'error', post: post.title, message: 'Missing meta title' });
      }
      if (!post.metaDescription) {
        issues.push({ type: 'warning', post: post.title, message: 'Missing meta description' });
      }
      if (!post.focusKeyword) {
        issues.push({ type: 'info', post: post.title, message: 'No focus keyword set' });
      }
      if ((post.seoScore || 0) < 50) {
        issues.push({ type: 'error', post: post.title, message: 'Low SEO score' });
      }
    });

    return {
      team: teamData,
      blog: blogData[0],
      seoStats,
      issues: issues.slice(0, 20),
      posts: allPosts,
    };
  },
  component: SEOToolsComponent,
  head: () => ({
    title: 'SEO Tools',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function SEOToolsComponent() {
  const { team, blog, seoStats, issues, posts } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'keywords'>('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href={`/${team.subdomain}/${blog.id}/admin`} className="text-gray-600 hover:text-gray-900">
                ← Back to Admin
              </a>
              <h1 className="text-xl font-semibold">SEO Tools</h1>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Analysis</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('issues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'issues'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Issues ({issues.length})
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'keywords'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Keywords
              </button>
            </nav>
          </div>

          {activeTab === 'overview' && (
            <>
              {/* SEO Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Average SEO Score</span>
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className={`text-3xl font-bold ${
                    seoStats.avgSeoScore >= 80 ? 'text-green-600' :
                    seoStats.avgSeoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {seoStats.avgSeoScore}/100
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Meta Titles</span>
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {seoStats.withMetaTitle}/{seoStats.totalPosts}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((seoStats.withMetaTitle / seoStats.totalPosts) * 100) || 0}% complete
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Meta Descriptions</span>
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {seoStats.withMetaDescription}/{seoStats.totalPosts}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((seoStats.withMetaDescription / seoStats.totalPosts) * 100) || 0}% complete
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Focus Keywords</span>
                    <Globe className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">
                    {seoStats.withFocusKeyword}/{seoStats.totalPosts}
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.round((seoStats.withFocusKeyword / seoStats.totalPosts) * 100) || 0}% complete
                  </div>
                </div>
              </div>

              {/* Score Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold mb-4">SEO Score Distribution</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="flex h-4 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500" 
                        style={{ width: `${(seoStats.highScore / seoStats.totalPosts) * 100 || 0}%` }}
                      />
                      <div 
                        className="bg-yellow-500" 
                        style={{ width: `${(seoStats.mediumScore / seoStats.totalPosts) * 100 || 0}%` }}
                      />
                      <div 
                        className="bg-red-500" 
                        style={{ width: `${(seoStats.lowScore / seoStats.totalPosts) * 100 || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span>High ({seoStats.highScore})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                    <span>Medium ({seoStats.mediumScore})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span>Low ({seoStats.lowScore})</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a 
                  href={`/${team.subdomain}/${blog.id}/sitemap.xml`}
                  target="_blank"
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Link2 className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold">View Sitemap</h3>
                  </div>
                  <p className="text-sm text-gray-600">Check your XML sitemap for search engines</p>
                </a>

                <a 
                  href={`/${team.subdomain}/${blog.id}/robots.txt`}
                  target="_blank"
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Globe className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold">View robots.txt</h3>
                  </div>
                  <p className="text-sm text-gray-600">Check your robots.txt configuration</p>
                </a>
              </div>
            </>
          )}

          {activeTab === 'issues' && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">SEO Issues</h3>
              </div>
              {issues.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {issues.map((issue, index) => (
                    <div key={index} className="px-6 py-4 flex items-start space-x-3">
                      {issue.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />}
                      {issue.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />}
                      {issue.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />}
                      <div>
                        <div className="font-medium">{issue.post}</div>
                        <div className="text-sm text-gray-600">{issue.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No SEO issues found!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Focus Keywords</h3>
              <div className="space-y-4">
                {posts.filter(p => p.focusKeyword).map(post => (
                  <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-purple-600">{post.focusKeyword}</div>
                    </div>
                    <a
                      href={`/${team.subdomain}/${blog.id}/admin/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </a>
                  </div>
                ))}
                {posts.filter(p => p.focusKeyword).length === 0 && (
                  <p className="text-gray-500 text-center py-8">No focus keywords set yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
