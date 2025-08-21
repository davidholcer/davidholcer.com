import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

interface ProjectMetadata {
  title: string;
  date: string;
  description: string;
  image: string;
  categories: string;
  status?: string;
  glowColor?: string;
  code?: string;
  site?: string;
  site2?: string;
  blog?: string;

}

interface Project {
  slug: string;
  metadata: ProjectMetadata;
  content: string;
  links: {
    code?: string;
    site?: string;
    site2?: string;
    blog?: string;

  };
}

export async function GET(_request: NextRequest) {
  try {
    const worksDir = path.join(process.cwd(), 'public', 'assets', 'works');
    const imagesDir = path.join(process.cwd(), 'public', 'assets', 'images');
    
    // Check if directory exists
    if (!fs.existsSync(worksDir)) {
      return NextResponse.json({ projects: [] });
    }

    const files = fs.readdirSync(worksDir);
    const mdxFiles = files.filter(file => file.endsWith('.mdx'));

    const projects: Project[] = [];

    for (const file of mdxFiles) {
      const filePath = path.join(worksDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Parse frontmatter and content
      const { data: metadata, content } = matter(fileContent);
      
      // Generate slug from filename
      const slug = file.replace('.mdx', '');
      
      // Automatically look for cover image in images directory
      let coverImage = metadata.image || '';
      if (!coverImage || coverImage === '') {
        // Try to find a cover image based on the slug
        const possibleExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
        for (const ext of possibleExtensions) {
          const imagePath = path.join(imagesDir, `${slug}${ext}`);
          if (fs.existsSync(imagePath)) {
            coverImage = `${slug}${ext}`;
            break;
          }
        }
        
        // If still no image found, try with underscores instead of hyphens
        if (!coverImage) {
          const slugWithUnderscores = slug.replace(/-/g, '_');
          for (const ext of possibleExtensions) {
            const imagePath = path.join(imagesDir, `${slugWithUnderscores}${ext}`);
            if (fs.existsSync(imagePath)) {
              coverImage = `${slugWithUnderscores}${ext}`;
              break;
            }
          }
        }
      } else if (!coverImage.startsWith('/')) {
        // If it's just a filename, check if it exists in images directory
        const imagePath = path.join(imagesDir, coverImage);
        if (!fs.existsSync(imagePath)) {
          // Try with .png extension if no extension provided
          if (!path.extname(coverImage)) {
            const pngPath = path.join(imagesDir, `${coverImage}.png`);
            if (fs.existsSync(pngPath)) {
              coverImage = `${coverImage}.png`;
            }
          }
        }
      }
      
      // Check status - skip if draft or archive
      const status = metadata.status || 'published';
      if (status === 'draft' || status === 'archive') {
        continue;
      }

      // Parse categories string into array
      const categories = metadata.categories 
        ? metadata.categories.split(',').map((cat: string) => cat.trim())
        : [];

      // Create links object
      const links: Record<string, string> = {};
      if (metadata.code) links.code = metadata.code;
      // Prefer explicit site links from metadata if present, otherwise default to internal route
      links.site = metadata.site || "/works/" + slug;
      if (metadata.site2) links.site2 = metadata.site2;
      if (metadata.blog) links.blog = metadata.blog;

      projects.push({
        slug,
        metadata: {
          title: metadata.title || '',
          date: metadata.date || '',
          description: metadata.description || '',
          image: coverImage,
          categories: categories.join(', '),
          status: status,
          glowColor: metadata.glowColor,
          code: metadata.code,
          site: metadata.site,
          site2: metadata.site2,
          blog: metadata.blog,

        },
        content,
        links
      });
    }

    // Sort projects by date (newest first)
    projects.sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error reading projects:', error);
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 });
  }
} 