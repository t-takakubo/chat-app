import { useCallback, useEffect, useRef, useState } from "react";
import type { QueueServerEvent } from "../../shared/match-protocol";
import { matchWsUrl } from "./match-config";
import { getIdentity } from "./session";
import { useJsonWebSocket } from "./use-json-websocket";

export type MatchQueueStatus = "idle" | "searching" | "matched";

export type MatchResult = { roomId: string; partnerName: string };

export function useMatchQueue() {
  const [status, setStatus] = useState<MatchQueueStatus>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const { connect, disconnect } = useJsonWebSocket<QueueServerEvent>({
    onMessage: (data) => {
      if (data.type === "matched") {
        stopTimer();
        setResult({ roomId: data.roomId, partnerName: data.partnerName });
        setStatus("matched");
      }
    },
  });

  const start = useCallback(() => {
    const identity = getIdentity();
    const url = matchWsUrl(
      `/match?userId=${encodeURIComponent(identity.userId)}&name=${encodeURIComponent(identity.name)}`,
    );
    setResult(null);
    setElapsed(0);
    setStatus("searching");
    connect(url);
    intervalRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
  }, [connect]);

  const cancel = useCallback(() => {
    stopTimer();
    disconnect(1000, "cancelled");
    setStatus("idle");
    setElapsed(0);
  }, [disconnect, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      disconnect();
    };
  }, [disconnect, stopTimer]);

  return { status, elapsed, result, start, cancel };
}
