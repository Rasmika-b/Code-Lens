import { useState, useCallback } from "react";

export function useReview() {
  const [status, setStatus] = useState("idle"); // idle | streaming | done | error
  const [streamText, setStreamText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = useCallback(async ({ code, file, filename }) => {
    setStatus("streaming");
    setStreamText("");
    setResult(null);
    setError(null);

    try {
      const formData = new FormData();
      if (code) formData.append("code", code);
      if (file) formData.append("file", file);
      if (filename) formData.append("filename", filename);

      const response = await fetch("/api/review", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7).trim();
            const dataLine = lines[lines.indexOf(line) + 1];
            if (!dataLine?.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(dataLine.slice(6));
              if (eventType === "chunk") setStreamText((t) => t + data.text);
              if (eventType === "done") { setResult(data.result); setStatus("done"); }
              if (eventType === "error") { setError(data.message); setStatus("error"); }
            } catch {}
          }
        }
      }

      if (status !== "done") setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setStreamText("");
    setResult(null);
    setError(null);
  }, []);

  return { status, streamText, result, error, submit, reset };
}
