import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/')({
  component: TeamComponent,
})

function TeamComponent() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Team Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Choose a blog to manage or create a new one
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Tech Blog', 'Personal Blog', 'Company News'].map((blogName, index) => (
            <article
              key={index}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                <a
                  href={`sample-team/${index + 1}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {blogName}
                </a>
              </h2>
              <p className="text-gray-600 mb-4">
                Sample blog description for {blogName}. 
                Click manage to access the admin area.
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created Today</span>
                <a
                  href={`sample-team/${index + 1}/admin`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Manage →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}