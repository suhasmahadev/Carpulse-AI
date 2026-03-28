// src/pages/StudentDashboard.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import AgentWidget from "../components/AgentWidget";
import "../styles/student-dashboard.css";

const NAV_ITEMS = [
  { id: "overview",      label: "Overview",        icon: "fa-solid fa-chart-pie" },
  { id: "subjects",      label: "My Subjects",     icon: "fa-solid fa-book-open" },
  { id: "attendance",    label: "Attendance",      icon: "fa-solid fa-clipboard-check" },
  { id: "marks",         label: "Marks",           icon: "fa-solid fa-pen-to-square" },
  { id: "ia",            label: "IA Marks",        icon: "fa-solid fa-star-half-stroke" },
  { id: "results",       label: "Results",         icon: "fa-solid fa-trophy" },
  { id: "notifications", label: "Notifications",   icon: "fa-solid fa-bell" },
  { id: "chat",          label: "Chat",            icon: "fa-solid fa-comments" },
];

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [result, setResult] = useState(null);
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subject + session drill-down
  const [mySubjects, setMySubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectAnalytics, setSubjectAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportMsg, setReportMsg] = useState("");

  // Intelligence layer
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [iaMarks, setIaMarks] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [attRes, marksRes, resRes, meRes, subRes] = await Promise.allSettled([
          api.get("/academic/my/attendance"),
          api.get("/academic/my/marks"),
          api.get("/academic/my/results"),
          api.get("/academic/me"),
          api.get("/academic/my/semester-subjects"),
        ]);

        if (attRes.status === "fulfilled") setAttendance(attRes.value.data);
        if (marksRes.status === "fulfilled") setMarks(marksRes.value.data);
        if (resRes.status === "fulfilled") setResult(resRes.value.data);
        if (meRes.status === "fulfilled") setDepartment(meRes.value.data);
        if (subRes.status === "fulfilled") setMySubjects(subRes.value.data || []);
      } catch (err) {
        console.error("Error loading student data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();

    // Intelligence: analytics + notifications (once)
    api.get("/academic/analytics/student").then(r => setAnalytics(r.data)).catch(() => {});
    api.get("/academic/notifications").then(r => setNotifications(r.data)).catch(() => {});
    api.get("/academic/my/ia-marks").then(r => setIaMarks(r.data || [])).catch(() => {});

    // Alerts: poll every 60 seconds
    const fetchAlerts = () =>
      api.get("/academic/alerts").then(r => setAlerts(r.data || [])).catch(() => {});
    fetchAlerts();
    const alertTimer = setInterval(fetchAlerts, 60000);
    return () => clearInterval(alertTimer);
  }, []);

  const handleSubjectClick = async (subjectId) => {
    setSelectedSubject(subjectId);
    setSubjectAnalytics(null);
    setAnalyticsLoading(true);
    setReportMsg("");
    setReportText("");
    try {
      const res = await api.get(`/academic/my/subject/${subjectId}/analytics`);
      setSubjectAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load subject analytics", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();
    setReportMsg("");
    try {
      await api.post("/academic/student/query", { subject_id: selectedSubject, message: reportText });
      setReportMsg("✅ Issue reported successfully! Faculty will review it.");
      setReportText("");
    } catch (err) {
      setReportMsg("❌ " + (err.response?.data?.detail || err.message));
    }
  };

  const navigate = (page) => {
    if (page === "chat") {
      window.location.href = "/chat";
      return;
    }
    setActivePage(page);
    setMobileMenuOpen(false);
  };

  // ── Helpers ──────────────────────────────────────────────
  const getAttBadgeClass = (pct) => {
    const p = parseFloat(pct);
    if (p >= 85) return "sd-badge sd-badge-success";
    if (p >= 75) return "sd-badge sd-badge-warning";
    return "sd-badge sd-badge-danger";
  };

  const overallPct = analytics?.overall_percentage ?? null;

  // ── PAGE RENDERERS ────────────────────────────────────────

  const renderOverview = () => (
    <>
      <div className="sd-page-header">
        <h1>Dashboard Overview</h1>
        <p>Your academic snapshot — attendance, performance, and alerts</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {alerts.map((a, i) => (
            <div key={i} className={a.type === "critical" ? "sd-alert-banner" : "sd-alert-warning"}>
              <i className={`fa-solid ${a.type === "critical" ? "fa-circle-exclamation" : "fa-triangle-exclamation"}`} />
              <div>
                <strong>{a.type === "critical" ? "CRITICAL" : "WARNING"}:</strong>{" "}
                {a.message}
              </div>
            </div>
          ))}
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
            ⟳ Alerts refresh every 60 seconds
          </p>
        </div>
      )}

      {/* Stat row */}
      <div className="sd-grid sd-grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Overall Attendance</span>
          <span className="sd-stat-value" style={{
            color: overallPct >= 85 ? "#34d399" : overallPct >= 75 ? "#fbbf24" : "#f87171"
          }}>
            {overallPct !== null ? `${overallPct}%` : "—"}
          </span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Subjects</span>
          <span className="sd-stat-value" style={{ color: "#a78bfa" }}>
            {mySubjects.length || "—"}
          </span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">IA Marks Uploaded</span>
          <span className="sd-stat-value" style={{ color: "#38bdf8" }}>
            {iaMarks.length || "—"}
          </span>
        </div>
      </div>

      {/* Analytics breakdown */}
      {analytics && (
        <div className="sd-card" style={{ marginBottom: "1.5rem" }}>
          <div className="sd-card-header">
            <i className="fa-solid fa-chart-line" />
            <h2>Performance Analytics</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {analytics.subjects?.map((s, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "12px",
                padding: "0.85rem 1.25rem",
                minWidth: "160px",
                flex: "1 1 160px"
              }}>
                <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.25rem" }}>{s.subject}</p>
                <p style={{
                  fontSize: "1.75rem", fontWeight: 800, margin: 0,
                  color: s.percentage >= 85 ? "#34d399" : s.percentage >= 75 ? "#fbbf24" : "#f87171"
                }}>{s.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Department info */}
      {department && (
        <div className="sd-card">
          <div className="sd-card-header">
            <i className="fa-solid fa-id-badge" />
            <h2>Student Profile</h2>
          </div>
          <div className="sd-grid sd-grid-3" style={{ gap: "1rem" }}>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>USN</p>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>{department.usn || "—"}</p>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Department</p>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>{department.department || "—"}</p>
            </div>
            <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "1rem" }}>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Semester</p>
              <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}>{department.semester || "—"}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderSubjects = () => (
    <>
      <div className="sd-page-header">
        <h1>My Subjects</h1>
        <p>Semester {department?.semester || "—"} — click a subject to view attendance analytics</p>
      </div>

      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-book-open" />
          <h2>Subject List</h2>
        </div>

        {loading ? (
          <div className="sd-loading"><span className="sd-spinner" /></div>
        ) : mySubjects.length > 0 ? (
          <>
            <div className="sd-pill-group">
              {mySubjects.map(sub => (
                <button
                  key={sub.id}
                  className={`sd-pill ${selectedSubject === sub.id ? "active" : ""}`}
                  onClick={() => handleSubjectClick(sub.id)}
                >
                  {sub.subject_name} ({sub.subject_code})
                </button>
              ))}
            </div>

            {analyticsLoading && (
              <div className="sd-loading"><span className="sd-spinner" /></div>
            )}

            {subjectAnalytics && (
              <div className="sd-drilldown-panel">
                <h3 style={{ marginBottom: "1rem", color: "#a78bfa" }}>
                  <i className="fa-solid fa-chart-bar" style={{ marginRight: "0.5rem" }} />
                  {subjectAnalytics.subject} — Attendance Analytics
                </h3>

                <div className="sd-grid sd-grid-4" style={{ marginBottom: "1.25rem", gap: "0.75rem" }}>
                  {[
                    { label: "Total Classes", value: subjectAnalytics.total_classes, color: "#e2e8f0" },
                    { label: "Attended", value: subjectAnalytics.attended, color: "#34d399" },
                    { label: "Missed", value: subjectAnalytics.missed, color: "#f87171" },
                    {
                      label: "Percentage", value: `${subjectAnalytics.percentage}%`,
                      color: subjectAnalytics.percentage >= 85 ? "#34d399" : subjectAnalytics.percentage >= 75 ? "#fbbf24" : "#f87171"
                    },
                  ].map((item, idx) => (
                    <div key={idx} style={{
                      background: "rgba(0,0,0,0.25)",
                      borderRadius: "12px",
                      padding: "1rem",
                      border: "1px solid rgba(255,255,255,0.06)"
                    }}>
                      <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginBottom: "0.3rem" }}>{item.label}</p>
                      <p style={{ fontSize: "1.8rem", fontWeight: 800, color: item.color, margin: 0 }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Warning banners */}
                {subjectAnalytics.percentage < 75 && (
                  <div className="sd-alert-banner" style={{ marginBottom: "1rem" }}>
                    <i className="fa-solid fa-circle-exclamation" />
                    <strong>CRITICAL: Your attendance is below 75%. You are at risk of not being allowed to take exams.</strong>
                  </div>
                )}
                {subjectAnalytics.percentage >= 75 && subjectAnalytics.percentage < 85 && (
                  <div className="sd-alert-warning" style={{ marginBottom: "1rem" }}>
                    <i className="fa-solid fa-triangle-exclamation" />
                    <strong>WARNING: Your attendance is below 85%. Please attend upcoming classes.</strong>
                  </div>
                )}

                {/* Absent history */}
                <h4 style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>Absent History</h4>
                {subjectAnalytics.absent_dates?.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                    {subjectAnalytics.absent_dates.map((d, i) => (
                      <span key={i} className="sd-badge sd-badge-danger">{d}</span>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#34d399", marginBottom: "1.25rem" }}>🎉 Perfect attendance! Keep it up.</p>
                )}

                {/* Report form */}
                <div style={{
                  background: "rgba(0,0,0,0.2)",
                  borderRadius: "12px",
                  padding: "1.25rem",
                  border: "1px solid rgba(255,255,255,0.06)"
                }}>
                  <h4 style={{ color: "#e2e8f0", marginBottom: "0.35rem" }}>
                    <i className="fa-solid fa-flag" style={{ marginRight: "0.4rem", color: "#a78bfa" }} />
                    Report Discrepancy / Raise Query
                  </h4>
                  <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "0.75rem" }}>
                    If you were marked absent incorrectly, please report it to your professor.
                  </p>
                  <form onSubmit={submitReport}>
                    <textarea
                      className="sd-textarea"
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="Describe the issue… (e.g. 'I was present on Oct 12 but marked absent')"
                      required
                      style={{ marginBottom: "0.75rem" }}
                    />
                    <button type="submit" className="sd-btn sd-btn-primary">
                      <i className="fa-solid fa-paper-plane" /> Submit Report
                    </button>
                    {reportMsg && (
                      <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#94a3b8" }}>{reportMsg}</p>
                    )}
                  </form>
                </div>

                <button
                  className="sd-btn sd-btn-secondary"
                  style={{ marginTop: "1.25rem", width: "100%" }}
                  onClick={() => { setSelectedSubject(null); setSubjectAnalytics(null); }}
                >
                  <i className="fa-solid fa-xmark" /> Close Analytics
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="sd-empty-state">No subjects found for your semester.</p>
        )}
      </div>
    </>
  );

  const renderAttendance = () => (
    <>
      <div className="sd-page-header">
        <h1>Attendance Summary</h1>
        <p>Your attendance record across all subjects</p>
      </div>
      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-clipboard-check" />
          <h2>Attendance Records</h2>
        </div>
        {loading ? (
          <div className="sd-loading"><span className="sd-spinner" /></div>
        ) : attendance.length > 0 ? (
          <div className="sd-table-container">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Sessions</th>
                  <th>Attended</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, i) => {
                  const pct = typeof a.percentage === "number"
                    ? a.percentage.toFixed(1)
                    : (a.attendance_percentage ?? 0);
                  return (
                    <tr key={i}>
                      <td>{a.subject_name || a.subject_id}</td>
                      <td>{a.total_sessions ?? "—"}</td>
                      <td>{a.attended ?? "—"}</td>
                      <td>
                        <span className={getAttBadgeClass(pct)}>{pct}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sd-empty-state">No attendance records yet.</p>
        )}
      </div>
    </>
  );

  const renderMarks = () => (
    <>
      <div className="sd-page-header">
        <h1>Marks</h1>
        <p>Internal and external exam marks</p>
      </div>
      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-pen-to-square" />
          <h2>Marks Record</h2>
        </div>
        {loading ? (
          <div className="sd-loading"><span className="sd-spinner" /></div>
        ) : marks.length > 0 ? (
          <div className="sd-table-container">
            <table className="sd-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Internal</th>
                  <th>External</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((m, i) => (
                  <tr key={i}>
                    <td>{m.subject_id}</td>
                    <td>{m.internal_marks}</td>
                    <td>{m.external_marks}</td>
                    <td>
                      <strong style={{ color: "#a78bfa" }}>
                        {m.internal_marks + m.external_marks}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sd-empty-state">No marks recorded yet.</p>
        )}
      </div>
    </>
  );

  const renderIaMarks = () => (
    <>
      <div className="sd-page-header">
        <h1>Internal Assessment Marks</h1>
        <p>IA scores uploaded by your faculty</p>
      </div>
      {iaMarks.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {iaMarks.map((m, i) => {
            const statusColor = m.status === "good" ? "#34d399" : m.status === "average" ? "#fbbf24" : "#f87171";
            const pct = m.max > 0 ? Math.round((m.marks / m.max) * 100) : 0;
            return (
              <div key={i} className="sd-ia-card" style={{ borderTop: `3px solid ${statusColor}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1rem", color: "#e2e8f0" }}>{m.subject}</h4>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>{m.subject_code}</p>
                  </div>
                  <span className={`sd-badge ${m.status === "good" ? "sd-badge-success" : m.status === "average" ? "sd-badge-warning" : "sd-badge-danger"}`}
                    style={{ textTransform: "capitalize", fontSize: "0.72rem" }}
                  >
                    {m.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: 800, color: statusColor }}>{m.marks}</span>
                  <span style={{ fontSize: "1rem", color: "#64748b" }}>/ {m.max}</span>
                </div>
                <div className="sd-progress-bar-bg">
                  <div className="sd-progress-bar-fill" style={{ width: `${pct}%`, background: statusColor }} />
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "#64748b", textAlign: "right" }}>{pct}%</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="sd-card">
          <p className="sd-empty-state">No IA marks available yet.</p>
        </div>
      )}
    </>
  );

  const renderResults = () => (
    <>
      <div className="sd-page-header">
        <h1>Results</h1>
        <p>Your SGPA and CGPA</p>
      </div>
      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-trophy" />
          <h2>Semester Result</h2>
        </div>
        {loading ? (
          <div className="sd-loading"><span className="sd-spinner" /></div>
        ) : result ? (
          <div className="sd-result-grid">
            <div className="sd-result-item">
              <span className="sd-result-label">SGPA</span>
              <span className="sd-result-value">{result.sgpa}</span>
            </div>
            <div className="sd-result-item">
              <span className="sd-result-label">CGPA</span>
              <span className="sd-result-value">{result.cgpa}</span>
            </div>
          </div>
        ) : (
          <p className="sd-empty-state">Results not published yet.</p>
        )}
      </div>
    </>
  );

  const renderNotifications = () => (
    <>
      <div className="sd-page-header">
        <h1>Notifications</h1>
        <p>Messages and updates from faculty</p>
      </div>
      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-bell" />
          <h2>Inbox</h2>
        </div>
        {notifications.length > 0 ? (
          <div>
            {notifications.map((n, i) => (
              <div key={i} className="sd-notification-item">
                <i className="fa-solid fa-envelope" />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0" }}>{n.message}</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="sd-empty-state">No notifications yet.</p>
        )}
      </div>
    </>
  );

  const pages = {
    overview:      renderOverview,
    subjects:      renderSubjects,
    attendance:    renderAttendance,
    marks:         renderMarks,
    ia:            renderIaMarks,
    results:       renderResults,
    notifications: renderNotifications,
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="sd-layout">
      {/* Sidebar */}
      <aside className={`sd-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sd-logo">
          <i className="fa-solid fa-user-graduate" />
          AcademiX
        </div>
        <nav className="sd-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sd-nav-item ${activePage === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <i className={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="sd-main">
        {/* Topbar */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button
              className="mobile-sd-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fa-solid fa-bars" />
            </button>
            <div style={{ lineHeight: 1.2 }}>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "#e2e8f0" }}>
                {department?.usn || user}
              </span>
              {department?.department && (
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  {department.department} — Sem {department.semester}
                </div>
              )}
            </div>
          </div>
          <div className="sd-topbar-right">
            <div className="sd-profile">
              <div className="sd-avatar">
                {user ? user.charAt(0).toUpperCase() : "S"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user}</span>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Student</span>
              </div>
            </div>
            <button onClick={logout} className="sd-logout-btn" title="Logout">
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="sd-content">
          {(pages[activePage] || renderOverview)()}
        </main>
      </div>

    </div>
  );
}
