import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'

// Simple in-memory webhook storage (in production, use database)
const webhooks: Map<string, any[]> = new Map();

export const APIRoute = createAPIFileRoute('/api/webhooks')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('teamId');

      if (!teamId) {
        return json({ error: 'Team ID is required' }, { status: 400 });
      }

      const teamWebhooks = webhooks.get(teamId) || [];

      return json({
        success: true,
        webhooks: teamWebhooks,
      });
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      return json({ error: 'Failed to fetch webhooks' }, { status: 500 });
    }
  },

  POST: async ({ request, env }) => {
    try {
      const { teamId, url: webhookUrl, events, secret } = await request.json();

      if (!teamId || !webhookUrl || !events || !Array.isArray(events)) {
        return json(
          { error: 'Team ID, URL, and events are required' },
          { status: 400 }
        );
      }

      const webhookId = nanoid();
      const webhook = {
        id: webhookId,
        teamId,
        url: webhookUrl,
        events,
        secret: secret || nanoid(32),
        active: true,
        createdAt: new Date().toISOString(),
      };

      // Store webhook
      const teamWebhooks = webhooks.get(teamId) || [];
      teamWebhooks.push(webhook);
      webhooks.set(teamId, teamWebhooks);

      return json({
        success: true,
        webhook,
      });
    } catch (error) {
      console.error('Error creating webhook:', error);
      return json({ error: 'Failed to create webhook' }, { status: 500 });
    }
  },
});

// Delete webhook
export const WebhookDeleteRoute = createAPIFileRoute('/api/webhooks/$webhookId')({
  DELETE: async ({ params, env }) => {
    try {
      const { webhookId } = params;
      const url = new URL((env as any).request?.url || '');
      const teamId = url.searchParams.get('teamId');

      if (!webhookId || !teamId) {
        return json(
          { error: 'Webhook ID and Team ID are required' },
          { status: 400 }
        );
      }

      const teamWebhooks = webhooks.get(teamId) || [];
      const filtered = teamWebhooks.filter((w: any) => w.id !== webhookId);
      webhooks.set(teamId, filtered);

      return json({
        success: true,
        message: 'Webhook deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      return json({ error: 'Failed to delete webhook' }, { status: 500 });
    }
  },
});

// Trigger webhook (internal use)
export async function triggerWebhook(
  teamId: string,
  event: string,
  payload: any
) {
  const teamWebhooks = webhooks.get(teamId) || [];
  
  for (const webhook of teamWebhooks) {
    if (!webhook.active || !webhook.events.includes(event)) continue;

    try {
      // In production, this would actually send the webhook
      console.log(`Triggering webhook ${webhook.id} for event ${event}`);
      
      // Send webhook
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhook.secret,
          'X-Webhook-Event': event,
        },
        body: JSON.stringify({
          event,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error(`Failed to trigger webhook ${webhook.id}:`, error);
    }
  }
}
