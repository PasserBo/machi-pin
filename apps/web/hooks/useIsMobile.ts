import { useState, useEffect } from 'react';

/**
 * Hook to detect if the current device is a touch/mobile device
 * Uses pointer: coarse media query which is more accurate than User Agent
 * 
 * @returns isMobile - true if device primarily uses touch input
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the device has a coarse pointer (touch screen)
    // This is more reliable than checking User Agent
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    
    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Listen for changes (e.g., connecting/disconnecting touch screen)
    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isMobile;
}

export default useIsMobile;

