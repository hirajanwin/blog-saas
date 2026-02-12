import { createFileRoute, redirect } from '@tanstack/react-router'
import { createDb, getTeamBySubdomain } from '../../../../lib/db'
import { posts, blogs } from '../../../../lib/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { useState } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

export const Route = createFileRoute('/team/blog/admin/calendar')({
  loader: async ({ params, context }) => {
    const { team, blog } = params;
    
    if (!team || !blog) {
      throw redirect({ to: '/' });
    }

    const env = context.env as any;
    const db = createDb(env);
    
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

    // Get scheduled and draft posts
    const scheduledPosts = await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.blogId, blog),
        eq(posts.status, 'scheduled')
      ));

    const draftPosts = await db
      .select()
      .from(posts)
      .where(and(
        eq(posts.blogId, blog),
        eq(posts.status, 'draft')
      ));

    return {
      team: teamData,
      blog: blogData[0],
      scheduledPosts,
      draftPosts,
    };
  },
  component: ContentCalendarComponent,
  head: () => ({
    title: 'Content Calendar',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }],
  }),
});

function ContentCalendarComponent({ loaderData }: { loaderData: Awaited<ReturnType<typeof Route.loader>> }) {
  const { team, blog, scheduledPosts, draftPosts } = loaderData;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const renderCalendar = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-200"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayPosts = getPostsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div 
          key={day} 
          className={`h-32 border border-gray-200 p-2 overflow-y-auto ${
            isToday ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          {dayPosts.map(post => (
            <a
              key={post.id}
              href={`/${team.subdomain}/${blog.id}/admin/posts/${post.id}`}
              className="block text-xs p-1 mb-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200 truncate"
              title={post.title}
            >
              {post.title}
            </a>
          ))}
        </div>
      );
    }

    return days;
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
              <h1 className="text-xl font-semibold">Content Calendar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('month')}
                  className={`px-3 py-1 rounded-md text-sm ${view === 'month' ? 'bg-white shadow' : ''}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-3 py-1 rounded-md text-sm ${view === 'week' ? 'bg-white shadow' : ''}`}
                >
                  Week
                </button>
              </div>
              <a
                href={`/${team.subdomain}/${blog.id}/admin/posts/new`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>New Post</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Calendar Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold">
              {monthNames[month]} {year}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7">
            {renderCalendar()}
          </div>
        </div>

        {/* Upcoming Posts */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Scheduled Posts ({scheduledPosts.length})
            </h3>
            {scheduledPosts.length > 0 ? (
              <div className="space-y-3">
                {scheduledPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500">
                        {post.scheduledAt && new Date(post.scheduledAt).toLocaleString()}
                      </div>
                    </div>
                    <a
                      href={`/${team.subdomain}/${blog.id}/admin/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No scheduled posts</p>
            )}
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Drafts ({draftPosts.length})
            </h3>
            {draftPosts.length > 0 ? (
              <div className="space-y-3">
                {draftPosts.slice(0, 5).map(post => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-sm text-gray-500">
                        Last edited: {new Date(post.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <a
                      href={`/${team.subdomain}/${blog.id}/admin/posts/${post.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Edit
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No drafts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
