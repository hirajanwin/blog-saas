import { useState, useEffect } from 'react'
import { Mail, Users, Send, Check, AlertTriangle, Clock, Plus, Trash2, BarChart3, Edit2 } from 'lucide-react'

interface Subscriber {
  id: string
  email: string
  firstName?: string
  lastName?: string
  tags: string[]
  status: 'active' | 'unsubscribed' | 'bounced'
  subscribedAt: Date
  lastOpened?: Date
}

interface Newsletter {
  id: string
  title: string
  subject: string
  content: string
  previewText?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  recipients: number
  scheduledTime?: Date
  sentAt?: Date
  openRate?: number
  clickRate?: number
}

const mockSubscribers: Subscriber[] = [
  { id: '1', email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe', tags: ['newsletter', 'premium'], status: 'active', subscribedAt: new Date('2024-01-15'), lastOpened: new Date() },
  { id: '2', email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith', tags: ['newsletter'], status: 'active', subscribedAt: new Date('2024-02-01'), lastOpened: new Date() },
  { id: '3', email: 'bob.wilson@example.com', firstName: 'Bob', lastName: 'Wilson', tags: ['newsletter', 'lead'], status: 'active', subscribedAt: new Date('2024-01-20') },
  { id: '4', email: 'alice.brown@example.com', firstName: 'Alice', lastName: 'Brown', tags: ['newsletter'], status: 'unsubscribed', subscribedAt: new Date('2024-01-10'), lastOpened: new Date('2024-02-01') },
  { id: '5', email: 'charlie.davis@example.com', firstName: 'Charlie', lastName: 'Davis', tags: ['newsletter', 'premium'], status: 'active', subscribedAt: new Date('2024-02-10'), lastOpened: new Date() }
]

const mockNewsletters: Newsletter[] = [
  { id: '1', title: 'Welcome Newsletter', subject: 'Welcome to Blog SaaS!', content: 'Thanks for joining us...', status: 'sent', recipients: 5, sentAt: new Date('2024-01-16'), openRate: 68, clickRate: 24 },
  { id: '2', title: 'Weekly Roundup #1', subject: 'This Week\'s Best Content', content: 'Check out our latest articles...', status: 'sent', recipients: 5, sentAt: new Date('2024-01-23'), openRate: 52, clickRate: 18 },
  { id: '3', title: 'SEO Tips Guide', subject: 'Master SEO in 2024', content: 'Learn the latest SEO strategies...', status: 'draft', recipients: 0 },
  { id: '4', title: 'Content Strategy Tips', subject: 'How to Create Viral Content', content: 'Discover the secrets to viral content...', status: 'scheduled', recipients: 5, scheduledTime: new Date(Date.now() + 86400000) }
]

export default function EmailNewsletterIntegration() {
  const [activeTab, setActiveTab] = useState<'newsletters' | 'subscribers' | 'stats'>('newsletters')
  const [subscribers, setSubscribers] = useState<Subscriber[]>(mockSubscribers)
  const [newsletters, setNewsletters] = useState<Newsletter[]>(mockNewsletters)
  const [showNewNewsletterModal, setShowNewNewsletterModal] = useState(false)
  const [showNewSubscriberModal, setShowNewSubscriberModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newSubscriber, setNewSubscriber] = useState({ email: '', firstName: '', lastName: '', tags: '' })
  const [newNewsletter, setNewNewsletter] = useState({ 
    title: '', 
    subject: '', 
    previewText: '', 
    content: '' 
  })

  const stats = {
    totalSubscribers: subscribers.filter(s => s.status === 'active').length,
    totalNewslettersSent: newsletters.filter(n => n.status === 'sent').length,
    avgOpenRate: newsletters.filter(n => n.status === 'sent' && n.openRate)
      .reduce((acc, n) => acc + (n.openRate || 0), 0) / newsletters.filter(n => n.status === 'sent' && n.openRate).length || 0,
    avgClickRate: newsletters.filter(n => n.status === 'sent' && n.clickRate)
      .reduce((acc, n) => acc + (n.clickRate || 0), 0) / newsletters.filter(n => n.status === 'sent' && n.clickRate).length || 0
  }

  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) return
    
    const subscriber: Subscriber = {
      id: Date.now().toString(),
      email: newSubscriber.email,
      firstName: newSubscriber.firstName || undefined,
      lastName: newSubscriber.lastName || undefined,
      tags: newSubscriber.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'active',
      subscribedAt: new Date()
    }
    
    setSubscribers([subscriber, ...subscribers])
    setNewSubscriber({ email: '', firstName: '', lastName: '', tags: '' })
    setShowNewSubscriberModal(false)
  }

  const handleDeleteSubscriber = (id: string) => {
    setSubscribers(subscribers.filter(s => s.id !== id))
  }

  const handleCreateNewsletter = async () => {
    if (!newNewsletter.title || !newNewsletter.subject || !newNewsletter.content) return
    
    const newsletter: Newsletter = {
      id: Date.now().toString(),
      title: newNewsletter.title,
      subject: newNewsletter.subject,
      previewText: newNewsletter.previewText,
      content: newNewsletter.content,
      status: 'draft',
      recipients: 0
    }
    
    setNewsletters([newsletter, ...newsletters])
    setNewNewsletter({ title: '', subject: '', previewText: '', content: '' })
    setShowNewNewsletterModal(false)
  }

  const handleSendNewsletter = async (id: string) => {
    setNewsletters(newsletters.map(n => 
      n.id === id ? { ...n, status: 'sent', sentAt: new Date(), recipients: subscribers.filter(s => s.status === 'active').length } : n
    ))
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Email Newsletter</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {stats.totalSubscribers} subscribers
          </span>
        </div>
        <button 
          onClick={() => setShowNewNewsletterModal(true)}
          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Newsletter
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        {(['newsletters', 'subscribers', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-1 text-sm font-medium capitalize transition-colors ${
              activeTab === tab 
                ? 'text-purple-600 border-b-2 border-purple-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'newsletters' && (
        <div className="space-y-4">
          {newsletters.map(newsletter => (
            <div key={newsletter.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{newsletter.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      newsletter.status === 'sent' ? 'bg-green-100 text-green-800' :
                      newsletter.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      newsletter.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {newsletter.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Subject: {newsletter.subject}</p>
                  
                  {newsletter.sentAt && (
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Sent {formatTimeAgo(newsletter.sentAt)}</span>
                      <span>{newsletter.recipients} recipients</span>
                      {newsletter.openRate && <span>{newsletter.openRate}% opened</span>}
                      {newsletter.clickRate && <span>{newsletter.clickRate}% clicked</span>}
                    </div>
                  )}

                  {newsletter.scheduledTime && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Clock className="w-3 h-3" />
                      Scheduled for {newsletter.scheduledTime.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {newsletter.status === 'draft' && (
                    <button
                      onClick={() => handleSendNewsletter(newsletter.id)}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                  <button className="text-gray-600 hover:text-gray-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewSubscriberModal(true)}
                className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Add Subscriber
              </button>
            </div>
          </div>

          {subscribers.map(subscriber => (
            <div key={subscriber.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-medium">
                  {subscriber.firstName?.[0] || subscriber.email[0].toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {subscriber.firstName} {subscriber.lastName}
                  </div>
                  <div className="text-sm text-gray-600">{subscriber.email}</div>
                  <div className="flex gap-1 mt-1">
                    {subscriber.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  subscriber.status === 'active' ? 'bg-green-100 text-green-800' :
                  subscriber.status === 'unsubscribed' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {subscriber.status}
                </span>
                <button
                  onClick={() => handleDeleteSubscriber(subscriber.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-900">{stats.totalSubscribers}</div>
            <div className="text-sm text-purple-600">Active Subscribers</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-900">{stats.totalNewslettersSent}</div>
            <div className="text-sm text-blue-600">Newsletters Sent</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-900">{stats.avgOpenRate.toFixed(1)}%</div>
            <div className="text-sm text-green-600">Avg Open Rate</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-orange-900">{stats.avgClickRate.toFixed(1)}%</div>
            <div className="text-sm text-orange-600">Avg Click Rate</div>
          </div>
        </div>
      )}

      {showNewNewsletterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Newsletter</h3>
              <button onClick={() => setShowNewNewsletterModal(false)} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newNewsletter.title}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={newNewsletter.subject}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preview Text</label>
                <input
                  type="text"
                  value={newNewsletter.previewText}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, previewText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={newNewsletter.content}
                  onChange={(e) => setNewNewsletter({ ...newNewsletter, content: e.target.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewsletter}
                  disabled={!newNewsletter.title || !newNewsletter.subject || !newNewsletter.content}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => setShowNewNewsletterModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewSubscriberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Subscriber</h3>
              <button onClick={() => setShowNewSubscriberModal(false)} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={newSubscriber.firstName}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newSubscriber.lastName}
                    onChange={(e) => setNewSubscriber({ ...newSubscriber, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newSubscriber.tags}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, tags: e.target.value })}
                  placeholder="newsletter, premium, lead"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddSubscriber}
                  disabled={!newSubscriber.email}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  Add Subscriber
                </button>
                <button
                  onClick={() => setShowNewSubscriberModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}