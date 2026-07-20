/**
 * Allowed browser origins.
 *
 * Set CORS_ORIGINS to a comma-separated list in production, e.g.
 *   CORS_ORIGINS="https://booking.purbayan-paroki.org,https://parish-booking.vercel.app"
 *
 * When unset (local dev) we fall back to the Vite dev server. We deliberately
 * do NOT fall back to "*", because the API is credentialed — a wildcard would
 * let any site call it with a umat's bearer token.
 */
const DEV_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function allowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) return DEV_ORIGINS;
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/$/, '')) // tolerate trailing slashes
    .filter(Boolean);
}

/** Shared by the HTTP layer and the Socket.io gateway so they can't drift. */
export function isOriginAllowed(origin: string | undefined): boolean {
  // Non-browser callers (curl, server-to-server, the display kiosk) send no Origin.
  if (!origin) return true;
  return allowedOrigins().includes(origin.replace(/\/$/, ''));
}
