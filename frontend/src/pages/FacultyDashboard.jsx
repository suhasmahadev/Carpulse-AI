import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/apiClient";
import AgentWidget from "../components/AgentWidget";
import "../styles/student-dashboard.css";

// ── Nav items differ by role ───────────────────────────────
const FACULTY_NAV = [
  { id: "overview",       label: "Overview",          icon: "fa-solid fa-chart-pie" },
  { id: "subjects",       label: "My Subjects",       icon: "fa-solid fa-book" },
  { id: "attendance",     label: "Attendance",        icon: "fa-solid fa-clipboard-check" },
  { id: "marks",          label: "Manage Marks",      icon: "fa-solid fa-pen-to-square" },
  { id: "ia",             label: "IA Marks",          icon: "fa-solid fa-star-half-stroke" },
  { id: "notifications",  label: "Student Queries",   icon: "fa-solid fa-bell" },
  { id: "chat",           label: "Chat",             icon: "fa-solid fa-comments" },
];

const HOD_NAV = [
  { id: "overview",       label: "Overview",          icon: "fa-solid fa-chart-pie" },
  { id: "students",       label: "Dept. Students",    icon: "fa-solid fa-users" },
  { id: "subjects",       label: "My Subjects",       icon: "fa-solid fa-book" },
  { id: "mgmt",           label: "Subject Mgmt",      icon: "fa-solid fa-layer-group" },
  { id: "attendance",     label: "Attendance",        icon: "fa-solid fa-clipboard-check" },
  { id: "marks",          label: "Manage Marks",      icon: "fa-solid fa-pen-to-square" },
  { id: "ia",             label: "IA Marks",          icon: "fa-solid fa-star-half-stroke" },
  { id: "notifications",  label: "Student Queries",   icon: "fa-solid fa-bell" },
  { id: "chat",           label: "Chat",             icon: "fa-solid fa-comments" },
];

export default function FacultyDashboard() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [department, setDepartment] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState("");

  const [assignedSubjects, setAssignedSubjects] = useState([]);

  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectSemester, setSubjectSemester] = useState("");
  const [createSubMsg, setCreateSubMsg] = useState("");

  const [editSubjectId, setEditSubjectId] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionStudents, setSessionStudents] = useState([]);
  const [absentIds, setAbsentIds] = useState([]);
  const [attendanceMsg, setAttendanceMsg] = useState("");

  const [assignFacultyId, setAssignFacultyId] = useState("");
  const [assignSubjectId, setAssignSubjectId] = useState("");
  const [assignMsg, setAssignMsg] = useState("");

  const [facultyList, setFacultyList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  // HOD student visibility
  const [hodStudents, setHodStudents] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Intelligence layer
  const [analytics, setAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // IA Marks
  const [iaSubject, setIaSubject] = useState("");
  const [iaStudents, setIaStudents] = useState([]);
  const [iaMarksData, setIaMarksData] = useState({});
  const [iaMsg, setIaMsg] = useState("");
  const [iaLoading, setIaLoading] = useState(false);
  const [iaExistingMarks, setIaExistingMarks] = useState([]);
  const [iaAnalytics, setIaAnalytics] = useState(null);

  const [marksStudentId, setMarksStudentId] = useState("");
  const [marksSubjectId, setMarksSubjectId] = useState("");
  const [internalMarks, setInternalMarks] = useState("");
  const [externalMarks, setExternalMarks] = useState("");
  const [marksMsg, setMarksMsg] = useState("");
  const [marksIsUpdate, setMarksIsUpdate] = useState(false);
  const [loading, setLoading] = useState(false);

  const userRole = localStorage.getItem("user_role");
  const isHod = userRole === "hod" || localStorage.getItem("role") === "hod";

  const navItems = isHod ? HOD_NAV : FACULTY_NAV;

  useEffect(() => {
    async function fetchDept() {
      try {
        const res = await api.get("/academic/me");
        if (res.data) setProfile(res.data);
      } catch (err) {
        console.error("Failed to load profile info", err);
      }
      if (isHod) {
        try {
          const deptRes = await api.get("/academic/my/department");
          if (deptRes.data && deptRes.data.id) {
            setDepartment(deptRes.data);
            fetchReport(deptRes.data.id);

            const facs = await api.get(`/academic/manage/faculty?department=${deptRes.data.id}`);
            setFacultyList(facs.data);

            const subs = await api.get(`/academic/manage/subjects?department_id=${deptRes.data.id}`);
            setSubjectsList(subs.data);

            try {
              const hodRes = await api.get("/academic/hod/students");
              setHodStudents(hodRes.data);
              if (hodRes.data.semesters?.length > 0) {
                setActiveSemester(hodRes.data.semesters[0].semester);
              }
            } catch (e) { console.error("HOD students fetch failed", e); }
          }
        } catch (err) {}
      }
    }
    fetchDept();

    async function fetchAssignedSubjects() {
      try {
        const res = await api.get("/academic/my/subjects");
        setAssignedSubjects(res.data);
      } catch (err) {}
    }
    fetchAssignedSubjects();

    api.get("/academic/analytics/faculty").then(r => setAnalytics(r.data)).catch(() => {});
    api.get("/academic/notifications").then(r => setNotifications(r.data)).catch(() => {});

    const fetchAlerts = () =>
      api.get("/academic/alerts").then(r => setAlerts(r.data || [])).catch(() => {});
    fetchAlerts();
    const alertTimer = setInterval(fetchAlerts, 60000);
    return () => clearInterval(alertTimer);
  }, [isHod]);

  const fetchReport = async (deptId) => {
    setReportLoading(true);
    setReportMsg("");
    try {
      const res = await api.get(`/academic/manage/reports/${deptId}`);
      setReportData(res.data);
    } catch (err) {
      setReportMsg("❌ Failed to fetch reports: " + (err.response?.data?.detail || err.message));
    } finally {
      setReportLoading(false);
    }
  };

  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    setMarksMsg("");
    setLoading(true);
    try {
      const payload = {
        student_id: marksStudentId,
        subject_id: marksSubjectId,
        internal_marks: parseFloat(internalMarks),
        external_marks: parseFloat(externalMarks),
      };
      if (marksIsUpdate) {
        await api.put("/academic/manage/marks", payload);
      } else {
        await api.post("/academic/manage/marks", payload);
      }
      setMarksMsg(`✅ Marks ${marksIsUpdate ? "updated" : "recorded"} successfully!`);
      setMarksStudentId("");
      setMarksSubjectId("");
      setInternalMarks("");
      setExternalMarks("");
    } catch (err) {
      setMarksMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    setCreateSubMsg("");
    try {
      await api.post("/academic/manage/subjects", {
        subject_name: subjectName,
        subject_code: subjectCode,
        semester: parseInt(subjectSemester)
      });
      setCreateSubMsg("✅ Subject created successfully!");
      setSubjectName(""); setSubjectCode(""); setSubjectSemester("");
      if (department) {
        const subs = await api.get(`/academic/manage/subjects?department_id=${department.id}`);
        setSubjectsList(subs.data);
      }
    } catch (err) {
      setCreateSubMsg("❌ " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteSubject = async (subId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) return;
    try {
      await api.delete(`/academic/manage/subjects/${subId}`);
      if (department) {
        const subs = await api.get(`/academic/manage/subjects?department_id=${department.id}`);
        setSubjectsList(subs.data);
      }
    } catch (err) {
      alert("Error deleting: " + (err.response?.data?.detail || err.message));
    }
  };

  const startEditSubject = (sub) => {
    setEditSubjectId(sub.id);
    setSubjectName(sub.subject_name);
    setSubjectCode(sub.subject_code);
    setSubjectSemester(sub.semester || "");
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    setCreateSubMsg("");
    try {
      await api.put(`/academic/manage/subjects/${editSubjectId}`, {
        subject_name: subjectName,
        subject_code: subjectCode,
        semester: parseInt(subjectSemester)
      });
      setCreateSubMsg("✅ Subject updated successfully!");
      setEditSubjectId(null);
      setSubjectName(""); setSubjectCode(""); setSubjectSemester("");
      if (department) {
        const subs = await api.get(`/academic/manage/subjects?department_id=${department.id}`);
        setSubjectsList(subs.data);
      }
    } catch (err) {
      setCreateSubMsg("❌ " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSelectSubject = async (sub) => {
    setSelectedSubject(sub);
    setCurrentSession(null);
    setSessionStudents([]);
    setAbsentIds([]);
    setAttendanceMsg("");
    try {
      const res = await api.get(`/academic/attendance/subject/${sub.id}/sessions`);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createSession = async () => {
    try {
      let total_classes = null;
      if (sessions.length === 0) {
        const input = window.prompt("First session! Enter total classes for this subject:", "50");
        if (!input) return;
        total_classes = parseInt(input, 10);
      }
      const res = await api.post("/academic/attendance/session/start", {
        subject_id: selectedSubject.id,
        total_classes: total_classes
      });
      const sessRes = await api.get(`/academic/attendance/subject/${selectedSubject.id}/sessions`);
      setSessions(sessRes.data);
      const newSess = sessRes.data.find(s => s.id === res.data.session_id);
      openSession(newSess);
    } catch (err) {
      alert("Error creating session: " + (err.response?.data?.detail || err.message));
    }
  };

  const openSession = async (sess) => {
    setCurrentSession(sess);
    setAttendanceMsg("");
    try {
      const stRes = await api.get(`/academic/attendance/session/${sess.id}/students`);
      setSessionStudents(stRes.data);

      const recsRes = await api.get(`/academic/attendance/session/${sess.id}/records`);
      if (recsRes.data && recsRes.data.length > 0) {
        const absences = recsRes.data.filter(r => r.status === "absent").map(r => r.student_id);
        setAbsentIds(absences);
      } else {
        setAbsentIds([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleAbsent = (studentId) => {
    setAbsentIds(prev =>
      prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
    );
  };

  const saveAttendance = async () => {
    setLoading(true);
    setAttendanceMsg("");
    try {
      const recsRes = await api.get(`/academic/attendance/session/${currentSession.id}/records`);
      if (recsRes.data && recsRes.data.length > 0) {
        await api.put(`/academic/attendance/session/${currentSession.id}/update`, { absent_student_ids: absentIds });
      } else {
        await api.post(`/academic/attendance/session/${currentSession.id}/mark`, { absent_student_ids: absentIds });
      }
      setAttendanceMsg("✅ Attendance Saved!");
    } catch (err) {
      setAttendanceMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = async (studentId) => {
    setSelectedStudent(studentId);
    setStudentDetail(null);
    setStudentDetailLoading(true);
    try {
      const res = await api.get(`/academic/hod/student/${studentId}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error("Failed to load student detail", err);
    } finally {
      setStudentDetailLoading(false);
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    setAssignMsg("");
    try {
      await api.post("/academic/manage/assign-subject", {
        faculty_id: assignFacultyId,
        subject_id: assignSubjectId
      });
      const facName = facultyList.find(f => f.id === assignFacultyId)?.name;
      const subName = subjectsList.find(s => s.id === assignSubjectId)?.subject_name;
      setAssignMsg(`✅ ${facName} → ${subName}`);
      setAssignFacultyId(""); setAssignSubjectId("");
    } catch (err) {
      setAssignMsg("❌ " + (err.response?.data?.detail || err.message));
    }
  };

  const navigate = (page) => { 
    if (page === "chat") {
      window.location.href = "/chat";
      return;
    }
    setActivePage(page); setMobileMenuOpen(false); 
  };

  // ── Icon/colour helpers ───────────────────────────────────
  const accentColor = isHod ? "#34d399" : "#a78bfa";
  const accentClass = isHod ? "hd" : "sd";

  // ── PAGE RENDERERS ────────────────────────────────────────

  const renderOverview = () => (
    <>
      <div className="sd-page-header">
        <h1>{isHod ? "HOD Dashboard" : "Faculty Dashboard"}</h1>
        <p>{isHod ? `Managing ${profile?.department || "your department"}` : "Subject performance & your teaching overview"}</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          {alerts.map((a, i) => (
            <div key={i} className={a.type === "critical" ? "sd-alert-banner" : "sd-alert-warning"}>
              <i className={`fa-solid ${a.type === "critical" ? "fa-circle-exclamation" : "fa-triangle-exclamation"}`} />
              <div>
                <strong>{a.type === "critical" ? "CRITICAL" : "WARNING"}:</strong> {a.message}
              </div>
            </div>
          ))}
          <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem" }}>
            ⟳ Alerts refresh every 60 seconds
          </p>
        </div>
      )}

      {/* Profile stats */}
      <div className="sd-grid sd-grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Faculty Code</span>
          <span className="sd-stat-value" style={{ color: accentColor, fontSize: "1.5rem" }}>
            {profile?.faculty_code || "—"}
          </span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Department</span>
          <span className="sd-stat-value" style={{ color: "#38bdf8", fontSize: "1.4rem" }}>
            {profile?.department || "—"}
          </span>
        </div>
        <div className="sd-stat-card">
          <span className="sd-stat-label">Assigned Subjects</span>
          <span className="sd-stat-value" style={{ color: accentColor }}>
            {assignedSubjects.length || "—"}
          </span>
        </div>
      </div>

      {/* Analytics */}
      {analytics && analytics.length > 0 && (
        <div className="sd-card" style={{ marginBottom: "1.5rem" }}>
          <div className="sd-card-header">
            <i className="fa-solid fa-chart-line" style={{ color: accentColor }} />
            <h2>Subject Performance Summary</h2>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {analytics.map((s, i) => (
              <div key={i} style={{
                flex: "1 1 220px",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "12px",
                padding: "1rem 1.25rem",
                borderLeft: `4px solid ${s.avg_attendance >= 80 ? "#34d399" : s.avg_attendance >= 70 ? "#fbbf24" : "#f87171"}`
              }}>
                <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.25rem" }}>{s.subject_name}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>{s.avg_attendance}%</p>
                    <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0 }}>Avg. Attendance</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: s.low_performers > 0 ? "#fca5a5" : "#e2e8f0" }}>
                      {s.low_performers}
                    </p>
                    <p style={{ fontSize: "0.72rem", color: "#64748b", margin: 0 }}>At Risk (&lt;75%)</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HOD dept overview */}
      {isHod && (
        <div className="sd-card">
          <div className="sd-card-header">
            <i className="fa-solid fa-chart-bar" style={{ color: accentColor }} />
            <h2>Department Overview</h2>
          </div>
          {reportLoading && !reportData && (
            <div className="sd-loading"><span className={`sd-spinner hd-spinner`} /></div>
          )}
          {reportMsg && <p style={{ color: "#f87171", marginBottom: "0.5rem" }}>{reportMsg}</p>}
          {reportData ? (
            <div>
              <div className="sd-grid sd-grid-2" style={{ gap: "1rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Total Students</p>
                  <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#34d399", margin: 0 }}>{reportData.total_students}</p>
                </div>
                <div style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", borderRadius: "12px", padding: "1.25rem", textAlign: "center" }}>
                  <p style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "0.3rem" }}>Total Faculty</p>
                  <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#38bdf8", margin: 0 }}>{reportData.total_faculty}</p>
                </div>
              </div>
              <button
                className="sd-btn hd-btn-primary"
                onClick={() => fetchReport(department?.id)}
                disabled={reportLoading || !department}
              >
                <i className="fa-solid fa-rotate-right" />
                {reportLoading ? "Refreshing…" : "Refresh Report"}
              </button>
            </div>
          ) : (
            !reportLoading && <p className="sd-empty-state">No report data available yet.</p>
          )}
        </div>
      )}
    </>
  );

  const renderStudents = () => (
    <>
      <div className="sd-page-header">
        <h1>Department Students</h1>
        <p>{hodStudents?.department || "Your department"} — all enrolled students by semester</p>
      </div>

      {hodStudents ? (
        <div className="sd-card">
          <div className="sd-card-header">
            <i className="fa-solid fa-users" style={{ color: accentColor }} />
            <h2>Students — {hodStudents.department}</h2>
          </div>

          {/* Semester tabs */}
          <div className="sd-pill-group">
            {hodStudents.semesters.map(s => (
              <button
                key={s.semester}
                className={`sd-pill ${activeSemester === s.semester ? "active hd-pill" : ""}`}
                onClick={() => { setActiveSemester(s.semester); setSelectedStudent(null); setStudentDetail(null); }}
              >
                Sem {s.semester} ({s.students.length})
              </button>
            ))}
          </div>

          {/* Student table */}
          {hodStudents.semesters.filter(s => s.semester === activeSemester).map(sem => (
            <div key={sem.semester}>
              <div className="sd-table-container">
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sem.students.map(st => (
                      <tr key={st.student_id}
                        className={selectedStudent === st.student_id ? "hd-table-row-active" : ""}>
                        <td style={{ fontFamily: "monospace" }}>{st.usn}</td>
                        <td>{st.name}</td>
                        <td>
                          <button
                            onClick={() => handleStudentClick(st.student_id)}
                            style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", fontWeight: 600, fontSize: "0.88rem" }}
                          >
                            <i className="fa-solid fa-eye" style={{ marginRight: "0.3rem" }} />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sem.students.length === 0 && <p className="sd-empty-state">No students in this semester.</p>}
            </div>
          ))}

          {/* Student detail */}
          {studentDetailLoading && (
            <div className="sd-loading" style={{ marginTop: "1rem" }}>
              <span className={`sd-spinner hd-spinner`} />
            </div>
          )}
          {studentDetail && (
            <div className="sd-drilldown-panel" style={{ borderColor: "rgba(52,211,153,0.2)", marginTop: "1.25rem" }}>
              <h3 style={{ color: accentColor, marginBottom: "0.35rem" }}>
                {studentDetail.name} ({studentDetail.usn})
              </h3>
              <p style={{ color: "#64748b", marginBottom: "1rem" }}>Semester {studentDetail.semester}</p>

              {studentDetail.subjects?.length > 0 ? (
                <div className="sd-table-container">
                  <table className="sd-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Attended</th>
                        <th>Total</th>
                        <th>Att %</th>
                        <th>Internal</th>
                        <th>External</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentDetail.subjects.map(sub => (
                        <tr key={sub.subject_id}>
                          <td>{sub.subject_name}</td>
                          <td>{sub.attended}</td>
                          <td>{sub.total_sessions}</td>
                          <td>
                            <span className={`sd-badge ${sub.attendance_percentage >= 75 ? "sd-badge-success" : "sd-badge-danger"}`}>
                              {sub.attendance_percentage}%
                            </span>
                          </td>
                          <td>{sub.marks?.internal ?? "—"}</td>
                          <td>{sub.marks?.external ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="sd-empty-state">No subject data for this student.</p>
              )}

              <button
                className="sd-btn sd-btn-secondary"
                style={{ marginTop: "1rem" }}
                onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
              >
                <i className="fa-solid fa-xmark" /> Close Detail
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="sd-card">
          <p className="sd-empty-state">HOD student data not available.</p>
        </div>
      )}
    </>
  );

  const renderSubjects = () => (
    <>
      <div className="sd-page-header">
        <h1>Your Assigned Subjects</h1>
        <p>Select a subject to manage attendance sessions</p>
      </div>

      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-book" style={{ color: accentColor }} />
          <h2>Assigned Subjects</h2>
        </div>

        {assignedSubjects.length > 0 ? (
          <>
            <div className="sd-pill-group">
              {assignedSubjects.map((sub, i) => (
                <button
                  key={i}
                  className={`sd-pill ${selectedSubject?.id === sub.id ? "active" : ""}`}
                  onClick={() => handleSelectSubject(sub)}
                >
                  {sub.subject_name} ({sub.subject_code}) — Sem {sub.semester}
                </button>
              ))}
            </div>

            {selectedSubject && (
              <div className="sd-drilldown-panel">
                <h3 style={{ color: accentColor, marginBottom: "1rem" }}>
                  <i className="fa-solid fa-calendar-days" style={{ marginRight: "0.5rem" }} />
                  {selectedSubject.subject_name} — Sessions
                </h3>

                <div className="sd-pill-group">
                  {sessions.map(s => (
                    <button
                      key={s.id}
                      className={`sd-pill ${currentSession?.id === s.id ? "active" : ""}`}
                      onClick={() => openSession(s)}
                    >
                      Session {s.session_number} ({s.date})
                    </button>
                  ))}
                  <button
                    className="sd-btn hd-btn-primary"
                    style={{ padding: "0.4rem 1rem", borderRadius: "20px", fontSize: "0.85rem" }}
                    onClick={createSession}
                  >
                    <i className="fa-solid fa-plus" /> New Session
                  </button>
                </div>

                {currentSession && (
                  <div style={{ marginTop: "1rem" }}>
                    <p style={{ color: "#94a3b8", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
                      Session {currentSession.session_number} / {currentSession.total_sessions} — Mark absent students (default: present)
                    </p>
                    <div className="sd-table-container">
                      <table className="sd-table">
                        <thead>
                          <tr>
                            <th>USN</th>
                            <th>Name</th>
                            <th>Absent?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sessionStudents.map(st => (
                            <tr key={st.id}>
                              <td style={{ fontFamily: "monospace" }}>{st.usn}</td>
                              <td>{st.name} ({st.user_id})</td>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={absentIds.includes(st.id)}
                                  onChange={() => toggleAbsent(st.id)}
                                  style={{ transform: "scale(1.4)" }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {sessionStudents.length === 0 && (
                      <p className="sd-empty-state">No students found for this subject's semester/department.</p>
                    )}
                    <button
                      className={`sd-btn ${isHod ? "hd-btn-primary" : "sd-btn-primary"}`}
                      style={{ marginTop: "1rem" }}
                      onClick={saveAttendance}
                      disabled={loading || sessionStudents.length === 0}
                    >
                      {loading ? <><span className="sd-spinner" style={{ width: 14, height: 14 }} /> Saving…</> : <><i className="fa-solid fa-floppy-disk" /> Save Attendance</>}
                    </button>
                    {attendanceMsg && (
                      <p style={{ marginTop: "0.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>{attendanceMsg}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="sd-empty-state">You have no assigned subjects yet.</p>
        )}
      </div>
    </>
  );

  const renderMgmt = () => (
    <>
      <div className="sd-page-header">
        <h1>Subject Management</h1>
        <p>Create, edit, delete subjects and assign faculty</p>
      </div>

      <div className="sd-grid sd-grid-2">
        {/* Create / Edit subject */}
        <div className="sd-card">
          <div className="sd-card-header">
            <i className="fa-solid fa-layer-group" style={{ color: accentColor }} />
            <h2>{editSubjectId ? "Edit Subject" : "Create Subject"}</h2>
          </div>
          <form onSubmit={editSubjectId ? handleUpdateSubject : handleCreateSubject}>
            <div className="sd-form-group">
              <label>Subject Name</label>
              <input className="sd-input" type="text" placeholder="e.g. Machine Learning"
                value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
            </div>
            <div className="sd-form-group">
              <label>Subject Code</label>
              <input className="sd-input" type="text" placeholder="e.g. ML101"
                value={subjectCode} onChange={e => setSubjectCode(e.target.value)} required />
            </div>
            <div className="sd-form-group">
              <label>Semester</label>
              <input className="sd-input" type="number" placeholder="e.g. 6"
                value={subjectSemester} onChange={e => setSubjectSemester(e.target.value)} required />
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button type="submit" className={`sd-btn ${isHod ? "hd-btn-primary" : "sd-btn-primary"}`}>
                <i className={`fa-solid ${editSubjectId ? "fa-pencil" : "fa-plus"}`} />
                {editSubjectId ? "Update Subject" : "Create Subject"}
              </button>
              {editSubjectId && (
                <button type="button" className="sd-btn sd-btn-danger"
                  onClick={() => { setEditSubjectId(null); setSubjectName(""); setSubjectCode(""); setSubjectSemester(""); }}>
                  Cancel
                </button>
              )}
            </div>
            {createSubMsg && <p style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>{createSubMsg}</p>}
          </form>

          <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <h4 style={{ color: "#e2e8f0", marginBottom: "0.75rem" }}>Existing Subjects</h4>
            {subjectsList.length > 0 ? subjectsList.map(sub => (
              <div key={sub.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "0.6rem 0.85rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "8px",
                marginBottom: "0.4rem",
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                  {sub.subject_name} ({sub.subject_code}) — Sem {sub.semester}
                </span>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={() => startEditSubject(sub)}
                    style={{ background: "none", border: "none", color: accentColor, cursor: "pointer", fontSize: "0.85rem" }}>
                    <i className="fa-solid fa-pencil" />
                  </button>
                  <button onClick={() => handleDeleteSubject(sub.id)}
                    style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: "0.85rem" }}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            )) : <p className="sd-empty-state">No subjects yet.</p>}
          </div>
        </div>

        {/* Assign faculty */}
        <div className="sd-card">
          <div className="sd-card-header">
            <i className="fa-solid fa-user-tag" style={{ color: accentColor }} />
            <h2>Assign Faculty to Subject</h2>
          </div>
          <form onSubmit={handleAssignSubject}>
            <div className="sd-form-group">
              <label>Select Faculty</label>
              <select className="sd-select" value={assignFacultyId}
                onChange={e => setAssignFacultyId(e.target.value)} required>
                <option value="" disabled>-- Select Faculty --</option>
                {facultyList.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.faculty_code})</option>
                ))}
              </select>
            </div>
            <div className="sd-form-group">
              <label>Select Subject</label>
              <select className="sd-select" value={assignSubjectId}
                onChange={e => setAssignSubjectId(e.target.value)} required>
                <option value="" disabled>-- Select Subject --</option>
                {subjectsList.map(s => (
                  <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
                ))}
              </select>
            </div>
            <button type="submit" className={`sd-btn ${isHod ? "hd-btn-primary" : "sd-btn-primary"}`}>
              <i className="fa-solid fa-link" /> Assign
            </button>
            {assignMsg && <p style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>{assignMsg}</p>}
          </form>
        </div>
      </div>
    </>
  );

  const renderMarks = () => (
    <>
      <div className="sd-page-header">
        <h1>Manage Marks</h1>
        <p>Record or update student marks</p>
      </div>

      <div className="sd-card" style={{ maxWidth: "560px" }}>
        <div className="sd-card-header">
          <i className="fa-solid fa-pen-to-square" style={{ color: accentColor }} />
          <h2>Enter Marks</h2>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#94a3b8", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={marksIsUpdate}
              onChange={e => setMarksIsUpdate(e.target.checked)}
              style={{ transform: "scale(1.3)" }}
            />
            Update Existing Record
          </label>
        </div>

        <form onSubmit={handleMarksSubmit}>
          <div className="sd-form-group">
            <label>Student ID</label>
            <input className="sd-input" type="text" placeholder="e.g. stu_1234"
              value={marksStudentId} onChange={e => setMarksStudentId(e.target.value)} required />
          </div>
          <div className="sd-form-group">
            <label>Subject ID</label>
            <input className="sd-input" type="text" placeholder="e.g. sub_5678"
              value={marksSubjectId} onChange={e => setMarksSubjectId(e.target.value)} required />
          </div>
          <div className="sd-grid sd-grid-2">
            <div className="sd-form-group">
              <label>Internal Marks</label>
              <input className="sd-input" type="number" step="0.1" min="0"
                placeholder="Internal" value={internalMarks} onChange={e => setInternalMarks(e.target.value)} required />
            </div>
            <div className="sd-form-group">
              <label>External Marks</label>
              <input className="sd-input" type="number" step="0.1" min="0"
                placeholder="External" value={externalMarks} onChange={e => setExternalMarks(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className={`sd-btn ${isHod ? "hd-btn-primary" : "sd-btn-primary"}`} disabled={loading}>
            {loading
              ? <><span className="sd-spinner" style={{ width: 14, height: 14 }} /> Saving…</>
              : <><i className="fa-solid fa-floppy-disk" /> {marksIsUpdate ? "Update Marks" : "Create Marks"}</>}
          </button>
          {marksMsg && <p style={{ marginTop: "0.75rem", color: "#94a3b8", fontSize: "0.9rem" }}>{marksMsg}</p>}
        </form>
      </div>
    </>
  );

  const renderIa = () => (
    <>
      <div className="sd-page-header">
        <h1>IA Marks</h1>
        <p>Upload internal assessment marks for your students</p>
      </div>

      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-clipboard-check" style={{ color: accentColor }} />
          <h2>Upload IA Marks</h2>
        </div>

        {/* Subject selector */}
        <div className="sd-form-group" style={{ maxWidth: 400 }}>
          <label>Select Subject</label>
          <select
            className="sd-select"
            value={iaSubject}
            onChange={async (e) => {
              const subId = e.target.value;
              setIaSubject(subId);
              setIaMsg("");
              setIaExistingMarks([]);
              setIaAnalytics(null);
              if (!subId) { setIaStudents([]); return; }
              try {
                const sub = assignedSubjects.find(s => s.id === subId);
                if (sub && sub.department_id && sub.semester) {
                  const res = await api.get(`/academic/attendance/session/temp/students?department_id=${sub.department_id}&semester=${sub.semester}`);
                  const students = res.data || [];
                  setIaStudents(students);
                  const initMarks = {};
                  students.forEach(s => { initMarks[s.id] = ""; });
                  setIaMarksData(initMarks);
                }
              } catch { setIaStudents([]); }
              try {
                const res = await api.get(`/academic/manage/ia-marks/${subId}`);
                setIaExistingMarks(res.data || []);
                const filled = {};
                (res.data || []).forEach(m => { filled[m.student_id] = String(m.marks); });
                setIaMarksData(prev => ({ ...prev, ...filled }));
              } catch {}
              if (isHod) {
                try {
                  const r = await api.get(`/academic/hod/ia-analytics/${subId}`);
                  setIaAnalytics(r.data);
                } catch {}
              }
            }}
          >
            <option value="">-- Select a subject --</option>
            {assignedSubjects.map(s => (
              <option key={s.id} value={s.id}>{s.subject_name} ({s.subject_code})</option>
            ))}
          </select>
        </div>

        {/* Student marks table */}
        {iaSubject && iaStudents.length > 0 && (
          <>
            <div className="sd-table-container" style={{ marginBottom: "1rem" }}>
              <table className="sd-table">
                <thead>
                  <tr>
                    <th>USN</th>
                    <th>Name</th>
                    <th>Marks / 40</th>
                  </tr>
                </thead>
                <tbody>
                  {iaStudents.map(stu => (
                    <tr key={stu.id}>
                      <td style={{ fontFamily: "monospace" }}>{stu.usn}</td>
                      <td>{stu.name || "Unknown"}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={iaMarksData[stu.id] || ""}
                          onChange={e => setIaMarksData(prev => ({ ...prev, [stu.id]: e.target.value }))}
                          className="sd-input"
                          style={{ width: "90px", padding: "0.4rem 0.6rem", textAlign: "center" }}
                          placeholder="0-40"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className={`sd-btn ${isHod ? "hd-btn-primary" : "sd-btn-primary"}`}
              disabled={iaLoading}
              onClick={async () => {
                setIaMsg("");
                setIaLoading(true);
                try {
                  const marksList = Object.entries(iaMarksData)
                    .filter(([, v]) => v !== "" && v !== undefined)
                    .map(([sid, v]) => ({ student_id: sid, marks_obtained: parseInt(v) }));
                  if (marksList.length === 0) { setIaMsg("❌ Enter at least one mark."); setIaLoading(false); return; }
                  await api.post("/academic/manage/ia-marks", {
                    subject_id: iaSubject,
                    max_marks: 40,
                    marks: marksList,
                  });
                  setIaMsg(`✅ IA marks saved for ${marksList.length} students!`);
                  const res = await api.get(`/academic/manage/ia-marks/${iaSubject}`);
                  setIaExistingMarks(res.data || []);
                } catch (err) {
                  const detail = err.response?.data?.detail;
                  const msg = typeof detail === "object" ? JSON.stringify(detail) : (detail || err.message);
                  setIaMsg("❌ " + msg);
                } finally {
                  setIaLoading(false);
                }
              }}
            >
              {iaLoading
                ? <><span className="sd-spinner" style={{ width: 14, height: 14 }} /> Saving…</>
                : <><i className="fa-solid fa-floppy-disk" /> Save IA Marks</>}
            </button>
            {iaMsg && <p style={{ marginTop: "0.5rem", color: "#94a3b8", fontSize: "0.9rem" }}>{iaMsg}</p>}
          </>
        )}

        {/* Existing marks */}
        {iaExistingMarks.length > 0 && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <h4 style={{ color: "#e2e8f0", marginBottom: "0.75rem" }}>
              <i className="fa-solid fa-list-check" style={{ marginRight: "0.4rem", color: accentColor }} />
              Current IA Marks
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {iaExistingMarks.map((m, i) => (
                <div key={i} style={{
                  background: m.marks >= 30 ? "rgba(16,185,129,0.12)" : m.marks >= 20 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                  border: `1px solid ${m.marks >= 30 ? "rgba(52,211,153,0.3)" : m.marks >= 20 ? "rgba(251,191,36,0.3)" : "rgba(248,113,113,0.3)"}`,
                  borderRadius: "10px", padding: "0.85rem", minWidth: "160px",
                }}>
                  <p style={{ margin: 0, fontWeight: 700, color: "#e2e8f0" }}>{m.student_name}</p>
                  <p style={{ margin: "0.15rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>{m.usn}</p>
                  <p style={{
                    margin: "0.4rem 0 0", fontSize: "1.5rem", fontWeight: 800,
                    color: m.marks >= 30 ? "#34d399" : m.marks >= 20 ? "#fbbf24" : "#f87171"
                  }}>
                    {m.marks}<span style={{ fontSize: "0.85rem", color: "#64748b" }}>/{m.max}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HOD IA analytics */}
        {isHod && iaAnalytics && (
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid rgba(52,211,153,0.2)", paddingTop: "1rem" }}>
            <h4 style={{ color: accentColor, marginBottom: "0.75rem" }}>
              <i className="fa-solid fa-chart-bar" style={{ marginRight: "0.4rem" }} />
              IA Analytics — {iaAnalytics.subject}
            </h4>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: "12px", padding: "1rem", display: "inline-block", marginBottom: "1rem" }}>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "#94a3b8" }}>Class Average</p>
              <p style={{ margin: "0.2rem 0 0", fontSize: "2rem", fontWeight: 800, color: accentColor }}>{iaAnalytics.average_marks}</p>
            </div>
            <div className="sd-grid sd-grid-2">
              <div>
                <h5 style={{ color: "#34d399", marginBottom: "0.5rem" }}>🏆 Top Performers</h5>
                {iaAnalytics.top_performers?.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0.6rem", background: "rgba(52,211,153,0.08)", borderRadius: "6px", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#e2e8f0" }}>{p.name} <span style={{ color: "#64748b" }}>({p.usn})</span></span>
                    <span style={{ fontWeight: 700, color: "#34d399" }}>{p.marks}</span>
                  </div>
                ))}
              </div>
              <div>
                <h5 style={{ color: "#f87171", marginBottom: "0.5rem" }}>⚠️ Low Performers</h5>
                {iaAnalytics.low_performers?.map((p, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0.6rem", background: "rgba(239,68,68,0.08)", borderRadius: "6px", marginBottom: "0.3rem" }}>
                    <span style={{ color: "#e2e8f0" }}>{p.name} <span style={{ color: "#64748b" }}>({p.usn})</span></span>
                    <span style={{ fontWeight: 700, color: "#f87171" }}>{p.marks}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  const renderNotifications = () => (
    <>
      <div className="sd-page-header">
        <h1>Student Queries & Notifications</h1>
        <p>Messages and discrepancy reports from students</p>
      </div>
      <div className="sd-card">
        <div className="sd-card-header">
          <i className="fa-solid fa-bell" style={{ color: accentColor }} />
          <h2>Inbox</h2>
        </div>
        {notifications.length > 0 ? (
          <div>
            {notifications.map((n, i) => (
              <div key={i} className={`sd-notification-item ${isHod ? "hd-notification-item" : ""}`}>
                <i className="fa-solid fa-message" />
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: "#e2e8f0" }}>{n.message}</p>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.78rem", color: "#64748b" }}>
                    Received: {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="sd-empty-state">No student queries yet.</p>
        )}
      </div>
    </>
  );

  const pages = {
    overview:      renderOverview,
    students:      renderStudents,
    subjects:      renderSubjects,
    mgmt:          renderMgmt,
    attendance:    renderSubjects,   // reuses subject session UI
    marks:         renderMarks,
    ia:            renderIa,
    notifications: renderNotifications,
  };

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="sd-layout">
      {/* Sidebar */}
      <aside className={`sd-sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className={isHod ? "hd-logo" : "sd-logo"}>
          <i className={isHod ? "fa-solid fa-user-tie" : "fa-solid fa-chalkboard-user"} />
          {isHod ? "HOD Panel" : "Faculty Panel"}
        </div>
        <nav className="sd-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`sd-nav-item ${activePage === item.id ? (isHod ? "active hd-nav-item" : "active") : ""}`}
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
                {profile?.name || (isHod ? `HOD ${user}` : `Prof. ${user}`)}
              </span>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                {profile?.department || "—"}
              </div>
            </div>
          </div>
          <div className="sd-topbar-right">
            <div className="sd-profile">
              <div className={isHod ? "hd-avatar" : "sd-avatar"}>
                {user ? user.charAt(0).toUpperCase() : "F"}
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user}</span>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {isHod ? "Head of Department" : "Faculty"}
                </span>
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
