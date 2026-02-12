import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { nanoid } from 'nanoid'
import { createDb } from '../../../lib/db'

// Simple in-memory API keys storage (in production, use database with encryption)
const apiKeys: Map<string, any[]> = new Map();

export const APIRoute = createAPIFileRoute('/api/api-keys')({
  GET: async ({ request, env }) => {
    try {
      const url = new URL(request.url);
      const teamId = url.searchParams.get('teamId');

      if (!teamId) {
        return json({ error: 'Team ID is required' }, { status: 400 });
      }

      const keys = apiKeys.get(teamId) || [];

      // Return keys without the full key value (only show last 4 chars)
      const sanitizedKeys = keys.map(k => ({
        ...k,
        key: `${k.key.slice(0, 8)}...${k.key.slice(-4)}`,
      }));

      return json({
        success: true,
        keys: sanitizedKeys,
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return json({ error: 'Failed to fetch API keys' }, { status: 500 });
    }
  },

  POST: async ({ request, env }) => {
    try {
      const { teamId, name, permissions } = await request.json();

      if (!teamId || !name) {
        return json(
          { error: 'Team ID and name are required' },
          { status: 400 }
        );
      }

      // Generate API key
      const key = `blog_${nanoid(32)}`;
      const keyId = nanoid();

      const apiKey = {
        id: keyId,
        teamId,
        name,
        key,
        permissions: permissions || ['read'],
        active: true,
        lastUsedAt: null,
        createdAt: new Date().toISOString(),
      };

      // Store API key
      const keys = apiKeys.get(teamId) || [];
      keys.push(apiKey);
      apiKeys.set(teamId, keys);

      // Return the full key only once (on creation)
      return json({
        success: true,
        apiKey: {
          ...apiKey,
          key, // Show full key only on creation
        },
        message: 'Copy this key now. You won\'t be able to see it again!',
      });
    } catch (error) {
      console.error('Error creating API key:', error);
      return json({ error: 'Failed to create API key' }, { status: 500 });
    }
  },
});

// Delete API key
export const DeleteAPIRoute = createAPIFileRoute('/api/api-keys/$keyId')({
  DELETE: async ({ params, env }) => {
    try {
      const { keyId } = params;
      const url = new URL((env as any).request?.url || '');
      const teamId = url.searchParams.get('teamId');

      if (!keyId || !teamId) {
        return json(
          { error: 'Key ID and Team ID are required' },
          { status: 400 }
        );
      }

      const keys = apiKeys.get(teamId) || [];
      const filtered = keys.filter((k: any) => k.id !== keyId);
      apiKeys.set(teamId, filtered);

      return json({
        success: true,
        message: 'API key deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      return json({ error: 'Failed to delete API key' }, { status: 500 });
    }
  },
});

// Validate API key middleware (for use in other routes)
export async function validateApiKey(
  request: Request,
  requiredPermissions: string[] = []
): Promise<{ valid: boolean; teamId?: string; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid authorization header' };
  }

  const key = authHeader.split(' ')[1];

  // Find key in storage
  for (const [teamId, keys] of apiKeys.entries()) {
    const apiKey = keys.find((k: any) => k.key === key && k.active);
    
    if (apiKey) {
      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.every(p => 
          apiKey.permissions.includes(p) || apiKey.permissions.includes('admin')
        );
        
        if (!hasPermission) {
          return { valid: false, error: 'Insufficient permissions' };
        }
      }

      // Update last used
      apiKey.lastUsedAt = new Date().toISOString();

      return { valid: true, teamId };
    }
  }

  return { valid: false, error: 'Invalid API key' };
}
