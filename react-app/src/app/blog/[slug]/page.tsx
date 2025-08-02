import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import BlogPost from '@/components/BlogPost';
import { processMDXContent } from '@/lib/mdx-utils';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const blogDir = path.join(process.cwd(), 'public', 'assets', 'blog');
  
  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir);
  const mdxFiles = files.filter(file => file.endsWith('.mdx'));

  return mdxFiles.map((file) => ({
    slug: file.replace('.mdx', ''),
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = params;
  const blogDir = path.join(process.cwd(), 'public', 'assets', 'blog');
  const filePath = path.join(blogDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) {
    notFound();
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const { data: metadata, content } = matter(fileContent);

  // Process the content to replace p5.js placeholders
  const processedContent = processMDXContent(content);

  // Convert frontmatter to the format expected by BlogPost
  const frontmatter = `+++
title = "${metadata.title}"
date = "${metadata.date}"
description = "${metadata.description}"
image = "${metadata.image}"
categories = "${metadata.categories}"
${metadata.code ? `code = "${metadata.code}"` : ''}
${metadata.site ? `site = "${metadata.site}"` : ''}
${metadata.blog ? `blog = "${metadata.blog}"` : ''}
${metadata.game ? `game = "${metadata.game}"` : ''}
${metadata.extension ? `extension = "${metadata.extension}"` : ''}
${metadata.sheet ? `sheet = "${metadata.sheet}"` : ''}
${metadata.itch ? `itch = "${metadata.itch}"` : ''}
+++

${processedContent}`;

  return (
    <div className="w-full">
      <div className="container mx-auto py-8 max-w-6xl">
        {/* Desktop back link - aligned with TOC */}
        <div className="hidden xl:block absolute left-28 top-72 w-48 -left-40">
          <a 
            href="/blog"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </a>
        </div>
        
        {/* Mobile back link */}
        <div className="xl:hidden mb-8">
          <a 
            href="/blog"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </a>
        </div>
        
        <BlogPost 
          content={frontmatter}
          title={metadata.title}
          date={metadata.date}
          image={metadata.image}
          description={metadata.description}
        />
      </div>
    </div>
  );
} 