// Cloudflare Functions version of sketch API
// This replaces the Next.js API route for Cloudflare Pages deployment

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
    const { filename } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Debug: Log the URL and search parameters
    console.log('Cloudflare Function - Request URL:', request.url);
    console.log('Cloudflare Function - Search params:', Object.fromEntries(searchParams.entries()));
    
    // Get dimensions from URL parameters
    const sketchWidth = parseInt(searchParams.get('sketchWidth') || '800', 10);
    const sketchHeight = parseInt(searchParams.get('sketchHeight') || '600', 10);
    const domWidth = parseInt(searchParams.get('domWidth') || '800', 10);
    const domHeight = parseInt(searchParams.get('domHeight') || '600', 10);
    const theme = searchParams.get('theme') || 'light';
    
    console.log('Cloudflare Function - Parsed dimensions:', {
      sketchWidth,
      sketchHeight,
      domWidth,
      domHeight,
      theme
    });
    
    // Fetch the base sketch file
    const sketchUrl = `${url.origin}/assets/sketches/${filename}`;
    console.log('Cloudflare Function - Fetching sketch from:', sketchUrl);
    
    const sketchResponse = await fetch(sketchUrl);
    if (!sketchResponse.ok) {
      console.error('Cloudflare Function - Failed to fetch sketch:', sketchResponse.status);
      return new Response(`Sketch file not found: ${filename}`, { 
        status: 404,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
    
    let sketchContent = await sketchResponse.text();
    console.log('Cloudflare Function - Original sketch content length:', sketchContent.length);
    
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
        }
      }
    } else {
      // Generic theme replacements for other sketches
      if (theme === 'dark') {
        sketchContent = sketchContent
          .replace(/background\(255\)/g, 'background(0)')
          .replace(/background\(255,\s*255,\s*255\)/g, 'background(0, 0, 0)')
          .replace(/fill\(0\)/g, 'fill(255)')
          .replace(/stroke\(0\)/g, 'stroke(255)')
          .replace(/fill\(0,\s*0,\s*0\)/g, 'fill(255, 255, 255)')
          .replace(/stroke\(0,\s*0,\s*0\)/g, 'stroke(255, 255, 255)');
      }
    }
    
    console.log('Cloudflare Function - Final sketch content length:', sketchContent.length);
    
    // Log sketch dimensions for debugging
    console.log('Cloudflare Function - Sketch dimensions:', {
      sketchWidth,
      sketchHeight,
      domWidth,
      domHeight
    });
    
    // Return the modified sketch with proper headers
    return new Response(sketchContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
    
  } catch (error) {
    console.error('Cloudflare Function - Error processing sketch:', error);
    return new Response('Internal server error', { 
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
