import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { createDb, getTeamBySubdomain } from "../../../../lib/db";
import { posts, blogs } from "../../../../lib/db/schema";
import { eq } from "drizzle-orm";
import EnhancedTiptapEditor from "../../../../components/editor/EnhancedTiptapEditor";
import SEOStatusBar from "../../../../components/SEOStatusBar";
import { InternalLinkingSuggestions } from "../../../../components/InternalLinkingSuggestions";
import { Editor } from "@tiptap/react";

export const Route = createFileRoute("/team/blog/admin/posts/[postId]/")({
  loader: async ({ params, context }) => {
    const { team, blog, postId } = params;
    if (!team || !blog || !postId) {
      throw redirect({ to: "/" });
    }
    const env = context.env as any;
    const db = createDb(env);
    const teamData = await getTeamBySubdomain(db, team);
    if (!teamData) {
      throw new Error("Team not found");
    }
    const blogData = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, blog))
      .limit(1);
    if (!blogData[0]) {
      throw new Error("Blog not found");
    }
    if (blogData[0].teamId !== teamData.id) {
      throw new Error("Blog not found in this team");
    }
    const postData = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!postData[0]) {
      throw new Error("Post not found");
    }
    if (postData[0].blogId !== blog) {
      throw new Error("Post not found in this blog");
    }
    return {
      team: teamData,
      blog: blogData[0],
      post: postData[0],
    };
  },
  component: EditPostComponent,
  head: ({ loaderData }) => ({
    title: `Edit: ${loaderData.post.title}`,
    meta: [
      {
        name: "robots",
        content: "noindex, nofollow",
      },
    ],
  }),
});

function EditPostComponent({
  loaderData,
}: {
  loaderData: Awaited<ReturnType<typeof Route.loader>>;
}) {
  const { team, blog, post } = loaderData;
  const [formData, setFormData] = useState({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content,
    metaTitle: post.metaTitle || "",
    metaDescription: post.metaDescription || "",
    focusKeyword: post.focusKeyword || "",
    status: post.status,
  });
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleSave = async (publish = false) => {
    if (publish) {
      setPublishing(true);
    } else {
      setSaving(true);
    }
    setError("");

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          status: publish ? "published" : formData.status,
          publishedAt:
            publish && !post.publishedAt
              ? new Date().toISOString()
              : post.publishedAt,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save post");
      }

      setLastSaved(new Date());

      if (publish) {
        setFormData({ ...formData, status: "published" });
        // Redirect to the published post
        window.location.href = `/${team.subdomain}/${blog.id}/${formData.slug}`;
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleLinkClick = (url: string) => {
    if (editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a
                href={`/${team.subdomain}/${blog.id}/admin`}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </a>
              <h1 className="text-xl font-semibold text-gray-900">Edit Post</h1>
            </div>

            <div className="flex items-center space-x-4">
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Last saved {lastSaved.toLocaleTimeString()}
                </span>
              )}

              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              {formData.status !== "published" ? (
                <button
                  onClick={() => handleSave(true)}
                  disabled={publishing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {publishing ? "Publishing..." : "Publish"}
                </button>
              ) : (
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update"}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="container mx-auto">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData({
                      ...formData,
                      title,
                      slug: formData.slug || generateSlug(title),
                    });
                  }}
                  placeholder="Post Title"
                  className="w-full text-3xl font-bold text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:border-blue-500 focus:ring-0 pb-2"
                />
              </div>

              {/* Slug */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Slug:</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="flex-1 border-0 border-b border-gray-200 focus:border-blue-500 focus:ring-0 px-0"
                />
              </div>

              {/* Editor */}
              <div className="bg-white rounded-lg border border-gray-200">
                <EnhancedTiptapEditor
                  content={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  onEditorReady={setEditor}
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief summary of your post..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      formData.status === "published"
                        ? "bg-green-100 text-green-800"
                        : formData.status === "draft"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {formData.status}
                  </span>
                </div>

                {post.publishedAt && (
                  <p className="text-sm text-gray-600">
                    Published on{" "}
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <a
                    href={`/${team.subdomain}/${blog.id}/${formData.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View Post →
                  </a>
                </div>
              </div>

              {/* SEO Settings */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  SEO Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, metaTitle: e.target.value })
                      }
                      placeholder={formData.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          metaDescription: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Focus Keyword
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeyword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          focusKeyword: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Score */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">SEO Score</h3>
                <SEOStatusBar
                  title={formData.title}
                  content={formData.content}
                  metaTitle={formData.metaTitle}
                  metaDescription={formData.metaDescription}
                  focusKeyword={formData.focusKeyword}
                />
              </div>

              {/* Internal Linking Suggestions */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <InternalLinkingSuggestions
                  blogId={blog.id}
                  content={formData.content}
                  onLinkClick={handleLinkClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
