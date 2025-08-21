'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FootnoteData {
  id: string;
  text: string;
  content: string;
  position?: number;
}

interface FootnoteProps {
  id: string;
  text: string;
  content: string;
  onFootnoteClick: (id: string) => void;
}

export function Footnote({ id, text, content, onFootnoteClick }: FootnoteProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span className="inline relative group">
      {text}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="footnote-button"
        title={content}
        data-footnote-id={id}
      >
        {id}
      </button>
      
      {/* Inline footnote popup */}
      {isVisible && (
        <div className="absolute z-50 left-0 top-full mt-2 w-80 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {content}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
    </span>
  );
}

export function FootnotePanel({ footnotes }: { footnotes: FootnoteData[] }) {
  if (footnotes.length === 0) return null;

  return (
    <div className="notes-sidebar">
              <h3 className="text-lg font-medium mb-4 montreal">Footnotes</h3>
      <div className="space-y-3">
        {footnotes.map((footnote) => (
          <div key={footnote.id} className="text-sm transition-all duration-200" data-footnote-id={footnote.id}>
            <span className="inline-flex items-center justify-center w-5 h-5 mr-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              {footnote.id}
            </span>
            <span className="text-gray-700 dark:text-gray-300">
              {footnote.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parse footnotes and images from markdown content
export function parseFootnotes(content: string): { processedContent: string; footnotes: FootnoteData[] } {
  const footnotes: FootnoteData[] = [];
  let footnoteCounter = 1;
  let processedContent = content;
  

  
  // First, handle newlines
  const newlineRegex = /!\[\[newline\]\]/g;
  processedContent = processedContent.replace(newlineRegex, '<br>');
  
  // Then, handle images with custom image component
  const imageRegex = /!\[\[image\]\]\[\[(.*?)\]\]/g;
  processedContent = processedContent.replace(imageRegex, (match, imagePath) => {
    return `<div class="blog-image-container"><img src="${imagePath}" alt="Blog image" class="rounded-lg shadow-lg w-full max-w-4xl mx-auto" /></div>`;
  });
  
  // Then, handle footnotes - only if the first bracket contains "footnote"
  // Exclude matches that are within code blocks or frontmatter
  const footnoteRegex = /!\[\[([^\]]+)\]\]\[\[([\s\S]*?)\]\]/g;
  let footnoteMatch;
  
  while ((footnoteMatch = footnoteRegex.exec(processedContent)) !== null) {
    const [fullMatch, text, footnoteContent] = footnoteMatch;
    
    // Only process as footnote if the text contains "footnote"
    if (!text.toLowerCase().includes('footnote')) {
      continue; // Skip if not a footnote
    }
    
    const id = footnoteCounter.toString();
    
    // Process markdown links in footnote content
    const processedFootnoteContent = footnoteContent
      // Convert markdown links to HTML
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Convert bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert newlines to <br> tags
      .replace(/\n/g, '<br>');
    
    footnotes.push({
      id,
      text,
      content: processedFootnoteContent,
      position: footnoteCounter
    });
    
    // Use a different format that's easier to parse - encode the content
    const encodedContent = encodeURIComponent(processedFootnoteContent);
    const replacement = `<footnote id="${id}" text="${text}" content="${encodedContent}"></footnote>`;
    
    // Replace the match in the processed content
    processedContent = processedContent.replace(fullMatch, replacement);
    
    footnoteCounter++;
  }
  
  return { processedContent, footnotes };
} 