'use client';

import { useEffect } from 'react';
import { isMobileDevice, getViewportDimensions } from '@/lib/utils';

interface MobileSketchRedirectProps {
  slug: string;
}

export default function MobileSketchRedirect({ slug }: MobileSketchRedirectProps) {
  useEffect(() => {
    // Only run on client side and if this is a mobile device with a sketch
    if (typeof window !== 'undefined' && isMobileDevice() ) {
      // Get actual viewport dimensions
      const { width: pageWidth, height: pageHeight } = getViewportDimensions();
      
              // Determine which sketch file to use based on the slug
      const sketchFilename = `${slug}.js`;
        
      
      // Redirect to the sketch API with actual viewport dimensions
      const sketchUrl = `/api/sketch/${sketchFilename}?sketchWidth=${pageWidth}&sketchHeight=${pageHeight}&domWidth=${pageWidth}&domHeight=${pageHeight}&theme=dark`;
      window.location.href = sketchUrl;
    }
  }, [slug]);

  // This component doesn't render anything
  return null;
}
