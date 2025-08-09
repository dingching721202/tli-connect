'use client';

import { useEffect } from 'react';
import { addResourceHints, trackPageLoad } from '@/utils/analytics';

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Add resource hints for external domains
    addResourceHints();
    
    // Track page load performance
    trackPageLoad();
    
    // Prefetch critical resources
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch next page routes during idle time
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
          if (link instanceof HTMLAnchorElement) {
            const href = link.getAttribute('href');
            if (href && !href.includes('#')) {
              const prefetchLink = document.createElement('link');
              prefetchLink.rel = 'prefetch';
              prefetchLink.href = href;
              document.head.appendChild(prefetchLink);
            }
          }
        });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}