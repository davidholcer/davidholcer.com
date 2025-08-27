// Cloudflare Functions version of blog API

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
    
    console.log('Cloudflare Function - Blog API called');
    
    // Since this is a static deployment, return a basic blog list
    // In a real deployment, you'd fetch from a database or static files
    const blogPosts = [
      {
        slug: 'example-blog-post',
        metadata: {
          title: 'Example Blog Post',
          date: '2024-01-01',
          description: 'An example blog post',
          image: 'example.png',
          categories: 'example'
        }
      },
      // Add more blog posts as needed
    ];
    
    return new Response(JSON.stringify(blogPosts), {
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
    console.error('Cloudflare Function - Error in blog API:', error);
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
