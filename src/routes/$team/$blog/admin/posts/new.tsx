import { createFileRoute, redirect, Action } from '@tanstack/react-router'
import { getDbFromContext, getTeamBySubdomain, mockTeam, createDb } from '@/lib/db'
import { nanoid } from 'nanoid'

export const Route = createFileRoute('/$team/$blog/admin/posts/new')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const db = getDbFromContext(context);
    if (!db) {
      return { team: mockTeam(team), blogId: blog, post: null };
    }

    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    return { team: teamData, blogId: blog, post: null };
  },
  action: async ({ request, params, context }) => {
    const { team, blog } = params;
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const formData = await request.formData();
    const env = context.env as any;
    const db = createDb(env);

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const metaTitle = formData.get('metaTitle') as string;
    const metaDescription = formData.get('metaDescription') as string;
    const status = formData.get('status') as string;

    if (!title || !content) {
      return {
        success: false,
        error: 'Title and content are required',
      };
    }

    try {
      const postId = nanoid();
      
      // Create new post
      await db.insert(db.schema.posts).values({
        id: postId,
        blogId: blog,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        content,
        excerpt: excerpt || '',
        metaTitle,
        metaDescription,
        status: status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      return {
        success: true,
        postId,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create post',
      };
    }
  },
  component: PostEditorComponent,
  head: ({ loaderData }) => ({
    title: 'New Post - Admin',
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function PostEditorComponent() {
  const { team, blogId } = Route.useLoaderData();

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
              <a href={`/${team.subdomain}/${blogId}/admin`} className="text-gray-600 hover:text-gray-900">
                Admin
              </a>
            </nav>
            <div className="flex space-x-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Editor */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Post
          </h1>

          {actionData?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {actionData.error}
            </div>
          )}

          <form 
            method="POST" 
            className="space-y-6"
            onSubmit={(e) => {
              const formData = new FormData(e.currentTarget);
              
              // Simple content processing for now
              const content = formData.get('content') as string;
              if (content) {
                // Generate excerpt from content
                const plainText = content.replace(/<[^>]*>/g, '');
                const excerpt = plainText.substring(0, 160) + (plainText.length > 160 ? '...' : '');
                formData.set('excerpt', excerpt);
                
                // Calculate reading time (assuming 200 words per minute)
                const words = plainText.trim().split(/\s+/).length;
                const readingTime = Math.ceil(words / 200);
                formData.set('readingTime', readingTime.toString());
              }
            }}
          >
            {/* Basic SEO Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                SEO Settings
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your post title..."
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="url-friendly-title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to auto-generate from title
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    id="metaTitle"
                    name="metaTitle"
                    maxLength={60}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO title (60 chars max)..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows={3}
                    maxLength={160}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="SEO description (160 chars max)..."
                  />
                </div>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Content
              </h2>
              
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Write your post content here..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Basic markdown supported. Use **bold**, *italic*, # for headers
                </p>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Publishing Options
              </h2>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
                onClick={() => window.history.back()}
              >
                Cancel
              </button>
              <button
                type="submit"
                name="status"
                value="draft"
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Save Draft
              </button>
              <button
                type="submit"
                name="status"
                value="published"
                className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Publish
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}