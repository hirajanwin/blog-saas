import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { createDb } from '../../../lib/db'
import { posts, blogs, teams, users } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'

export const APIRoute = createAPIFileRoute('/api/export')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('teamId');
      const format = url.searchParams.get('format') || 'json';

      if (!teamId) {
        return json({ error: 'Team ID is required' }, { status: 400 });
      }

      const db = createDb(env as any);

      // Get team data
      const team = await db
        .select()
        .from(teams)
        .where(eq(teams.id, teamId))
        .limit(1);

      if (team.length === 0) {
        return json({ error: 'Team not found' }, { status: 404 });
      }

      // Get blogs
      const teamBlogs = await db
        .select()
        .from(blogs)
        .where(eq(blogs.teamId, teamId));

      // Get posts for all blogs
      const allPosts = [];
      for (const blog of teamBlogs) {
        const blogPosts = await db
          .select()
          .from(posts)
          .where(eq(posts.blogId, blog.id));
        allPosts.push(...blogPosts.map(p => ({ ...p, blogTitle: blog.title })));
      }

      // Get team members
      const members = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.teamId, teamId));

      const exportData = {
        exportedAt: new Date().toISOString(),
        team: {
          name: team[0].name,
          subdomain: team[0].subdomain,
          planType: team[0].planType,
        },
        blogs: teamBlogs.map(b => ({
          id: b.id,
          title: b.title,
          description: b.description,
          defaultLanguage: b.defaultLanguage,
        })),
        posts: allPosts.map(p => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          content: p.content,
          excerpt: p.excerpt,
          status: p.status,
          blogId: p.blogId,
          blogTitle: p.blogTitle,
          metaTitle: p.metaTitle,
          metaDescription: p.metaDescription,
          focusKeyword: p.focusKeyword,
          seoScore: p.seoScore,
          publishedAt: p.publishedAt,
          createdAt: p.createdAt,
        })),
        members: members,
      };

      if (format === 'markdown') {
        // Export as markdown files (ZIP would be better, but returning concatenated for now)
        let markdownContent = `# Export from ${team[0].name}\n\n`;
        markdownContent += `Exported: ${new Date().toLocaleString()}\n\n`;
        
        for (const post of allPosts) {
          markdownContent += `---\n\n`;
          markdownContent += `# ${post.title}\n\n`;
          markdownContent += `**Status:** ${post.status}\n`;
          markdownContent += `**Blog:** ${post.blogTitle}\n`;
          markdownContent += `**Published:** ${post.publishedAt || 'Not published'}\n\n`;
          
          if (post.excerpt) {
            markdownContent += `> ${post.excerpt}\n\n`;
          }
          
          // Convert Tiptap JSON to markdown (simplified)
          try {
            const content = JSON.parse(post.content);
            markdownContent += convertTiptapToMarkdown(content);
          } catch (e) {
            markdownContent += post.content;
          }
          
          markdownContent += `\n\n`;
        }

        return new Response(markdownContent, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${team[0].subdomain}-export.md"`,
          },
        });
      }

      // Default JSON export
      return new Response(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${team[0].subdomain}-export.json"`,
        },
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      return json({ error: 'Failed to export data' }, { status: 500 });
    }
  },
});

function convertTiptapToMarkdown(content: any): string {
  if (!content || !content.content) return '';
  
  return content.content.map((node: any) => {
    switch (node.type) {
      case 'paragraph':
        return `${renderText(node.content)}\n\n`;
      case 'heading':
        const level = node.attrs?.level || 1;
        return `${'#'.repeat(level)} ${renderText(node.content)}\n\n`;
      case 'bulletList':
        return node.content.map((item: any) => `- ${renderText(item.content)}`).join('\n') + '\n\n';
      case 'orderedList':
        return node.content.map((item: any, i: number) => `${i + 1}. ${renderText(item.content)}`).join('\n') + '\n\n';
      case 'codeBlock':
        return '```\n' + node.content?.map((n: any) => n.text).join('') + '\n```\n\n';
      case 'blockquote':
        return `> ${renderText(node.content)}\n\n`;
      default:
        return '';
    }
  }).join('');
}

function renderText(content: any[]): string {
  if (!content) return '';
  return content.map((node: any) => {
    if (node.type === 'text') {
      let text = node.text || '';
      if (node.marks) {
        node.marks.forEach((mark: any) => {
          switch (mark.type) {
            case 'bold':
              text = `**${text}**`;
              break;
            case 'italic':
              text = `*${text}*`;
              break;
            case 'code':
              text = `\`${text}\``;
              break;
          }
        });
      }
      return text;
    }
    return '';
  }).join('');
}
