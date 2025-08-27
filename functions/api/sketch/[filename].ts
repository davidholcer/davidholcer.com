// Cloudflare Function to handle requests to /api/sketch/[filename]
// This should handle /api/sketch/moving_points.js

interface Env {
  // Add any environment variables here if needed
}

export async function onRequestGet(context: {
  request: Request;
  env: Env;
  params: { filename: string };
}) {
  try {
    const { params, request } = context;
    const url = new URL(request.url);
    
    // Enhanced debugging
    console.log('=== Cloudflare Pages Function Debug ===');
    console.log('Request URL:', request.url);
    console.log('URL pathname:', url.pathname);
    console.log('Raw params:', JSON.stringify(params));
    console.log('Filename param:', params.filename);
    console.log('Search params:', Object.fromEntries(url.searchParams.entries()));
    
    let filename = params.filename;
    
    // Handle filename with .js extension
    if (!filename) {
      console.error('No filename parameter provided');
      return new Response('No filename provided', { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    // Ensure filename ends with .js
    if (!filename.endsWith('.js')) {
      filename += '.js';
    }
    
    console.log('Final filename:', filename);
    
    // Verify this is a valid sketch file
    const validSketches = [
      '3d_egg.js', 'circles_color.js', 'leveled_circles.js', 'moving_points.js',
      'noisy_dots.js', 'spheres.js', 'tesla_ball.js', 'trillipses.js', 'vector_field.js'
    ];
    
    if (!validSketches.includes(filename)) {
      console.error('Invalid sketch requested:', filename);
      return new Response(`Invalid sketch: ${filename}. Valid sketches: ${validSketches.join(', ')}`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    const searchParams = url.searchParams;
    
    // Extract query parameters
    const sketchWidth = parseInt(searchParams.get('sketchWidth') || '800');
    const sketchHeight = parseInt(searchParams.get('sketchHeight') || '600');
    const domWidth = parseInt(searchParams.get('domWidth') || '800');
    const domHeight = parseInt(searchParams.get('domHeight') || '600');
    const theme = searchParams.get('theme') || 'light';
    
    console.log('Cloudflare Function - Params:', { sketchWidth, sketchHeight, domWidth, domHeight, theme });
    
    // Read the sketch file from the public directory
    const sketchPath = `/assets/sketches/${filename}`;
    const sketchUrl = `https://davidholcer.com${sketchPath}`;
    
    console.log('Cloudflare Function - Fetching sketch from:', sketchUrl);
    
    const sketchResponse = await fetch(sketchUrl);
    if (!sketchResponse.ok) {
      console.error('Cloudflare Function - Failed to fetch sketch:', sketchResponse.status, sketchResponse.statusText);
      return new Response(`Sketch not found: ${filename}`, { 
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
    if (filename === 'moving_points.js') {
      // Find the setup function and add theme initialization before its closing brace
      const setupStartIndex = sketchContent.indexOf('function setup() {');
      if (setupStartIndex !== -1) {
        console.log('Cloudflare Function - Found setup function, applying theme');
        // Find the matching closing brace for the setup function
        let braceCount = 0;
        let i = setupStartIndex + 'function setup() {'.length - 1;
        let setupEndIndex = -1;
        
        for (; i < sketchContent.length; i++) {
          if (sketchContent[i] === '{') {
            braceCount++;
          } else if (sketchContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              setupEndIndex = i;
              break;
            }
          }
        }
        
        if (setupEndIndex !== -1) {
          const themeInitCode = `
  
  // Apply initial theme
  if ('${theme}' === 'dark') {
    // Check if we need to invert to dark mode (cColors[1] === 0 means light mode)
    if (cColors[1] === 0) {
      invertBgP();
    }
  } else {
    // Check if we need to invert to light mode (cColors[1] === 255 means dark mode)
    if (cColors[1] === 255) {
      invertBgP();
    }
  }`;
          
          // Insert the theme code before the closing brace
          sketchContent = sketchContent.slice(0, setupEndIndex) + themeInitCode + '\n' + sketchContent.slice(setupEndIndex);
          console.log('Cloudflare Function - Theme code injected successfully');
        }
      }
    } else {
      // Generic theme replacements for other sketches
      if (theme === 'dark') {
        console.log('Cloudflare Function - Applying generic dark theme replacements');
        sketchContent = sketchContent
          .replace(/background\(255\)/g, 'background(0)')
          .replace(/background\(240\)/g, 'background(15)')
          .replace(/fill\(0\)/g, 'fill(255)')
          .replace(/stroke\(0\)/g, 'stroke(255)');
      }
    }
    
    // Generate the complete HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketch - ${filename}</title>
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
    
    console.log('Cloudflare Function - Returning HTML response');
    
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
