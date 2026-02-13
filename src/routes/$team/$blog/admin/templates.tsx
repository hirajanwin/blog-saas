import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Copy, 
  Trash2, 
  Edit2, 
  Check,
  X,
  Layout,
  BookOpen,
  Newspaper,
  Lightbulb,
  List
} from 'lucide-react'

// Pre-defined templates
const defaultTemplates = [
  {
    id: 'how-to-guide',
    name: 'How-To Guide',
    icon: BookOpen,
    description: 'Step-by-step instructional article',
    structure: {
      title: 'How to [Achieve Desired Result]',
      sections: [
        { type: 'heading', content: 'Introduction' },
        { type: 'paragraph', content: 'Explain what the reader will learn and why it matters.' },
        { type: 'heading', content: 'What You\'ll Need' },
        { type: 'bulletList', content: 'List required tools, materials, or prerequisites' },
        { type: 'heading', content: 'Step 1: [First Action]' },
        { type: 'paragraph', content: 'Detailed explanation of the first step' },
        { type: 'heading', content: 'Step 2: [Second Action]' },
        { type: 'paragraph', content: 'Detailed explanation of the second step' },
        { type: 'heading', content: 'Tips for Success' },
        { type: 'bulletList', content: 'Additional tips and best practices' },
        { type: 'heading', content: 'Conclusion' },
        { type: 'paragraph', content: 'Summarize key points and encourage action' },
      ]
    }
  },
  {
    id: 'listicle',
    name: 'Listicle',
    icon: List,
    description: 'Numbered list article format',
    structure: {
      title: 'X [Topic] That Will [Benefit]',
      sections: [
        { type: 'heading', content: 'Introduction' },
        { type: 'paragraph', content: 'Hook the reader and preview what they\'ll learn.' },
        { type: 'heading', content: '1. [First Item]' },
        { type: 'paragraph', content: 'Detailed explanation with examples' },
        { type: 'heading', content: '2. [Second Item]' },
        { type: 'paragraph', content: 'Detailed explanation with examples' },
        { type: 'heading', content: '3. [Third Item]' },
        { type: 'paragraph', content: 'Detailed explanation with examples' },
        { type: 'heading', content: 'Conclusion' },
        { type: 'paragraph', content: 'Summarize and provide final thoughts' },
      ]
    }
  },
  {
    id: 'case-study',
    name: 'Case Study',
    icon: Newspaper,
    description: 'In-depth analysis of a specific example',
    structure: {
      title: 'How [Company/Person] [Achieved Result]',
      sections: [
        { type: 'heading', content: 'Executive Summary' },
        { type: 'paragraph', content: 'Brief overview of the case study' },
        { type: 'heading', content: 'The Challenge' },
        { type: 'paragraph', content: 'Describe the problem or situation' },
        { type: 'heading', content: 'The Solution' },
        { type: 'paragraph', content: 'Explain what was done to address the challenge' },
        { type: 'heading', content: 'Implementation' },
        { type: 'paragraph', content: 'Detail the process and steps taken' },
        { type: 'heading', content: 'Results' },
        { type: 'paragraph', content: 'Present the outcomes with data' },
        { type: 'heading', content: 'Key Takeaways' },
        { type: 'bulletList', content: 'Lessons learned and actionable insights' },
      ]
    }
  },
  {
    id: 'product-review',
    name: 'Product Review',
    icon: Lightbulb,
    description: 'Comprehensive product evaluation',
    structure: {
      title: '[Product Name] Review: [Key Finding]',
      sections: [
        { type: 'heading', content: 'Quick Summary' },
        { type: 'paragraph', content: 'Overview verdict and rating' },
        { type: 'heading', content: 'Pros' },
        { type: 'bulletList', content: 'List of advantages' },
        { type: 'heading', content: 'Cons' },
        { type: 'bulletList', content: 'List of disadvantages' },
        { type: 'heading', content: 'Features Overview' },
        { type: 'paragraph', content: 'Detailed look at key features' },
        { type: 'heading', content: 'Performance' },
        { type: 'paragraph', content: 'How well it works in practice' },
        { type: 'heading', content: 'Pricing & Value' },
        { type: 'paragraph', content: 'Cost analysis and value proposition' },
        { type: 'heading', content: 'Final Verdict' },
        { type: 'paragraph', content: 'Who should buy this and why' },
      ]
    }
  },
  {
    id: 'comparison',
    name: 'Comparison Post',
    icon: Layout,
    description: 'Compare two or more options',
    structure: {
      title: '[Option A] vs [Option B]: Which is Better?',
      sections: [
        { type: 'heading', content: 'Introduction' },
        { type: 'paragraph', content: 'Set up the comparison and what\'s at stake' },
        { type: 'heading', content: 'Quick Comparison' },
        { type: 'paragraph', content: 'Side-by-side summary table' },
        { type: 'heading', content: '[Option A] Overview' },
        { type: 'paragraph', content: 'Detailed look at first option' },
        { type: 'heading', content: '[Option B] Overview' },
        { type: 'paragraph', content: 'Detailed look at second option' },
        { type: 'heading', content: 'Head-to-Head Comparison' },
        { type: 'paragraph', content: 'Category-by-category breakdown' },
        { type: 'heading', content: 'Which One Should You Choose?' },
        { type: 'paragraph', content: 'Decision framework and recommendations' },
      ]
    }
  },
];

export const Route = createFileRoute('/$team/$blog/admin/templates')({
  component: TemplatesComponent,
  head: () => ({
    title: 'Content Templates',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function TemplatesComponent() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
  });

  const allTemplates = [...defaultTemplates, ...customTemplates];

  const handleUseTemplate = (template: any) => {
    // Store selected template in session storage for the editor to use
    sessionStorage.setItem('selectedTemplate', JSON.stringify(template));
    // Redirect to new post page
    window.location.href = './posts/new';
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim()) return;

    const template = {
      id: `custom-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      icon: FileText,
      isCustom: true,
      structure: {
        title: '',
        sections: [
          { type: 'heading', content: 'Introduction' },
          { type: 'paragraph', content: 'Add your introduction here' },
        ]
      }
    };

    setCustomTemplates([...customTemplates, template]);
    setNewTemplate({ name: '', description: '' });
    setIsCreating(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates(customTemplates.filter(t => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="./" className="text-gray-600 hover:text-gray-900">
                ← Back to Admin
              </a>
              <h1 className="text-xl font-semibold">Content Templates</h1>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600 mb-8">
            Choose a template to start your post with a proven structure. Templates help you write faster and ensure you cover all essential elements.
          </p>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    {template.isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="text-sm text-gray-500">
                    {template.structure.sections.length} sections
                  </div>
                </div>
              );
            })}
          </div>

          {/* Template Preview Modal */}
          {selectedTemplate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <selectedTemplate.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
                        <p className="text-gray-600">{selectedTemplate.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTemplate(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
                    Structure Preview
                  </h3>
                  <div className="space-y-3">
                    {selectedTemplate.structure.sections.map((section: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${
                          section.type === 'heading' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <div>
                          {section.type === 'heading' ? (
                            <h4 className="font-medium">{section.content}</h4>
                          ) : (
                            <p className="text-gray-600 text-sm">{section.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex space-x-3">
                  <button
                    onClick={() => handleUseTemplate(selectedTemplate)}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Use This Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Create Template Modal */}
          {isCreating && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-semibold mb-4">Create Custom Template</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Interview Article"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Brief description of when to use this template"
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.name.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create Template
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewTemplate({ name: '', description: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
