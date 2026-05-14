/**
 * Global Configuration for SmartHire Insights
 * All secrets MUST be set via environment variables — never hardcoded.
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// C-1: No hardcoded fallback — must be set in .env
export const API_SECRET = import.meta.env.VITE_API_SECRET;
if (!API_SECRET) {
  console.error(
    '[SmartHire] VITE_API_SECRET is not set. ' +
    'Create a .env file in /frontend with VITE_API_SECRET=your_key'
  );
}

export const DEMO_CREDENTIALS = {
  email: import.meta.env.VITE_DEMO_EMAIL || 'mahima@smarthire.ai',
  key:   import.meta.env.VITE_DEMO_KEY   || 'admin123'
};

// M-6: Renamed param to omitContentType for clarity
export const getHeaders = (omitContentType = false) => {
  const headers = { 'x-api-key': API_SECRET || '' };
  if (!omitContentType) headers['Content-Type'] = 'application/json';
  return headers;
};
