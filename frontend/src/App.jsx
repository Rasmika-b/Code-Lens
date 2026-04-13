import { useState } from "react";
import { InputPanel } from "./components/InputPanel.jsx";
import { ReviewPanel } from "./components/ReviewPanel.jsx";
import { GitHubPanel } from "./components/GitHubPanel.jsx";
import { useReview } from "./hooks/useReview.js";
import { RotateCcw, Cpu } from "lucide-react";

export default function App() {
  const { status, streamText, result, error, submit, reset } = useReview();
  const [lastFilename, setLastFilename] = useState(null);

  const handleSubmit = ({ code, file, filename }) => {
    setLastFilename(filename || null);
    submit({ code, file, filename });
  };

  const handleReset = () => {
    reset();
    setLastFilename(null);
  };

  const isLoading = status === "streaming";
  const hasResult = status === "done" && result;

  return (
    <div style={styles.root}>
      {/* Top nav */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <Cpu size={18} color="var(--accent)" />
          <span>CodeLens</span>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.modelBadge}>llama-4 · groq</span>
          {status !== "idle" && (
            <button style={styles.resetBtn} onClick={handleReset}>
              <RotateCcw size={13} /> New review
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <main style={styles.main}>
        {/* Left column — input + GitHub */}
        <div style={styles.leftCol}>
          <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
          {hasResult && (
            <GitHubPanel review={result} filename={lastFilename} />
          )}
        </div>

        {/* Right column — review output */}
        <div style={styles.rightCol}>
          {status === "idle" ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Cpu size={32} color="var(--border2)" />
              </div>
              <p style={styles.emptyTitle}>Ready to review</p>
              <p style={styles.emptyHint}>
                Paste code, upload a file, or drop a UI screenshot.<br />
                Gemini 1.5 Flash will analyse it and stream results.
              </p>
              <div style={styles.featureList}>
                {[
                  "Bugs & security vulnerabilities",
                  "Performance issues",
                  "UI/UX accessibility problems",
                  "Architecture concerns",
                  "Post results directly to GitHub PR",
                ].map((f) => (
                  <div key={f} style={styles.featureRow}>
                    <div style={styles.featureDot} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ReviewPanel
              status={status}
              streamText={streamText}
              result={result}
              error={error}
            />
          )}
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    height: 52,
    borderBottom: "1px solid var(--border)",
    background: "var(--bg2)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontFamily: "var(--font-ui)",
    fontWeight: 700,
    fontSize: 17,
    letterSpacing: "-0.02em",
    color: "var(--text)",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  modelBadge: {
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    color: "var(--accent2)",
    background: "rgba(124,106,247,0.1)",
    border: "1px solid rgba(124,106,247,0.25)",
    padding: "3px 9px",
    borderRadius: 6,
  },
  resetBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    background: "var(--bg3)",
    color: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: 7,
    fontSize: 12,
    fontFamily: "var(--font-ui)",
  },
  main: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "480px 1fr",
    gap: 0,
    height: "calc(100vh - 52px)",
    overflow: "hidden",
  },
  leftCol: {
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 0,
    overflowY: "auto",
    padding: 20,
    gap: 16,
  },
  rightCol: {
    overflowY: "auto",
    padding: 24,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "100%",
    gap: 0,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--text)",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: "var(--muted)",
    lineHeight: 1.7,
    maxWidth: 340,
    marginBottom: 28,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
  },
  featureRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    color: "var(--muted)",
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
    flexShrink: 0,
  },
};
