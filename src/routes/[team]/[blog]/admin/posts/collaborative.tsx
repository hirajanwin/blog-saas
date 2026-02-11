import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import EnhancedTiptapEditor from '@/components/editor/EnhancedTiptapEditor';
import PostComments, { Comment } from '@/components/PostComments';
import ContentTasks, { Task } from '@/components/ContentTasks';
import AIContentAssistant from '@/components/AIContentAssistant';
import ImageUploader from '@/components/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export const Route = createFileRoute('/team/blog/admin/posts/collaborative')({
  component: CollaborativeEditor,
  head: () => ({
    title: 'Collaborative Editor',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

// Mock data - in production, fetch from API
const mockComments: Comment[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Chen',
    comment: 'Great introduction! Maybe add a hook in the first paragraph?',
    resolved: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Johnson',
    comment: 'The statistics in section 3 need updating with 2024 data.',
    resolved: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Update meta description',
    description: 'Make it more compelling for CTR',
    status: 'in_progress',
    priority: 'high',
    assignedTo: { id: 'user1', name: 'Sarah Chen' },
    createdBy: { id: 'user1', name: 'Sarah Chen' },
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Add internal links',
    status: 'todo',
    priority: 'medium',
    createdBy: { id: 'user2', name: 'Mike Johnson' },
    createdAt: new Date().toISOString(),
  },
];

const mockTeamMembers = [
  { id: 'user1', name: 'Sarah Chen', avatar: '' },
  { id: 'user2', name: 'Mike Johnson', avatar: '' },
  { id: 'user3', name: 'Emma Wilson', avatar: '' },
];

function CollaborativeEditor() {
  const [formData, setFormData] = useState({
    title: 'Sample Blog Post',
    content: '<h1>Introduction</h1><p>Start writing your amazing content here...</p>',
    status: 'draft' as 'draft' | 'in_review' | 'approved' | 'published',
    metaTitle: '',
    metaDescription: '',
  });

  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [activeTab, setActiveTab] = useState<'editor' | 'comments' | 'tasks' | 'ai'>('editor');
  const [seoScore, setSeoScore] = useState(0);

  // Workflow status transitions
  const workflowSteps = [
    { id: 'draft', label: 'Draft', color: 'bg-gray-500' },
    { id: 'in_review', label: 'In Review', color: 'bg-yellow-500' },
    { id: 'approved', label: 'Approved', color: 'bg-blue-500' },
    { id: 'published', label: 'Published', color: 'bg-green-500' },
  ];

  const handleAddComment = (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
  };

  const handleResolveComment = (commentId: string) => {
    setComments(comments.map(c => 
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
  };

  const handleAddTask = (task: Omit<Task, 'id' | 'createdAt' | 'createdBy'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      createdBy: { id: 'current-user', name: 'Current User' },
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleStatusChange = (newStatus: typeof formData.status) => {
    setFormData({ ...formData, status: newStatus });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {formData.title || 'Untitled Post'}
              </h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                workflowSteps.find(s => s.id === formData.status)?.color || 'bg-gray-500'
              } text-white`}>
                {workflowSteps.find(s => s.id === formData.status)?.label}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Workflow Actions */}
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value as typeof formData.status)}
                className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {workflowSteps.map(step => (
                  <option key={step.id} value={step.id}>{step.label}</option>
                ))}
              </select>

              <Button variant="outline">Save Draft</Button>
              <Button>Publish</Button>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-1">
                {[
                  { id: 'editor', label: 'Editor', icon: '📝' },
                  { id: 'comments', label: 'Comments', icon: '💬', badge: comments.filter(c => !c.resolved).length },
                  { id: 'tasks', label: 'Tasks', icon: '✅', badge: tasks.filter(t => t.status !== 'done').length },
                  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as typeof activeTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        activeTab === item.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </nav>

              {/* SEO Score */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{seoScore}</div>
                  <div className="text-sm text-gray-600">SEO Score</div>
                  <div className={`text-xs mt-1 ${
                    seoScore >= 80 ? 'text-green-600' : seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {seoScore >= 80 ? 'Excellent' : seoScore >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Comments</span>
                  <span className="font-medium">{comments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tasks</span>
                  <span className="font-medium">{tasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Words</span>
                  <span className="font-medium">{formData.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 'editor' && (
              <div className="space-y-6">
                {/* Post Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Post Settings</h2>
                  <div className="space-y-4">
                    <Input
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter post title..."
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Meta Title"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                        placeholder="SEO title..."
                      />
                      <Textarea
                        label="Meta Description"
                        value={formData.metaDescription}
                        onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                        placeholder="SEO description..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h2>
                  <ImageUploader
                    onUpload={(url, alt) => console.log('Upload:', url, alt)}
                  />
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
                  <EnhancedTiptapEditor
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    onSEOChange={(analysis) => setSeoScore(analysis.score)}
                    placeholder="Write your post content here..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <PostComments
                postId="post-1"
                comments={comments}
                currentUserId="current-user"
                onAddComment={handleAddComment}
                onResolveComment={handleResolveComment}
                onDeleteComment={handleDeleteComment}
              />
            )}

            {activeTab === 'tasks' && (
              <ContentTasks
                postId="post-1"
                tasks={tasks}
                teamMembers={mockTeamMembers}
                currentUserId="current-user"
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeTab === 'ai' && (
              <AIContentAssistant
                content={formData.content}
                title={formData.title}
                onContentUpdate={(content) => setFormData({ ...formData, content })}
                onTitleUpdate={(title) => setFormData({ ...formData, title })}
                onMetaUpdate={(meta) => setFormData({ ...formData, metaTitle: meta.title, metaDescription: meta.description })}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborativeEditor;