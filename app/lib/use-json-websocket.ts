import { useCallback, useRef } from "react";

type JsonWebSocketHandlers<TServerEvent> = {
  onMessage: (event: TServerEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export function useJsonWebSocket<TServerEvent>(handlers: JsonWebSocketHandlers<TServerEvent>) {
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const disconnect = useCallback((code = 1000, reason = "closed") => {
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onmessage = null;
      wsRef.current.close(code, reason);
    }
    wsRef.current = null;
  }, []);

  const connect = useCallback(
    (url: string) => {
      disconnect();
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => handlersRef.current.onOpen?.();
      ws.onclose = () => {
        wsRef.current = null;
        handlersRef.current.onClose?.();
      };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as TServerEvent;
          handlersRef.current.onMessage(data);
        } catch {
          // 不正なペイロードは無視
        }
      };

      return ws;
    },
    [disconnect],
  );

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return false;
    wsRef.current.send(JSON.stringify(data));
    return true;
  }, []);

  return { connect, disconnect, send };
}
