import { afterEach, describe, expect, it, vi } from "vitest";
import { notifyDiscord } from "../src/discord";
import type { Env } from "../src/env";

function fakeEnv(webhookUrl?: string): Env {
  return { DISCORD_WEBHOOK_URL: webhookUrl } as Env;
}

describe("notifyDiscord", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("does nothing when no webhook URL is configured", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    await notifyDiscord(fakeEnv(undefined), "hello");

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts the message to the configured webhook", async () => {
    const fetchSpy = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchSpy);

    await notifyDiscord(fakeEnv("https://discord.com/api/webhooks/test"), "hello");

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://discord.com/api/webhooks/test",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: "hello" }),
      }),
    );
  });

  it("swallows errors from a failed request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    await expect(
      notifyDiscord(fakeEnv("https://discord.com/api/webhooks/test"), "hello"),
    ).resolves.toBeUndefined();
  });
});
