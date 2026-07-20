// Local dev (`pnpm run dev`) runs the Vite dev server and the Worker as
// separate processes, so it needs an explicit cross-origin URL (see
// .env.example). In production the frontend and the /match, /room/* API
// routes are served by the same Worker, so same-origin is correct by default.
// VITE_MATCH_WORKER_URL is honored only in dev so a local .env can never leak
// into a production build.
const DEFAULT_WORKER_URL = "http://localhost:8787";

function workerBaseUrl(): string {
  if (import.meta.env.DEV && import.meta.env.VITE_MATCH_WORKER_URL) {
    return import.meta.env.VITE_MATCH_WORKER_URL;
  }
  if (typeof window !== "undefined") return window.location.origin;
  return DEFAULT_WORKER_URL;
}

export function matchWsUrl(path: string): string {
  const base = workerBaseUrl().replace(/^http/, "ws");
  return `${base}${path}`;
}
