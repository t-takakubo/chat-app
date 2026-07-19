import { useCallback, useEffect, useRef, useState } from "react";
import type { QueueServerEvent } from "../../shared/match-protocol";
import { matchWsUrl } from "./match-config";
import { getIdentity } from "./session";

export type MatchQueueStatus = "idle" | "searching" | "matched";

export type MatchResult = { roomId: string; partnerName: string };

export function useMatchQueue() {
  const [status, setStatus] = useState<MatchQueueStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    stopTimer();
    wsRef.current?.close(1000, "cancelled");
    wsRef.current = null;
  }, [stopTimer]);

  const start = useCallback(() => {
    disconnect();
    const identity = getIdentity();
    const url = matchWsUrl(
      `/match?userId=${encodeURIComponent(identity.userId)}&name=${encodeURIComponent(identity.name)}`,
    );
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setResult(null);
    setElapsed(0);
    setStatus("searching");

    intervalRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as QueueServerEvent;
      if (data.type === "matched") {
        stopTimer();
        setResult({ roomId: data.roomId, partnerName: data.partnerName });
        setStatus("matched");
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
    };
  }, [disconnect, stopTimer]);

  const cancel = useCallback(() => {
    disconnect();
    setStatus("idle");
    setElapsed(0);
  }, [disconnect]);

  useEffect(() => disconnect, [disconnect]);

  return { status, elapsed, result, start, cancel };
}
