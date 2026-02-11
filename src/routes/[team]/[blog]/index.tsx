import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/team/blog/')({
  component: BlogComponent,
})

function BlogComponent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Blog Home
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This blog will display all published posts.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <article
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  <a href="#" className="hover:text-blue-600 transition-colors">
                    Sample Post Title {i}
                  </a>
                </h2>
                <p className="text-gray-600 mb-4">
                  This is a sample excerpt for blog post {i}. 
                  Real posts will appear here once the editor is implemented.
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Sample Author</span>
                  <span>5 min read</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}