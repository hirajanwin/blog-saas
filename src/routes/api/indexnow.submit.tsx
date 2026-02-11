import { createFileRoute } from '@tanstack/react-router';

interface IndexNowSubmission {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export const Route = createFileRoute('/api/indexnow/submit')({
  component: IndexNowHandler,
});

// IndexNow API integration for instant search indexing
// Supports Bing, Yandex, and other participating search engines
async function submitToIndexNow(data: IndexNowSubmission): Promise<Response> {
  const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
  
  try {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return response;
  } catch (error) {
    console.error('IndexNow submission failed:', error);
    throw error;
  }
}

// Generate IndexNow API key file
async function generateKeyFile(): Promise<{ key: string; location: string }> {
  // In production, generate a unique key and store it securely
  const key = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const location = `/${key}.txt`;
  
  return { key, location };
}

async function IndexNowHandler({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await request.json();
    const { urls, host } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'URLs array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!host) {
      return new Response(
        JSON.stringify({ error: 'Host is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get or generate IndexNow key
    const { key } = await generateKeyFile();

    // Submit URLs to IndexNow
    const submission: IndexNowSubmission = {
      host,
      key,
      urlList: urls.slice(0, 10000), // IndexNow supports up to 10,000 URLs
    };

    const response = await submitToIndexNow(submission);

    if (response.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully submitted ${urls.length} URLs to IndexNow`,
          urlsSubmitted: urls.length,
          searchEngines: ['Bing', 'Yandex', 'Others'],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          success: false,
          error: 'IndexNow submission failed',
          details: errorText,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('IndexNow handler error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Automatic IndexNow submission on post publish
export async function notifyIndexNow(
  urls: string[],
  host: string,
  env: { INDEXNOW_KEY?: string }
): Promise<boolean> {
  try {
    const key = env.INDEXNOW_KEY || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    const submission: IndexNowSubmission = {
      host,
      key,
      urlList: urls,
    };

    const response = await submitToIndexNow(submission);
    return response.ok;
  } catch (error) {
    console.error('Automatic IndexNow notification failed:', error);
    return false;
  }
}

// Generate IndexNow key file content
export function generateIndexNowKeyContent(key: string): string {
  return key;
}

export default IndexNowHandler;