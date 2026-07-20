import { DurableObject } from "cloudflare:workers";
import type { Env } from "../env";
import type { QueueServerEvent } from "../../../shared/match-protocol";
import type { Identity } from "../../../shared/identity";
import { notifyDiscord } from "../discord";

const WAITING_TAG = "waiting";

export class MatchQueue extends DurableObject<Env> {
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

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server, [WAITING_TAG]);
    server.serializeAttachment({ userId, name } satisfies Identity);
    this.ctx.waitUntil(
      notifyDiscord(
        this.env,
        `🔍 **${name}** がマッチング待機を開始しました\n<https://chat.quickformats.com>`,
      ),
    );

    this.tryPair();

    return new Response(null, { status: 101, webSocket: client });
  }

  private tryPair() {
    const alive = this.ctx
      .getWebSockets(WAITING_TAG)
      .filter((ws) => ws.readyState === WebSocket.OPEN);

    while (alive.length >= 2) {
      const a = alive.shift()!;
      const b = alive.shift()!;
      const identityA = a.deserializeAttachment() as Identity;
      const identityB = b.deserializeAttachment() as Identity;
      const roomId = crypto.randomUUID();

      this.sendMatched(a, roomId, identityB.name);
      this.sendMatched(b, roomId, identityA.name);
      this.safeClose(a, 1000, "matched");
      this.safeClose(b, 1000, "matched");
    }
  }

  private sendMatched(ws: WebSocket, roomId: string, partnerName: string) {
    const event: QueueServerEvent = { type: "matched", roomId, partnerName };
    ws.send(JSON.stringify(event));
  }

  private safeClose(ws: WebSocket, code: number, reason: string) {
    try {
      ws.close(code, reason);
    } catch {
      // already closed on the client side; nothing to do
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string) {
    this.safeClose(ws, code, reason);
  }
}
