import { useState, useEffect } from 'react';

interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export function useImageDimensions(imageSrc: string | null): ImageDimensions | null {
  const [dimensions, setDimensions] = useState<ImageDimensions | null>(null);

  useEffect(() => {
    if (!imageSrc) {
      setDimensions(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      setDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };
    img.onerror = () => {
      // Fallback to default aspect ratio if image fails to load
      setDimensions({
        width: 4,
        height: 3,
        aspectRatio: 4/3
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  return dimensions;
} 