import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export interface Env {
  DB: any;
  ENVIRONMENT: string;
}

export function createDb(env: Env) {
  return drizzle(env.DB, { schema });
}

export type Db = ReturnType<typeof createDb>;

// Helper functions for common operations
export async function getTeamBySubdomain(db: Db, subdomain: string) {
  const teams = await db.select()
    .from(schema.teams)
    .where(eq(schema.teams.subdomain, subdomain))
    .limit(1);
  return teams[0] || null;
}

export async function getTeamByCustomDomain(db: Db, domain: string) {
  const teams = await db.select()
    .from(schema.teams)
    .where(eq(schema.teams.customDomain, domain))
    .limit(1);
  return teams[0] || null;
}

export async function getBlogsByTeam(db: Db, teamId: string) {
  return await db.select()
    .from(schema.blogs)
    .where(eq(schema.blogs.teamId, teamId))
    .orderBy(desc(schema.blogs.createdAt));
}

export async function getBlogWithPosts(db: Db, blogId: string, limit = 10, offset = 0) {
  const blog = await db.select()
    .from(schema.blogs)
    .where(eq(schema.blogs.id, blogId))
    .limit(1);
    
  const posts = await db.select({
    id: schema.posts.id,
    title: schema.posts.title,
    slug: schema.posts.slug,
    excerpt: schema.posts.excerpt,
    status: schema.posts.status,
    publishedAt: schema.posts.publishedAt,
    authorName: schema.users.name,
    authorAvatar: schema.users.avatarUrl,
    views: schema.posts.views,
    readingTime: schema.posts.readingTime,
    createdAt: schema.posts.createdAt,
  })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
    .where(and(
      eq(schema.posts.blogId, blogId),
      eq(schema.posts.status, 'published')
    ))
    .orderBy(desc(schema.posts.publishedAt))
    .limit(limit)
    .offset(offset);
    
  return {
    blog: blog[0] || null,
    posts,
  };
}

export async function getPostBySlug(db: Db, blogId: string, slug: string) {
  const posts = await db.select({
    id: schema.posts.id,
    title: schema.posts.title,
    slug: schema.posts.slug,
    content: schema.posts.content,
    excerpt: schema.posts.excerpt,
    status: schema.posts.status,
    metaTitle: schema.posts.metaTitle,
    metaDescription: schema.posts.metaDescription,
    ogImage: schema.posts.ogImage,
    focusKeyword: schema.posts.focusKeyword,
    seoScore: schema.posts.seoScore,
    publishedAt: schema.posts.publishedAt,
    authorName: schema.users.name,
    authorAvatar: schema.users.avatarUrl,
    views: schema.posts.views,
    readingTime: schema.posts.readingTime,
    createdAt: schema.posts.createdAt,
    updatedAt: schema.posts.updatedAt,
  })
    .from(schema.posts)
    .leftJoin(schema.users, eq(schema.posts.authorId, schema.users.id))
    .where(and(
      eq(schema.posts.blogId, blogId),
      eq(schema.posts.slug, slug),
      eq(schema.posts.status, 'published')
    ))
    .limit(1);
    
  return posts[0] || null;
}

// Need to import the eq, and, desc functions
import { eq, and, desc } from 'drizzle-orm';