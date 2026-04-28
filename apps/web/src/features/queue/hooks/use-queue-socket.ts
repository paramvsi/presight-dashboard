import { useEffect, useRef, useState } from "react";
import { ServerToClientMessageSchema } from "@presight/shared";
import { useQueueStore } from "@/features/queue/store/queue-store";

type ConnectionStatus = "connecting" | "open" | "closed";

const RECONNECT_DELAYS_MS = [500, 1000, 2000, 5000];

export function useQueueSocket() {
  const clientId = useQueueStore((s) => s.clientId);
  const setResult = useQueueStore((s) => s.setResult);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const attemptRef = useRef(0);
  const closedByUnmount = useRef(false);

  useEffect(() => {
    closedByUnmount.current = false;
    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      socket = new WebSocket(`${protocol}//${window.location.host}/ws?clientId=${clientId}`);
      setStatus("connecting");

      socket.onopen = () => {
        attemptRef.current = 0;
        setStatus("open");
      };

      socket.onmessage = (event) => {
        const raw = typeof event.data === "string" ? event.data : null;
        if (!raw) return;
        // ws message keyed by jobId; clientId scopes the subscription
        const parsed = ServerToClientMessageSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) return;
        if (parsed.data.type === "job_result") setResult(parsed.data.jobId, parsed.data.result);
      };

      socket.onclose = () => {
        setStatus("closed");
        if (closedByUnmount.current) return;
        const delay = RECONNECT_DELAYS_MS[Math.min(attemptRef.current, RECONNECT_DELAYS_MS.length - 1)] ?? 5000;
        attemptRef.current++;
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      closedByUnmount.current = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socket?.close();
    };
  }, [clientId, setResult]);

  return status;
}
