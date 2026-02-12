import { createFileRoute, redirect } from '@tanstack/react-router'
import { createDb, getTeamBySubdomain, getBlogsByTeam } from '../../lib/db'
import { posts, users } from '../../lib/db/schema'
import { eq, desc, count } from 'drizzle-orm'

export const Route = createFileRoute('/team/')({
  loader: async ({ params, context }) => {
    const { team } = params;
    
    if (!team) {
      throw redirect({ to: '/' });
    }

    const env = context.env as any;
    const db = createDb(env);
    
    // Get team by subdomain
    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    // Get all blogs for this team
    const blogs = await getBlogsByTeam(db, teamData.id);

    // Get post counts for each blog
    const blogsWithStats = await Promise.all(
      blogs.map(async (blog) => {
        const postCount = await db
          .select({ count: count() })
          .from(posts)
          .where(eq(posts.blogId, blog.id));

        const publishedCount = await db
          .select({ count: count() })
          .from(posts)
          .where(eq(posts.blogId, blog.id))
          .where(eq(posts.status, 'published'));

        const totalViews = await db
          .select({ total: count() })
          .from(posts)
          .where(eq(posts.blogId, blog.id));

        return {
          ...blog,
          postCount: postCount[0]?.count || 0,
          publishedCount: publishedCount[0]?.count || 0,
          totalViews: totalViews[0]?.total || 0,
        };
      })
    );

    return {
      team: teamData,
      blogs: blogsWithStats,
    };
  },
  component: TeamComponent,
  head: ({ loaderData }) => ({
    title: `${loaderData.team.name} - Team Dashboard`,
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function TeamComponent({ loaderData }: { loaderData: Awaited<ReturnType<typeof Route.loader>> }) {
  const { team, blogs } = loaderData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Home
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Plan: <span className="font-medium capitalize">{team.planType}</span>
              </span>
              <a
                href={`/${team.subdomain}/settings`}
                className="text-gray-600 hover:text-gray-900"
              >
                Settings
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {team.name}
            </h1>
            <p className="text-gray-600">
              Manage your blogs and content
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-gray-900">
                {blogs.length}
              </div>
              <div className="text-sm text-gray-600">Total Blogs</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-green-600">
                {blogs.reduce((sum, b) => sum + b.publishedCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Published Posts</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-blue-600">
                {blogs.reduce((sum, b) => sum + b.postCount, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Posts</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-2xl font-bold text-purple-600">
                {team.aiCreditsMonthly}
              </div>
              <div className="text-sm text-gray-600">AI Credits/Month</div>
            </div>
          </div>

          {/* Blogs Grid */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Blogs</h2>
            <a
              href={`/${team.subdomain}/create-blog`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Blog</span>
            </a>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <a
                      href={`/${team.subdomain}/${blog.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {blog.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {blog.description || 'No description'}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-bold text-gray-900">{blog.postCount}</div>
                      <div className="text-xs text-gray-500">Posts</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-lg font-bold text-green-600">{blog.publishedCount}</div>
                      <div className="text-xs text-gray-500">Published</div>
                    </div>
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-lg font-bold text-blue-600">{blog.totalViews}</div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Created {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <a
                        href={`/${team.subdomain}/${blog.id}`}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        View
                      </a>
                      <a
                        href={`/${team.subdomain}/${blog.id}/admin`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        Manage →
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-lg font-medium">No blogs yet</p>
                <p className="text-sm">Create your first blog to get started</p>
              </div>
              <a
                href={`/${team.subdomain}/create-blog`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Your First Blog</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
