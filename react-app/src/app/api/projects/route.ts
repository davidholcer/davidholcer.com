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
  code?: string;
  site?: string;
  blog?: string;
  game?: string;
  extension?: string;
  sheet?: string;
  itch?: string;
}

interface Project {
  slug: string;
  metadata: ProjectMetadata;
  content: string;
}

export async function GET(request: NextRequest) {
  try {
    const worksDir = path.join(process.cwd(), 'public', 'assets', 'works');
    
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
      
      // Parse categories string into array
      const categories = metadata.categories 
        ? metadata.categories.split(',').map((cat: string) => cat.trim())
        : [];

      // Create links object
      const links: any = {};
      if (metadata.code) links.code = metadata.code;
      links.site = "/works/"+slug;
      if (metadata.blog) links.blog = metadata.blog;

      projects.push({
        slug,
        metadata: {
          ...metadata,
          categories: categories.join(', '),
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