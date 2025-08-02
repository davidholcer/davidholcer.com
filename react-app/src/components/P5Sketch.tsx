'use client'

import React from 'react';

interface P5SketchProps {
  sketchPath: string;
  width?: number;
  height?: number;
  /** The width the sketch thinks it has (can be different from DOM width) */
  sketchWidth?: number;
  /** The height the sketch thinks it has (can be different from DOM height) */
  sketchHeight?: number;
  className?: string;
}

/**
 * P5Sketch Component
 * 
 * Renders a P5.js sketch in an iframe with support for different sketch and DOM dimensions.
 * 
 * @example
 * // Normal usage - sketch and DOM have same dimensions
 * <P5Sketch sketchPath="/assets/sketches/circles_color.js" width={400} height={300} />
 * 
 * @example
 * // Trick the sketch into thinking it's larger than the DOM container
 * <P5Sketch 
 *   sketchPath="/assets/sketches/circles_color.js" 
 *   width={400} 
 *   height={300}
 *   sketchWidth={1200} 
 *   sketchHeight={900} 
 * />
 * 
 * @example
 * // Trick the sketch into thinking it's smaller than the DOM container
 * <P5Sketch 
 *   sketchPath="/assets/sketches/circles_color.js" 
 *   width={800} 
 *   height={600}
 *   sketchWidth={400} 
 *   sketchHeight={300} 
 * />
 */
const P5Sketch: React.FC<P5SketchProps> = ({ 
  sketchPath, 
  width = 800, 
  height = 600,
  sketchWidth,  // If not provided, use DOM width
  sketchHeight, // If not provided, use DOM height
  className = '' 
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  // Extract the sketch filename and use the API route
  const sketchFilename = sketchPath.split('/').pop();
  const apiPath = `/api/sketch/${sketchFilename}`;
  
  // Use sketch dimensions if provided, otherwise use DOM dimensions
  const actualSketchWidth = sketchWidth || width;
  const actualSketchHeight = sketchHeight || height;
  
  // Build the iframe src URL
  const iframeSrc = `${apiPath}?sketchWidth=${actualSketchWidth}&sketchHeight=${actualSketchHeight}&domWidth=${width}&domHeight=${height}`;
  
  console.log('P5Sketch: Loading sketch via API:', apiPath);
  console.log('DOM dimensions:', width, 'x', height);
  console.log('Sketch dimensions:', actualSketchWidth, 'x', actualSketchHeight);
  console.log('P5Sketch: Generated iframe src:', iframeSrc);

  // Listen for fullscreen messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'fullscreen') {
        // Add a small delay to ensure smooth transition
        setTimeout(() => {
          setIsFullscreen(event.data.enabled);
        }, 10);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div 
      className={`p5-sketch-container ${className}`} 
      style={{ 
        width: isFullscreen ? '100vw' : width, 
        height: isFullscreen ? '100vh' : height,
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
        backgroundColor: isFullscreen ? '#000' : 'transparent'
      }}
    >
      <iframe
        src={iframeSrc}
        width={isFullscreen ? '100vw' : width}
        height={isFullscreen ? '100vh' : height}
        style={{ 
          border: isFullscreen ? 'none' : '1px solid #ccc', 
          borderRadius: isFullscreen ? 0 : '8px',
          backgroundColor: isFullscreen ? '#000' : '#f0f0f0',
          // Allow iframe to expand beyond container for fullscreen
          maxWidth: 'none',
          maxHeight: 'none'
        }}
        title="P5.js Sketch"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        sandbox="allow-scripts allow-same-origin allow-fullscreen"
      />
    </div>
  );
};

export default P5Sketch; 