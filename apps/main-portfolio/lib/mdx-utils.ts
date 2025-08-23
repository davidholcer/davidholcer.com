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
 * Parses custom image placeholders and converts them to HTML img tags
 * Syntax: ![[image width=800, height=auto]][[/assets/images/file.png]]
 * - width/height are optional, support numeric px or 'auto'
 * - if both are auto or missing, keep intrinsic size (no inline sizing)
 * - if src doesn't start with '/', it will be assumed to be under /assets/images
 */
export function parseImagePlaceholders(content: string): string {
  const imageRegex = /!\[\[image\s*([^\]]*)\]\]\[\[([^\]]+)\]\]/g;

  return content.replace(imageRegex, (match, params, srcPath) => {
    // Normalize src
    let src = srcPath.trim();
    if (!src.startsWith('/')) {
      src = `/assets/images/${src}`;
    }

    // Defaults
    let widthParam: string | undefined;
    let heightParam: string | undefined;

    if (params) {
      const widthMatch = params.match(/width\s*=\s*([^,\s]+)/);
      const heightMatch = params.match(/height\s*=\s*([^,\s]+)/);
      widthParam = widthMatch?.[1];
      heightParam = heightMatch?.[1];
    }

    // Build style attributes based on auto rules
    let styleAttr = '';
    const isWidthAuto = !widthParam || widthParam.toLowerCase() === 'auto';
    const isHeightAuto = !heightParam || heightParam.toLowerCase() === 'auto';

    if (!(isWidthAuto && isHeightAuto)) {
      const styleParts: string[] = [];
      if (!isWidthAuto) {
        const w = /px$/.test(widthParam!) ? widthParam! : `${widthParam}px`;
        styleParts.push(`width:${w}`);
      }
      if (!isHeightAuto) {
        const h = /px$/.test(heightParam!) ? heightParam! : `${heightParam}px`;
        styleParts.push(`height:${h}`);
      } else if (!isWidthAuto) {
        // Maintain aspect ratio when only width is given
        styleParts.push('height:auto');
      }
      styleAttr = styleParts.length ? ` style="${styleParts.join(';')}"` : '';
    }

    // Use a simpler, more reliable approach
    return `<img src="${src}" alt="" loading="lazy" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1.5rem 0;${styleAttr}"/>`;
  });
}

/**
 * Parses custom video placeholders and converts them to Video component tags
 * Syntax: ![[video width=800, height=auto, controls=true, autoPlay=false]][[/assets/video/file.mp4]]
 * - width/height are optional, support numeric px or 'auto'
 * - controls, autoPlay, muted, loop are boolean options
 * - poster is optional for thumbnail image
 * - if src doesn't start with '/', it will be assumed to be under /assets/video
 */
export function parseVideoPlaceholders(content: string): string {
  const videoRegex = /!\[\[video\s*([^\]]*)\]\]\[\[([^\]]+)\]\]/g;

  return content.replace(videoRegex, (match, params, srcPath) => {
    // Normalize src
    let src = srcPath.trim();
    if (!src.startsWith('/')) {
      src = `/assets/video/${src}`;
    }

    // Defaults
    let widthParam: string | undefined;
    let heightParam: string | undefined;
    let controls = true;
    let autoPlay = false;
    let muted = false;
    let loop = false;
    let poster: string | undefined;

    if (params) {
      const widthMatch = params.match(/width\s*=\s*([^,\s]+)/);
      const heightMatch = params.match(/height\s*=\s*([^,\s]+)/);
      const controlsMatch = params.match(/controls\s*=\s*(true|false)/);
      const autoPlayMatch = params.match(/autoPlay\s*=\s*(true|false)/);
      const mutedMatch = params.match(/muted\s*=\s*(true|false)/);
      const loopMatch = params.match(/loop\s*=\s*(true|false)/);
      const posterMatch = params.match(/poster\s*=\s*"([^"]+)"/);

      widthParam = widthMatch?.[1];
      heightParam = heightMatch?.[1];
      controls = controlsMatch ? controlsMatch[1] === 'true' : true;
      autoPlay = autoPlayMatch ? autoPlayMatch[1] === 'true' : false;
      muted = mutedMatch ? mutedMatch[1] === 'true' : false;
      loop = loopMatch ? loopMatch[1] === 'true' : false;
      poster = posterMatch?.[1];
    }

    // Build props string
    const props = [
      `src="${src}"`,
      widthParam ? `width="${widthParam}"` : '',
      heightParam ? `height="${heightParam}"` : '',
      `controls={${controls}}`,
      `autoPlay={${autoPlay}}`,
      `muted={${muted}}`,
      `loop={${loop}}`,
      poster ? `poster="${poster}"` : '',
      'className="border rounded-lg shadow-lg my-8"'
    ].filter(Boolean).join(' ');

    return `<Video ${props} />`;
  });
}

/**
 * Parses custom PDF placeholders and converts them to PDF component tags
 * Syntax: ![[pdf width=800, height=600px]][[/assets/pdf/file.pdf]]
 * - width/height are optional, support numeric px or CSS values
 * - if src doesn't start with '/', it will be assumed to be under /assets/pdf
 */
export function parsePDFPlaceholders(content: string): string {
  const pdfRegex = /!\[\[pdf\s*([^\]]*)\]\]\[\[([^\]]+)\]\]/g;

  return content.replace(pdfRegex, (match, params, srcPath) => {
    // Normalize src
    let src = srcPath.trim();
    if (!src.startsWith('/')) {
      src = `/assets/pdf/${src}`;
    }

    // Defaults
    let widthParam: string | undefined;
    let heightParam: string | undefined;

    if (params) {
      const widthMatch = params.match(/width\s*=\s*([^,\s]+)/);
      const heightMatch = params.match(/height\s*=\s*([^,\s]+)/);

      widthParam = widthMatch?.[1];
      heightParam = heightMatch?.[1];
    }

    // Build props string
    const props = [
      `src="${src}"`,
      widthParam ? `width="${widthParam}"` : '',
      heightParam ? `height="${heightParam}"` : '',
      'className="border rounded-lg shadow-lg my-8"'
    ].filter(Boolean).join(' ');

    return `<PDF ${props} />`;
  });
}

/**
 * Parses slideshow placeholders and converts them to GallerySlideshow components
 * Syntax: ![[slideshow]][[/assets/images/folder]]
 * - Scans the specified folder for image files
 * - Supports common image formats: jpg, jpeg, png, gif, webp
 */
export function parseSlideshowPlaceholders(content: string): string {
  const slideshowRegex = /!\[\[slideshow\]\]\[\[([^\]]+)\]\]/g;

  return content.replace(slideshowRegex, (match, folderPath) => {
    console.log('MDX Utils: Found slideshow match:', match);
    console.log('MDX Utils: Folder path:', folderPath);
    
    // Normalize folder path
    let folder = folderPath.trim();
    if (!folder.startsWith('/')) {
      folder = `/assets/images/${folder}`;
    }
    
    // Remove leading slash for filesystem path
    const fsFolder = folder.startsWith('/') ? folder.slice(1) : folder;
    const fullPath = path.join(process.cwd(), 'public', fsFolder);
    
    console.log('MDX Utils: Full filesystem path:', fullPath);
    
    // Check if folder exists
    if (!fs.existsSync(fullPath)) {
      console.warn(`Slideshow folder not found: ${fullPath}`);
      return `<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-8">
        <strong>Error:</strong> Slideshow folder "${folder}" not found.
      </div>`;
    }
    
    try {
      // Read all files in the folder
      const files = fs.readdirSync(fullPath);
      
      // Filter for image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });
      
      if (imageFiles.length === 0) {
        console.warn(`No image files found in slideshow folder: ${fullPath}`);
        return `<div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-8">
          <strong>Warning:</strong> No image files found in slideshow folder "${folder}".
        </div>`;
      }
      
      // Sort files alphabetically
      imageFiles.sort();
      
      // Create image paths
      const imagePaths = imageFiles.map(file => `${folder}/${file}`);
      
      console.log('MDX Utils: Found images:', imagePaths);
      
      // Create the GallerySlideshow component
      const imagesJson = JSON.stringify(imagePaths);
      const generatedComponent = `<GallerySlideshow images={${imagesJson}} className="border rounded-lg shadow-lg my-8" />`;
      
      console.log('MDX Utils: Generated GallerySlideshow component:', generatedComponent);
      return generatedComponent;
      
    } catch (error) {
      console.error('Error reading slideshow folder:', error);
      return `<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-8">
        <strong>Error:</strong> Failed to read slideshow folder "${folder}".
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
  // Parse image placeholders
  processedContent = parseImagePlaceholders(processedContent);
  // Parse video placeholders
  processedContent = parseVideoPlaceholders(processedContent);
  // Parse PDF placeholders
  processedContent = parsePDFPlaceholders(processedContent);
  // Parse slideshow placeholders
  processedContent = parseSlideshowPlaceholders(processedContent);
  
  return processedContent;
} 