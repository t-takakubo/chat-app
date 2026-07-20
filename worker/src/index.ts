import type { Env } from "./env";
import { handleAdminRequest } from "./admin";

export { MatchQueue } from "./durable-objects/match-queue";
export { ChatRoom } from "./durable-objects/chat-room";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env, url);
    }

    if (url.pathname === "/match") {
      const stub = env.MATCH_QUEUE.getByName("global");
      return stub.fetch(request);
    }

    const roomMatch = url.pathname.match(/^\/room\/([^/]+)$/);
    if (roomMatch) {
      const roomId = roomMatch[1];
      const stub = env.CHAT_ROOM.getByName(roomId);
      return stub.fetch(request);
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    // "/" is prerendered into index.html at build time; other client-routed
    // pages hydrate from the SPA fallback shell. Anything else is a real 404
    // (still rendered by the SPA's not-found page) so crawlers don't index
    // junk URLs as soft-404s.
    const isClientRoute = /^\/chat\/room\/[^/]+$/.test(url.pathname);
    const fallback = await env.ASSETS.fetch(new URL("/__spa-fallback.html", url));
    return new Response(fallback.body, {
      status: isClientRoute ? 200 : 404,
      headers: fallback.headers,
    });
  },
} satisfies ExportedHandler<Env>;
