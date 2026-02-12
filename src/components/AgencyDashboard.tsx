import React, { useState, useEffect } from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { 
  Users, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Settings,
  ChevronRight,
  MoreHorizontal,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface AgencyClient {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  clientCompany?: string
  status: string
  monthlyFee: number
  notes?: string
  createdAt: string
}

interface AgencyOverview {
  totalClients: number
  activeOperations: number
  monthlyRevenue: number
  activeClients: number
}

interface AgencyDashboardProps {
  agencyId: string
}

export default function AgencyDashboard({ agencyId }: AgencyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'billing' | 'branding'>('overview')
  const [loading, setLoading] = useState(false)
  const [overview, setOverview] = useState<AgencyOverview | null>(null)
  const [clients, setClients] = useState<AgencyClient[]>([])
  const [showAddClient, setShowAddClient] = useState(false)

  useEffect(() => {
    fetchAgencyData()
  }, [agencyId])

  const fetchAgencyData = async () => {
    try {
      setLoading(true)
      
      // Fetch overview
      const overviewResponse = await fetch(`/api/agency/management?agencyId=${agencyId}`)
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData.overview)
      }

      // Fetch clients
      const clientsResponse = await fetch(`/api/agency/management?agencyId=${agencyId}&action=clients`)
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json()
        setClients(clientsData.clients || [])
      }
    } catch (error) {
      console.error('Error fetching agency data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = async (clientData: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/agency/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          action: 'create_client',
          data: clientData
        })
      })

      if (response.ok) {
        fetchAgencyData()
        setShowAddClient(false)
      }
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Agency Dashboard</h1>
          <p className="text-muted-foreground">
            Manage clients, billing, and white-label branding
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveTab('branding')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Branding
          </Button>
          <Button
            onClick={() => setShowAddClient(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.totalClients || 0}</div>
            <p className="text-xs text-muted-foreground">
              {overview?.activeClients || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(overview?.monthlyRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Active Operations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.activeOperations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Running in background
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">+12%</div>
            <p className="text-xs text-muted-foreground">
              vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          {[
            { id: 'clients', label: 'Clients', icon: Users },
            { id: 'billing', label: 'Billing', icon: DollarSign },
            { id: 'branding', label: 'Branding', icon: Building2 }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          {clients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Clients Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start adding clients to your agency
                </p>
                <Button onClick={() => setShowAddClient(true)}>
                  Add Your First Client
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {clients.map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {client.clientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{client.clientName}</h3>
                            <Badge className={getStatusColor(client.status)}>
                              {client.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {client.clientEmail}
                            </span>
                            {client.clientCompany && (
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {client.clientCompany}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(client.monthlyFee)}</div>
                          <p className="text-xs text-muted-foreground">/month</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Billing Analytics</h3>
            <p className="text-muted-foreground mb-4">
              View revenue, profit margins, and payment history
            </p>
            <Button variant="outline">
              View Full Analytics
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Branding Tab */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>White-Label Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Logo URL</label>
                <input
                  type="text"
                  placeholder="https://your-agency.com/logo.png"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-10 h-10 rounded cursor-pointer"
                    defaultValue="#3b82f6"
                  />
                  <input
                    type="text"
                    placeholder="#3b82f6"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Custom Domain</label>
                <input
                  type="text"
                  placeholder="blog.your-agency.com"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="removeBranding"
                  className="rounded"
                />
                <label htmlFor="removeBranding" className="text-sm">
                  Remove platform branding
                </label>
              </div>
              <Button className="w-full">
                Save Branding Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold">Your Brand</h3>
                  <p className="text-sm text-muted-foreground">blog.your-agency.com</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Logo</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Custom Colors</span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Custom Domain</span>
                    <Clock className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Branding Removed</span>
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add New Client</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.currentTarget)
                  handleCreateClient({
                    clientName: formData.get('clientName'),
                    clientEmail: formData.get('clientEmail'),
                    clientPhone: formData.get('clientPhone'),
                    clientCompany: formData.get('clientCompany'),
                    monthlyFee: parseInt(formData.get('monthlyFee') as string) * 100, // Convert to cents
                    createTeam: formData.get('createTeam') === 'on',
                    teamName: formData.get('teamName'),
                    subdomain: formData.get('subdomain')
                  })
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-sm font-medium mb-2 block">Client Name *</label>
                  <input
                    name="clientName"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <input
                    name="clientEmail"
                    type="email"
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Company</label>
                  <input
                    name="clientCompany"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Company Inc."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <input
                    name="clientPhone"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Monthly Fee ($)</label>
                  <input
                    name="monthlyFee"
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="99"
                  />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      name="createTeam"
                      id="createTeam"
                      className="rounded"
                    />
                    <label htmlFor="createTeam" className="text-sm font-medium">
                      Create blog team for client
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Team Name</label>
                      <input
                        name="teamName"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Client Blog"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subdomain</label>
                      <input
                        name="subdomain"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="client"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddClient(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Client'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}