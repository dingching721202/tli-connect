// Performance Analytics and Monitoring

// Web Vitals tracking
interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
}

export function trackWebVitals(metric: WebVitalsMetric) {
  if (process.env.NODE_ENV === 'production') {
    // Track Core Web Vitals
    const { name, value, id } = metric;
    
    // Send to analytics service (e.g., Google Analytics)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as Window & { gtag: (...args: unknown[]) => void }).gtag('event', name, {
        event_category: 'Web Vitals',
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        event_label: id,
        non_interaction: true,
      });
    }
    
    // Console log for development
    console.log('Web Vitals:', { name, value, id });
  }
}

// Image loading performance tracking
export function trackImageLoad(src: string, loadTime: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Image loaded: ${src} in ${loadTime}ms`);
  }
}

// Page load performance
export function trackPageLoad() {
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
    });
  }
}

// Resource hints for better performance
export function addResourceHints() {
  if (typeof document !== 'undefined') {
    // Preconnect to external domains
    const domains = [
      'https://drive.google.com',
      'https://images.unsplash.com',
      'https://images.pexels.com'
    ];
    
    domains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }
}