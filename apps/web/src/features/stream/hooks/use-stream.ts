import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "streaming" | "done" | "error";

function isAbort(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

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
    setStatus((s) => (s === "streaming" ? "idle" : s));
  }, []);

  const start = useCallback(async () => {
    cancel();
    setText("");
    setError(null);
    setStatus("streaming");

    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      const res = await fetch("/api/stream", { signal: controller.signal });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // raf-batched: avoid one render per character
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bufferRef.current += decoder.decode(value, { stream: true });
        schedule();
      }
      bufferRef.current += decoder.decode();
      schedule();
      setStatus("done");
    } catch (err) {
      if (isAbort(err)) return;
      setError(err instanceof Error ? err.message : "stream failed");
      setStatus("error");
    }
  }, [cancel, schedule]);

  useEffect(() => () => cancel(), [cancel]);

  return { status, text, error, start, cancel };
}
