import { useEffect, useRef, useState } from "react";
import type { ChatMessage, RoomClientEvent, RoomServerEvent } from "../../shared/match-protocol";
import { matchWsUrl } from "./match-config";
import { getIdentity } from "./session";
import { useJsonWebSocket } from "./use-json-websocket";

export type RoomStatus = "connecting" | "open" | "closed";

// 相手の「入力中」false通知が届かなかった場合に自動で消すまでの猶予
const PEER_TYPING_TIMEOUT_MS = 5000;

function isPageVisible() {
  return document.visibilityState === "visible" && document.hasFocus();
}

export function useChatRoom(roomId: string, onPeerLeft?: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerConnected, setPeerConnected] = useState(false);
  const [peerVisible, setPeerVisible] = useState(true);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerName, setPeerName] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomStatus>("connecting");
  const [identity] = useState(() => getIdentity());
  const peerTypingTimeoutRef = useRef<number | null>(null);

  const clearPeerTypingTimeout = () => {
    if (peerTypingTimeoutRef.current !== null) {
      window.clearTimeout(peerTypingTimeoutRef.current);
      peerTypingTimeoutRef.current = null;
    }
  };

  const {
    connect,
    disconnect,
    send: sendJson,
  } = useJsonWebSocket<RoomServerEvent>({
    onOpen: () => {
      setStatus("open");
      sendJson({ type: "presence", visible: isPageVisible() } satisfies RoomClientEvent);
    },
    onClose: () => setStatus("closed"),
    onMessage: (data) => {
      switch (data.type) {
        case "history":
          setMessages(data.messages);
          if (data.peerNames.length > 0) {
            setPeerName(data.peerNames[0]);
            setPeerConnected(true);
            setPeerVisible(data.peerVisible[0] ?? true);
          }
          break;
        case "message":
          setMessages((prev) => [...prev, data.message]);
          if (data.message.authorId !== identity.userId) {
            clearPeerTypingTimeout();
            setPeerTyping(false);
          }
          break;
        case "peer-joined":
          setPeerName(data.name);
          setPeerConnected(true);
          setPeerVisible(true);
          break;
        case "peer-left":
          setPeerConnected(false);
          setPeerVisible(true);
          clearPeerTypingTimeout();
          setPeerTyping(false);
          onPeerLeft?.();
          break;
        case "peer-presence":
          setPeerVisible(data.visible);
          break;
        case "peer-typing":
          clearPeerTypingTimeout();
          setPeerTyping(data.isTyping);
          if (data.isTyping) {
            peerTypingTimeoutRef.current = window.setTimeout(() => {
              setPeerTyping(false);
              peerTypingTimeoutRef.current = null;
            }, PEER_TYPING_TIMEOUT_MS);
          }
          break;
      }
    },
  });

  useEffect(() => {
    const url = matchWsUrl(
      `/room/${roomId}?userId=${encodeURIComponent(identity.userId)}&name=${encodeURIComponent(identity.name)}`,
    );
    setMessages([]);
    setPeerConnected(false);
    setPeerVisible(true);
    setPeerTyping(false);
    setPeerName(null);
    setStatus("connecting");
    connect(url);

    return () => {
      clearPeerTypingTimeout();
      disconnect(1000, "unmount");
    };
  }, [roomId, identity, connect, disconnect]);

  useEffect(() => {
    const notify = () => {
      sendJson({ type: "presence", visible: isPageVisible() } satisfies RoomClientEvent);
    };
    document.addEventListener("visibilitychange", notify);
    window.addEventListener("focus", notify);
    window.addEventListener("blur", notify);
    return () => {
      document.removeEventListener("visibilitychange", notify);
      window.removeEventListener("focus", notify);
      window.removeEventListener("blur", notify);
    };
  }, [sendJson]);

  const send = (body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const event: RoomClientEvent = { type: "message", body: trimmed };
    sendJson(event);
  };

  const sendTyping = (isTyping: boolean) => {
    sendJson({ type: "typing", isTyping } satisfies RoomClientEvent);
  };

  const leave = () => {
    disconnect(1000, "left");
  };

  return {
    messages,
    peerOnline: peerConnected && peerVisible,
    peerTyping,
    peerName,
    status,
    send,
    sendTyping,
    leave,
    userId: identity.userId,
  };
}
