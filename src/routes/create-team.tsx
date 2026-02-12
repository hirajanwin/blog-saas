import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { nanoid } from 'nanoid'
import { createDb } from '../../lib/db'
import { teams, users } from '../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const Route = createFileRoute('/create-team')({
  component: CreateTeamComponent,
  head: () => ({
    title: 'Create Team - Blog SaaS',
    meta: [
      {
        name: 'description',
        content: 'Create a new team and start your blog',
      },
    ],
  }),
});

function CreateTeamComponent() {
  const [formData, setFormData] = useState({
    teamName: '',
    subdomain: '',
    userName: '',
    userEmail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const validateSubdomain = (subdomain: string) => {
    const regex = /^[a-z0-9-]+$/;
    return regex.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate subdomain
      if (!validateSubdomain(formData.subdomain)) {
        throw new Error('Subdomain must be 3-30 characters, lowercase letters, numbers, and hyphens only');
      }

      // Check if subdomain is available (this would be an API call in production)
      const response = await fetch('/api/teams/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: formData.subdomain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Subdomain is not available');
      }

      // Create team
      const createResponse = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.teamName,
          subdomain: formData.subdomain,
          userName: formData.userName,
          userEmail: formData.userEmail,
        }),
      });

      if (!createResponse.ok) {
        const data = await createResponse.json();
        throw new Error(data.error || 'Failed to create team');
      }

      const data = await createResponse.json();
      
      // Redirect to the new team's dashboard
      window.location.href = `/${formData.subdomain}`;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && (!formData.teamName || !formData.subdomain)) {
      setError('Please fill in all fields');
      return;
    }
    if (step === 2 && (!formData.userName || !formData.userEmail)) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Team</h1>
          <p className="text-gray-600">Set up your blog team in minutes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  value={formData.teamName}
                  onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Team"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subdomain *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={formData.subdomain}
                    onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="my-team"
                    required
                  />
                  <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-600">
                    .blogsaas.com
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  3-30 characters, lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-gray-900">Review Your Information</h3>
                <div className="text-sm">
                  <span className="text-gray-600">Team:</span>{' '}
                  <span className="font-medium">{formData.teamName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Subdomain:</span>{' '}
                  <span className="font-medium">{formData.subdomain}.blogsaas.com</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Your Name:</span>{' '}
                  <span className="font-medium">{formData.userName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Email:</span>{' '}
                  <span className="font-medium">{formData.userEmail}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have a team?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
