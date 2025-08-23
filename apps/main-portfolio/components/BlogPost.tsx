'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { CodeBlock } from './ui/CodeBlock';
import TableOfContents from './TableOfContents';
import { FootnotePanel, parseFootnotes } from './ui/Footnote';
import P5Sketch from './P5Sketch';
import { Video } from './ui/Video';
import { PDF } from './ui/PDF';
import GallerySlideshow from './GallerySlideshow';

interface BlogPostProps {
  content: string;
  title?: string;
  date?: string;
  author?: string;
  image?: string;
  description?: string;
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
    description?: string;
    author?: string;
  };
  content: string;
}

interface CodeBlockData {
  language: string;
  code: string;
  filename?: string;
}

interface ContentSegment {
  type: 'html' | 'codeblock' | 'p5sketch' | 'video' | 'pdf' | 'slideshow';
  content: string;
  codeBlock?: CodeBlockData;
  p5Sketch?: {
    sketchPath: string;
    width: number;
    height: number;
    sketchWidth?: number;
    sketchHeight?: number;
    className: string;
  };
  video?: {
    src: string;
    width?: string | number;
    height?: string | number;
    controls?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    poster?: string;
    className: string;
  };
  pdf?: {
    src: string;
    width?: string | number;
    height?: string | number;
    className: string;
  };
  slideshow?: {
    images: string[];
    className: string;
  };
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface FootnoteData {
  id: string;
  text: string;
  content: string;
}

export default function BlogPost({ content, title, date, author, image, description, iama }: BlogPostProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [footnotes, setFootnotes] = useState<FootnoteData[]>([]);
  const [footnoteContents, setFootnoteContents] = useState<{[key: string]: string}>({});
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [contentSegments, setContentSegments] = useState<ContentSegment[]>([]);
  const [parsedData, setParsedData] = useState<ParsedMarkdown | null>(null);
  const [tocPosition, setTocPosition] = useState({ top: 18.75, left: 8 }); // 300px / 16 = 18.75rem
  const [tocVisible, setTocVisible] = useState(true);
  
  // Store footnote contents in a ref to avoid state update timing issues
  const footnoteContentsRef = useRef<{[key: string]: string}>({});

  // Track scroll position for TOC positioning with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const windowHeight = window.innerHeight;
          const tocHeight = 400; // Approximate TOC height
          const footer = document.querySelector('footer');
          
          console.log('Scroll event triggered:', { scrollY, windowHeight });
          
          // Base position - starts lower and moves with scroll but stays within bounds
          let baseTop = 300 + (scrollY * 0.15); // Start lower and move with scroll at 15% rate
          
          console.log('Base top position:', baseTop);
          
          // Ensure TOC doesn't go too high
          const minTop = 200; // Higher minimum top position
          baseTop = Math.max(minTop, baseTop);
          
          // Check if TOC would overlap with footer
          let shouldHide = false;
          if (footer) {
            const footerRect = footer.getBoundingClientRect();
            const footerTop = footerRect.top;
            
            // If TOC would overlap with footer, hide it
            if (baseTop + tocHeight > footerTop - 20) {
              shouldHide = true;
            }
          }
          
          // Also hide if TOC would go below viewport
          if (baseTop + tocHeight > windowHeight - 40) {
            shouldHide = true;
          }
          
          // Convert to rem units for consistency
          const topInRem = baseTop / 16;
          
          console.log('Setting TOC position:', { top: topInRem, left: 8, shouldHide });
          
          setTocPosition({ top: topInRem, left: 8 });
          setTocVisible(!shouldHide);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial call to set position
    handleScroll();

    // Use locomotive scroll container if available
    const scrollContainer = document.querySelector('[data-scroll-container]');
    if (scrollContainer) {
      console.log('Using locomotive scroll container');
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    } else {
      console.log('Using window scroll');
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Parse markdown frontmatter and content
  const parseMarkdown = (markdownContent: string): ParsedMarkdown => {
    const frontmatterRegex = /^\+\+\+\s*\n([\s\S]*?)\n\+\+\+\s*\n([\s\S]*)$/;
    const match = markdownContent.match(frontmatterRegex);
    
    if (match) {
      const frontmatter = match[1];
      const content = match[2];
      
      // Parse frontmatter
      const metadata: Record<string, string> = {};
      const lines = frontmatter.split('\n').filter(line => line.trim());
      lines.forEach(line => {
        const equalIndex = line.indexOf(' = ');
        if (equalIndex !== -1) {
          const key = line.substring(0, equalIndex).trim();
          let value = line.substring(equalIndex + 3).trim();
          
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          }
          
          metadata[key] = value;
        }
      });
      
      return { metadata, content };
    }
    
    return { metadata: {}, content: markdownContent };
  };

  // Process inline code
  const processInlineCode = (content: string): string => {
    const inlineCodeRegex = /`([^`]+)`/g;
    return content.replace(inlineCodeRegex, '<code class="inline-code">$1</code>');
  };

  // Parse P5Sketch components
  const parseP5SketchComponents = (content: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    // Simpler regex that matches the basic structure first
    const p5SketchRegex = /<P5Sketch\s+sketchPath="([^"]+)"\s+width={(\d+)}\s+height={(\d+)}[^>]*className="([^"]+)"\s*\/>/g;
    
        let lastIndex = 0;
    let match;
    
    while ((match = p5SketchRegex.exec(content)) !== null) {
      // Add content before the P5Sketch component
      if (match.index > lastIndex) {
        const beforeContent = content.substring(lastIndex, match.index);
        if (beforeContent.trim()) {
          segments.push({
            type: 'html',
            content: beforeContent
          });
        }
      }
      
      // Parse the P5Sketch props
      const p5SketchProps: {
        sketchPath: string;
        width: number;
        height: number;
        sketchWidth?: number;
        sketchHeight?: number;
        className: string;
      } = {
        sketchPath: match[1],
        width: parseInt(match[2]),
        height: parseInt(match[3]),
        className: match[4]
      };
      
      // Extract sketchWidth and sketchHeight from the full match if they exist
      const fullMatch = match[0];
      const sketchWidthMatch = fullMatch.match(/sketchWidth={(\d+)}/);
      const sketchHeightMatch = fullMatch.match(/sketchHeight={(\d+)}/);
      
      if (sketchWidthMatch && sketchHeightMatch) {
        p5SketchProps.sketchWidth = parseInt(sketchWidthMatch[1]);
        p5SketchProps.sketchHeight = parseInt(sketchHeightMatch[1]);
      }
      
      // Add the P5Sketch component
      segments.push({
        type: 'p5sketch',
        content: '',
        p5Sketch: p5SketchProps
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining content after the last P5Sketch component
    if (lastIndex < content.length) {
      const afterContent = content.substring(lastIndex);
      if (afterContent.trim()) {
        segments.push({
          type: 'html',
          content: afterContent
        });
      }
    }
    
    return segments;
  };

  // Parse Video components - simplified for Safari
  const parseVideoComponents = (content: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    const videoRegex = /<Video\s+src="([^"]+)"[^>]*className="([^"]+)"\s*\/>/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = videoRegex.exec(content)) !== null) {
      // Add content before the Video component
      if (match.index > lastIndex) {
        const beforeContent = content.substring(lastIndex, match.index);
        if (beforeContent.trim()) {
          segments.push({
            type: 'html',
            content: beforeContent
          });
        }
      }
      
      // Parse the Video props - simplified
      const fullMatch = match[0];
      const videoProps: {
        src: string;
        width?: string | number;
        height?: string | number;
        controls?: boolean;
        autoPlay?: boolean;
        muted?: boolean;
        loop?: boolean;
        poster?: string;
        className: string;
      } = {
        src: match[1],
        className: match[2]
      };
      
      // Extract additional props from the full match
      const widthMatch = fullMatch.match(/width="([^"]+)"/);
      const heightMatch = fullMatch.match(/height="([^"]+)"/);
      const controlsMatch = fullMatch.match(/controls={([^}]+)}/);
      const autoPlayMatch = fullMatch.match(/autoPlay={([^}]+)}/);
      const mutedMatch = fullMatch.match(/muted={([^}]+)}/);
      const loopMatch = fullMatch.match(/loop={([^}]+)}/);
      const posterMatch = fullMatch.match(/poster="([^"]+)"/);
      
      if (widthMatch) videoProps.width = widthMatch[1];
      if (heightMatch) videoProps.height = heightMatch[1];
      if (controlsMatch) videoProps.controls = controlsMatch[1] === 'true';
      if (autoPlayMatch) videoProps.autoPlay = autoPlayMatch[1] === 'true';
      if (mutedMatch) videoProps.muted = mutedMatch[1] === 'true';
      if (loopMatch) videoProps.loop = loopMatch[1] === 'true';
      if (posterMatch) videoProps.poster = posterMatch[1];
      
      // Add the Video component
      segments.push({
        type: 'video',
        content: '',
        video: videoProps
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining content after the last Video component
    if (lastIndex < content.length) {
      const afterContent = content.substring(lastIndex);
      if (afterContent.trim()) {
        segments.push({
          type: 'html',
          content: afterContent
        });
      }
    }
    
    return segments;
  };

  // Parse PDF components
  const parsePDFComponents = (content: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    const pdfRegex = /<PDF\s+src="([^"]+)"[^>]*className="([^"]+)"\s*\/>/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = pdfRegex.exec(content)) !== null) {
      // Add content before the PDF component
      if (match.index > lastIndex) {
        const beforeContent = content.substring(lastIndex, match.index);
        if (beforeContent.trim()) {
          segments.push({
            type: 'html',
            content: beforeContent
          });
        }
      }
      
      // Parse the PDF props
      const fullMatch = match[0];
      const pdfProps: {
        src: string;
        width?: string | number;
        height?: string | number;
        pageNumber?: number;
        scale?: number;
        className: string;
      } = {
        src: match[1],
        className: match[2]
      };
      
      // Extract additional props from the full match
      const widthMatch = fullMatch.match(/width="([^"]+)"/);
      const heightMatch = fullMatch.match(/height="([^"]+)"/);
      
      if (widthMatch) pdfProps.width = widthMatch[1];
      if (heightMatch) pdfProps.height = heightMatch[1];
      
      // Add the PDF component
      segments.push({
        type: 'pdf',
        content: '',
        pdf: pdfProps
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining content after the last PDF component
    if (lastIndex < content.length) {
      const afterContent = content.substring(lastIndex);
      if (afterContent.trim()) {
        segments.push({
          type: 'html',
          content: afterContent
        });
      }
    }
    
    return segments;
  };

  // Parse GallerySlideshow components
  const parseSlideshowComponents = (content: string): ContentSegment[] => {
    const segments: ContentSegment[] = [];
    let lastIndex = 0;
    const slideshowRegex = /<GallerySlideshow\s+images={([^}]+)}\s+className="([^"]+)"\s*\/>/g;
    let match;

    while ((match = slideshowRegex.exec(content)) !== null) {
      // Add content before the slideshow component
      if (match.index > lastIndex) {
        const beforeContent = content.substring(lastIndex, match.index);
        if (beforeContent.trim()) {
          segments.push({
            type: 'html',
            content: beforeContent
          });
        }
      }

      // Parse the slideshow props
      const imagesJson = match[1];
      const className = match[2];
      
      try {
        const images = JSON.parse(imagesJson);
        
        const slideshowProps: {
          images: string[];
          className: string;
        } = {
          images,
          className
        };
        
        // Add the slideshow component
        segments.push({
          type: 'slideshow',
          content: '',
          slideshow: slideshowProps
        });
      } catch (error) {
        console.error('Error parsing slideshow images:', error);
        // Add error message as HTML
        segments.push({
          type: 'html',
          content: `<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-8">
            <strong>Error:</strong> Failed to parse slideshow images.
          </div>`
        });
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining content after the last slideshow component
    if (lastIndex < content.length) {
      const afterContent = content.substring(lastIndex);
      if (afterContent.trim()) {
        segments.push({
          type: 'html',
          content: afterContent
        });
      }
    }
    
    return segments;
  };

  // Convert markdown to HTML and extract code blocks
  const processMarkdown = (content: string): ContentSegment[] => {
    let processed = content;
    const segments: ContentSegment[] = [];
    const codeBlocks: CodeBlockData[] = [];
    
    // Process footnotes BEFORE splitting by code blocks
    const footnoteRegex = /<footnote id="(\d+)" text="([^"]+)" content="([^"]*?)"><\/footnote>/g;
    let footnoteMatch;
    
    console.log('=== PROCESSMARKDOWN FOOTNOTE DEBUG ===');
    console.log('Looking for footnotes in processed content...');
    
    // Find all footnote elements first
    const allFootnotes = processed.match(/<footnote[^>]*><\/footnote>/g);
    console.log('All footnote elements found:', allFootnotes);
    
    // Process each footnote manually
    let footnoteCount = 0;
    allFootnotes?.forEach((footnoteElement, index) => {
      // Extract id, text, and content using a more robust approach
      const idMatch = footnoteElement.match(/id="(\d+)"/);
      const textMatch = footnoteElement.match(/text="([^"]+)"/);
      const contentMatch = footnoteElement.match(/content="([^"]+)"/);
      
      if (idMatch && textMatch && contentMatch) {
        const id = idMatch[1];
        const text = textMatch[1];
        const encodedContent = contentMatch[1];
        
                 footnoteCount++;
         // Decode the content and store in ref
         const decodedContent = decodeURIComponent(encodedContent);
         footnoteContentsRef.current[id] = decodedContent;
        
                 // Replace the footnote element
         const replacement = `<span class="footnote-wrapper"><button class="footnote-button" data-footnote-id="${id}">${id}</button></span>`;
         processed = processed.replace(footnoteElement, replacement);
      }
    });
    
    console.log(`Total footnotes processed in processMarkdown: ${footnoteCount}`);
    
    // Split content by code blocks
    const parts = processed.split(/(```[\w]*\n[\s\S]*?```)/g);
    console.log('Content split into', parts.length, 'parts');
    parts.forEach((part, index) => {
      if (part.includes('footnote-wrapper')) {
        console.log(`Part ${index} contains footnotes:`, part.substring(0, 200));
      }
    });
    
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
        htmlContent = htmlContent.replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>');
        
        // Process unordered lists
        htmlContent = htmlContent.replace(/^-\s+(.+)$/gm, '<li>$1</li>');
        htmlContent = htmlContent.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        
        // Process paragraphs
        htmlContent = htmlContent.split('\n\n').map(paragraph => {
          paragraph = paragraph.trim();
          if (!paragraph) return '';
          
          // Don't wrap headers, lists, or footnote elements in p tags
          if (paragraph.startsWith('<h') || 
              paragraph.startsWith('<ul>') || 
              paragraph.startsWith('<ol>') ||
              paragraph.includes('footnote-wrapper')) {
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
    
    // Parse footnotes
    const { processedContent, footnotes: parsedFootnotes } = parseFootnotes(contentToProcess);
    setFootnotes(parsedFootnotes);
    
    // Parse P5Sketch components first
    const p5Segments = parseP5SketchComponents(processedContent);
    
    // Parse Video and PDF components from P5Sketch segments
    const finalSegments: ContentSegment[] = [];
    p5Segments.forEach(segment => {
      if (segment.type === 'p5sketch') {
        finalSegments.push(segment);
      } else {
        // Parse Video components from HTML segments
        const videoSegments = parseVideoComponents(segment.content);
        videoSegments.forEach(videoSegment => {
          if (videoSegment.type === 'video') {
            finalSegments.push(videoSegment);
          } else {
            // Parse PDF components from remaining HTML segments
            const pdfSegments = parsePDFComponents(videoSegment.content);
            pdfSegments.forEach(pdfSegment => {
              if (pdfSegment.type === 'pdf') {
                finalSegments.push(pdfSegment);
              } else {
                // Parse slideshow components from remaining HTML segments
                const slideshowSegments = parseSlideshowComponents(pdfSegment.content);
                slideshowSegments.forEach(slideshowSegment => {
                  if (slideshowSegment.type === 'slideshow') {
                    finalSegments.push(slideshowSegment);
                  } else {
                    // Process markdown for remaining HTML segments
                    const markdownSegments = processMarkdown(slideshowSegment.content);
                    finalSegments.push(...markdownSegments);
                  }
                });
              }
            });
          }
        });
      }
    });
    
    setContentSegments(finalSegments);
  }, [content]);

  useEffect(() => {
    if (contentSegments.length === 0) return;

    // Extract headings and footnotes after content is processed
    setTimeout(() => {
      const headingElements = document.querySelectorAll<HTMLElement>('h2[id], h3[id]');
      const extractedHeadings: Heading[] = Array.from(headingElements).map((heading) => ({
        id: heading.id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName.charAt(1))
      }));
      setHeadings(extractedHeadings);

      // Image click zoom - exclude images inside the slideshow
      const imgElements = document.querySelectorAll<HTMLImageElement>('.blog-content-container img');
      imgElements.forEach((img) => {
        if (img.closest('.gallery-slideshow')) return;
        img.style.cursor = 'zoom-in';
        img.onclick = () => handleImageClick(img.src);
      });

      // Setup footnote toggling with a delay to ensure DOM is ready
      setTimeout(() => {
        const footnoteButtons = document.querySelectorAll<HTMLButtonElement>('.footnote-button');
        console.log('Found footnote buttons:', footnoteButtons.length);
        
        footnoteButtons.forEach((button, index) => {
          console.log(`Setting up button ${index}:`, button);
          
          // Remove any existing listeners
          button.removeEventListener('click', handleFootnoteClick);
          
          // Add new listener
          button.addEventListener('click', handleFootnoteClick);
          
          // Also add onclick as backup
          button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const footnoteId = button.getAttribute('data-footnote-id');
            
            console.log('Footnote clicked via onclick:', { footnoteId });
            
            if (footnoteId) {
              toggleFootnote(footnoteId);
            }
          };
        });
      }, 200);



      // Add global click handler as backup
      const handleGlobalClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('footnote-button')) {
          e.preventDefault();
          e.stopPropagation();
          const footnoteId = target.getAttribute('data-footnote-id');
          
          console.log('Footnote clicked via global handler:', { footnoteId });
          
          if (footnoteId) {
            toggleFootnote(footnoteId);
          }
        }
      };

      document.addEventListener('click', handleGlobalClick);

      // No need to dispatch locomotive-update on blog pages since smooth scroll is disabled
    }, 100);
  }, [contentSegments]);

  // Separate function for footnote click handling
  const handleFootnoteClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const button = e.target as HTMLButtonElement;
    const footnoteId = button.getAttribute('data-footnote-id');
    
    console.log('Footnote clicked via event listener:', { footnoteId });
    
    if (footnoteId) {
      toggleFootnote(footnoteId);
    }
  };

  // Function to toggle footnote visibility
  const toggleFootnote = (id: string) => {
    console.log('toggleFootnote called with:', { id });
    console.log('All footnote contents in ref:', footnoteContentsRef.current);
    
    // Get content from ref
    const footnoteContent = footnoteContentsRef.current[id];
    console.log('Footnote content for id', id, ':', footnoteContent);
    
    if (!footnoteContent) {
      console.error('No footnote content found for id:', id);
      return;
    }
    
    // Remove highlight from all footnotes
    document.querySelectorAll('.footnote-highlight').forEach(el => {
      el.classList.remove('footnote-highlight');
    });
    
    // Remove any existing footnotes
    document.querySelectorAll('.dynamic-footnote').forEach(el => {
      el.remove();
    });
    
    // Get the button that was clicked
    const button = document.querySelector(`[data-footnote-id="${id}"]`) as HTMLElement;
    
    if (button) {
      const wrapper = button.closest('.footnote-wrapper') as HTMLElement;
      
      if (wrapper) {
        console.log('Wrapper:', wrapper);
        
        // Set wrapper position
        wrapper.style.position = 'relative';
        
        // Create the footnote with simple centered positioning
        const footnote = document.createElement('div');
        footnote.className = 'dynamic-footnote';
        footnote.style.position = 'absolute';
        footnote.style.left = '0%';
        footnote.style.top = '170%';
        footnote.style.zIndex = '1000';
        footnote.innerHTML = `
          <div class="footnote-content">
            <div class="footnote-header">
              <span class="footnote-number">${id}</span>
              <button class="footnote-close" onclick="closeFootnote('${id}')">×</button>
            </div>
            <div class="footnote-text"></div>
          </div>
        `;
        
        // Set the HTML content properly to render links
        const footnoteTextElement = footnote.querySelector('.footnote-text') as HTMLElement;
        if (footnoteTextElement) {
          footnoteTextElement.innerHTML = footnoteContent;
        }
        
        // Add the footnote
        wrapper.appendChild(footnote);
      }
      
      // Highlight the button
      button.classList.add('footnote-highlight');
    }
  };

  // Function to close footnotes
  const closeFootnote = (id: string) => {
    // Remove the footnote
    const footnote = document.querySelector(`.dynamic-footnote`);
    if (footnote) {
      footnote.remove();
    }
    
    // Remove highlight from the button
    const button = document.querySelector(`[data-footnote-id="${id}"]`) as HTMLElement;
    if (button) {
      button.classList.remove('footnote-highlight');
    }
  };

  // Make closeFootnote available globally
  useEffect(() => {
    (window as unknown as { closeFootnote: typeof closeFootnote }).closeFootnote = closeFootnote;
  }, []);

  // Function to handle image click and zoom
  const handleImageClick = (src: string) => {
    setZoomedImage(src);
  };

  const closeZoomedImage = () => {
    setZoomedImage(null);
  };

  // Get display values from props or parsed metadata
  const displayTitle = title || parsedData?.metadata.title || '';
  const displayDate = date || parsedData?.metadata.date;
  const displayAuthor = author || parsedData?.metadata.author;
  const displayImage = image || parsedData?.metadata.image;
  const displayDescription = description || parsedData?.metadata.description;

    return (
    <article className="prose dark:prose-invert max-w-none">
      {/* Main container with title and content centered relative to whole page */}
      <div className="relative w-full">
        {/* TOC on left side on large screens */}
        {headings.length > 0 && tocVisible && (
          <div className="hidden xl:block w-48" style={{ 
            position: 'fixed',
            left: `${tocPosition.left}rem`,
            top: `${tocPosition.top}rem`,
            zIndex: 10,
            maxHeight: 'calc(100vh - 320px)', 
            overflow: 'hidden',
            transition: 'top 0.3s ease-out, opacity 0.3s ease-out',
            opacity: tocVisible ? 1 : 0,
            backgroundColor: 'rgba(255, 0, 0, 0.1)' // Debug background
          }}>
            <TableOfContents headings={headings} />
          </div>
        )}
        
        {/* Content area - centered with respect to whole page */}
        <div className="mx-auto">
          {/* Header section with title, date, and description */}
          <header className="mb-12 text-center">
            {displayTitle && (
              <h1 className="text-6xl md:text-5xl font-medium mb-6 montreal">{displayTitle}</h1>
            )}
            <div className="flex items-center justify-center gap-4 text-gray-600 dark:text-gray-300 mb-6">
              {displayAuthor && <span>{displayAuthor}</span>}
              {displayAuthor && displayDate && <span>•</span>}
              {displayDate && (
                <time dateTime={displayDate}>
                  {(() => {
                    const [year, month, day] = displayDate.split('-').map(Number);
                    return new Date(year, month - 1, day).toLocaleDateString();
                  })()}
                </time>
              )}
            </div>
            {displayDescription && (
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">{displayDescription}</p>
            )}
          </header>



          {/* Main content */}
          <div className="blog-content-container max-w-3xl mx-auto">
            {contentSegments.map((segment, index) => (
              <div key={index}>
                {segment.type === 'html' ? (
                  <div dangerouslySetInnerHTML={{ __html: segment.content }} />
                ) : segment.type === 'p5sketch' && segment.p5Sketch ? (
                  <div>
                    <P5Sketch
                      sketchPath={segment.p5Sketch.sketchPath}
                      width={segment.p5Sketch.width}
                      height={segment.p5Sketch.height}
                      sketchWidth={segment.p5Sketch.sketchWidth}
                      sketchHeight={segment.p5Sketch.sketchHeight}
                      className={segment.p5Sketch.className}
                    />
                  </div>
                ) : segment.type === 'video' && segment.video ? (
                  <div>
                    <Video
                      src={segment.video.src}
                      width={segment.video.width}
                      height={segment.video.height}
                      controls={segment.video.controls}
                      autoPlay={segment.video.autoPlay}
                      muted={segment.video.muted}
                      loop={segment.video.loop}
                      poster={segment.video.poster}
                      className={segment.video.className}
                    />
                  </div>
                ) : segment.type === 'pdf' && segment.pdf ? (
                  <div>
                    <PDF
                      src={segment.pdf.src}
                      width={segment.pdf.width}
                      height={segment.pdf.height}
                      className={segment.pdf.className}
                    />
                  </div>
                ) : segment.type === 'slideshow' && segment.slideshow ? (
                  <div>
                    <GallerySlideshow
                      images={segment.slideshow.images}
                      className={segment.slideshow.className}
                    />
                  </div>
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
        </div>
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
    </article>
  );
}