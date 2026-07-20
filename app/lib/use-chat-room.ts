import { useEffect, useState } from "react";
import type { ChatMessage, RoomClientEvent, RoomServerEvent } from "../../shared/match-protocol";
import { matchWsUrl } from "./match-config";
import { getIdentity } from "./session";
import { useJsonWebSocket } from "./use-json-websocket";

export type RoomStatus = "connecting" | "open" | "closed";

export function useChatRoom(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerOnline, setPeerOnline] = useState(false);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [identity] = useState(() => getIdentity());

  const {
    connect,
    disconnect,
    send: sendJson,
  } = useJsonWebSocket<RoomServerEvent>({
    onOpen: () => setStatus("open"),
    onClose: () => setStatus("closed"),
    onMessage: (data) => {
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
    },
  });

  useEffect(() => {
    const url = matchWsUrl(
      `/room/${roomId}?userId=${encodeURIComponent(identity.userId)}&name=${encodeURIComponent(identity.name)}`,
    );
    setMessages([]);
    setPeerOnline(false);
    setPeerName(null);
    setStatus("connecting");
    connect(url);

    return () => disconnect(1000, "unmount");
  }, [roomId, identity, connect, disconnect]);

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const event: RoomClientEvent = { type: "message", body: trimmed };
    sendJson(event);
  };

  return { messages, peerOnline, peerName, status, send, userId: identity.userId };
}
