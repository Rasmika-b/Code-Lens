import { AlertTriangle, ShieldAlert, Zap, Palette, Layout, Accessibility, Boxes, CheckCircle2, Loader2 } from "lucide-react";

const SEVERITY_COLOR = {
  critical: "var(--red)",
  high: "var(--orange)",
  medium: "var(--yellow)",
  low: "var(--green)",
};

const SEVERITY_BG = {
  critical: "rgba(248,113,113,0.08)",
  high: "rgba(249,115,22,0.08)",
  medium: "rgba(251,191,36,0.08)",
  low: "rgba(52,211,153,0.08)",
};

const TYPE_ICON = {
  bug: AlertTriangle,
  security: ShieldAlert,
  performance: Zap,
  style: Palette,
  ux: Layout,
  accessibility: Accessibility,
  architecture: Boxes,
};

function SeverityBadge({ severity }) {
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 600,
      fontFamily: "var(--font-mono)",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: SEVERITY_COLOR[severity] || "var(--muted)",
      background: SEVERITY_BG[severity] || "var(--bg3)",
      border: `1px solid ${SEVERITY_COLOR[severity] || "var(--border)"}40`,
      padding: "2px 8px",
      borderRadius: 5,
    }}>
      {severity}
    </span>
  );
}

function IssueCard({ issue, index }) {
  const Icon = TYPE_ICON[issue.type] || AlertTriangle;
  return (
    <div className="animate-in" style={{ ...styles.issueCard, animationDelay: `${index * 40}ms` }}>
      <div style={styles.issueHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon size={15} color={SEVERITY_COLOR[issue.severity]} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>{issue.title}</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={styles.typeTag}>{issue.type}</span>
          <SeverityBadge severity={issue.severity} />
        </div>
      </div>
      {issue.line && (
        <span style={styles.lineRef}>Line {issue.line}</span>
      )}
      <p style={styles.description}>{issue.description}</p>
      {issue.suggestion && (
        <div style={styles.suggestion}>
          <span style={styles.suggestionLabel}>Suggestion</span>
          <p style={{ color: "var(--text)", fontSize: 13, marginTop: 4 }}>{issue.suggestion}</p>
        </div>
      )}
    </div>
  );
}

export function ReviewPanel({ status, streamText, result, error }) {
  if (status === "idle") return null;

  if (status === "error") {
    return (
      <div style={styles.errorBox}>
        <AlertTriangle size={16} color="var(--red)" />
        <span>{error}</span>
      </div>
    );
  }

  if (status === "streaming" && !result) {
    return (
      <div style={styles.streamBox}>
        <div style={styles.streamHeader}>
          <Loader2 size={14} className="spinner" color="var(--accent)" />
          <span style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13 }}>
            Gemini is reviewing...
          </span>
        </div>
        <pre style={styles.streamPre}>{streamText}</pre>
      </div>
    );
  }

  if (!result) return null;

  const overallColor = SEVERITY_COLOR[result.severity] || "var(--muted)";

  return (
    <div style={styles.container} className="animate-in">
      {/* Summary header */}
      <div style={{ ...styles.summaryCard, borderLeftColor: overallColor }}>
        <div style={styles.summaryTop}>
          <div>
            <span style={styles.langTag}>{result.language}</span>
            <span style={styles.langTag}>{result.inputType}</span>
          </div>
          <SeverityBadge severity={result.severity} />
        </div>
        <p style={styles.summaryText}>{result.summary}</p>
        <div style={styles.statsRow}>
          <span style={styles.stat}>
            <span style={{ color: "var(--red)" }}>
              {result.issues.filter((i) => i.severity === "critical").length}
            </span>{" "}critical
          </span>
          <span style={styles.stat}>
            <span style={{ color: "var(--orange)" }}>
              {result.issues.filter((i) => i.severity === "high").length}
            </span>{" "}high
          </span>
          <span style={styles.stat}>
            <span style={{ color: "var(--yellow)" }}>
              {result.issues.filter((i) => i.severity === "medium").length}
            </span>{" "}medium
          </span>
          <span style={styles.stat}>
            <span style={{ color: "var(--green)" }}>
              {result.issues.filter((i) => i.severity === "low").length}
            </span>{" "}low
          </span>
        </div>
      </div>

      {/* Issues list */}
      {result.issues.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Issues ({result.issues.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.issues.map((issue, i) => (
              <IssueCard key={issue.id || i} issue={issue} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Positives */}
      {result.positives?.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>What&apos;s good</h3>
          <div style={styles.positivesCard}>
            {result.positives.map((p, i) => (
              <div key={i} style={styles.positiveRow}>
                <CheckCircle2 size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refactored snippet */}
      {result.refactoredSnippet && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Suggested refactor</h3>
          <pre style={styles.codePre}>{result.refactoredSnippet}</pre>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: "flex", flexDirection: "column", gap: 16 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "14px 16px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: "var(--radius)",
    color: "var(--red)", fontSize: 13,
  },
  streamBox: {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
  },
  streamHeader: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "10px 14px",
    borderBottom: "1px solid var(--border)",
  },
  streamPre: {
    padding: "12px 16px",
    fontFamily: "var(--font-mono)", fontSize: 11,
    color: "var(--muted)", whiteSpace: "pre-wrap",
    maxHeight: 200, overflow: "auto",
  },
  summaryCard: {
    padding: "18px 20px",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderLeft: "3px solid var(--accent)",
    borderRadius: "var(--radius)",
  },
  summaryTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  langTag: {
    fontSize: 11, fontFamily: "var(--font-mono)",
    color: "var(--muted)", textTransform: "uppercase",
    letterSpacing: "0.06em", marginRight: 10,
  },
  summaryText: { color: "var(--text)", fontSize: 14, lineHeight: 1.6 },
  statsRow: { display: "flex", gap: 18, marginTop: 12 },
  stat: { fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)" },
  section: {},
  sectionTitle: {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.1em", color: "var(--muted)",
    marginBottom: 10,
  },
  issueCard: {
    padding: "14px 16px",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    display: "flex", flexDirection: "column", gap: 8,
  },
  issueHeader: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", gap: 10,
  },
  typeTag: {
    fontSize: 11, fontFamily: "var(--font-mono)",
    color: "var(--muted)",
    background: "var(--bg3)",
    padding: "2px 7px", borderRadius: 4,
    border: "1px solid var(--border)",
  },
  lineRef: {
    fontSize: 11, fontFamily: "var(--font-mono)",
    color: "var(--accent)", display: "inline-block",
  },
  description: { fontSize: 13, color: "var(--muted)", lineHeight: 1.6 },
  suggestion: {
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: 7, padding: "10px 12px",
  },
  suggestionLabel: {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "var(--accent2)",
  },
  positivesCard: {
    padding: "14px 16px",
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    display: "flex", flexDirection: "column", gap: 10,
  },
  positiveRow: {
    display: "flex", gap: 10, alignItems: "flex-start",
    fontSize: 13, color: "var(--text)",
  },
  codePre: {
    fontFamily: "var(--font-mono)", fontSize: 12,
    background: "var(--bg3)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "16px", overflowX: "auto",
    color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.6,
  },
};
