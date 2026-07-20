import type { Config } from "@react-router/dev/config";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  // Pre-render the landing page at build time so crawlers and OGP scrapers
  // get real HTML (title, meta, JSON-LD) without executing JavaScript.
  prerender: ["/"],
} satisfies Config;
