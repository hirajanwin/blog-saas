import { createFileRoute, redirect } from '@tanstack/react-router'
import { createDb } from '../../../../lib/db'
import { getTeamBySubdomain } from '../../../../lib/db'
import { eq, desc } from 'drizzle-orm'
import { useState } from 'react'
import AnalyticsDashboard from '../../../../components/AnalyticsDashboard'

export const Route = createFileRoute('/team/blog/admin/')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const env = context.env as any;
    const db = createDb(env);
    
    // Get team by subdomain
    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    // Get all posts for this blog (including drafts)
    const posts = await db.select()
      .from(db.schema.posts)
      .where(eq(db.schema.posts.blogId, blog))
      .orderBy(desc(db.schema.posts.createdAt));

    // Get analytics data for the dashboard
    const totalViews = posts.reduce((sum, post) => sum + (post.views || 0), 0)
    const totalUniqueViews = posts.reduce((sum, post) => sum + (post.uniqueViews || 0), 0)
    const avgTimeOnPage = posts.length > 0 
      ? posts.reduce((sum, post) => sum + (post.avgTimeOnPage || 0), 0) / posts.length 
      : 0

    return {
      team: teamData,
      blogId: blog,
      posts,
      analytics: {
        totalViews,
        totalUniqueViews,
        avgTimeOnPage,
      }
    };
  },
  component: AdminComponent,
  head: ({ loaderData }) => ({
    title: `Admin - ${loaderData.blogId}`,
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function AdminComponent({ loaderData }: { loaderData: Awaited<ReturnType<typeof Route.loader>> }) {
  const { team, blogId, posts, analytics } = loaderData;
  const [activeTab, setActiveTab] = useState<'posts' | 'analytics'>('posts');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Teams
              </a>
              <span className="text-gray-400">/</span>
              <a href={`/${team.subdomain}`} className="text-gray-600 hover:text-gray-900">
                {team.name}
              </a>
              <span className="text-gray-400">/</span>
              <a href={`/${team.subdomain}/${blogId}`} className="text-gray-600 hover:text-gray-900">
                View Blog
              </a>
            </nav>
            <a
              href={`/${team.subdomain}/${blogId}/admin/posts/new`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Post</span>
            </a>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Blog Admin
            </h1>
            <p className="text-gray-600">
              Manage your blog posts and content
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-gray-900">
                {posts.length}
              </div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600">
                {posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">Published</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-yellow-600">
                {posts.filter(p => p.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Drafts</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.totalViews}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics
              </button>
            </nav>
          </div>

          {activeTab === 'posts' ? (
            <>
              {/* Posts Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    All Posts
                  </h2>
                </div>
                
                {posts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SEO Score
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {posts.map((post) => (
                          <tr key={post.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {post.title}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {post.excerpt}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                post.status === 'published' 
                                  ? 'bg-green-100 text-green-800'
                                  : post.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {post.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`text-sm font-bold ${
                                  (post.seoScore || 0) >= 80 ? 'text-green-600' :
                                  (post.seoScore || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                  {post.seoScore || 0}/100
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {post.views || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex space-x-2">
                                <a
                                  href={`/${team.subdomain}/${blogId}/admin/posts/${post.id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </a>
                                {post.status === 'published' && (
                                  <a
                                    href={`/${team.subdomain}/${blogId}/${post.slug}`}
                                    className="text-gray-600 hover:text-gray-900"
                                    target="_blank"
                                  >
                                    View
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">
                      No posts yet
                    </div>
                    <a
                      href={`/${team.subdomain}/${blogId}/admin/posts/new`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Create Your First Post
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <AnalyticsDashboard posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
}