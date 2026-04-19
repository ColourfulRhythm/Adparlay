/**
 * Get the correct base URL for the application
 * Uses production URL in production, localhost in development
 */
export const getBaseUrl = (): string => {
  // Check if we're in production
  if (process.env.NODE_ENV === 'production') {
    return 'https://adparlay.com';
  }
  
  // In development, use localhost
  return window.location.origin;
};

/**
 * Get the correct domain for sharing links
 * Always uses production domain for sharing, even in development
 */
export const getShareUrl = (path: string): string => {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://adparlay.com' 
    : 'https://adparlay.com';
  
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
