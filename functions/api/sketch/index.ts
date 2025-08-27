// Cloudflare Function to handle requests to /api/sketch/*
// This handles the base sketch route

interface Env {
  // Add any environment variables here if needed
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
}) {
  try {
    const { request } = context;
    const url = new URL(request.url);
    
    console.log('Cloudflare Function (index) - Request URL:', request.url);
    console.log('Cloudflare Function (index) - URL pathname:', url.pathname);
    
    // This is the index route, not a specific sketch
    return new Response('Sketch API - use /api/sketch/[filename].js', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': '*',
      },
    });
    
  } catch (error) {
    console.error('Cloudflare Function (index) - Error:', error);
    return new Response(`Error: ${error}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
