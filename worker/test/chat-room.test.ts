import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import type { RoomClientEvent, RoomServerEvent } from "../../shared/match-protocol";
import { collectMessages, openSocket, waitFor } from "./ws-helper";

function send(ws: WebSocket, event: RoomClientEvent) {
  ws.send(JSON.stringify(event));
}

describe("ChatRoom", () => {
  it("sends history and notifies the existing member when a peer joins", async () => {
    const roomId = crypto.randomUUID();
    const alice = await openSocket(`/room/${roomId}?userId=alice-id&name=Alice`);
    const aliceBox = collectMessages(alice);

    await waitFor(() => aliceBox.messages.length > 0);
    const aliceHistory = aliceBox.messages[0] as RoomServerEvent;
    expect(aliceHistory.type).toBe("history");
    if (aliceHistory.type !== "history") throw new Error("unreachable");
    expect(aliceHistory.messages).toEqual([]);
    expect(aliceHistory.peerNames).toEqual([]);

    const bob = await openSocket(`/room/${roomId}?userId=bob-id&name=Bob`);
    const bobBox = collectMessages(bob);

    await waitFor(() => bobBox.messages.length > 0);
    const bobHistory = bobBox.messages[0] as RoomServerEvent;
    expect(bobHistory.type).toBe("history");
    if (bobHistory.type !== "history") throw new Error("unreachable");
    expect(bobHistory.peerNames).toEqual(["Alice"]);

    await waitFor(() => aliceBox.messages.length > 1);
    const peerJoined = aliceBox.messages[1] as RoomServerEvent;
    expect(peerJoined).toEqual({ type: "peer-joined", name: "Bob" });
  });

  it("broadcasts a sent message to every member, including the sender", async () => {
    const roomId = crypto.randomUUID();
    const alice = await openSocket(`/room/${roomId}?userId=alice-id&name=Alice`);
    const aliceBox = collectMessages(alice);
    const bob = await openSocket(`/room/${roomId}?userId=bob-id&name=Bob`);
    const bobBox = collectMessages(bob);

    await waitFor(() => aliceBox.messages.length > 1 && bobBox.messages.length > 0);

    send(alice, { type: "message", body: "こんにちは" });

    await waitFor(() => aliceBox.messages.length > 2 && bobBox.messages.length > 1);

    const aliceReceived = aliceBox.messages.at(-1) as RoomServerEvent;
    const bobReceived = bobBox.messages.at(-1) as RoomServerEvent;

    expect(aliceReceived.type).toBe("message");
    expect(bobReceived).toEqual(aliceReceived);
    if (aliceReceived.type !== "message") throw new Error("unreachable");
    expect(aliceReceived.message.body).toBe("こんにちは");
    expect(aliceReceived.message.authorName).toBe("Alice");
  });

  it("notifies remaining members when a peer disconnects", async () => {
    const roomId = crypto.randomUUID();
    const alice = await openSocket(`/room/${roomId}?userId=alice-id&name=Alice`);
    const aliceBox = collectMessages(alice);
    const bob = await openSocket(`/room/${roomId}?userId=bob-id&name=Bob`);

    await waitFor(() => aliceBox.messages.length > 1);

    bob.close(1000, "leaving");

    await waitFor(() => aliceBox.messages.length > 2);
    const peerLeft = aliceBox.messages.at(-1) as RoomServerEvent;
    expect(peerLeft).toEqual({ type: "peer-left" });
  });

  it("replays persisted history to a client that (re)joins later", async () => {
    const roomId = crypto.randomUUID();
    const alice = await openSocket(`/room/${roomId}?userId=alice-id&name=Alice`);
    const aliceBox = collectMessages(alice);
    await waitFor(() => aliceBox.messages.length > 0);

    send(alice, { type: "message", body: "先に送っておくメッセージ" });
    await waitFor(() => aliceBox.messages.length > 1);

    const bob = await openSocket(`/room/${roomId}?userId=bob-id&name=Bob`);
    const bobBox = collectMessages(bob);
    await waitFor(() => bobBox.messages.length > 0);

    const bobHistory = bobBox.messages[0] as RoomServerEvent;
    expect(bobHistory.type).toBe("history");
    if (bobHistory.type !== "history") throw new Error("unreachable");
    expect(bobHistory.messages).toHaveLength(1);
    expect(bobHistory.messages[0].body).toBe("先に送っておくメッセージ");
  });

  it("rejects a third member once the room already has two", async () => {
    const roomId = crypto.randomUUID();
    await openSocket(`/room/${roomId}?userId=alice-id&name=Alice`);
    await openSocket(`/room/${roomId}?userId=bob-id&name=Bob`);

    const res = await SELF.fetch(`https://example.com/room/${roomId}?userId=carol-id&name=Carol`, {
      headers: { Upgrade: "websocket" },
    });
    expect(res.status).toBe(409);
  });
});
