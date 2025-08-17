// URL configuration for production and development
export const getBaseUrl = (): string => {
  // In production, always use the production URL
  if (import.meta.env.PROD) {
    return 'https://sihaa-express.vercel.app';
  }
  
  // In development, check if we're running on localhost
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If we're on localhost or 127.0.0.1, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.protocol}//${hostname}:${window.location.port}`;
    }
    
    // Otherwise, use the production URL (for preview deployments)
    return 'https://sihaa-express.vercel.app';
  }
  
  // Fallback to production URL
  return 'https://sihaa-express.vercel.app';
};

// Get the correct redirect URL for authentication
export const getAuthRedirectUrl = (path: string = ''): string => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};

// Environment detection
export const isProduction = (): boolean => {
  return import.meta.env.PROD;
};

export const isDevelopment = (): boolean => {
  return import.meta.env.DEV;
};
