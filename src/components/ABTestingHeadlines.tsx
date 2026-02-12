import { useState } from 'react'
import { 
  Split, 
  TrendingUp, 
  BarChart3, 
  Users, 
  MousePointerClick, 
  Eye, 
  Plus, 
  RotateCcw, 
  Check,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react'

interface ABTest {
  id: string
  name: string
  status: 'draft' | 'running' | 'completed' | 'winner-declared'
  variants: Variant[]
  trafficSplit: number
  startDate?: Date
  endDate?: Date
  totalVisitors: number
  confidence: number
  winner?: string
}

interface Variant {
  id: string
  headline: string
  description: string
  visitors: number
  clicks: number
  conversions: number
  ctr: number
  conversionRate: number
}

const mockTests: ABTest[] = [
  {
    id: '1',
    name: 'Homepage Headline Test',
    status: 'completed',
    variants: [
      { id: 'A', headline: 'Start Your Blog in Minutes', description: 'Original', visitors: 1500, clicks: 450, conversions: 45, ctr: 30, conversionRate: 10 },
      { id: 'B', headline: 'Launch a Professional Blog Today', description: 'More professional tone', visitors: 1500, clicks: 525, conversions: 63, ctr: 35, conversionRate: 12 }
    ],
    trafficSplit: 50,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-08'),
    totalVisitors: 3000,
    confidence: 95,
    winner: 'B'
  },
  {
    id: '2',
    name: 'CTA Button Text Test',
    status: 'running',
    variants: [
      { id: 'A', headline: 'Start Free Trial', description: 'Original', visitors: 800, clicks: 120, conversions: 24, ctr: 15, conversionRate: 20 },
      { id: 'B', headline: 'Get Started Now', description: 'More action-oriented', visitors: 800, clicks: 144, conversions: 29, ctr: 18, conversionRate: 20 }
    ],
    trafficSplit: 50,
    startDate: new Date('2024-02-10'),
    totalVisitors: 1600,
    confidence: 87
  },
  {
    id: '3',
    name: 'Social Proof Headline Test',
    status: 'draft',
    variants: [
      { id: 'A', headline: 'Join 10,000+ Bloggers', description: 'Social proof', visitors: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 },
      { id: 'B', headline: 'Create Your Blog', description: 'Direct action', visitors: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 }
    ],
    trafficSplit: 50,
    totalVisitors: 0,
    confidence: 0
  }
]

export default function ABTestingHeadlines() {
  const [tests, setTests] = useState<ABTest[]>(mockTests)
  const [showNewTestModal, setShowNewTestModal] = useState(false)
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [newTest, setNewTest] = useState({
    name: '',
    variantA: '',
    variantB: '',
    trafficSplit: 50
  })

  const handleCreateTest = () => {
    if (!newTest.name || !newTest.variantA || !newTest.variantB) return
    
    const test: ABTest = {
      id: Date.now().toString(),
      name: newTest.name,
      status: 'draft',
      variants: [
        { id: 'A', headline: newTest.variantA, description: 'Variant A', visitors: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 },
        { id: 'B', headline: newTest.variantB, description: 'Variant B', visitors: 0, clicks: 0, conversions: 0, ctr: 0, conversionRate: 0 }
      ],
      trafficSplit: newTest.trafficSplit,
      totalVisitors: 0,
      confidence: 0
    }
    
    setTests([test, ...tests])
    setNewTest({ name: '', variantA: '', variantB: '', trafficSplit: 50 })
    setShowNewTestModal(false)
  }

  const handleStartTest = (testId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'running', startDate: new Date() } 
        : t
    ))
  }

  const handleStopTest = (testId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'completed', endDate: new Date() } 
        : t
    ))
  }

  const handleDeclareWinner = (testId: string, winnerId: string) => {
    setTests(tests.map(t => 
      t.id === testId 
        ? { ...t, status: 'winner-declared', winner: winnerId, endDate: new Date() } 
        : t
    ))
  }

  const calculateUplift = (test: ABTest, variant: Variant) => {
    const baseline = test.variants[0]
    const uplift = ((variant.conversionRate - baseline.conversionRate) / baseline.conversionRate) * 100
    return uplift.toFixed(1)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'winner-declared': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Split className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">A/B Testing</h3>
          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {tests.length} tests
          </span>
        </div>
        
        <button 
          onClick={() => setShowNewTestModal(true)}
          className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          New Test
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-900">{tests.filter(t => t.status === 'running').length}</div>
          <div className="text-sm text-blue-600">Running</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-900">{tests.filter(t => t.status === 'completed' || t.status === 'winner-declared').length}</div>
          <div className="text-sm text-green-600">Completed</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-900">{tests.filter(t => t.status === 'winner-declared').length}</div>
          <div className="text-sm text-purple-600">Winners Declared</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-900">
            {tests.reduce((acc, t) => acc + t.totalVisitors, 0).toLocaleString()}
          </div>
          <div className="text-sm text-orange-600">Total Visitors</div>
        </div>
      </div>

      <div className="space-y-6">
        {tests.map(test => (
          <div key={test.id} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{test.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(test.status)}`}>
                    {test.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {test.startDate && (
                    <span>Started {test.startDate.toLocaleDateString()}</span>
                  )}
                  {test.endDate && (
                    <span>Ended {test.endDate.toLocaleDateString()}</span>
                  )}
                  <span>{test.totalVisitors.toLocaleString()} visitors</span>
                  {test.confidence > 0 && (
                    <span className="text-purple-600">{test.confidence}% confidence</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {test.status === 'draft' && (
                  <button
                    onClick={() => handleStartTest(test.id)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  >
                    Start Test
                  </button>
                )}
                {test.status === 'running' && (
                  <button
                    onClick={() => handleStopTest(test.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700"
                  >
                    Stop Test
                  </button>
                )}
                {test.status === 'completed' && test.confidence >= 90 && (
                  <div className="flex gap-2">
                    {test.variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => handleDeclareWinner(test.id, variant.id)}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700"
                      >
                        Choose {variant.id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {test.variants.map(variant => (
                <div 
                  key={variant.id}
                  className={`border-2 rounded-lg p-4 ${
                    test.winner === variant.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : test.winner 
                        ? 'border-gray-200 opacity-50' 
                        : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        variant.id === 'A' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        Variant {variant.id}
                      </span>
                      {test.winner === variant.id && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                          <Check className="w-3 h-3" />
                          Winner
                        </span>
                      )}
                    </div>
                    {test.status !== 'draft' && test.variants[0].conversionRate > 0 && (
                      <span className={`text-sm font-medium ${
                        Number(calculateUplift(test, variant)) > 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {Number(calculateUplift(test, variant)) > 0 ? '+' : ''}{calculateUplift(test, variant)}%
                      </span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900 mb-4">{variant.headline}</p>

                  {test.status !== 'draft' && (
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-gray-500">Visitors</div>
                        <div className="font-semibold">{variant.visitors.toLocaleString()}</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-gray-500">CTR</div>
                        <div className="font-semibold">{variant.ctr}%</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-gray-500">Conversions</div>
                        <div className="font-semibold">{variant.conversions}</div>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <div className="text-gray-500">Conv. Rate</div>
                        <div className={`font-semibold ${
                          variant.conversionRate >= 10 ? 'text-green-600' : 
                          variant.conversionRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {variant.conversionRate}%
                        </div>
                      </div>
                    </div>
                  )}

                  {test.status === 'draft' && (
                    <p className="text-sm text-gray-500 italic">Test not started yet</p>
                  )}
                </div>
              ))}
            </div>

            {test.status === 'running' && test.confidence < 90 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                Low confidence level ({test.confidence}%). Collect more data before making decisions.
              </div>
            )}
          </div>
        ))}
      </div>

      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create A/B Test</h3>
              <button onClick={() => setShowNewTestModal(false)} className="text-gray-500 hover:text-gray-700">
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="e.g., Homepage Headline Test"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant A <span className="text-blue-600">(Control)</span>
                  </label>
                  <textarea
                    value={newTest.variantA}
                    onChange={(e) => setNewTest({ ...newTest, variantA: e.target.value })}
                    placeholder="Enter control headline..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Variant B <span className="text-green-600">(Test)</span>
                  </label>
                  <textarea
                    value={newTest.variantB}
                    onChange={(e) => setNewTest({ ...newTest, variantB: e.target.value })}
                    placeholder="Enter test headline..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Traffic Split: {newTest.trafficSplit}% / {100 - newTest.trafficSplit}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={newTest.trafficSplit}
                  onChange={(e) => setNewTest({ ...newTest, trafficSplit: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Variant A: {newTest.trafficSplit}%</span>
                  <span>Variant B: {100 - newTest.trafficSplit}%</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateTest}
                  disabled={!newTest.name || !newTest.variantA || !newTest.variantB}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  Create Test
                </button>
                <button
                  onClick={() => setShowNewTestModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <AlertTriangle className="w-4 h-4" />
          <span>Tip: Run tests for at least 7 days or until you reach 95% confidence for accurate results.</span>
        </div>
      </div>
    </div>
  )
}