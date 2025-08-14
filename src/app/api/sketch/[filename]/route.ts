import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

interface RouteParams {
  params: {
    filename: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = params;
    const { searchParams } = new URL(request.url);
    
    // Debug: Log the URL and search parameters
    console.log('API Route - Request URL:', request.url);
    console.log('API Route - Search params:', Object.fromEntries(searchParams.entries()));
    
    // Get dimensions from URL parameters
    const sketchWidth = parseInt(searchParams.get('sketchWidth') || '800');
    const sketchHeight = parseInt(searchParams.get('sketchHeight') || '600');
    const domWidth = parseInt(searchParams.get('domWidth') || '800');
    const domHeight = parseInt(searchParams.get('domHeight') || '600');
    
    // Debug: Log the parsed dimensions
    console.log('API Route - Parsed dimensions:', {
      sketchWidth,
      sketchHeight,
      domWidth,
      domHeight
    });
    
    // Fetch the sketch code from the public assets (Workers-compatible)
    const sketchUrl = new URL(`/assets/sketches/${filename}`, request.url);
    const sketchResponse = await fetch(sketchUrl.toString());
    if (!sketchResponse.ok) {
      return new NextResponse('Sketch not found', { status: 404 });
    }
    let sketchCode = await sketchResponse.text();

    // Detect if the sketch uses WEBGL features so we can force WEBGL renderer when needed
    const usesWebGL = /createCanvas\s*\([^)]*\bWEBGL\b/i.test(sketchCode)
      || /(ambientLight|directionalLight|pointLight|createEasyCam)\s*\(/i.test(sketchCode);
    // Detect if sketch uses p5.pattern helpers
    const usesPattern = /(pattern\s*\(|patternAngle\s*\(|patternColors\s*\()/i.test(sketchCode);

    // Preserve/force WEBGL when sketch uses 3D while forcing our dimensions
    const canvasCallRegex = /createCanvas\s*\(([^)]*)\)/g;
    sketchCode = sketchCode.replace(canvasCallRegex, (_match, args) => {
      const hasWEBGL = /\bWEBGL\b/.test(args);
      return (hasWEBGL || usesWebGL)
        ? `createCanvas(${sketchWidth}, ${sketchHeight}, WEBGL)`
        : `createCanvas(${sketchWidth}, ${sketchHeight})`;
    });
    
    // Inject the sketch dimensions directly into the createCanvas call
    const modifiedSketchCode = sketchCode.replace(
      /createCanvas\([^)]+\)/g,
      `createCanvas(${sketchWidth}, ${sketchHeight})`
    );
    
    console.log('API Route - Sketch dimensions:', {
      sketchWidth,
      sketchHeight,
      domWidth,
      domHeight
    });
    
    // Create the HTML with the sketch embedded
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>P5.js Sketch - ${filename}</title>
    <script src="https://cdn.jsdelivr.net/npm/p5@1.11.9/lib/p5.min.js"></script>
    <script>window.module=undefined; window.exports=undefined; window.global=window;</script>
    <script src="/assets/sketches/p5.gui.js"></script>
    ${usesWebGL ? '<script src="/assets/sketches/p5.easycam.min.js"></script>' : ''}
    ${usesWebGL ? '<script>(function(){try{if(typeof window.Dw === \"undefined\" || typeof window.Dw.EasyCam === \"undefined\"){var s=document.createElement(\"script\");s.src=\"https://cdn.jsdelivr.net/npm/p5.easycam@1.0.1/p5.easycam.min.js\";document.head.appendChild(s);}}catch(e){console.warn(\"EasyCam fallback load failed\", e);}})();</script>' : ''}
    ${usesPattern ? '<script src="/assets/sketches/p5.pattern.js"></script>' : ''}
    ${usesPattern ? '<script>(function(){try{if(typeof window.pattern === \"undefined\"){var s=document.createElement(\"script\");s.src=\"https://cdn.jsdelivr.net/npm/p5.pattern@1.3.1/lib/p5.pattern.min.js\";document.head.appendChild(s);}}catch(e){console.warn(\"p5.pattern fallback load failed\", e);}})();</script>' : ''}
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #f0f0f0;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            width: ${domWidth}px;
            height: ${domHeight}px;
            /* Ensure mouse events pass through to canvas */
        pointer-events: auto;
        touch-action: none;
        }
        canvas {
            display: block;
            /* No scaling - canvas stays at full size */
            /* The sketch will run at sketchWidth x sketchHeight */
            /* but the DOM container will be domWidth x domHeight */
            /* Ensure canvas receives mouse events */
        pointer-events: auto;
        touch-action: none;
            /* Ensure canvas is interactive */
            cursor: pointer;
            /* Prevent any interference with mouse events */
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
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
        }
        
        /* Fullscreen indicator */
        .fullscreen-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
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
        // Set up global variables that the sketch expects
        window.$fxhashFeatures = {
            Levels: 3,
            Speed: 'medium',
            'Stroke Type': 'All',
            'Click Ease': 'Mixed',
            'Number of Shapes': 5,
            Shapes: 'cltrphso',
            'Color Scheme': 'Techno Vanilla',
            Density: '50%',
            'Return Time': 30,
            'Go Time': 15
        };

        window.fxrand = () => Math.random();

        // Store original dimensions
        let originalWidth = ${sketchWidth};
        let originalHeight = ${sketchHeight};
        let domWidth = ${domWidth};
        let domHeight = ${domHeight};
        let isFullscreen = false;

        // Embed the modified sketch code
        ${modifiedSketchCode}

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
            
            // Add wheel event listener directly to canvas
            const canvas = document.querySelector('canvas');
            if (canvas) {
                canvas.addEventListener('wheel', function(event) {
                    event.preventDefault();
                }, { passive: false });
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
                        }, 300); // Wait for fade transition
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
        
        // Handle clicks outside canvas to exit fullscreen
        document.addEventListener('click', function(event) {
            if (isFullscreen && event.target === document.body) {
                toggleFullscreen();
            }
        });
        
        // Handle wheel events for P5.js sketches
        function preventWheelScroll(event) {
            event.preventDefault();
        }
        
        // Add wheel event listeners
        document.addEventListener('wheel', preventWheelScroll, { passive: false });
        document.body.addEventListener('wheel', preventWheelScroll, { passive: false });
        
        // Override windowResized to handle fullscreen properly
        const originalWindowResized = window.windowResized;
        window.windowResized = function() {
            try {
                if (isFullscreen) {
                    // In fullscreen mode - use full screen dimensions
                    resizeCanvas(window.screen.width, window.screen.height);
                    console.log('Window resized in fullscreen mode:', window.screen.width, 'x', window.screen.height);
                } else {
                    // In normal mode - use DOM dimensions
                    resizeCanvas(domWidth, domHeight);
                    console.log('Window resized in normal mode:', domWidth, 'x', domHeight);
                }
                
                // Call the original windowResized if it exists
                if (originalWindowResized) {
                    originalWindowResized();
                }
            } catch (error) {
                console.error('Error in windowResized:', error);
                // Fallback: try to resize manually
                const canvas = document.querySelector('canvas');
                if (canvas) {
                    if (isFullscreen) {
                        canvas.width = window.screen.width;
                        canvas.height = window.screen.height;
                    } else {
                        canvas.width = domWidth;
                        canvas.height = domHeight;
                    }
                }
            }
        };
    </script>
</body>
</html>`;
    
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
    
  } catch (error) {
    console.error('Error serving sketch:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 