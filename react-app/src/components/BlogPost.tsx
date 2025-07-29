'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { CodeBlock } from './ui/CodeBlock';

interface BlogPostProps {
  content: string;
  title?: string;
  date?: string;
  author?: string;
  image?: string;
  teaser?: string;
  iama?: string;
}

interface Footnote {
  id: string;
  content: string;
}

interface ParsedMarkdown {
  metadata: {
    title?: string;
    date?: string;
    image?: string;
    iama?: string;
    teaser?: string;
  };
  content: string;
}

interface CodeBlockData {
  language: string;
  code: string;
  filename?: string;
}

interface ContentSegment {
  type: 'html' | 'codeblock';
  content: string;
  codeBlock?: CodeBlockData;
}

export default function BlogPost({ content, title, date, author, image, teaser, iama }: BlogPostProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [contentSegments, setContentSegments] = useState<ContentSegment[]>([]);
  const [parsedData, setParsedData] = useState<ParsedMarkdown | null>(null);

  // Parse markdown frontmatter and content
  const parseMarkdown = (markdownContent: string): ParsedMarkdown => {
    const frontmatterRegex = /^\+\+\+\n([\s\S]*?)\n\+\+\+\n([\s\S]*)$/;
    const match = markdownContent.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = match[1];
      const content = match[2];
      
      // Parse frontmatter
      const metadata: any = {};
      const lines = frontmatter.split('\n');
      lines.forEach(line => {
        const [key, ...valueParts] = line.split(' = ');
        if (key && valueParts.length > 0) {
          let value = valueParts.join(' = ').trim();
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          metadata[key.trim()] = value;
        }
      });
      
      return { metadata, content };
    }
    
    return { metadata: {}, content: markdownContent,  };
  };

  // Process inline code
  const processInlineCode = (content: string): string => {
    const inlineCodeRegex = /`([^`]+)`/g;
    return content.replace(inlineCodeRegex, '<code class="inline-code">$1</code>');
  };

  // Convert markdown to HTML and extract code blocks
  const processMarkdown = (content: string): ContentSegment[] => {
    let processed = content;
    const segments: ContentSegment[] = [];
    const codeBlocks: CodeBlockData[] = [];
    
    // Split content by code blocks
    const parts = processed.split(/(```[\w]*\n[\s\S]*?```)/g);
    
    parts.forEach((part, index) => {
      if (part.startsWith('```')) {
        // This is a code block
        const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (match) {
          const language = match[1] || 'text';
          const code = match[2].trim();
          
          const codeBlock: CodeBlockData = {
            language,
            code,
            filename: `example.${language === 'javascript' || language === 'js' ? 'js' : 
                                  language === 'typescript' || language === 'ts' ? 'ts' : 
                                  language === 'jsx' ? 'jsx' : 
                                  language === 'tsx' ? 'tsx' : 
                                  language === 'html' ? 'html' : 
                                  language === 'css' ? 'css' : 
                                  language === 'python' ? 'py' : language}`
          };
          
          segments.push({
            type: 'codeblock',
            content: '',
            codeBlock
          });
        }
      } else if (part.trim()) {
        // This is regular content
        let htmlContent = part;
        
        // Process inline code
        htmlContent = processInlineCode(htmlContent);
        
        // Process headers with IDs
        htmlContent = htmlContent.replace(/^### (.*$)/gim, (match, text) => {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return `<h3 id="${id}">${text}</h3>`;
        });
        htmlContent = htmlContent.replace(/^## (.*$)/gim, (match, text) => {
          const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return `<h2 id="${id}">${text}</h2>`;
        });
        htmlContent = htmlContent.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Process bold and italic
        htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Process links
        htmlContent = htmlContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
        
        // Process ordered lists
        htmlContent = htmlContent.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        htmlContent = htmlContent.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
        
        // Process unordered lists
        htmlContent = htmlContent.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
        htmlContent = htmlContent.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Process paragraphs
        htmlContent = htmlContent.split('\n\n').map(paragraph => {
          paragraph = paragraph.trim();
          if (!paragraph) return '';
          
          // Don't wrap headers or lists in p tags
          if (paragraph.startsWith('<h') || 
              paragraph.startsWith('<ul>') || 
              paragraph.startsWith('<ol>')) {
            return paragraph;
          }
          
          return `<p>${paragraph}</p>`;
        }).join('\n');
        
        segments.push({
          type: 'html',
          content: htmlContent
        });
      }
    });
    
    return segments;
  };

  useEffect(() => {
    let contentToProcess = content;
    
    // First, try to parse markdown if it looks like it has frontmatter
    if (content.startsWith('+++')) {
      const parsed = parseMarkdown(content);
      setParsedData(parsed);
      contentToProcess = parsed.content;
    }
    
    // Process the content (either from frontmatter or direct content)
    const segments = processMarkdown(contentToProcess);
    setContentSegments(segments);
  }, [content]);

  useEffect(() => {
    if (contentSegments.length === 0) return;

    // Extract headings and footnotes after content is processed
    setTimeout(() => {
      const headingElements = document.querySelectorAll<HTMLElement>('h2[id], h3[id]');
      const extractedHeadings = Array.from(headingElements).map((heading) => ({
        id: heading.id,
        text: heading.textContent || '',
      }));
      setHeadings(extractedHeadings);

      const footnoteElements = document.querySelectorAll<HTMLElement>('.footnote');
      const extractedFootnotes = Array.from(footnoteElements).map((footnote) => ({
        id: footnote.id,
        content: footnote.textContent || '',
      }));
      setFootnotes(extractedFootnotes);

      // Image click zoom
      const imgElements = document.querySelectorAll<HTMLImageElement>('.blog-content-container img');
      imgElements.forEach((img) => {
        img.style.borderRadius = '8px';
        img.style.cursor = 'zoom-in';
        img.onclick = () => handleImageClick(img.src);
      });

      window.dispatchEvent(new Event('locomotive-update'));
    }, 100);
  }, [contentSegments]);

  // Function to handle image click and zoom
  const handleImageClick = (src: string) => {
    setZoomedImage(src);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  // Get display values from props or parsed metadata
  const displayTitle = title || parsedData?.metadata.title || 'Untitled';
  const displayDate = date || parsedData?.metadata.date;
  const displayImage = image || parsedData?.metadata.image;
  const displayTeaser = teaser || parsedData?.metadata.teaser;

  return (
    <article className="prose dark:prose-invert max-w-none">
      <header className="mb-8">
        <h1 className="text-4xl font-medium mb-4 saans">{displayTitle}</h1>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          {author && <span>{author}</span>}
          {author && displayDate && <span>•</span>}
          {displayDate && (
            <time dateTime={displayDate}>
              {new Date(displayDate).toLocaleDateString()}
            </time>
          )}
        </div>
        {displayTeaser && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">{displayTeaser}</p>
        )}
      </header>

      {headings.length > 0 && (
        <nav className="toc mb-8">
          <h2 className="text-lg font-medium mb-2 saans">Table of Contents</h2>
          <ul className="list-none pl-0">
            {headings.map((heading) => (
              <li key={heading.id} className="mb-1">
                <a
                  href={`#${heading.id}`}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="blog-content-container">
        {contentSegments.map((segment, index) => (
          <div key={index}>
            {segment.type === 'html' ? (
              <div dangerouslySetInnerHTML={{ __html: segment.content }} />
            ) : (
              segment.codeBlock && (
                <CodeBlock
                  language={segment.codeBlock.language}
                  filename={segment.codeBlock.filename}
                  code={segment.codeBlock.code}
                />
              )
            )}
          </div>
        ))}
      </div>

      {/* Image Zoom Feature */}
      {zoomedImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex items-center justify-center" onClick={closeZoomedImage}>
          <Image
            src={zoomedImage}
            alt="Zoomed Image"
            width={1200}
            height={800}
            className="rounded-lg cursor-zoom-out"
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
            onClick={closeZoomedImage}
          />
        </div>
      )}

      {footnotes.length > 0 && (
        <aside className="footnotes mt-8">
          <h2 className="text-lg font-medium mb-2 saans">Notes</h2>
          <ol className="list-decimal pl-5">
            {footnotes.map((footnote) => (
              <li key={footnote.id} id={`fn-${footnote.id}`} className="mb-2">
                <p className="inline">{footnote.content}</p>
                <a href={`#fnref-${footnote.id}`} className="text-gray-500 dark:text-gray-400"> ↩</a>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </article>
  );
}