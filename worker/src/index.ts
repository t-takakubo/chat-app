import type { Env } from "./env";

export { MatchQueue } from "./durable-objects/match-queue";
export { ChatRoom } from "./durable-objects/chat-room";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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

    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
