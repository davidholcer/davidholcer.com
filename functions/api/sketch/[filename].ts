// Cloudflare Function to handle requests to /api/sketch/[filename]
// This should handle /api/sketch/moving_points.js

type Env = Record<string, never>;

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
      '3d_egg.js', 'circles_color.js', 'leveled_circles.js', 'logo.js', 'moving_points.js',
      'noisy_dots.js', 'spheres.js', 'tesla_ball.js', 'trillipses.js', 'vector_field.js', 
      'bananagram_tiles.js'
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
    
    // Detect which libraries the sketch needs by analyzing the code
    const usesWebGL = /createCanvas\s*\([^)]*\bWEBGL\b/i.test(sketchContent)
      || /(ambientLight|directionalLight|pointLight|createEasyCam)\s*\(/i.test(sketchContent);
    const usesPattern = /(pattern\s*\(|patternAngle\s*\(|patternColors\s*\()/i.test(sketchContent);
    const usesGui = /createGui\s*\(/i.test(sketchContent);
    const usesMatter = /Matter\./i.test(sketchContent);
    
    console.log ('library detection:', { usesWebGL, usesPattern, usesGui, usesMatter });

    
    // Determine which additional libraries are needed
    let additionalLibraries = '';
    let setupCode = '';
    
    // Add required libraries based on code analysis
    if (usesGui) {
      additionalLibraries += '<script src="https://davidholcer.com/assets/sketches/quicksettings.js"></script>\n    ';
      additionalLibraries += '<script src="https://davidholcer.com/assets/sketches/p5.gui.js"></script>\n    ';
    }
    if (usesWebGL) {
      additionalLibraries += '<script src="https://davidholcer.com/assets/sketches/p5.easycam.min.js"></script>\n    ';
    }
    if (usesPattern) {
      additionalLibraries += '<script src="https://davidholcer.com/assets/sketches/p5.pattern.js"></script>\n    ';
    }
    if (usesMatter) {
      // Try to use local copy first, fall back to CDN for local development
      additionalLibraries += '<script src="https://davidholcer.com/assets/sketches/matter.min.js" onerror="this.onerror=null;this.src=\'https://cdn.jsdelivr.net/npm/matter-js@0.19.0/build/matter.min.js\';"></script>\n    ';
    }
    
    // Add fxhash mock for fxhash-based sketches
    if (filename === 'circles_color.js') {
      setupCode = `
        console.log('🎨 SETUP CODE EXECUTING - circles_color.js');
        
        // Mock fxhash features for circles_color.js - ALWAYS recreate to ensure randomization
        const allColorSchemes = [
          "Techno Vanilla", "Retro Rainbow", "Halloween", "Cooltone", "Salmon Blues",
          "Gold Wine", "Japonica", "Minimal Ice", "Vintage Fire", "Flame Pea",
          "Jaguar Lavender", "Mandalay Glacier", "Pastel Tabasco", "Guacamole",
          "Blue Honey", "Red Pill Blue Pill", "Purple Cabbage", "Highlighters", "Grayscale"
        ];
        
        // Force re-randomization on each load by deleting existing features
        delete window.$fxhashFeatures;
        
        // Create fresh random features every time
        window.$fxhashFeatures = {
          "Levels": Math.floor(Math.random() * 5) + 3,
          "Speed": ["very slow", "slow", "medium", "fast", "very fast"][Math.floor(Math.random() * 5)],
          "Stroke Type": ["None", "All","Mixed"][Math.floor(Math.random() * 3)],
          "Click Ease": ["Mixed", "Polynomial", "Exponential"][Math.floor(Math.random() * 3)],
          "Number of Shapes": Math.floor(Math.random() * 20) + 10,
          "Shapes": "cltrphso".split('').sort(() => Math.random() - 0.5).join('').substring(0, Math.floor(Math.random() * 8) + 1),
          "Color Scheme": allColorSchemes[Math.floor(Math.random() * allColorSchemes.length)]
        };
        
        console.log('🎨 fxhash features created:', window.$fxhashFeatures);
        console.log('🎯 Selected Color Scheme:', window.$fxhashFeatures["Color Scheme"]);
        
        // Also mock the fxrand function used by the sketch
        if (typeof window.fxrand === 'undefined') {
          window.fxrand = function() {
            return Math.random();
          };
          console.log('🎲 fxrand function created');
        }
      `;
    }
    
    // Generate the complete HTML page
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketch - ${filename}</title>
    <script src="https://davidholcer.com/assets/sketches/p5.min.js" onerror="this.onerror=null;this.src='https://cdn.jsdelivr.net/npm/p5@1.11.9/lib/p5.min.js';"></script>
    ${additionalLibraries}<script>window.module=undefined; window.exports=undefined; window.global=window;</script>
    
    
    
    
    
    
    
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        html {
            overflow: hidden;
        }
        
        /* Fullscreen styles */
        body.fullscreen {
            width: 100vw !important;
            height: 100vh !important;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 9999;
            transition: all 0.2s ease-out;
            overflow: hidden;
        }
        
        body.fullscreen canvas {
            width: 100vw !important;
            height: 100vh !important;
            transition: all 0.2s ease-out;
            pointer-events: auto;
            /* Ensure canvas can receive wheel events in fullscreen */
            position: relative;
            z-index: 1;
        }
        
        canvas {
            transition: all 0.2s ease-out;
            display: block;
            border-radius: 8px;
        }
        
        /* Fullscreen indicator */
        .fullscreen-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            z-index: 10000;
            display: none;
            opacity: 1;
            transition: opacity 0.3s ease-out;
        }
        
        body.fullscreen .fullscreen-indicator {
            display: block;
        }
        
        .fullscreen-indicator.fade-out {
            opacity: 0;
        }
    </style>
</head>
<body>
    <div class="fullscreen-indicator">
        Fullscreen Mode - Press F or ESC to exit
    </div>
    <script>
        ${setupCode}
        
        // Store original dimensions
        let originalWidth = ${sketchWidth};
        let originalHeight = ${sketchHeight};
        let domWidth = ${domWidth};
        let domHeight = ${domHeight};
        let isFullscreen = false;
        let currentTheme = '${theme}';

        // Embed the sketch code
        ${sketchContent}

        // Override the setup function to handle fullscreen properly
        const originalSetup = window.setup;
        window.setup = function() {
            // Call original setup
            if (originalSetup) {
                originalSetup();
            }
            
            // Set initial canvas size based on current state
            if (isFullscreen) {
                resizeCanvas(window.screen.width, window.screen.height);
            } else {
                resizeCanvas(domWidth, domHeight);
            }
        };

        // Add fullscreen functionality
        function keyPressed() {
            if (key === 'f' || key === 'F') {
                toggleFullscreen();
            } else if (keyCode === ESCAPE && isFullscreen) {
                // Exit fullscreen with Escape key
                toggleFullscreen();
            }
        }
        
        function toggleFullscreen() {
            isFullscreen = !isFullscreen;
            console.log('Toggle fullscreen:', isFullscreen ? 'entering' : 'exiting');
            
            if (isFullscreen) {
                // Enter fullscreen
                document.body.classList.add('fullscreen');
                resizeCanvas(window.screen.width, window.screen.height);
                console.log('Canvas resized to fullscreen:', window.screen.width, 'x', window.screen.height);
                
                // Show fullscreen indicator and hide after 5 seconds
                const indicator = document.querySelector('.fullscreen-indicator');
                if (indicator) {
                    indicator.classList.remove('fade-out');
                    setTimeout(() => {
                        indicator.classList.add('fade-out');
                        setTimeout(() => {
                            indicator.style.display = 'none';
                        }, 300);
                    }, 5000);
                }
                
                // Notify parent window
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'fullscreen', enabled: true }, '*');
                }
                
                // Try to request fullscreen on the iframe itself
                try {
                    if (document.documentElement.requestFullscreen) {
                        document.documentElement.requestFullscreen();
                    } else if (document.documentElement.webkitRequestFullscreen) {
                        document.documentElement.webkitRequestFullscreen();
                    } else if (document.documentElement.msRequestFullscreen) {
                        document.documentElement.msRequestFullscreen();
                    }
                } catch (e) {
                    console.log('Fullscreen API not available, using CSS fullscreen');
                }
            } else {
                // Exit fullscreen
                document.body.classList.remove('fullscreen');
                console.log('Exiting fullscreen, resizing to DOM dimensions:', domWidth, 'x', domHeight);
                
                // Hide fullscreen indicator immediately when exiting
                const indicator = document.querySelector('.fullscreen-indicator');
                if (indicator) {
                    indicator.classList.add('fade-out');
                    setTimeout(() => {
                        indicator.style.display = 'none';
                    }, 300);
                }
                
                // Notify parent window first
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'fullscreen', enabled: false }, '*');
                }
                
                // Small delay to ensure parent has updated before resizing canvas
                setTimeout(() => {
                    try {
                        resizeCanvas(domWidth, domHeight);
                        console.log('Canvas resized to DOM dimensions:', domWidth, 'x', domHeight);
                    } catch (error) {
                        console.error('Error resizing canvas:', error);
                        // Fallback: try to resize manually
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            canvas.width = domWidth;
                            canvas.height = domHeight;
                            console.log('Canvas manually resized to:', domWidth, 'x', domHeight);
                        }
                    }
                }, 100);
                
                // Exit fullscreen if available
                try {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                } catch (e) {
                    console.log('Fullscreen exit failed');
                }
            }
        }
        
        // Handle fullscreen change events
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        
        function handleFullscreenChange() {
            if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
                // Exited fullscreen
                isFullscreen = false;
                document.body.classList.remove('fullscreen');
                
                // Hide fullscreen indicator immediately when exiting
                const indicator = document.querySelector('.fullscreen-indicator');
                if (indicator) {
                    indicator.classList.add('fade-out');
                    setTimeout(() => {
                        indicator.style.display = 'none';
                    }, 300);
                }
                
                // Notify parent window
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'fullscreen', enabled: false }, '*');
                }
                
                // Small delay to ensure parent has updated before resizing canvas
                setTimeout(() => {
                    try {
                        resizeCanvas(domWidth, domHeight);
                        console.log('Canvas resized to DOM dimensions from fullscreen change:', domWidth, 'x', domHeight);
                    } catch (error) {
                        console.error('Error resizing canvas from fullscreen change:', error);
                        // Fallback: try to resize manually
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            canvas.width = domWidth;
                            canvas.height = domHeight;
                            console.log('Canvas manually resized to:', domWidth, 'x', domHeight);
                        }
                    }
                }, 100);
            }
        }
        
        // Theme change handler
        window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'theme-change') {
                console.log('Sketch received theme change:', event.data.theme);
                currentTheme = event.data.theme;
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
    </script>
</body>
</html>`;
    
    console.log('Cloudflare Function - Returning HTML response');
    
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Disable caching for randomization
        'Pragma': 'no-cache',
        'Expires': '0',
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
