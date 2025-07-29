'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface BlogPostProps {
  content: string;
  title: string;
  date: string;
  author: string;
}

interface Footnote {
  id: string;
  content: string;
}

export default function BlogPost({ content, title, date, author }: BlogPostProps) {
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);

  useEffect(() => {
    // Extract headings from content
    const headingElements = document.querySelectorAll('h2, h3');
    const extractedHeadings = Array.from(headingElements).map((heading) => ({
      id: heading.id,
      text: heading.textContent || '',
    }));
    setHeadings(extractedHeadings);

    // Extract footnotes from content
    const footnoteElements = document.querySelectorAll('.footnote');
    const extractedFootnotes = Array.from(footnoteElements).map((footnote) => ({
      id: footnote.id,
      content: footnote.textContent || '',
    }));
    setFootnotes(extractedFootnotes);
  }, [content]);

  return (
    <article className="prose dark:prose-invert max-w-none">
      <header className="mb-8">
        <h1 className="text-4xl font-medium mb-4 saans">{title}</h1>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <span>{author}</span>
          <span>•</span>
          <time dateTime={date}>{new Date(date).toLocaleDateString()}</time>
        </div>
      </header>

      {headings.length > 0 && (
        <nav className="toc">
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

      {footnotes.length > 0 && (
        <aside className="footnotes">
          <h2 className="text-lg font-medium mb-2 saans">Notes</h2>
          <ol className="list-decimal pl-4">
            {footnotes.map((footnote) => (
              <li key={footnote.id} id={`note-${footnote.id}`}>
                {footnote.content}
              </li>
            ))}
          </ol>
        </aside>
      )}

      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
} 