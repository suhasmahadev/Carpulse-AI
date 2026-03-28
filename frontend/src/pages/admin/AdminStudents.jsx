import { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { useAdminData } from "./AdminDataContext";

export default function AdminStudents() {
  const { departments, loading } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Student List
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  // Enroll Student
  const [stuUsn, setStuUsn] = useState("");
  const [stuDept, setStuDept] = useState("");
  const [stuSem, setStuSem] = useState("");
  const [stuUserId, setStuUserId] = useState("");
  const [stuMsg, setStuMsg] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setStudentsLoading(true);
    try {
      const res = await api.get("/academic/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students. Ensure the endpoint exists on the backend.", err);
      // We don't want to crash the UI if this is a newly requested feature without backend support yet.
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    setStuMsg(""); setIsSubmitting(true);
    try {
      const res = await api.post("/academic/students", {
        usn: stuUsn, 
        department: stuDept, 
        department_id: stuDept, 
        semester: parseInt(stuSem), 
        user_id: stuUserId || null,
      });
      setStuMsg(`✅ Student registered: ${res.data.usn} (${res.data.id || ''})`);
      setStuUsn(""); setStuDept(""); setStuSem(""); setStuUserId("");
      fetchStudents(); // refresh the table
    } catch (err) {
      setStuMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Student Administration</h1>
        <p>Enroll students into the system and monitor records</p>
      </div>

      <div className="admin-grid admin-grid-2">
        {/* Enroll Student Form */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-user-graduate"></i>
            <h2>Enroll New Student</h2>
          </div>
          <form onSubmit={handleRegisterStudent} className="admin-card-body">
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>University Serial Number (USN)</label>
              <input type="text" className="admin-input" placeholder="e.g. 1MS20CS001" value={stuUsn} onChange={(e) => setStuUsn(e.target.value)} required />
            </div>
            
            <div className="admin-grid admin-grid-2">
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Department</label>
                <select className="admin-select" value={stuDept} onChange={(e) => setStuDept(e.target.value)} required disabled={loading}>
                  <option value="" disabled>-- Select Dept --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Semester</label>
                <input type="number" min="1" max="8" className="admin-input" placeholder="e.g. 1-8" value={stuSem} onChange={(e) => setStuSem(e.target.value)} required />
              </div>
            </div>

            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>User Link ID (Optional)</label>
              <input type="text" className="admin-input" placeholder="user auth ID" value={stuUserId} onChange={(e) => setStuUserId(e.target.value)} />
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "0.25rem" }}>Link academic records with a registered login user account.</p>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem" }}>
              <i className="fa-solid fa-address-card"></i> Process Enrollment
            </button>
            {stuMsg && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: stuMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: stuMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5" }}>
                {stuMsg}
              </div>
            )}
          </form>
        </div>

        {/* Student List Table */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="admin-card-header">
            <i className="fa-solid fa-users"></i>
            <h2>System Directory Data</h2>
          </div>
          <div className="admin-card-body" style={{ flex: 1, overflowY: 'auto' }}>
            {studentsLoading ? (
              <p style={{ color: "#94a3b8" }}><i className="fa-solid fa-spinner fa-spin"></i> Loading students from database...</p>
            ) : students.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Dept</th>
                      <th>Sem</th>
                      <th>Linked User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((stu, i) => (
                      <tr key={stu.id || i}>
                        <td style={{ fontWeight: 600, color: "#fff" }}>{stu.usn}</td>
                        <td><span className="admin-badge info">{stu.department_id || stu.department}</span></td>
                        <td>{stu.semester}</td>
                        <td>{stu.user_id ? "Linked ✅" : "Unlinked ⚠️"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#64748b" }}>
                <i className="fa-solid fa-clipboard-list" style={{ fontSize: "3rem", marginBottom: "1rem", opacity: 0.5 }}></i>
                <p>No student data found or endpoint not implemented.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
