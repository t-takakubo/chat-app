import { DurableObject } from "cloudflare:workers";
import type { Env } from "../env";
import type { ChatMessage, RoomClientEvent, RoomServerEvent } from "../../../shared/match-protocol";

type Identity = { userId: string; name: string };

type MessageRow = {
  id: number;
  author_id: string;
  author_name: string;
  body: string;
  created_at: number;
};

const MEMBER_TAG = "member";
const MAX_MEMBERS = 2;
const MAX_BODY_LENGTH = 2000;
const HISTORY_LIMIT = 200;

function rowToMessage(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  };
}

export class ChatRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    void ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const name = url.searchParams.get("name");
    if (!userId || !name) {
      return new Response("Missing userId or name", { status: 400 });
    }

    const existingMembers = this.ctx.getWebSockets(MEMBER_TAG);
    if (existingMembers.length >= MAX_MEMBERS) {
      return new Response("Room is full", { status: 409 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server, [MEMBER_TAG]);
    server.serializeAttachment({ userId, name } satisfies Identity);

    const history = this.ctx.storage.sql
      .exec<MessageRow>(
        "SELECT id, author_id, author_name, body, created_at FROM messages ORDER BY id ASC LIMIT ?",
        HISTORY_LIMIT,
      )
      .toArray();
    const peerNames = existingMembers.map(
      (member) => (member.deserializeAttachment() as Identity).name,
    );
    this.send(server, { type: "history", messages: history.map(rowToMessage), peerNames });

    for (const member of existingMembers) {
      this.send(member, { type: "peer-joined", name });
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string") return;

    let event: RoomClientEvent;
    try {
      event = JSON.parse(message);
    } catch {
      return;
    }
    if (event.type !== "message") return;

    const body = event.body.trim().slice(0, MAX_BODY_LENGTH);
    if (!body) return;

    const identity = ws.deserializeAttachment() as Identity;
    const createdAt = Date.now();
    const row = this.ctx.storage.sql
      .exec<MessageRow>(
        "INSERT INTO messages (author_id, author_name, body, created_at) VALUES (?, ?, ?, ?) RETURNING id, author_id, author_name, body, created_at",
        identity.userId,
        identity.name,
        body,
        createdAt,
      )
      .one();

    const chatMessage = rowToMessage(row);
    for (const member of this.ctx.getWebSockets(MEMBER_TAG)) {
      this.send(member, { type: "message", message: chatMessage });
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    try {
      ws.close(code, reason);
    } catch {
      // already closed on the client side; nothing to do
    }
    for (const member of this.ctx.getWebSockets(MEMBER_TAG)) {
      this.send(member, { type: "peer-left" });
    }
  }

  private send(ws: WebSocket, event: RoomServerEvent) {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(event));
    } catch {
      // socket died between the readyState check and send; ignore
    }
  }
}
