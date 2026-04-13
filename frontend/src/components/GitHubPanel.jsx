import { useState } from "react";
import { Github, ChevronRight, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { useGitHub } from "../hooks/useGitHub.js";

export function GitHubPanel({ review, filename }) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [selectedPR, setSelectedPR] = useState(null);
  const [step, setStep] = useState("repo"); // repo | prs | confirm | posted

  const { prs, loadingPrs, posting, postResult, error, fetchPrs, postComment } = useGitHub();

  const handleFetchPRs = async () => {
    if (!owner.trim() || !repo.trim()) return;
    await fetchPrs(owner.trim(), repo.trim());
    setStep("prs");
  };

  const handlePost = async () => {
    if (!selectedPR) return;
    try {
      await postComment({ owner, repo, pull_number: selectedPR.number, review, filename });
      setStep("posted");
    } catch {}
  };

  if (!review) return null;

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <Github size={15} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>Post to GitHub PR</span>
        <span style={styles.mcpBadge}>via MCP</span>
      </div>

      {step === "repo" && (
        <div style={styles.body}>
          <p style={styles.hint}>Enter the repository to find open pull requests.</p>
          <div style={styles.repoRow}>
            <input
              placeholder="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleFetchPRs()}
            />
            <span style={{ color: "var(--muted)" }}>/</span>
            <input
              placeholder="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              style={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleFetchPRs()}
            />
            <button
              style={styles.btn}
              onClick={handleFetchPRs}
              disabled={loadingPrs || !owner || !repo}
            >
              {loadingPrs ? <Loader2 size={13} className="spinner" /> : <ChevronRight size={13} />}
              {loadingPrs ? "Loading..." : "Find PRs"}
            </button>
          </div>
          {error && (
            <div style={styles.errorRow}>
              <AlertTriangle size={12} color="var(--red)" />
              <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>
            </div>
          )}
        </div>
      )}

      {step === "prs" && (
        <div style={styles.body}>
          <p style={styles.hint}>
            {prs.length === 0
              ? "No open PRs found in this repo."
              : `Select a PR to post the review as a comment.`}
          </p>
          {prs.map((pr) => (
            <button
              key={pr.number}
              style={{
                ...styles.prRow,
                ...(selectedPR?.number === pr.number ? styles.prRowActive : {}),
              }}
              onClick={() => { setSelectedPR(pr); setStep("confirm"); }}
            >
              <span style={styles.prNum}>#{pr.number}</span>
              <span style={styles.prTitle}>{pr.title}</span>
              <span style={styles.prAuthor}>@{pr.author}</span>
            </button>
          ))}
          <button style={styles.backBtn} onClick={() => setStep("repo")}>← Back</button>
        </div>
      )}

      {step === "confirm" && selectedPR && (
        <div style={styles.body}>
          <p style={styles.hint}>
            Post review to <strong style={{ color: "var(--text)" }}>
              {owner}/{repo}
            </strong> · PR #{selectedPR.number}
          </p>
          <div style={styles.prPreview}>
            <span style={styles.prNum}>#{selectedPR.number}</span>
            <span style={styles.prTitle}>{selectedPR.title}</span>
          </div>
          <div style={styles.confirmRow}>
            <button style={styles.backBtn} onClick={() => setStep("prs")}>← Back</button>
            <button style={styles.btn} onClick={handlePost} disabled={posting}>
              {posting ? <Loader2 size={13} className="spinner" /> : <Github size={13} />}
              {posting ? "Posting..." : "Post review comment"}
            </button>
          </div>
          {error && (
            <div style={styles.errorRow}>
              <AlertTriangle size={12} color="var(--red)" />
              <span style={{ fontSize: 12, color: "var(--red)" }}>{error}</span>
            </div>
          )}
        </div>
      )}

      {step === "posted" && postResult && (
        <div style={styles.body}>
          <div style={styles.successRow}>
            <CheckCircle2 size={16} color="var(--green)" />
            <span style={{ color: "var(--green)", fontWeight: 600, fontSize: 13 }}>
              Review posted successfully
            </span>
          </div>
          <a href={postResult.html_url} target="_blank" rel="noreferrer" style={styles.link}>
            View on GitHub <ExternalLink size={11} />
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  panel: {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
  },
  mcpBadge: {
    marginLeft: "auto",
    fontSize: 10, fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.08em",
    color: "var(--accent2)",
    background: "rgba(167,139,250,0.12)",
    border: "1px solid rgba(167,139,250,0.3)",
    padding: "2px 7px", borderRadius: 4,
  },
  body: { padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 },
  hint: { fontSize: 12, color: "var(--muted)" },
  repoRow: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  input: { flex: 1, minWidth: 80 },
  btn: {
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px",
    background: "var(--accent)", color: "#fff",
    borderRadius: 8, fontWeight: 600, fontFamily: "var(--font-ui)",
    fontSize: 12, whiteSpace: "nowrap",
  },
  prRow: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px",
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: 7, cursor: "pointer", width: "100%",
    textAlign: "left", fontFamily: "var(--font-ui)", color: "var(--text)",
    transition: "border-color 0.15s",
  },
  prRowActive: { borderColor: "var(--accent)" },
  prNum: { fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--accent2)", flexShrink: 0 },
  prTitle: { fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  prAuthor: { fontSize: 11, color: "var(--muted)", flexShrink: 0 },
  prPreview: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 12px",
    background: "var(--bg3)",
    border: "1px solid var(--accent)",
    borderRadius: 7,
  },
  confirmRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  backBtn: {
    background: "none", color: "var(--muted)", fontSize: 12,
    padding: "6px 0", fontFamily: "var(--font-ui)",
  },
  errorRow: { display: "flex", alignItems: "center", gap: 6 },
  successRow: { display: "flex", alignItems: "center", gap: 8 },
  link: {
    display: "inline-flex", alignItems: "center", gap: 5,
    color: "var(--accent2)", fontSize: 12, textDecoration: "none",
    fontFamily: "var(--font-mono)",
  },
};
