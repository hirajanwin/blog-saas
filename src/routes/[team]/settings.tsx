import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { createDb, getTeamBySubdomain } from '../../lib/db'
import { teams, users } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { Settings, Users, CreditCard, Trash2, Plus } from 'lucide-react'

export const Route = createFileRoute('/team/settings')({
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

    // Get team members
    const members = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        avatarUrl: users.avatarUrl,
      })
      .from(users)
      .where(eq(users.teamId, teamData.id));

    return {
      team: teamData,
      members,
    };
  },
  component: TeamSettingsComponent,
  head: ({ loaderData }) => ({
    title: `Team Settings - ${loaderData.team.name}`,
    meta: [
      {
        name: 'robots',
        content: 'noindex, nofollow',
      },
    ],
  }),
});

function TeamSettingsComponent({ loaderData }: { loaderData: Awaited<ReturnType<typeof Route.loader>> }) {
  const { team, members } = loaderData;
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'billing'>('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const [teamData, setTeamData] = useState({
    name: team.name,
    description: '',
  });

  const handleSaveTeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      setMessage('Team settings updated successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update team settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Team Settings</h1>
              <p className="text-gray-600">Manage your team and preferences</p>
            </div>
            <a 
              href={`/${team.subdomain}`}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Back to Team
            </a>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'general' 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                  <span>General</span>
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'members' 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Members</span>
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'billing' 
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Billing</span>
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeTab === 'general' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">General Settings</h2>
                  
                  {/* Team Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    <input
                      type="text"
                      value={teamData.name}
                      onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Subdomain */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={team.subdomain}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-gray-500"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                        .blogsaas.com
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Subdomain cannot be changed</p>
                  </div>

                  {/* Plan */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                    <input
                      type="text"
                      value={team.planType}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 capitalize"
                    />
                  </div>

                  {/* AI Credits */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      AI Credits (Monthly)
                    </label>
                    <input
                      type="text"
                      value={team.aiCreditsMonthly}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>

                  <button
                    onClick={handleSaveTeam}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
                      <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span>Invite Member</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {members.map((member) => (
                      <div key={member.id} className="p-6 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                            {member.name ? member.name[0] : member.email[0]}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.name || member.email}
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : member.role === 'editor'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role}
                          </span>
                          <button className="text-red-600 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {members.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No team members yet
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing</h2>
                  
                  <div className="bg-blue-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">Current Plan</h3>
                        <p className="text-blue-700 capitalize">{team.planType}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-900">
                        {team.planType === 'free' ? 'Free' : '$29/mo'}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>{team.aiCreditsMonthly} AI credits per month</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Unlimited blogs</span>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>SEO optimization tools</span>
                      </div>
                    </div>
                  </div>

                  {team.planType === 'free' && (
                    <div className="flex justify-center">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                        Upgrade to Pro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
