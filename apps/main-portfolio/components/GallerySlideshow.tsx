'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface GallerySlideshowProps {
  images: string[];
  className?: string;
}

export default function GallerySlideshow({ images, className = '' }: GallerySlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Keyboard navigation - works even when zoomed
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'ArrowLeft') {
          setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else {
          setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        }
      } else if (e.key === 'Escape' && isZoomed) {
        setIsZoomed(false);
      }
    };

    // Use capture phase to ensure it works even when zoomed
    document.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [images.length, isZoomed]);

  // Prevent body scroll/layout shift when zoom is open
  useEffect(() => {
    if (isZoomed) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return;
  }, [isZoomed]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded my-8">
        <strong>Warning:</strong> No images found for slideshow.
      </div>
    );
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
    setIsZoomed(false);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageClick = () => {
    setIsZoomed((prev) => !prev);
  };

  const closeZoom = () => {
    setIsZoomed(false);
  };

  return (
    <div className="gallery-slideshow">
      {/* Zoom Overlay - Separate from main image */}
      {isZoomed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center"
          style={{ 
            zIndex: 999999
          }}
          onClick={closeZoom}
        >
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex]}
              alt={`Gallery image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh'
              }}
            />
            
            {/* Left Arrow - Always visible */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Right Arrow - Always visible */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-10"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={closeZoom}
              className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
              aria-label="Close zoom"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Image Display with Navigation Arrows */}
      <div className="mb-4 relative group">
        <div className="relative w-full h-96 md:h-[500px]">
          <Image
            src={images[currentIndex]}
            alt={`Gallery image ${currentIndex + 1}`}
            fill
            className="object-cover rounded-lg cursor-pointer transition-all duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            onClick={handleImageClick}
          />
          
          {/* Left Arrow - Always visible */}
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-10"
            aria-label="Previous image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Arrow - Always visible */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-10"
            aria-label="Next image"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Thumbnail Navigation - Properly Centered */}
      <div className="flex justify-center w-full">
        <div className="flex gap-2 overflow-x-auto thumbnail-container max-w-full px-4 items-center">
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative w-20 h-16 flex-shrink-0 cursor-pointer rounded transition-all duration-200 ${
                index === currentIndex 
                  ? 'ring-2 ring-blue-500 scale-105' 
                  : 'hover:scale-105'
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover rounded"
                sizes="80px"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Image Counter */}
      <div className="text-center text-sm text-gray-600 mt-2">
        {currentIndex + 1} of {images.length}
      </div>
    </div>
  );
}
