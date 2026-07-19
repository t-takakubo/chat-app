const DEFAULT_WORKER_URL = "http://localhost:8787";

function workerBaseUrl(): string {
  return import.meta.env.VITE_MATCH_WORKER_URL || DEFAULT_WORKER_URL;
}

export function matchWsUrl(path: string): string {
  const base = workerBaseUrl().replace(/^http/, "ws");
  return `${base}${path}`;
}
