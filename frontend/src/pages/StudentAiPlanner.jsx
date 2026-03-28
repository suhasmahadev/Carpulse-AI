import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";

export default function StudentAiPlanner() {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [plan, setPlan] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // AI Assistant chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    // get student ID
    api.get("/academic/me").then(res => {
      setStudentInfo(res.data);
      if (res.data?.id) {
        fetchPlan(res.data.id);
      }
    }).catch(console.error);
  }, []);

  const fetchPlan = async (sid) => {
    try {
      const res = await api.get(`/api/student/plan/${sid}`);
      setPlan(res.data.plan);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/student/upload-resume", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResumeText(res.data.resume_text);
      setUploadSuccess(true);
    } catch (err) {
      alert("Error uploading resume: " + (err.response?.data?.detail || err.message));
    } finally {
      setUploading(false);
    }
  };

  const generatePlan = async () => {
    if (!resumeText) {
      alert("Please upload a resume first.");
      return;
    }

    // If studentInfo is missing id, re-fetch it
    let sid = studentInfo?.id;
    if (!sid) {
      try {
        const meRes = await api.get("/academic/me");
        setStudentInfo(meRes.data);
        sid = meRes.data?.id;
      } catch (e) {
        console.error("Failed to fetch student info", e);
      }
    }

    if (!sid) {
      alert("Could not determine your student ID. Please refresh the page and try again.");
      return;
    }

    setGenerating(true);
    try {
      const res = await api.post("/api/student/generate-plan", {
        student_id: sid,
        resume_text: resumeText
      });
      console.log("Plan generated:", res.data);
      await fetchPlan(sid);
    } catch (err) {
      console.error("Generate plan error:", err);
      alert("Error generating plan: " + (err.response?.data?.detail || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (day, task, currentStatus) => {
    if (!studentInfo?.id) return;
    try {
        const updatedPlan = JSON.parse(JSON.stringify(plan));
        const dayIdx = updatedPlan.week_plan.findIndex(p => p.day === day);
        if (dayIdx > -1) {
            if (!updatedPlan.week_plan[dayIdx].progress) updatedPlan.week_plan[dayIdx].progress = {};
            updatedPlan.week_plan[dayIdx].progress[task] = !currentStatus;
            setPlan(updatedPlan);
        }

        await api.post("/api/student/update-progress", {
            student_id: studentInfo.id,
            day: day,
            task: task,
            completed: !currentStatus
        });
    } catch (err) {
        console.error(err);
        fetchPlan(studentInfo.id);
    }
  };

  const calculateProgress = () => {
      if (!plan || !plan.week_plan) return 0;
      let total = 0;
      let completed = 0;
      plan.week_plan.forEach(day => {
          if (day.tasks) {
              total += day.tasks.length;
              day.tasks.forEach(t => {
                  if (day.progress && day.progress[t]) completed++;
              });
          }
      });
      return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const sendChatMessage = async () => {
      if (!chatInput.trim() || !studentInfo?.id) return;
      const userMsg = chatInput.trim();
      setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
      setChatInput("");
      setChatLoading(true);
      try {
          const res = await api.post("/api/student/ai-assistant", {
              student_id: studentInfo.id,
              message: userMsg
          });
          setChatMessages(prev => [...prev, { role: "ai", text: res.data.response }]);
      } catch (err) {
          setChatMessages(prev => [...prev, { role: "ai", text: "Sorry, I had an error. Please try again." }]);
      } finally {
          setChatLoading(false);
      }
  };

  const progressPct = calculateProgress();

  return (
    <div className="planner-container" style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <header style={{ marginBottom: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2.5rem", color: "#000000", marginBottom: "0.5rem" }}><i className="fa-solid fa-robot"></i> AI Study Planner</h1>
        <p style={{ color: "#000000", fontSize: "1.1rem" }}>Upload your resume. Let Gemini build your personalized study path.</p>
      </header>

      {!plan ? (
        <div style={{ background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", padding: "3rem", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
          <i className="fa-solid fa-file-pdf" style={{ fontSize: "4rem", color: "#ef4444", marginBottom: "1.5rem" }}></i>
          <h2 style={{ marginBottom: "1rem", color: "#000000" }}>Let's build your AI Plan!</h2>
          <p style={{ marginBottom: "1.5rem", color: "#000000", maxWidth: "500px", margin: "0 auto 2rem" }}>Upload your current resume in PDF format. We will extract the knowledge directly into Gemini and generate a strict 7-day personalized study and upskilling roadmap for you.</p>
          
          <div style={{ position: "relative", display: "inline-block", marginBottom: "1rem" }}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }}
            />
            <button className="dash-btn" style={{ background: "#FF5A1F", padding: "0.75rem 2rem", fontSize: "1rem", color: "#fff", border: "none" }} disabled={uploading}>
              {uploading ? "Extracting Text..." : "Upload Resume (PDF)"}
            </button>
          </div>

          {uploadSuccess && (
            <div style={{ marginTop: "1rem" }}>
              <p style={{ color: "#10b981", fontWeight: "bold", marginBottom: "1rem" }}><i className="fa-solid fa-check-circle"></i> Resume processed successfully!</p>
              <button 
                className="dash-btn" 
                style={{ background: "#10b981", transform: "scale(1.05)", padding: "0.75rem 2rem", fontSize: "1rem", boxShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)"}} 
                onClick={generatePlan} 
                disabled={generating}>
                {generating ? <span className="spinner" style={{width: '20px', height: '20px', display: 'inline-block'}} /> : <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate AI Plan</>}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Header bar with progress */}
          <div style={{ background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.3)", padding: "1.5rem", borderRadius: "16px", marginBottom: "2rem", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ margin: 0, color: "#000000" }}>Your Weekly Plan</h2>
                <p style={{ margin: "0.25rem 0 0", color: "#000000" }}>Progress: {progressPct}% Completed</p>
              </div>
              <button 
                onClick={() => { if(window.confirm('Erase current plan and generate a new one?')) { setPlan(null); setResumeText(""); setUploadSuccess(false); } }}
                className="dash-btn" style={{ background: "#ef4444" }}>
                <i className="fa-solid fa-rotate-right"></i> Regenerate
              </button>
            </div>
            {/* Global progress bar */}
            <div style={{ background: "rgba(0, 0, 0, 0.1)", borderRadius: "999px", height: "12px", overflow: "hidden" }}>
              <div style={{
                width: `${progressPct}%`,
                height: "100%",
                background: progressPct >= 80 ? "linear-gradient(90deg, #10b981, #34d399)" : progressPct >= 40 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #FF5A1F, #FF7A00)",
                borderRadius: "999px",
                transition: "width 0.5s ease"
              }} />
            </div>
          </div>

          {/* Day cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
            {plan.week_plan.map((dayPlan, idx) => {
              const dayTasks = dayPlan.tasks || [];
              const dayCompleted = dayTasks.filter(t => dayPlan.progress && dayPlan.progress[t]).length;
              const dayPct = dayTasks.length === 0 ? 0 : Math.round((dayCompleted / dayTasks.length) * 100);
              return (
              <div key={idx} style={{ background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255, 255, 255, 0.3)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", borderTop: `4px solid ${dayPct === 100 ? '#10b981' : '#FF5A1F'}`, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.3)", background: dayPct === 100 ? "rgba(16, 185, 129, 0.1)" : "rgba(255, 255, 255, 0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <h3 style={{ margin: 0, color: dayPct === 100 ? "#166534" : "#000000" }}>
                      {dayPct === 100 && <i className="fa-solid fa-check-circle" style={{ marginRight: "0.4rem", color: "#10b981" }}></i>}
                      {dayPlan.day}
                    </h3>
                    <span style={{ fontSize: "0.8rem", background: "rgba(255, 90, 31, 0.1)", color: "#FF5A1F", padding: "0.2rem 0.6rem", borderRadius: "1rem", fontWeight: "bold" }}>
                      <i className="fa-regular fa-clock"></i> {dayPlan.time_estimate}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 0.5rem", color: "#000000", fontWeight: "500", fontSize: "0.95rem" }}>{dayPlan.goal}</p>
                  {/* Per-day mini progress bar */}
                  <div style={{ background: "rgba(0, 0, 0, 0.1)", borderRadius: "999px", height: "6px", overflow: "hidden" }}>
                    <div style={{ width: `${dayPct}%`, height: "100%", background: dayPct === 100 ? "#10b981" : "#FF5A1F", borderRadius: "999px", transition: "width 0.3s ease" }} />
                  </div>
                  <p style={{ margin: "0.3rem 0 0", fontSize: "0.75rem", color: "#000000", textAlign: "right" }}>{dayCompleted}/{dayTasks.length} tasks</p>
                </div>
                <div style={{ padding: "1.25rem", flex: 1 }}>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {dayTasks.map((task, tidx) => {
                      const isCompleted = dayPlan.progress && dayPlan.progress[task];
                      return (
                        <li key={tidx} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.75rem" }}>
                          <input 
                            type="checkbox" 
                            checked={isCompleted || false}
                            onChange={() => toggleTask(dayPlan.day, task, isCompleted || false)}
                            style={{ marginTop: "0.25rem", width: "1.1rem", height: "1.1rem", cursor: "pointer", accentColor: "#10b981" }}
                          />
                          <span style={{ 
                            fontSize: "0.95rem", 
                            color: isCompleted ? "rgba(0,0,0,0.5)" : "#000000",
                            textDecoration: isCompleted ? "line-through" : "none",
                            transition: "all 0.2s"
                          }}>
                            {task}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {/* Scraped resource links */}
                {dayPlan.resources && dayPlan.resources.length > 0 && (
                  <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255, 255, 255, 0.3)", background: "rgba(255, 255, 255, 0.15)" }}>
                    <p style={{ margin: "0 0 0.4rem", fontWeight: "600", fontSize: "0.8rem", color: "#000000", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <i className="fa-solid fa-link" style={{ marginRight: "0.3rem" }}></i> Resources
                    </p>
                    {dayPlan.resources.map((res, ridx) => (
                      <a 
                        key={ridx} 
                        href={res.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ display: "block", fontSize: "0.85rem", color: "#FF5A1F", textDecoration: "none", marginBottom: "0.3rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        <i className="fa-solid fa-arrow-up-right-from-square" style={{ marginRight: "0.3rem", fontSize: "0.7rem" }}></i>
                        {res.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
            })}
          </div>

          {/* AI Assistant Chat Widget */}
          <div style={{ background: "rgba(255, 255, 255, 0.25)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.3)" }}>
            <div 
              onClick={() => setShowChat(!showChat)}
              style={{ padding: "1rem 1.5rem", background: "linear-gradient(135deg, #000000, #333333)", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}><i className="fa-solid fa-robot" style={{ marginRight: "0.5rem" }}></i> AI Study Assistant</span>
              <i className={`fa-solid fa-chevron-${showChat ? 'down' : 'up'}`}></i>
            </div>
            {showChat && (
              <div>
                <div style={{ height: "300px", overflowY: "auto", padding: "1rem", background: "rgba(255, 255, 255, 0.1)" }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: "center", color: "#000000", paddingTop: "4rem" }}>
                      <i className="fa-solid fa-comments" style={{ fontSize: "2rem", marginBottom: "0.5rem" }}></i>
                      <p>Ask me anything about your study plan!</p>
                      <p style={{ fontSize: "0.85rem" }}>Try: "What should I focus on today?"</p>
                    </div>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{
                        maxWidth: "75%",
                        padding: "0.75rem 1rem",
                        borderRadius: "12px",
                        background: msg.role === "user" ? "linear-gradient(135deg, #FF5A1F, #FF7A00)" : "rgba(255, 255, 255, 0.4)",
                        color: msg.role === "user" ? "#fff" : "#000000",
                        fontSize: "0.95rem",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap"
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "0.75rem" }}>
                      <div style={{ padding: "0.75rem 1rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.4)", color: "#000000" }}>
                        <i className="fa-solid fa-circle-notch fa-spin"></i> Thinking...
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", borderTop: "1px solid rgba(255, 255, 255, 0.3)" }}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    placeholder="Ask your AI study assistant..."
                    style={{ flex: 1, padding: "0.75rem 1rem", border: "none", outline: "none", fontSize: "0.95rem", background: "rgba(255, 255, 255, 0.2)", color: "#000000" }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={chatLoading}
                    style={{ padding: "0.75rem 1.5rem", background: "#FF5A1F", color: "#fff", border: "none", cursor: "pointer", fontWeight: "bold" }}>
                    <i className="fa-solid fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

