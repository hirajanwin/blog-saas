import { createFileRoute, redirect } from '@tanstack/react-router'
import { createDb } from '../../../../../lib/db'
import { getTeamBySubdomain } from '../../../../../lib/db'
import { nanoid } from 'nanoid'
import EnhancedTiptapEditor from '../../../../../components/editor/EnhancedTiptapEditor'
import { Button } from '../../../../../components/ui/Button'
import { Input } from '../../../../../components/ui/Input'
import { Textarea } from '../../../../../components/ui/Textarea'

export const Route = createFileRoute('/team/blog/admin/posts/enhanced-new')({
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

    return {
      team: teamData,
      blogId: blog,
      post: null, // New post
    };
  },
  component: EnhancedPostEditorComponent,
  head: ({ loaderData }) => ({
    title: 'Create New Post - SEO Enhanced',
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function EnhancedPostEditorComponent({ 
  loaderData, 
  actionData 
}: { 
  loaderData: Awaited<ReturnType<typeof Route.loader>>
  actionData?: Awaited<ReturnType<typeof Route.action>>
}) {
  const { team, blogId } = loaderData;
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'draft',
  });

  const [seoAnalysis, setSEOAnalysis] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSEOChange = useCallback((analysis: any) => {
    setSEOAnalysis(analysis);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate saving - in real implementation, this would call API
    setTimeout(() => {
      alert('Post saved successfully!');
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-4 text-sm">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Admin
              </button>
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

      {/* Editor with SEO Integration */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex space-x-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Create New Post
              </h1>

              {actionData?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                  {actionData.error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* SEO Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    SEO Settings
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      AUTO-OPTIMIZED
                    </span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Title *"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter your post title..."
                        required
                      />
                    </div>

                    <div>
                      <Input
                        label="URL Slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="url-friendly-title"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to auto-generate from title
                      </p>
                    </div>

                    <div>
                      <Input
                        label="Meta Title"
                        value={formData.metaTitle}
                        onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                        maxLength={60}
                        placeholder="SEO title (60 chars max)..."
                      />
                    </div>

                    <div>
                      <Textarea
                        label="Meta Description"
                        value={formData.metaDescription}
                        onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                        rows={3}
                        maxLength={160}
                        placeholder="SEO description (160 chars max)..."
                      />
                    </div>
                  </div>
                </div>

                {/* Enhanced Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Content (with Real-time SEO Analysis)
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <EnhancedTiptapEditor
                      value={formData.content}
                      onChange={(value) => handleInputChange('content', value)}
                      onSEOChange={handleSEOChange}
                      placeholder="Write your post content here..."
                      className="min-h-[500px]"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enhanced editor with markdown shortcuts and real-time SEO analysis
                    </p>
                  </div>
                </div>

                {/* Publishing Options */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Publishing Options
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isSubmitting || !formData.title || !formData.content}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.title || !formData.content}
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish'}
                  </Button>
                </div>
              </form>
            </div>

            {/* SEO Sidebar */}
            <div className="w-80 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  SEO Analysis
                </h2>

                {seoAnalysis && (
                  <>
                    {/* Score Overview */}
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        {seoAnalysis.score}
                      </div>
                      <div className="text-sm text-gray-600">
                        SEO Score (0-100)
                      </div>
                    </div>

                    {/* SEO Status Bar */}
                    {/* This would be the SEOStatusBar component */}
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <span className="text-sm text-gray-600">Current Score</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-2xl font-bold ${
                                seoAnalysis.score >= 80 ? 'text-green-600' :
                                seoAnalysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {seoAnalysis.score}/100
                              </span>
                              <span className={`text-sm font-medium ${
                                seoAnalysis.score >= 80 ? 'text-green-600' :
                                seoAnalysis.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {seoAnalysis.score >= 80 ? 'Excellent' :
                                 seoAnalysis.score >= 60 ? 'Good' :
                                 seoAnalysis.score >= 40 ? 'Fair' : 'Poor'}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {seoAnalysis.wordCount} words • {seoAnalysis.readingTime} min read
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Issues */}
                    {seoAnalysis.issues && seoAnalysis.issues.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Issues ({seoAnalysis.issues.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {seoAnalysis.issues.map((issue, index) => (
                            <div
                              key={index}
                              className={`flex items-start space-x-2 p-3 rounded-md ${
                                issue.type === 'error' ? 'bg-red-50 border-red-200' :
                                issue.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${
                                issue.type === 'error' ? 'bg-red-600' :
                                issue.type === 'warning' ? 'bg-yellow-600' :
                                'bg-blue-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className={`text-sm font-medium ${
                                  issue.type === 'error' ? 'text-red-900' :
                                  issue.type === 'warning' ? 'text-yellow-900' :
                                  'text-blue-900'
                                }`}>
                                  {issue.message}
                                </div>
                                <div className={`text-xs ${
                                  issue.type === 'error' ? 'text-red-700' :
                                  issue.type === 'warning' ? 'text-yellow-700' :
                                  'text-blue-700'
                                }`}>
                                  {issue.recommendation}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Suggestions */}
                    {seoAnalysis.suggestions && seoAnalysis.suggestions.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Suggestions ({seoAnalysis.suggestions.length})
                        </h4>
                        <div className="space-y-2">
                          {seoAnalysis.suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md"
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-blue-900">
                                  {suggestion}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}