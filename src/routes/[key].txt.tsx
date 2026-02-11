import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/[key].txt')({
  component: IndexNowKeyFile,
});

async function IndexNowKeyFile({ params }: { params: { key: string } }) {
  // Validate key format (simple check)
  if (!params.key || params.key.length < 10) {
    return new Response('Invalid key', { status: 400 });
  }

  // In production, verify this key exists in your database
  // and return it for IndexNow verification
  
  return new Response(params.key, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

export default IndexNowKeyFile;