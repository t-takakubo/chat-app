const STORAGE_KEY = "chat-app-web:identity";

export type Identity = { userId: string; name: string };

function randomName(): string {
  return `ゲスト${Math.floor(1000 + Math.random() * 9000)}`;
}

export function getIdentity(): Identity {
  if (typeof window === "undefined") {
    return { userId: "", name: "" };
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Identity;
    } catch {
      // fall through and regenerate
    }
  }

  const identity: Identity = { userId: crypto.randomUUID(), name: randomName() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

export function setDisplayName(name: string): Identity {
  const identity = { ...getIdentity(), name };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}
