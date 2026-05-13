/**
 * Centralised API helper.
 *
 * In development Vite proxies /api → http://localhost:5000 so we use a
 * relative base URL.  In Docker the same proxy rule forwards to the
 * "backend" service, so relative URLs work there too.
 *
 * If you ever need to point directly at a remote server set
 * VITE_API_BASE=https://api.example.com in your .env file.
 *
 * The API key is read from VITE_API_KEY (defaults to the dev key).
 * Set it in .env.local for local dev, or as a Docker env var in production.
 */

const BASE = (typeof __API_BASE__ !== 'undefined' && __API_BASE__)
  ? __API_BASE__
  : '';

const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key-change-in-production';

/**
 * Thin fetch wrapper that prepends the base URL, injects the API key
 * header, and throws on non-2xx responses.
 *
 * @param {string} path   - e.g. '/api/candidates'
 * @param {RequestInit} [options]
 * @returns {Promise<any>} parsed JSON body
 */
export async function apiFetch(path, options = {}) {
  const headers = {
    'X-API-Key': API_KEY,
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.error || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

export default apiFetch;
