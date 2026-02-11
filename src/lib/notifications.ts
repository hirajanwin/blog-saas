import { createFileRoute } from '@tanstack/react-router';

// Email notification service for blog platform
// Supports various notification types and email providers

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text: string;
  from?: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

// Notification types
export type NotificationType = 
  | 'post_published'
  | 'comment_added'
  | 'task_assigned'
  | 'task_completed'
  | 'lead_captured'
  | 'weekly_digest'
  | 'welcome';

// Mock email service - replace with actual provider (SendGrid, Resend, etc.)
export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  // In production, integrate with email service
  console.log('Sending email:', {
    to: notification.to,
    subject: notification.subject,
  });
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return true;
}

// Notification templates
export const templates: Record<NotificationType, NotificationTemplate> = {
  post_published: {
    id: 'post_published',
    name: 'Post Published',
    subject: 'New post published: {{postTitle}}',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Post Published! 🎉</h2>
        <p>Hi {{userName}},</p>
        <p>A new post has been published on your blog:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">{{postTitle}}</h3>
          <p style="color: #6b7280;">{{postExcerpt}}</p>
          <a href="{{postUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Read Post</a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Published by {{authorName}} on {{publishDate}}</p>
      </div>
    `,
    textTemplate: `
New Post Published!

Hi {{userName}},

A new post has been published on your blog:

"{{postTitle}}"
{{postExcerpt}}

Read the full post: {{postUrl}}

Published by {{authorName}} on {{publishDate}}
    `,
    variables: ['userName', 'postTitle', 'postExcerpt', 'postUrl', 'authorName', 'publishDate'],
  },
  
  comment_added: {
    id: 'comment_added',
    name: 'Comment Added',
    subject: 'New comment on "{{postTitle}}"',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Comment 💬</h2>
        <p>Hi {{userName}},</p>
        <p><strong>{{commenterName}}</strong> left a comment on your post "{{postTitle}}":</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <p style="margin: 0; font-style: italic;">"{{commentText}}"</p>
        </div>
        <a href="{{postUrl}}#comments" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Comment</a>
      </div>
    `,
    textTemplate: `
New Comment

Hi {{userName}},

{{commenterName}} left a comment on your post "{{postTitle}}":

"{{commentText}}"

View comment: {{postUrl}}#comments
    `,
    variables: ['userName', 'commenterName', 'postTitle', 'commentText', 'postUrl'],
  },
  
  task_assigned: {
    id: 'task_assigned',
    name: 'Task Assigned',
    subject: 'New task assigned: {{taskTitle}}',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Task Assigned 📋</h2>
        <p>Hi {{userName}},</p>
        <p>You've been assigned a new task:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">{{taskTitle}}</h3>
          <p style="color: #6b7280;">{{taskDescription}}</p>
          <p style="color: #dc2626; font-weight: bold;">Due: {{dueDate}}</p>
        </div>
        <a href="{{taskUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Task</a>
      </div>
    `,
    textTemplate: `
New Task Assigned

Hi {{userName}},

You've been assigned a new task:

Task: {{taskTitle}}
Description: {{taskDescription}}
Due: {{dueDate}}

View task: {{taskUrl}}
    `,
    variables: ['userName', 'taskTitle', 'taskDescription', 'dueDate', 'taskUrl'],
  },
  
  task_completed: {
    id: 'task_completed',
    name: 'Task Completed',
    subject: 'Task completed: {{taskTitle}}',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Task Completed ✅</h2>
        <p>Hi {{userName}},</p>
        <p><strong>{{completerName}}</strong> has completed the task:</p>
        <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #059669;">{{taskTitle}}</h3>
          <p style="color: #065f46;">Completed on {{completionDate}}</p>
        </div>
        <a href="{{taskUrl}}" style="display: inline-block; background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
      </div>
    `,
    textTemplate: `
Task Completed

Hi {{userName}},

{{completerName}} has completed the task:

"{{taskTitle}}"

Completed on {{completionDate}}

View details: {{taskUrl}}
    `,
    variables: ['userName', 'completerName', 'taskTitle', 'completionDate', 'taskUrl'],
  },
  
  lead_captured: {
    id: 'lead_captured',
    name: 'Lead Captured',
    subject: 'New lead captured: {{leadEmail}}',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">New Lead Captured 🎯</h2>
        <p>Hi {{userName}},</p>
        <p>A new lead has been captured through your form "{{formName}}":</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> {{leadEmail}}</p>
          <p style="margin: 5px 0;"><strong>Name:</strong> {{leadName}}</p>
          <p style="margin: 5px 0;"><strong>Source:</strong> {{source}}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> {{captureDate}}</p>
        </div>
        <a href="{{leadsUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View All Leads</a>
      </div>
    `,
    textTemplate: `
New Lead Captured

Hi {{userName}},

A new lead has been captured through your form "{{formName}}":

Email: {{leadEmail}}
Name: {{leadName}}
Source: {{source}}
Date: {{captureDate}}

View all leads: {{leadsUrl}}
    `,
    variables: ['userName', 'formName', 'leadEmail', 'leadName', 'source', 'captureDate', 'leadsUrl'],
  },
  
  weekly_digest: {
    id: 'weekly_digest',
    name: 'Weekly Digest',
    subject: 'Your weekly blog performance summary',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Weekly Performance Summary 📊</h2>
        <p>Hi {{userName}},</p>
        <p>Here's how your blog performed this week:</p>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #2563eb;">{{totalViews}}</div>
            <div style="color: #6b7280; font-size: 14px;">Total Views</div>
          </div>
          <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 24px; font-weight: bold; color: #059669;">{{newLeads}}</div>
            <div style="color: #6b7280; font-size: 14px;">New Leads</div>
          </div>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #111827;">Top Post</h3>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold;">{{topPostTitle}}</p>
            <p style="margin: 5px 0 0 0; color: #6b7280;">{{topPostViews}} views</p>
          </div>
        </div>
        
        <a href="{{analyticsUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Full Analytics</a>
      </div>
    `,
    textTemplate: `
Weekly Performance Summary

Hi {{userName}},

Here's how your blog performed this week:

Total Views: {{totalViews}}
New Leads: {{newLeads}}

Top Post: {{topPostTitle}} ({{topPostViews}} views)

View full analytics: {{analyticsUrl}}
    `,
    variables: ['userName', 'totalViews', 'newLeads', 'topPostTitle', 'topPostViews', 'analyticsUrl'],
  },
  
  welcome: {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Blog SaaS! 🎉',
    htmlTemplate: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111827;">Welcome to Blog SaaS! 🎉</h2>
        <p>Hi {{userName}},</p>
        <p>Thanks for joining Blog SaaS! We're excited to help you create amazing content.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2563eb;">Get Started</h3>
          <ul style="padding-left: 20px;">
            <li>Create your first blog</li>
            <li>Write your first post</li>
            <li>Customize your theme</li>
            <li>Set up your domain</li>
          </ul>
        </div>
        
        <a href="{{dashboardUrl}}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
        
        <p style="margin-top: 30px; color: #6b7280;">Need help? Reply to this email or check out our documentation.</p>
      </div>
    `,
    textTemplate: `
Welcome to Blog SaaS!

Hi {{userName}},

Thanks for joining Blog SaaS! We're excited to help you create amazing content.

Get Started:
• Create your first blog
• Write your first post
• Customize your theme
• Set up your domain

Go to dashboard: {{dashboardUrl}}

Need help? Reply to this email or check out our documentation.
    `,
    variables: ['userName', 'dashboardUrl'],
  },
};

// Render template with variables
export function renderTemplate(
  type: NotificationType,
  variables: Record<string, string>
): { subject: string; html: string; text: string } {
  const template = templates[type];
  
  let subject = template.subject;
  let html = template.htmlTemplate;
  let text = template.textTemplate;
  
  // Replace variables
  template.variables.forEach((variable) => {
    const value = variables[variable] || '';
    const regex = new RegExp(`{{${variable}}}`, 'g');
    subject = subject.replace(regex, value);
    html = html.replace(regex, value);
    text = text.replace(regex, value);
  });
  
  return { subject, html, text };
}

// Send notification by type
export async function sendNotification(
  type: NotificationType,
  to: string,
  variables: Record<string, string>,
  from?: string
): Promise<boolean> {
  const { subject, html, text } = renderTemplate(type, variables);
  
  return sendEmail({
    to,
    subject,
    html,
    text,
    from: from || 'notifications@blog-saas.com',
  });
}

// API Route for testing emails
export const Route = createFileRoute('/api/notifications/send')({
  component: async ({ request }) => {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      const { type, to, variables } = body;

      if (!type || !to || !variables) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const success = await sendNotification(type as NotificationType, to, variables);

      return new Response(
        JSON.stringify({ success, message: success ? 'Notification sent' : 'Failed to send' }),
        { status: success ? 200 : 500, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
});

export type { EmailNotification, NotificationTemplate };