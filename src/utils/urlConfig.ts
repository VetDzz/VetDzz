// URL configuration for production and development
export const getBaseUrl = (): string => {
  // Always use the current origin - this works for any deployment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to production URL
  return 'https://vetdzz-2.onrender.com';
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
