import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Upload, Code2, Image, FileCode, X, Play, Loader2 } from "lucide-react";

const TABS = [
  { id: "code", label: "Paste code", icon: Code2 },
  { id: "image", label: "Screenshot", icon: Image },
  { id: "file", label: "Upload file", icon: FileCode },
];

export function InputPanel({ onSubmit, isLoading }) {
  const [tab, setTab] = useState("code");
  const [code, setCode] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setUploadedFile(file);
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview(url);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = () => {
    if (tab === "code" && !code.trim()) return;
    if ((tab === "image" || tab === "file") && !uploadedFile) return;
    onSubmit({
      code: tab === "code" ? code : null,
      file: tab !== "code" ? uploadedFile : null,
      filename: uploadedFile?.name,
    });
  };

  const clearFile = () => {
    setUploadedFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const canSubmit = tab === "code" ? code.trim().length > 0 : !!uploadedFile;

  return (
    <div style={styles.panel}>
      {/* Tab bar */}
      <div style={styles.tabs}>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ ...styles.tab, ...(tab === t.id ? styles.tabActive : {}) }}
            >
              <Icon size={13} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div style={styles.content}>
        {tab === "code" && (
          <Editor
            height="360px"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(v) => setCode(v || "")}
            options={{
              fontSize: 13,
              fontFamily: '"DM Mono", monospace',
              minimap: { enabled: false },
              lineNumbers: "on",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              suggestOnTriggerCharacters: false,
            }}
          />
        )}

        {(tab === "image" || tab === "file") && (
          <div
            style={styles.dropzone}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => !uploadedFile && fileRef.current?.click()}
          >
            {uploadedFile ? (
              <div style={styles.filePreview}>
                {preview ? (
                  <img src={preview} alt="preview" style={styles.imgPreview} />
                ) : (
                  <div style={styles.filePill}>
                    <FileCode size={18} color="var(--accent)" />
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>
                      {uploadedFile.name}
                    </span>
                  </div>
                )}
                <button style={styles.clearBtn} onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div style={styles.dropHint}>
                <Upload size={28} color="var(--muted)" />
                <p style={{ color: "var(--text)", fontWeight: 500, marginTop: 8 }}>
                  Drop {tab === "image" ? "a screenshot" : "a code file"} here
                </p>
                <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 4 }}>
                  {tab === "image"
                    ? "PNG, JPG, WebP — UI mockups, error screens, etc."
                    : ".js .ts .py .go .java .rs .cpp and more"}
                </p>
                <button style={styles.browseBtn}>Browse files</button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={tab === "image" ? "image/*" : ".js,.ts,.jsx,.tsx,.py,.java,.go,.rs,.cpp,.c,.cs,.rb,.php,.swift,.kt,.md,.txt"}
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={styles.footer}>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          Powered by LLaMA 4 · Groq
        </span>
        <button
          style={{ ...styles.submitBtn, ...(!canSubmit || isLoading ? styles.submitDisabled : {}) }}
          onClick={handleSubmit}
          disabled={!canSubmit || isLoading}
        >
          {isLoading ? (
            <><Loader2 size={14} className="spinner" /> Analysing...</>
          ) : (
            <><Play size={14} /> Run review</>
          )}
        </button>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: "var(--bg2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  tabs: {
    display: "flex",
    borderBottom: "1px solid var(--border)",
    padding: "0 4px",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    background: "none",
    color: "var(--muted)",
    borderBottom: "2px solid transparent",
    borderRadius: 0,
    fontSize: 13,
    fontFamily: "var(--font-ui)",
    fontWeight: 500,
  },
  tabActive: {
    color: "var(--text)",
    borderBottomColor: "var(--accent)",
  },
  content: { flex: 1 },
  dropzone: {
    height: 360,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },
  dropHint: { textAlign: "center", userSelect: "none" },
  filePreview: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 20,
    width: "100%",
  },
  imgPreview: {
    maxWidth: "100%",
    maxHeight: 280,
    borderRadius: 8,
    border: "1px solid var(--border)",
    objectFit: "contain",
  },
  filePill: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 20px",
    background: "var(--bg3)",
    border: "1px solid var(--border2)",
    borderRadius: 8,
  },
  clearBtn: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    background: "transparent",
    color: "var(--muted)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    fontSize: 12,
  },
  browseBtn: {
    marginTop: 14,
    padding: "8px 18px",
    background: "var(--bg3)",
    color: "var(--accent2)",
    border: "1px solid var(--border2)",
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "var(--font-ui)",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderTop: "1px solid var(--border)",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 20px",
    background: "var(--accent)",
    color: "#fff",
    borderRadius: 8,
    fontFamily: "var(--font-ui)",
    fontWeight: 600,
    fontSize: 13,
  },
  submitDisabled: { opacity: 0.4, cursor: "not-allowed" },
};
