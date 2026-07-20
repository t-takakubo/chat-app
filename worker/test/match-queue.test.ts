import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { QueueServerEvent } from "../../shared/match-protocol";
import { collectMessages, openSocket, waitFor } from "./ws-helper";

describe("MatchQueue", () => {
  it("pairs two waiting clients and tells each other's name", async () => {
    const alice = await openSocket("/match?userId=alice-id&name=Alice");
    const aliceBox = collectMessages(alice);
    const bob = await openSocket("/match?userId=bob-id&name=Bob");
    const bobBox = collectMessages(bob);

    await waitFor(() => aliceBox.messages.length > 0 && bobBox.messages.length > 0);

    const aliceEvent = aliceBox.messages[0] as QueueServerEvent;
    const bobEvent = bobBox.messages[0] as QueueServerEvent;

    expect(aliceEvent.type).toBe("matched");
    expect(bobEvent.type).toBe("matched");
    if (aliceEvent.type !== "matched" || bobEvent.type !== "matched")
      throw new Error("unreachable");

    expect(aliceEvent.partnerName).toBe("Bob");
    expect(bobEvent.partnerName).toBe("Alice");
    expect(aliceEvent.roomId).toBe(bobEvent.roomId);
  });

  it("leaves a lone client waiting until a partner joins", async () => {
    const alice = await openSocket("/match?userId=alice-id-2&name=Alice2");
    const aliceBox = collectMessages(alice);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(aliceBox.messages).toHaveLength(0);

    const bob = await openSocket("/match?userId=bob-id-2&name=Bob2");
    const bobBox = collectMessages(bob);

    await waitFor(() => aliceBox.messages.length > 0 && bobBox.messages.length > 0);
    expect((aliceBox.messages[0] as QueueServerEvent).type).toBe("matched");
  });

  it("rejects requests missing userId or name", async () => {
    const res = await SELF.fetch("https://example.com/match?userId=only-id", {
      headers: { Upgrade: "websocket" },
    });
    expect(res.status).toBe(400);
  });
});
