"use client";

import React from 'react';

interface PDFProps {
  src: string;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const PDF: React.FC<PDFProps> = ({
  src,
  width = "100%",
  height = "600px",
  className = ""
}) => {
  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    margin: '1.5rem 0',
    borderRadius: '0.5rem',
    overflow: 'hidden',
    border: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
  };

  return (
    <div style={containerStyle} className={className}>
      <iframe
        src={`${src}.pdf#toolbar=1&navpanes=1&scrollbar=1`}
        width="100%"
        height="100%"
        style={{
          border: 'none',
          borderRadius: '0.5rem',
        }}
        title="PDF Viewer"
      >
        <p>Your browser does not support PDFs. 
          <a href={src} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
            Click here to download the PDF
          </a>
        </p>
      </iframe>
    </div>
  );
};
