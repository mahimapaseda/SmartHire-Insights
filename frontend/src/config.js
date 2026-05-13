/**
 * Global Configuration for SmartHire Insights
 */

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_SECRET = import.meta.env.VITE_API_SECRET || 'sh_secret_key_2026';

export const DEMO_CREDENTIALS = {
  email: import.meta.env.VITE_DEMO_EMAIL || 'mahima@smarthire.ai',
  key: import.meta.env.VITE_DEMO_KEY || 'admin123'
};

export const getHeaders = (isMultipart = false) => {
  const headers = { 'x-api-key': API_SECRET };
  if (!isMultipart) headers['Content-Type'] = 'application/json';
  return headers;
};
