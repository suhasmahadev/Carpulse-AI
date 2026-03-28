import { useState, useRef, useEffect } from "react";
import api from "../../api/apiClient";

export default function AdminAiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello Administrator. How can I assist you with the system today? You can ask me to analyze data or upload curriculum files.' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  
  // File upload state for the AI
  const [file, setFile] = useState(null);
  const [fileMsg, setFileMsg] = useState("");

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      // Re-using the chat endpoint
      const res = await api.post("/ai/chat", { message: userMsg, context: "admin_dashboard" });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.response || "I processed your request but didn't generate a text response." }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "Error connecting to AI service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setFileMsg("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      // Assuming a generic endpoint for file upload if available
      const res = await api.post("/ai/upload-knowledge", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setFileMsg("✅ " + (res.data.message || "File analyzed and added to knowledge base."));
      setFile(null);
    } catch (err) {
      setFileMsg("❌ Upload failed: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>AI Assistant</h1>
        <p>Interact with the system's intelligent agent for data insights or document processing</p>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: "3fr 1fr", height: "calc(100vh - 200px)" }}>
        
        {/* Chat Interface */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", height: "100%", padding: 0, overflow: "hidden" }}>
          <div className="admin-card-header" style={{ padding: "1.5rem 1.5rem 1rem", margin: 0, background: "rgba(0,0,0,0.2)" }}>
            <i className="fa-solid fa-robot"></i>
            <h2>System Intelligence</h2>
          </div>
          
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                alignSelf: msg.role === 'user' ? "flex-end" : "flex-start",
                background: msg.role === 'user' ? "linear-gradient(135deg, #0284c7, #06b6d4)" : "rgba(255,255,255,0.08)",
                color: msg.role === 'user' ? "#fff" : "#e2e8f0",
                padding: "1rem 1.25rem",
                borderRadius: "16px",
                borderBottomRightRadius: msg.role === 'user' ? 0 : "16px",
                borderBottomLeftRadius: msg.role === 'assistant' ? 0 : "16px",
                maxWidth: "80%",
                lineHeight: 1.5,
                fontSize: "0.95rem"
              }}>
                {msg.role === 'assistant' && <i className="fa-solid fa-shield-halved" style={{ marginRight: '0.5rem', color: '#38bdf8' }}></i>}
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: "flex-start", color: "#94a3b8", fontSize: "0.9rem", padding: "0.5rem" }}>
                <i className="fa-solid fa-circle-notch fa-spin"></i> Processing...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ padding: "1rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.75rem" }}>
            <input 
              type="text" 
              className="admin-input" 
              placeholder="Ask about attendance trends, generate reports..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              style={{ flex: 1, borderRadius: "20px", padding: "0.75rem 1.25rem", background: "rgba(255,255,255,0.05)" }}
            />
            <button type="submit" className="admin-btn admin-btn-primary" style={{ borderRadius: "50%", width: "45px", height: "45px", padding: 0 }} disabled={isTyping || !input.trim()}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>

        {/* File Upload Section */}
        <div className="admin-card" style={{ height: "min-content" }}>
          <div className="admin-card-header">
            <i className="fa-solid fa-file-arrow-up"></i>
            <h2>Knowledge Upload</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "1rem" }}>
              Upload CSV data, policies, or curriculum schemas for the AI to analyze.
            </p>
            <form onSubmit={handleFileUpload} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ 
                border: "2px dashed rgba(56, 189, 248, 0.3)", 
                borderRadius: "12px", 
                padding: "2rem 1rem", 
                textAlign: "center",
                background: "rgba(56, 189, 248, 0.05)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onClick={() => document.getElementById('ai-file-upload').click()}
              >
                <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: "2rem", color: "#38bdf8", marginBottom: "0.5rem" }}></i>
                <p style={{ fontSize: "0.9rem", color: "#e2e8f0" }}>{file ? file.name : "Click to select file"}</p>
                <input 
                  id="ai-file-upload" 
                  type="file" 
                  style={{ display: "none" }} 
                  onChange={(e) => setFile(e.target.files[0])} 
                />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={!file || fileMsg === "Uploading..."}>
                Analyze File
              </button>
              {fileMsg && <div style={{ fontSize: "0.85rem", color: fileMsg.startsWith("❌") ? "#fca5a5" : "#6ee7b7", textAlign: "center" }}>{fileMsg}</div>}
            </form>
          </div>
        </div>

      </div>
    </>
  );
}
