import { useEffect, useRef, useState } from "react";
import type { ChatMessage, RoomClientEvent, RoomServerEvent } from "../../shared/match-protocol";
import { matchWsUrl } from "./match-config";
import { getIdentity } from "./session";

export type RoomStatus = "connecting" | "open" | "closed";

export function useChatRoom(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [identity] = useState(() => getIdentity());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = matchWsUrl(
      `/room/${roomId}?userId=${encodeURIComponent(identity.userId)}&name=${encodeURIComponent(identity.name)}`,
    );
    const ws = new WebSocket(url);
    wsRef.current = ws;
    setMessages([]);
    setPeerOnline(false);
    setPeerName(null);
    setStatus("connecting");

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data as string) as RoomServerEvent;
      switch (data.type) {
        case "history":
          setMessages(data.messages);
          if (data.peerNames.length > 0) {
            setPeerName(data.peerNames[0]);
            setPeerOnline(true);
          }
          break;
        case "message":
          setMessages((prev) => [...prev, data.message]);
          break;
        case "peer-joined":
          setPeerName(data.name);
          setPeerOnline(true);
          break;
        case "peer-left":
          setPeerOnline(false);
          break;
      }
    };

    return () => {
      ws.close(1000, "unmount");
      wsRef.current = null;
    };
  }, [roomId]);

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed || wsRef.current?.readyState !== WebSocket.OPEN) return;
    const event: RoomClientEvent = { type: "message", body: trimmed };
    wsRef.current.send(JSON.stringify(event));
  };

  return { messages, peerOnline, peerName, status, send, userId: identity.userId };
}
