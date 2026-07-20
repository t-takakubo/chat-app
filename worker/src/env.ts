import type { MatchQueue } from "./durable-objects/match-queue";
import type { ChatRoom } from "./durable-objects/chat-room";

export interface Env {
  MATCH_QUEUE: DurableObjectNamespace<MatchQueue>;
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
  ASSETS: Fetcher;
  DB: D1Database;
  ADMIN_USER: string;
  ADMIN_PASSWORD: string;
  DISCORD_WEBHOOK_URL?: string;
}
