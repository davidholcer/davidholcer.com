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
    
    // Read projects from the static site
    const worksUrl = 'https://davidholcer.com/assets/works/';
    
    // Try to get a list of all MDX files by attempting to fetch common filenames
    // Since we can't list directory contents directly, we'll use a fallback approach
    const projects = [];
    
    // First, try to fetch a directory index (if available)
    let worksFiles: string[] = [];
    
    try {
      // Try to fetch a JSON file that lists all works files (we'll create this during build)
      const indexResponse = await fetch('https://davidholcer.com/assets/works/_index.json');
      if (indexResponse.ok) {
        const index = await indexResponse.json();
        worksFiles = index.files || [];
        console.log('Found works index with files:', worksFiles);
      }
    } catch (error) {
      console.log('No works index found, using directory scan approach');
    }
    
    // If no index file, fall back to trying known files
    if (worksFiles.length === 0) {
      // Try to discover files by attempting to fetch them
      const potentialFiles = [
        '3d_egg.mdx', 'all_the_news.mdx', 'botornot.mdx', 'chess_lines.mdx', 'circles_color.mdx',
        'coverify.mdx', 'creative_coding_workshop_2025.mdx', 'deco.mdx', 'earthquakes.mdx',
        'food_infographic.mdx', 'kleibers.mdx', 'leveled_circles.mdx', 'markov_chains.mdx',
        'moving_points.mdx', 'noisy_dots.mdx', 'nonlinear_optimization.mdx', 'spheres.mdx',
        'stitch.mdx', 'storyweaver.mdx', 'swc_times.mdx', 'tesla_ball.mdx', 'trillipses.mdx',
        'vector_field.mdx', 'writemind.mdx'
      ];
      
      console.log('Scanning for works files...');
      for (const filename of potentialFiles) {
        try {
          const testResponse = await fetch(worksUrl + filename, { method: 'HEAD' });
          if (testResponse.ok) {
            worksFiles.push(filename);
          }
        } catch (error) {
          // File doesn't exist, skip it
        }
      }
    }
    
    console.log('Processing works files:', worksFiles);
    
    for (const filename of worksFiles) {
      try {
        const response = await fetch(worksUrl + filename);
        if (response.ok) {
          const content = await response.text();
          
          // Parse frontmatter (basic implementation)
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const metadata: any = {};
            const links: any = {};
            
            // Parse YAML-like frontmatter
            frontmatter.split('\n').forEach(line => {
              const [key, ...valueParts] = line.split(':');
              if (key && valueParts.length > 0) {
                const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
                const trimmedKey = key.trim();
                
                // Handle links section
                if (['blog', 'site', 'site2', 'code', 'game', 'extension', 'sheet', 'itch'].includes(trimmedKey)) {
                  links[trimmedKey] = value;
                } else {
                  metadata[trimmedKey] = value;
                }
              }
            });
            
            // Only include published projects
            if (metadata.status !== 'draft' && metadata.status !== 'archive') {
              projects.push({
                slug: filename.replace('.mdx', ''),
                metadata: {
                  title: metadata.title || 'Untitled',
                  date: metadata.date || '2024-01-01',
                  description: metadata.description || '',
                  image: metadata.image || '',
                  categories: metadata.categories || '',
                  glowColor: metadata.glowColor || ''
                },
                links: links
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching project ${filename}:`, error);
      }
    }
    
    return new Response(JSON.stringify({ projects }), {
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

