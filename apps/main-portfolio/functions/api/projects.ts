// Cloudflare Functions version of projects API

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
    
    console.log('Cloudflare Function - Projects API called');
    
    // Since this is a static deployment, we'll need to read from a static file
    // or return a static list of projects
    
    // For now, return a basic response that indicates the API is working
    // In a real deployment, you'd fetch from a database or static files
    const projects = [
      {
        slug: 'deco',
        metadata: {
          title: 'Deco',
          date: '2024-12-26',
          description: 'AI-powered interior design assistant',
          image: 'deco/deco.png',
          categories: 'data science, ai',
          glowColor: '#7c3aed'
        },
        links: {
          site: 'https://devpost.com/software/deco-ai-uxv6mc',
          site2: 'https://screen.studio/share/rV2U4VJC'
        }
      },
      // Add more projects as needed
    ];
    
    return new Response(JSON.stringify(projects), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Cloudflare Function - Error in projects API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

// Handle CORS preflight requests
export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

