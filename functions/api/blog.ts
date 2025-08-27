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
    
    // Read blog posts from the static site
    const blogUrl = 'https://davidholcer.com/assets/blog/';
    
    // Try to get a list of all MDX files by attempting to fetch common filenames
    // Since we can't list directory contents directly, we'll use a fallback approach
    const blogPosts = [];
    
    // First, try to fetch a directory index (if available)
    let blogFiles: string[] = [];
    
    try {
      // Try to fetch a JSON file that lists all blog files (we'll create this during build)
      const indexResponse = await fetch('https://davidholcer.com/assets/blog/_index.json');
      if (indexResponse.ok) {
        const index = await indexResponse.json();
        blogFiles = index.files || [];
        console.log('Found blog index with files:', blogFiles);
      }
    } catch (error) {
      console.log('No blog index found, using directory scan approach');
    }
    
    // If no index file, fall back to trying common patterns and known files
    if (blogFiles.length === 0) {
      // Try to discover files by attempting to fetch them
      const potentialFiles = [
        'example-blog-post.mdx',
        'example-blog-post-2.mdx', 
        'example-with-media.mdx',
        'example-with-new-syntax.mdx'
      ];
      
      console.log('Scanning for blog files...');
      for (const filename of potentialFiles) {
        try {
          const testResponse = await fetch(blogUrl + filename, { method: 'HEAD' });
          if (testResponse.ok) {
            blogFiles.push(filename);
          }
        } catch (error) {
          // File doesn't exist, skip it
        }
      }
    }
    
    console.log('Processing blog files:', blogFiles);
    
    for (const filename of blogFiles) {
      try {
        const response = await fetch(blogUrl + filename);
        if (response.ok) {
          const content = await response.text();
          
          // Parse frontmatter (basic implementation)
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const metadata: any = {};
            
            // Parse YAML-like frontmatter
            frontmatter.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                metadata[key.trim()] = value;
              }
            });
            
            // Only include published posts
            if (metadata.status !== 'draft' && metadata.status !== 'archive') {
              blogPosts.push({
                slug: filename.replace('.mdx', ''),
                metadata: {
                  title: metadata.title || 'Untitled',
                  date: metadata.date || '2024-01-01',
                  description: metadata.description || '',
                  image: metadata.image || '',
                  categories: metadata.categories || ''
                }
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching blog post ${filename}:`, error);
      }
    }
    
    console.log('Returning blog posts:', blogPosts);
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

