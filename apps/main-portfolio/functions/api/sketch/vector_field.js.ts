// Cloudflare Function for vector_field.js
// Auto-generated function

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
    const searchParams = url.searchParams;
    
    console.log('Cloudflare Function - Request URL:', request.url);
    console.log('Cloudflare Function - Sketch: vector_field.js');
    
    // Extract query parameters
    const sketchWidth = parseInt(searchParams.get('sketchWidth') || '800');
    const sketchHeight = parseInt(searchParams.get('sketchHeight') || '600');
    const domWidth = parseInt(searchParams.get('domWidth') || '800');
    const domHeight = parseInt(searchParams.get('domHeight') || '600');
    const theme = searchParams.get('theme') || 'light';
    
    // Read the sketch file from the public directory
    const sketchPath = '/assets/sketches/vector_field.js';
    const sketchUrl = `https://davidholcer.com${sketchPath}`;
    
    console.log('Cloudflare Function - Fetching sketch from:', sketchUrl);
    
    const sketchResponse = await fetch(sketchUrl);
    if (!sketchResponse.ok) {
      console.error('Cloudflare Function - Failed to fetch sketch:', sketchResponse.status, sketchResponse.statusText);
      return new Response('Sketch not found: vector_field.js', { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    let sketchContent = await sketchResponse.text();
    
    // Replace dimension placeholders
    sketchContent = sketchContent
      .replace(/SKETCH_WIDTH/g, sketchWidth.toString())
      .replace(/SKETCH_HEIGHT/g, sketchHeight.toString())
      .replace(/DOM_WIDTH/g, domWidth.toString())
      .replace(/DOM_HEIGHT/g, domHeight.toString());
    
    // Apply theme-specific modifications
    
    // Generic theme replacements for other sketches
    if (theme === 'dark') {
      sketchContent = sketchContent
        .replace(/background\(255\)/g, 'background(0)')
        .replace(/background\(240\)/g, 'background(15)')
        .replace(/fill\(0\)/g, 'fill(255)')
        .replace(/stroke\(0\)/g, 'stroke(255)');
    }
    
    // Generate the complete HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketch - vector_field.js</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.9/lib/p5.min.js"></script>
    <script>window.module=undefined; window.exports=undefined; window.global=window;</script>
    
    
    
    
    
    
    
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            overflow: hidden;
        }
        canvas {
            display: block;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <script>
        ${sketchContent}
        
        // Theme change handler
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'theme-change') {
                console.log('Sketch received theme change:', event.data.theme);
                // Handle theme change if needed
                if (typeof invertBgP === 'function') {
                    if (event.data.theme === 'dark' && cColors && cColors[1] === 0) {
                        invertBgP();
                    } else if (event.data.theme === 'light' && cColors && cColors[1] === 255) {
                        invertBgP();
                    }
                }
            }
        });
        
        // Add keypress handler for fullscreen functionality
        document.addEventListener('keydown', function(e) {
            if (e.key === 'f' || e.key === 'F') {
                toggleFullscreen();
            }
        });
        
        function toggleFullscreen() {
            const iframe = window.parent;
            if (iframe) {
                iframe.postMessage({
                    type: 'fullscreen',
                    enabled: !document.fullscreenElement
                }, '*');
            }
        }
    </script>
</body>
</html>`;
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Cloudflare Function - Error processing sketch:', error);
    return new Response(`Internal server error: ${error}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
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