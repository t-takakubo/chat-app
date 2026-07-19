import type { MatchQueue } from "./durable-objects/match-queue";
import type { ChatRoom } from "./durable-objects/chat-room";

export interface Env {
  MATCH_QUEUE: DurableObjectNamespace<MatchQueue>;
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
}
