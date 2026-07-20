import { SELF } from "cloudflare:test";
import { vi } from "vitest";

export async function openSocket(path: string): Promise<WebSocket> {
  const res = await SELF.fetch(`https://example.com${path}`, {
    headers: { Upgrade: "websocket" },
  });
  const ws = res.webSocket;
  if (!ws) throw new Error(`expected a websocket upgrade for ${path}, got status ${res.status}`);
  ws.accept();
  return ws;
}

export function collectMessages(ws: WebSocket): { messages: unknown[] } {
  const box = { messages: [] as unknown[] };
  ws.addEventListener("message", (event) => {
    box.messages.push(JSON.parse(event.data as string));
  });
  return box;
}

export async function waitFor(check: () => boolean, timeoutMs = 1000): Promise<void> {
  await vi.waitFor(
    () => {
      if (!check()) throw new Error("condition not met");
    },
    { timeout: timeoutMs, interval: 10 },
  );
}
