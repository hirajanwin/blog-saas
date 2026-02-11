import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface LeadForm {
  id: string;
  name: string;
  type: 'newsletter' | 'popup' | 'inline' | 'slideup';
  title: string;
  description?: string;
  buttonText: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'email' | 'text' | 'name';
    required: boolean;
  }>;
  styling: {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    position?: 'bottom-right' | 'bottom-left' | 'center';
  };
  trigger?: {
    type: 'time' | 'scroll' | 'exit';
    value: number;
  };
  active: boolean;
  conversionCount: number;
}

interface LeadCapture {
  id: string;
  formId: string;
  email: string;
  name?: string;
  data: Record<string, string>;
  source: string;
  convertedAt: string;
}

interface LeadGenerationProps {
  blogId: string;
  forms: LeadForm[];
  leads: LeadCapture[];
  onCreateForm: (form: Omit<LeadForm, 'id' | 'conversionCount'>) => void;
  onUpdateForm: (formId: string, updates: Partial<LeadForm>) => void;
  onDeleteForm: (formId: string) => void;
  onToggleForm: (formId: string, active: boolean) => void;
}

export default function LeadGeneration({
  blogId,
  forms,
  leads,
  onCreateForm,
  onUpdateForm,
  onDeleteForm,
  onToggleForm,
}: LeadGenerationProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'forms' | 'leads'>('forms');
  const [newForm, setNewForm] = useState<Partial<LeadForm>>({
    type: 'newsletter',
    title: 'Subscribe to our newsletter',
    buttonText: 'Subscribe',
    fields: [{ name: 'email', label: 'Email Address', type: 'email', required: true }],
    styling: {
      backgroundColor: '#ffffff',
      textColor: '#111827',
      buttonColor: '#2563eb',
    },
    active: true,
  });

  const totalConversions = forms.reduce((sum, form) => sum + form.conversionCount, 0);
  const conversionRate = leads.length > 0 
    ? ((totalConversions / (totalConversions + 100)) * 100).toFixed(1)
    : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.title) return;

    onCreateForm(newForm as Omit<LeadForm, 'id' | 'conversionCount'>);
    setIsCreating(false);
    setNewForm({
      type: 'newsletter',
      title: 'Subscribe to our newsletter',
      buttonText: 'Subscribe',
      fields: [{ name: 'email', label: 'Email Address', type: 'email', required: true }],
      styling: {
        backgroundColor: '#ffffff',
        textColor: '#111827',
        buttonColor: '#2563eb',
      },
      active: true,
    });
  };

  const addField = () => {
    setNewForm({
      ...newForm,
      fields: [...(newForm.fields || []), { name: '', label: '', type: 'text', required: false }],
    });
  };

  const updateField = (index: number, updates: Partial<LeadForm['fields'][0]>) => {
    const updatedFields = [...(newForm.fields || [])];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    setNewForm({ ...newForm, fields: updatedFields });
  };

  const removeField = (index: number) => {
    setNewForm({
      ...newForm,
      fields: (newForm.fields || []).filter((_, i) => i !== index),
    });
  };

  const getFormTypeIcon = (type: LeadForm['type']) => {
    switch (type) {
      case 'newsletter': return '📧';
      case 'popup': return '🪟';
      case 'inline': return '📝';
      case 'slideup': return '⬆️';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{totalConversions}</div>
          <div className="text-sm text-gray-600">Total Conversions</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{conversionRate}%</div>
          <div className="text-sm text-gray-600">Conversion Rate</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-3xl font-bold text-gray-900">{forms.filter(f => f.active).length}</div>
          <div className="text-sm text-gray-600">Active Forms</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('forms')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'forms'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Lead Forms ({forms.length})
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'leads'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Captured Leads ({leads.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'forms' && (
            <div className="space-y-6">
              {/* Create Button */}
              <div className="flex justify-end">
                <Button onClick={() => setIsCreating(!isCreating)}>
                  {isCreating ? 'Cancel' : 'Create New Form'}
                </Button>
              </div>

              {/* Create Form */}
              {isCreating && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Lead Form</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                        <input
                          type="text"
                          value={newForm.name || ''}
                          onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="e.g., Newsletter Signup"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Form Type</label>
                        <select
                          value={newForm.type}
                          onChange={(e) => setNewForm({ ...newForm, type: e.target.value as LeadForm['type'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="newsletter">Newsletter</option>
                          <option value="popup">Popup</option>
                          <option value="inline">Inline</option>
                          <option value="slideup">Slide-up</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={newForm.title || ''}
                        onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="Headline for your form"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                      <textarea
                        value={newForm.description || ''}
                        onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={2}
                        placeholder="Brief description or value proposition"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                      <input
                        type="text"
                        value={newForm.buttonText || ''}
                        onChange={(e) => setNewForm({ ...newForm, buttonText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Subscribe Now"
                        required
                      />
                    </div>

                    {/* Fields */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Form Fields</label>
                        <button
                          type="button"
                          onClick={addField}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Field
                        </button>
                      </div>
                      <div className="space-y-2">
                        {newForm.fields?.map((field, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(index, { label: e.target.value })}
                              placeholder="Field label"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <select
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value as LeadForm['fields'][0]['type'] })}
                              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                              <option value="email">Email</option>
                              <option value="text">Text</option>
                              <option value="name">Name</option>
                            </select>
                            <label className="flex items-center space-x-1 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                              />
                              <span>Required</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Form</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Forms List */}
              <div className="space-y-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <span className="text-2xl">{getFormTypeIcon(form.type)}</span>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{form.name}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              form.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {form.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1">{form.title}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{form.conversionCount} conversions</span>
                            <span>•</span>
                            <span>{form.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onToggleForm(form.id, !form.active)}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            form.active
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {form.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => onDeleteForm(form.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {forms.length === 0 && !isCreating && (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-3">📧</div>
                    <p className="font-medium">No lead forms yet</p>
                    <p className="text-sm mt-1">Create your first form to start capturing leads</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'leads' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Captured Leads</h3>
                <Button variant="outline">Export CSV</Button>
              </div>

              {leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{lead.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{lead.name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{lead.source}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(lead.convertedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">👥</div>
                  <p className="font-medium">No leads captured yet</p>
                  <p className="text-sm mt-1">Leads will appear here when users submit your forms</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export type { LeadForm, LeadCapture };