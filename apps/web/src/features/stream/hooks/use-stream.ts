import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "streaming" | "done" | "error";

const REVEAL_PER_FRAME = 8;

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

export function useStream() {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const fullRef = useRef("");
  const cursorRef = useRef(0);
  const streamDoneRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  // raf loop reveals N chars/frame; stops when cursor caught up and stream is closed
  const tick = useCallback(() => {
    rafRef.current = null;
    const total = fullRef.current.length;
    const cursor = cursorRef.current;
    if (cursor < total) {
      const next = Math.min(cursor + REVEAL_PER_FRAME, total);
      cursorRef.current = next;
      setText(fullRef.current.slice(0, next));
    }
    if (cursorRef.current >= total && streamDoneRef.current) {
      setStatus("done");
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRaf = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    stopRaf();
    fullRef.current = "";
    cursorRef.current = 0;
    streamDoneRef.current = false;
    setStatus((s) => (s === "streaming" ? "idle" : s));
  }, []);

  const start = useCallback(async () => {
    cancel();
    setText("");
    setError(null);
    setStatus("streaming");
    fullRef.current = "";
    cursorRef.current = 0;
    streamDoneRef.current = false;

    const controller = new AbortController();
    controllerRef.current = controller;
    rafRef.current = requestAnimationFrame(tick);

    try {
      const res = await fetch("/api/stream", { signal: controller.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fullRef.current += decoder.decode(value, { stream: true });
      }
      fullRef.current += decoder.decode();
      streamDoneRef.current = true;
    } catch (err) {
      if (isAbort(err)) return;
      stopRaf();
      setError(err instanceof Error ? err.message : "stream failed");
      setStatus("error");
    }
  }, [cancel, tick]);

  useEffect(() => () => cancel(), [cancel]);

  return { status, text, error, start, cancel };
}
