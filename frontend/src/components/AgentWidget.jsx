import { useState, useRef } from "react";
import api from "../api/apiClient";

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.pdf,.csv,.xls,.xlsx";

const FILE_ICONS = {
  pdf: "fa-file-pdf",
  csv: "fa-file-csv",
  xls: "fa-file-excel",
  xlsx: "fa-file-excel",
  jpg: "fa-file-image",
  jpeg: "fa-file-image",
  png: "fa-file-image",
  webp: "fa-file-image",
  gif: "fa-file-image",
  bmp: "fa-file-image",
};

function getFileIcon(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || "fa-file";
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function AgentWidget({ role }) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Maximum size is 10MB.");
      return;
    }

    setAttachedFile(file);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() && !attachedFile) return;

    const userMsg = {
      role: "user",
      text: query,
      file: attachedFile ? { name: attachedFile.name, size: attachedFile.size, preview: filePreview } : null,
      ts: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);

    try {
      let res;

      if (attachedFile) {
        // Multipart: send file + query to /ask-agent-with-file
        const formData = new FormData();
        formData.append("query", query || `Analyze the attached file: ${attachedFile.name}`);
        formData.append("file", attachedFile);

        res = await api.post("/academic/ask-agent-with-file", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 120000, // 2 min for large files
        });
      } else {
        // Text-only: standard JSON
        res = await api.post("/academic/ask-agent", { query });
      }

      const agentMsg = {
        role: "agent",
        data: res.data,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        role: "agent",
        data: { status: "error", message: err.response?.data?.detail || err.message || "Failed to reach agent." },
        ts: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setQuery("");
      removeFile();
    }
  };

  const renderAgentResponse = (data) => {
    if (!data) return null;

    // If it's a plain string
    if (typeof data === "string") return data;

    // If it has response field
    if (data.response) {
      if (typeof data.response === "string") return data.response;
      return JSON.stringify(data.response, null, 2);
    }

    // If it has raw field
    if (data.raw) return data.raw;

    // If error
    if (data.status === "error") return `❌ ${data.message || "Unknown error"}`;

    // Otherwise dump JSON
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="dash-card" style={{ marginTop: "2rem" }}>
      <div className="dash-card-header">
        <i className="fa-solid fa-robot" />
        <h2>{role.toUpperCase()} AI Assistant</h2>
        <span style={{ marginLeft: "auto", fontSize: "0.75rem", background: "rgba(59,130,246,0.15)", color: "#3b82f6", padding: "0.2rem 0.6rem", borderRadius: "12px", fontWeight: 600 }}>
          <i className="fa-solid fa-paperclip" style={{ marginRight: "0.3rem" }} />
          Files supported
        </span>
      </div>
      <div className="dash-card-body">
        <p className="welcome-sub" style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
          Ask the AI agent anything. Attach images, PDFs, or Excel/CSV files for analysis.
        </p>

        {/* Chat History */}
        {messages.length > 0 && (
          <div style={{
            maxHeight: "400px", overflowY: "auto", marginBottom: "1.25rem",
            background: "#0f172a", borderRadius: "12px", padding: "1rem",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "0.75rem",
              }}>
                {/* User message */}
                {msg.role === "user" && (
                  <div style={{
                    background: "linear-gradient(135deg, #1e40af, #3b82f6)", color: "#fff",
                    padding: "0.75rem 1rem", borderRadius: "12px 12px 2px 12px",
                    maxWidth: "80%", fontSize: "0.9rem", wordBreak: "break-word",
                  }}>
                    {msg.file && (
                      <div style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        background: "rgba(255,255,255,0.15)", padding: "0.4rem 0.6rem",
                        borderRadius: "6px", marginBottom: "0.5rem", fontSize: "0.8rem",
                      }}>
                        {msg.file.preview ? (
                          <img src={msg.file.preview} alt="preview" style={{
                            width: "40px", height: "40px", objectFit: "cover",
                            borderRadius: "4px", border: "1px solid rgba(255,255,255,0.3)",
                          }} />
                        ) : (
                          <i className={`fa-solid ${getFileIcon(msg.file.name)}`} style={{ fontSize: "1.2rem" }} />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{msg.file.name}</div>
                          <div style={{ opacity: 0.7 }}>{formatBytes(msg.file.size)}</div>
                        </div>
                      </div>
                    )}
                    {msg.text}
                  </div>
                )}

                {/* Agent message */}
                {msg.role === "agent" && (
                  <div style={{
                    background: "#1e293b", color: "#e2e8f0",
                    padding: "0.75rem 1rem", borderRadius: "12px 12px 12px 2px",
                    maxWidth: "85%", fontSize: "0.9rem",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem", fontSize: "0.75rem", color: "#60a5fa" }}>
                      <i className="fa-solid fa-robot" />
                      <span>AI Agent</span>
                    </div>
                    <pre style={{
                      margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word",
                      fontFamily: "inherit", fontSize: "0.88rem", lineHeight: 1.5,
                    }}>
                      {renderAgentResponse(msg.data)}
                    </pre>
                  </div>
                )}

                <span style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "0.2rem" }}>
                  {msg.ts.toLocaleTimeString()}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#60a5fa", fontSize: "0.85rem" }}>
                <span className="spinner" style={{ width: "16px", height: "16px" }} />
                Agent is thinking...
              </div>
            )}
          </div>
        )}

        {/* File Preview Bar */}
        {attachedFile && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.75rem",
            background: "#f0f9ff", border: "1px solid #bae6fd",
            borderRadius: "8px", padding: "0.5rem 0.75rem", marginBottom: "0.75rem",
          }}>
            {filePreview ? (
              <img src={filePreview} alt="preview" style={{
                width: "48px", height: "48px", objectFit: "cover",
                borderRadius: "6px", border: "1px solid #93c5fd",
              }} />
            ) : (
              <i className={`fa-solid ${getFileIcon(attachedFile.name)}`} style={{
                fontSize: "1.5rem", color: "#2563eb",
              }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>{attachedFile.name}</div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{formatBytes(attachedFile.size)}</div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              style={{
                background: "#fee2e2", border: "none", borderRadius: "6px",
                color: "#dc2626", cursor: "pointer", padding: "0.3rem 0.5rem",
                fontSize: "0.8rem", fontWeight: 600,
              }}
            >
              <i className="fa-solid fa-xmark" /> Remove
            </button>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={ACCEPTED_TYPES}
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            title="Attach file (Image, PDF, Excel, CSV)"
            style={{
              background: attachedFile ? "#dbeafe" : "#f1f5f9",
              border: "1px solid #cbd5e1", borderRadius: "8px",
              padding: "0.6rem 0.75rem", cursor: "pointer",
              color: attachedFile ? "#2563eb" : "#64748b",
              fontSize: "1.1rem", transition: "all 0.2s",
              flexShrink: 0,
            }}
          >
            <i className="fa-solid fa-paperclip" />
          </button>
          <input
            type="text"
            placeholder={attachedFile
              ? `Ask about the attached ${attachedFile.name}...`
              : "e.g., 'What is my current attendance?'"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
            style={{ flex: 1 }}
          />
          <button type="submit" disabled={loading || (!query.trim() && !attachedFile)} className="dash-btn">
            {loading ? (
              <>
                <span className="spinner" style={{ width: "14px", height: "14px", marginRight: "0.3rem" }} />
                Processing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane" style={{ marginRight: "0.3rem" }} />
                Send
              </>
            )}
          </button>
        </form>

        {/* Supported formats hint */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
          {[
            { icon: "fa-file-image", label: "Images", color: "#10b981" },
            { icon: "fa-file-pdf", label: "PDF", color: "#ef4444" },
            { icon: "fa-file-excel", label: "Excel", color: "#22c55e" },
            { icon: "fa-file-csv", label: "CSV", color: "#f59e0b" },
          ].map((f, i) => (
            <span key={i} style={{
              display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.75rem", color: "#94a3b8",
            }}>
              <i className={`fa-solid ${f.icon}`} style={{ color: f.color }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
