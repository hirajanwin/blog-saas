import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { createDb, getTeamBySubdomain } from '../../lib/db'
import { blogs } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/team/create-blog')({
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

    return {
      team: teamData,
    };
  },
  component: CreateBlogComponent,
  head: ({ loaderData }) => ({
    title: `Create Blog - ${loaderData.team.name}`,
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function CreateBlogComponent({ loaderData }: { loaderData: Awaited<ReturnType<typeof Route.loader>> }) {
  const { team } = loaderData;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    primaryColor: '#3b82f6',
    language: 'en',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.title.trim()) {
        throw new Error('Blog title is required');
      }

      const response = await fetch(`/api/blogs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          title: formData.title,
          description: formData.description,
          primaryColor: formData.primaryColor,
          language: formData.language,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create blog');
      }

      const data = await response.json();
      
      // Redirect to the new blog's admin page
      window.location.href = `/${team.subdomain}/${data.blog.id}/admin`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Indigo', value: '#6366f1' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <a href={`/${team.subdomain}`} className="text-gray-600 hover:text-gray-900">
              ← Back to Team
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create New Blog
            </h1>
            <p className="text-gray-600">
              Set up a new blog for {team.name}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blog Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="My Awesome Blog"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="A brief description of your blog..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, primaryColor: color.value })}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.primaryColor === color.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Language
              </label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
              <div 
                className="bg-white rounded-lg border border-gray-200 p-4"
                style={{ borderLeft: `4px solid ${formData.primaryColor}` }}
              >
                <h4 className="text-lg font-semibold text-gray-900">
                  {formData.title || 'Your Blog Title'}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {formData.description || 'Your blog description will appear here...'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Blog'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
