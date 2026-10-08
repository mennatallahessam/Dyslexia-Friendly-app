// API base URL configuration
// Uses VITE_API_BASE_URL if defined, otherwise falls back to empty string for relative paths in production or localhost in development
export const API_BASE_URL: string = 
  import.meta.env.VITE_API_BASE_URL !== undefined 
    ? import.meta.env.VITE_API_BASE_URL 
    : (import.meta.env.DEV ? 'http://localhost:3000' : '');
