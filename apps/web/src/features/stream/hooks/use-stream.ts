import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "streaming" | "done" | "error";

export function useStream() {
  const [status, setStatus] = useState<Status>("idle");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const controllerRef = useRef<AbortController | null>(null);
  const bufferRef = useRef("");
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    if (bufferRef.current) {
      const next = bufferRef.current;
      bufferRef.current = "";
      setText((prev) => prev + next);
    }
  }, []);

  const schedule = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(flush);
  }, [flush]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    bufferRef.current = "";
  }, []);

  const start = useCallback(async () => {
    cancel();
    setText("");
    setError(null);
    setStatus("streaming");

    const controller = new AbortController();
    controllerRef.current = controller;

    const res = await fetch("/api/stream", { signal: controller.signal }).catch((err) => {
      if (err.name === "AbortError") return null;
      setError(err instanceof Error ? err.message : "stream failed");
      setStatus("error");
      return null;
    });
    if (!res) return;
    if (!res.ok || !res.body) {
      setStatus("error");
      setError(`HTTP ${res.status}`);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // raf-batched: avoid one render per character
    while (true) {
      const { value, done } = await reader.read().catch(() => ({ value: undefined, done: true }));
      if (done) break;
      if (value) {
        bufferRef.current += decoder.decode(value, { stream: true });
        schedule();
      }
    }
    bufferRef.current += decoder.decode();
    schedule();
    setStatus("done");
  }, [cancel, schedule]);

  useEffect(() => () => cancel(), [cancel]);

  return { status, text, error, start, cancel };
}
