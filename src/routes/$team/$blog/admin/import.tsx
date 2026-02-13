import { createFileRoute, redirect } from '@tanstack/react-router'
import { getDbFromContext, getTeamBySubdomain, mockTeam, mockBlog } from "@/lib/db"
import { blogs } from "@/lib/db/schema"
import { eq } from 'drizzle-orm'
import { useState } from 'react'
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/$team/$blog/admin/import')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const db = getDbFromContext(context);
    if (!db) {
      const t = mockTeam(team);
      return { team: t, blog: mockBlog(blog, t.id) };
    }

    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error('Team not found');
    }

    const blogData = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, blog))
      .limit(1);
    
    if (!blogData[0]) {
      throw new Error('Blog not found');
    }

    return { team: teamData, blog: blogData[0] };
  },
  component: ImportComponent,
  head: () => ({
    title: 'Import Content',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function ImportComponent() {
  const { team, blog } = Route.useLoaderData();
  const [importType, setImportType] = useState<'markdown' | 'wordpress' | 'medium' | 'json'>('markdown');
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; imported?: number } | null>(null);

  const handleImport = async () => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('blogId', blog.id);
    formData.append('type', importType);
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Successfully imported ${data.imported} posts`,
          imported: data.imported,
        });
        setFiles(null);
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'An error occurred during import',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href={`/${team.subdomain}/${blog.id}/admin`} className="text-gray-600 hover:text-gray-900">
                ← Back to Admin
              </a>
              <h1 className="text-xl font-semibold">Import Content</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Choose Import Source</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { id: 'markdown', name: 'Markdown Files', icon: FileText },
                { id: 'wordpress', name: 'WordPress', icon: Upload },
                { id: 'medium', name: 'Medium', icon: Upload },
                { id: 'json', name: 'JSON Export', icon: FileText },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setImportType(option.id as any)}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      importType === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    <div className="font-medium text-sm">{option.name}</div>
                  </button>
                );
              })}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">
                {importType === 'markdown' && 'Import Markdown Files'}
                {importType === 'wordpress' && 'Import from WordPress'}
                {importType === 'medium' && 'Import from Medium'}
                {importType === 'json' && 'Import JSON Export'}
              </h3>
              <p className="text-sm text-blue-700">
                {importType === 'markdown' && 'Upload .md files. Each file should have a title as the first heading (# Title).'}
                {importType === 'wordpress' && 'Upload WordPress export file (WXR format).'}
                {importType === 'medium' && 'Upload Medium export zip file or individual HTML files.'}
                {importType === 'json' && 'Upload a JSON export file from another Blog SaaS team.'}
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept={
                  importType === 'markdown' ? '.md,.markdown' :
                  importType === 'wordpress' ? '.xml' :
                  importType === 'medium' ? '.zip,.html' :
                  '.json'
                }
                onChange={(e) => setFiles(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  {files && files.length > 0 
                    ? `${files.length} file(s) selected`
                    : 'Drop files here or click to upload'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  {importType === 'markdown' && 'Supports .md and .markdown files'}
                  {importType === 'wordpress' && 'Supports WordPress WXR (.xml) files'}
                  {importType === 'medium' && 'Supports Medium export (.zip) or HTML files'}
                  {importType === 'json' && 'Supports JSON export files'}
                </p>
              </label>
            </div>

            {files && files.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium mb-3">Selected Files:</h3>
                <ul className="space-y-2 mb-6">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>{file.name}</span>
                      <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? 'Importing...' : `Import ${files.length} File(s)`}
                </button>
              </div>
            )}

            {result && (
              <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
                result.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                    {result.message}
                  </p>
                  {result.success && result.imported && (
                    <a
                      href={`/${team.subdomain}/${blog.id}/admin`}
                      className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                    >
                      View imported posts →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Import Tips */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="font-semibold mb-3">Import Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Files are imported as drafts by default</li>
              <li>• Images referenced in markdown won't be automatically uploaded</li>
              <li>• Large imports may take several minutes</li>
              <li>• Duplicate detection is based on post titles</li>
              <li>• Maximum file size: 10MB per file</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
