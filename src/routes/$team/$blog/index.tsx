import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDbFromContext, getTeamBySubdomain, getBlogWithPosts, mockTeam, mockBlog } from '@/lib/db'

export const Route = createFileRoute('/$team/$blog/')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const db = getDbFromContext(context);
    if (!db) {
      const t = mockTeam(team);
      return { team: t, blog: mockBlog(blog, t.id), posts: [] };
    }

    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    const blogData = await getBlogWithPosts(db, blog, 20, 0);
    if (!blogData.blog) {
      throw new Error('Blog not found');
    }

    if (blogData.blog.teamId !== teamData.id) {
      throw new Error('Blog not found in this team');
    }

    return { team: teamData, blog: blogData.blog, posts: blogData.posts };
  },
  component: BlogComponent,
  head: ({ loaderData }) => ({
    title: loaderData?.blog?.title || 'Blog',
    meta: [
      {
        name: 'description',
        content: loaderData?.blog?.description || 'Read the latest posts',
      },
    ],
  }),
});

function BlogComponent() {
  const { team, blog, posts } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blog Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {blog.title}
            </h1>
            {blog.description && (
              <p className="text-xl text-gray-600">
                {blog.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <a href={`/${team.subdomain}`} className="text-gray-600 hover:text-gray-900">
                {team.name}
              </a>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{blog.title}</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/${team.subdomain}/${blog.id}/admin`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Blog Posts */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {posts.length > 0 ? (
            <div className="space-y-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                    <a 
                      href={`/${team.subdomain}/${blog.id}/${post.slug}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {post.title}
                    </a>
                  </h2>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      {post.authorName && (
                        <span className="flex items-center space-x-2">
                          {post.authorAvatar ? (
                            <img 
                              src={post.authorAvatar} 
                              alt={post.authorName}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                              {post.authorName[0]}
                            </div>
                          )}
                          <span>{post.authorName}</span>
                        </span>
                      )}
                      {post.publishedAt && (
                        <span>
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      {post.readingTime && (
                        <span>{post.readingTime} min read</span>
                      )}
                      {post.views > 0 && (
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{post.views}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <p className="text-lg font-medium">No posts yet</p>
                <p className="text-sm">Check back later for new content</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} {blog.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
