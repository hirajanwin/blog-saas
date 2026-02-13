import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDbFromContext, getTeamBySubdomain, getPostBySlug, mockTeam, mockBlog } from "@/lib/db"
import { blogs, users, postComments } from "@/lib/db/schema"
import { eq, desc } from 'drizzle-orm'
import PostComments from '@/components/PostComments'

export const Route = createFileRoute('/$team/$blog/$slug/')({
  loader: async ({ params, context }) => {
    const { team, blog, slug } = params;
    
    if (!team || !blog || !slug) {
      throw redirect({ to: '/' });
    }

    const db = getDbFromContext(context);
    if (!db) {
      const t = mockTeam(team);
      const b = mockBlog(blog, t.id);
      return { team: t, blog: b, post: { id: 'mock', title: slug, slug, content: '<p>Sample post content</p>', excerpt: '', metaTitle: '', metaDescription: '', ogImage: null, focusKeyword: '', seoScore: 0, publishedAt: new Date().toISOString(), authorName: 'Author', authorAvatar: null, views: 0, readingTime: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: 'published' }, comments: [] };
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

    if (blogData[0].teamId !== teamData.id) {
      throw new Error('Blog not found in this team');
    }

    const post = await getPostBySlug(db, blog, slug);
    if (!post) {
      throw new Error('Post not found');
    }

    const comments = await db
      .select({
        id: postComments.id,
        comment: postComments.comment,
        createdAt: postComments.createdAt,
        userId: postComments.userId,
        userName: users.name,
        userAvatar: users.avatarUrl,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, post.id))
      .orderBy(desc(postComments.createdAt));

    return { team: teamData, blog: blogData[0], post, comments };
  },
  component: PostComponent,
  head: ({ loaderData }) => ({
    title: loaderData?.post?.metaTitle || loaderData?.post?.title || 'Post',
    meta: [
      {
        name: 'description',
        content: loaderData?.post?.metaDescription || loaderData?.post?.excerpt || '',
      },
      {
        property: 'og:title',
        content: loaderData?.post?.metaTitle || loaderData?.post?.title || '',
      },
      {
        property: 'og:description',
        content: loaderData?.post?.metaDescription || loaderData?.post?.excerpt || '',
      },
      {
        property: 'og:image',
        content: loaderData?.post?.ogImage || '',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    ],
  }),
});

function PostComponent() {
  const { team, blog, post, comments } = Route.useLoaderData();

  // Parse content from JSON (Tiptap format)
  let contentHtml = '';
  try {
    const contentObj = JSON.parse(post.content);
    // Simple HTML conversion from Tiptap JSON
    // In production, you'd use a proper Tiptap renderer
    contentHtml = renderTiptapContent(contentObj);
  } catch (e) {
    contentHtml = `<p>${post.content}</p>`;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center space-x-4 text-sm">
            <a href={`/${team.subdomain}`} className="text-gray-600 hover:text-gray-900">
              {team.name}
            </a>
            <span className="text-gray-400">/</span>
            <a href={`/${team.subdomain}/${blog.id}`} className="text-gray-600 hover:text-gray-900">
              {blog.title}
            </a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{post.title}</span>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <header className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 pb-8">
            <div className="flex items-center space-x-4">
              {post.authorName && (
                <div className="flex items-center space-x-3">
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                      {post.authorName[0]}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-900">{post.authorName}</div>
                    {post.publishedAt && (
                      <div>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {post.readingTime && (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{post.readingTime} min read</span>
                </span>
              )}
              {post.views > 0 && (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>{post.views} views</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Tags */}
          {post.focusKeyword && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Tags:</span>
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700">
                  {post.focusKeyword}
                </span>
              </div>
            </div>
          )}

          {/* SEO Score Badge */}
          {post.seoScore > 0 && (
            <div className="mt-8 flex items-center space-x-2">
              <span className="text-sm text-gray-500">SEO Score:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                post.seoScore >= 80 ? 'bg-green-100 text-green-800' :
                post.seoScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {post.seoScore}/100
              </span>
            </div>
          )}
        </div>
      </article>

      {/* Share Section */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this post</h3>
          <div className="flex space-x-4">
            <button 
              onClick={() => shareOnTwitter(post.title, window.location.href)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Twitter</span>
            </button>
            <button 
              onClick={() => shareOnLinkedIn(post.title, window.location.href)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </button>
            <button 
              onClick={() => copyToClipboard(window.location.href)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </section>

      {/* Comments Section */}
      <section className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <PostComments 
            postId={post.id} 
            comments={comments}
            teamSubdomain={team.subdomain}
            blogId={blog.id}
            slug={post.slug}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} {blog.title}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper function to render Tiptap content
function renderTiptapContent(content: any): string {
  if (!content || !content.content) return '';
  
  return content.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        return `<p>${renderMarks(node.content)}</p>`;
      case 'heading':
        const level = node.attrs?.level || 1;
        return `<h${level}>${renderMarks(node.content)}</h${level}>`;
      case 'bulletList':
        return `<ul>${node.content.map((item: any) => `<li>${renderMarks(item.content)}</li>`).join('')}</ul>`;
      case 'orderedList':
        return `<ol>${node.content.map((item: any) => `<li>${renderMarks(item.content)}</li>`).join('')}</ol>`;
      case 'codeBlock':
        return `<pre><code>${node.content?.map((n: any) => n.text).join('') || ''}</code></pre>`;
      case 'blockquote':
        return `<blockquote>${renderMarks(node.content)}</blockquote>`;
      default:
        return '';
    }
  }).join('');
}

function renderMarks(content: any[]): string {
  if (!content) return '';
  
  return content.map((node: any) => {
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;
            case 'italic':
              text = `<em>${text}</em>`;
              break;
            case 'underline':
              text = `<u>${text}</u>`;
              break;
            case 'strike':
              text = `<s>${text}</s>`;
              break;
            case 'link':
              text = `<a href="${mark.attrs?.href || '#'}" target="_blank" rel="noopener noreferrer">${text}</a>`;
              break;
          }
        });
      }
      return text;
    }
    if (node.type === 'hardBreak') {
      return '<br>';
    }
    return '';
  }).join('');
}

// Social sharing functions
function shareOnTwitter(title: string, url: string) {
  const text = encodeURIComponent(title);
  const shareUrl = encodeURIComponent(url);
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn(title: string, url: string) {
  const shareUrl = encodeURIComponent(url);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'width=600,height=400');
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Link copied to clipboard!');
  });
}
