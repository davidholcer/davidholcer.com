import fs from 'fs';
import path from 'path';

/**
 * Parses MDX content and replaces p5.js placeholders with actual sketch components
 * Syntax: ![[p5js width=800, height=600, sketchWidth=1200, sketchHeight=900]][[filename]]
 */
export function parseP5JSPlaceholders(content: string): string {
  console.log('MDX Utils: parseP5JSPlaceholders called with content length:', content.length);
  console.log('MDX Utils: Content preview:', content.substring(0, 500));
  
  // Regex to match ![[p5js ...]][[filename]] pattern with optional parameters
  const p5jsRegex = /!\[\[p5js\s*([^\]]*)\]\]\[\[([^\]]+)\]\]/g;
  
  return content.replace(p5jsRegex, (match, params, filename) => {
    console.log('MDX Utils: Found match:', match);
    console.log('MDX Utils: Params:', params);
    console.log('MDX Utils: Filename:', filename);
    
    // Check if the sketch file exists
    const sketchesDir = path.join(process.cwd(), 'public', 'assets', 'sketches');
    const sketchPath = path.join(sketchesDir, filename);
    
    // Parse width, height, sketchWidth, and sketchHeight from parameters
    let width = 800;
    let height = 600;
    let sketchWidth: number | undefined;
    let sketchHeight: number | undefined;
    
    if (params) {
      const widthMatch = params.match(/width\s*=\s*(\d+)/);
      const heightMatch = params.match(/height\s*=\s*(\d+)/);
      const sketchWidthMatch = params.match(/sketchWidth\s*=\s*(\d+)/);
      const sketchHeightMatch = params.match(/sketchHeight\s*=\s*(\d+)/);
      
      if (widthMatch) {
        width = parseInt(widthMatch[1]);
      }
      if (heightMatch) {
        height = parseInt(heightMatch[1]);
      }
      if (sketchWidthMatch) {
        sketchWidth = parseInt(sketchWidthMatch[1]);
      }
      if (sketchHeightMatch) {
        sketchHeight = parseInt(sketchHeightMatch[1]);
      }
      
      console.log('MDX Utils: Parsed dimensions:', { width, height, sketchWidth, sketchHeight });
    }
    
    if (fs.existsSync(sketchPath)) {
      // Build the P5Sketch component props
      let props = `sketchPath="/assets/sketches/${filename}" width={${width}} height={${height}}`;
      
      // Add sketch dimensions if provided
      if (sketchWidth !== undefined) {
        props += ` sketchWidth={${sketchWidth}}`;
      }
      if (sketchHeight !== undefined) {
        props += ` sketchHeight={${sketchHeight}}`;
      }
      
      // Return a custom component that will be rendered by the BlogPost component
      const generatedComponent = `<P5Sketch ${props} className="border rounded-lg shadow-lg my-8" />`;
      console.log('MDX Utils: Generated P5Sketch component:', generatedComponent);
      return generatedComponent;
    } else {
      // Return an error message if file doesn't exist
      console.warn(`P5.js sketch file not found: ${filename}`);
      return `<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-8">
        <strong>Error:</strong> P5.js sketch file "${filename}" not found in sketches directory.
      </div>`;
    }
  });
}

/**
 * Processes MDX content with all custom placeholders
 */
export function processMDXContent(content: string): string {
  // Parse p5.js placeholders
  let processedContent = parseP5JSPlaceholders(content);
  
  return processedContent;
} 