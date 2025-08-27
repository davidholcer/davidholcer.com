// Simple test function to verify Cloudflare Pages Functions work

export async function onRequestGet(context: {
  request: Request;
  env: any;
}) {
  const url = new URL(context.request.url);
  
  return new Response(JSON.stringify({
    message: 'Cloudflare Pages Functions working!',
    url: url.toString(),
    pathname: url.pathname,
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
