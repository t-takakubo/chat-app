import type { Env } from "./env";

export async function notifyDiscord(env: Env, content: string): Promise<void> {
  if (!env.DISCORD_WEBHOOK_URL) return;

  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) {
      console.error(`Discord webhook failed: ${res.status} ${await res.text()}`);
    }
  } catch (err) {
    console.error("Discord webhook request threw", err);
  }
}
