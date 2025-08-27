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
      console.log('Index fetch response status:', indexResponse.status);
      if (indexResponse.ok) {
        const index = await indexResponse.json();
        blogFiles = index.files || [];
        console.log('Found blog index with files:', blogFiles);
      } else {
        console.log('Index file not found, status:', indexResponse.status);
      }
    } catch (error) {
      console.log('Error fetching blog index:', error);
      console.log('Using directory scan approach');
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
    
    console.log('Processing', blogFiles.length, 'blog files');
    
    for (const filename of blogFiles) {
      try {
        console.log('Fetching blog file:', filename);
        const response = await fetch(blogUrl + filename);
        console.log('Blog file fetch status:', response.status, 'for', filename);
        
        if (response.ok) {
          const content = await response.text();
          console.log('Content length for', filename, ':', content.length);
          
          // Parse frontmatter (basic implementation)
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const metadata: any = {};
            
            console.log('Raw frontmatter for', filename, ':', frontmatter);
            
            // Parse YAML-like frontmatter
            frontmatter.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                metadata[key.trim()] = value;
              }
            });
            
            console.log('Parsed metadata for', filename, ':', metadata);
            
            // Only include published posts (posts without status are considered published)
            const status = metadata.status || 'published';
            if (status !== 'draft' && status !== 'archive') {
              const blogPost = {
                slug: filename.replace('.mdx', ''),
                metadata: {
                  title: metadata.title || 'Untitled',
                  date: metadata.date || '2024-01-01',
                  description: metadata.description || '',
                  image: metadata.image || '',
                  categories: metadata.categories || ''
                }
              };
              console.log('Adding blog post:', blogPost);
              blogPosts.push(blogPost);
            } else {
              console.log('Skipping draft/archived post:', filename, 'status:', metadata.status);
            }
          } else {
            console.log('No frontmatter found in', filename);
          }
        } else {
          console.log('Failed to fetch', filename, 'status:', response.status);
        }
      } catch (error) {
        console.error(`Error processing blog post ${filename}:`, error);
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

