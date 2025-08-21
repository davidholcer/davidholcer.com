'use client';

import { useEffect } from 'react';
import { isMobileDevice, getViewportDimensions } from '@/lib/utils';

interface MobileSketchRedirectProps {
  slug: string;
}

export default function MobileSketchRedirect({ slug }: MobileSketchRedirectProps) {
  useEffect(() => {
    if (typeof window !== 'undefined' && isMobileDevice()) {
      const { width: pageWidth, height: pageHeight } = getViewportDimensions();
      
      const sketchFilename = `${slug}.js`;
    
      const sketchUrl = `/api/sketch/${sketchFilename}?sketchWidth=${pageWidth}&sketchHeight=${pageHeight-25}&domWidth=${pageWidth}&domHeight=${pageHeight-25}&theme=dark`;
      window.location.href = sketchUrl;
    }
  }, [slug]);

  // This component doesn't render anything
  return null;
}
