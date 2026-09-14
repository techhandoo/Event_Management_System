/**
 * Single owner of environment/config constants.
 *
 * API base URL resolution order:
 *   1. VITE_API_URL env var (set in Vercel project settings or .env.local)
 *   2. Live prod URL fallback
 *
 * README documents VITE_API_URL — this module is what makes that true.
 * `index.html` also preconnects to the prod host; if you ever move hosts,
 * update the <link rel="preconnect"> there too (static HTML can't read env).
 */
export const API_BASE_URL: string =
  (import.meta.env?.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://eventry-api.onrender.com/api';
