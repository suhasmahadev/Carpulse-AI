import { useState } from "react";
import api from "../../api/apiClient";
import { useAdminData } from "./AdminDataContext";

export default function AdminFaculty() {
  const { departments, loading } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Faculty Registration & Assignment
  const [facCode, setFacCode] = useState("");
  const [facName, setFacName] = useState("");
  const [facDeptId, setFacDeptId] = useState("");
  const [facMsg, setFacMsg] = useState("");
  
  const handleRegisterFaculty = async (e) => {
    e.preventDefault();
    setFacMsg(""); setIsSubmitting(true);
    try {
      const res = await api.post("/academic/manage/faculty", { 
        faculty_code: facCode,
        name: facName,
        department_id: facDeptId 
      });
      setFacMsg(`✅ Faculty created with code: ${res.data.faculty_code}`);
      setFacCode(""); setFacName(""); setFacDeptId("");
    } catch (err) {
      setFacMsg("❌ " + (err.response?.data?.detail || err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign Faculty
  const [assignFacId, setAssignFacId] = useState("");
  const [assignDeptId, setAssignDeptId] = useState("");
  const [assignMsg, setAssignMsg] = useState("");
  
  const handleAssignFaculty = async (e) => {
    e.preventDefault();
    setAssignMsg(""); setIsSubmitting(true);
    try {
      await api.put(`/academic/manage/faculty/${assignFacId}`, { department_id: assignDeptId });
      setAssignMsg(`✅ Faculty ${assignFacId} assigned to ${assignDeptId}`);
      setAssignFacId(""); setAssignDeptId("");
    } catch (err) {
      setAssignMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Faculty
  const [delFacEmail, setDelFacEmail] = useState("");
  const [delFacMsg, setDelFacMsg] = useState("");
  
  const handleDeleteFaculty = async (e) => {
    e.preventDefault();
    setDelFacMsg(""); 
    if (!window.confirm(`Permanently delete faculty with email "${delFacEmail}" and ALL their data?`)) {
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.delete(`/academic/manage/faculty?email=${encodeURIComponent(delFacEmail)}`);
      setDelFacMsg("✅ " + (res.data.message || "Faculty deleted successfully"));
      setDelFacEmail("");
    } catch (err) {
      setDelFacMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Faculty Management</h1>
        <p>Register, assign, and manage faculty across departments</p>
      </div>

      <div className="admin-grid admin-grid-2">
        {/* Create Faculty */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-chalkboard-user"></i>
            <h2>Register New Faculty</h2>
          </div>
          <form onSubmit={handleRegisterFaculty} className="admin-card-body">
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Faculty Code</label>
              <input type="text" className="admin-input" placeholder="e.g. 4MH23" value={facCode} onChange={(e) => setFacCode(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Full Name</label>
              <input type="text" className="admin-input" placeholder="e.g. Dr. A. Sharma" value={facName} onChange={(e) => setFacName(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Primary Department</label>
              <select className="admin-select" value={facDeptId} onChange={(e) => setFacDeptId(e.target.value)} required disabled={loading}>
                <option value="" disabled>-- Select Department --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem" }}>
              <i className="fa-solid fa-user-plus"></i> Create Faculty
            </button>
            {facMsg && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: facMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: facMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5" }}>
                {facMsg}
              </div>
            )}
          </form>
        </div>

        {/* Update & Reassign Faculty */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-people-arrows"></i>
            <h2>Update Faculty Assignment</h2>
          </div>
          <form onSubmit={handleAssignFaculty} className="admin-card-body">
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Physical ID / External Ref</label>
              <input type="text" className="admin-input" placeholder="e.g. fac_..." value={assignFacId} onChange={(e) => setAssignFacId(e.target.value)} required />
            </div>
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>New Department</label>
              <select className="admin-select" value={assignDeptId} onChange={(e) => setAssignDeptId(e.target.value)} required disabled={loading}>
                <option value="" disabled>-- Transfer to Department --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem", background: "linear-gradient(135deg, #10b981, #059669)" }}>
              <i className="fa-solid fa-people-transfer"></i> Reassign Faculty
            </button>
            {assignMsg && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: assignMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: assignMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5" }}>
                {assignMsg}
              </div>
            )}
          </form>
        </div>
        
        {/* Delete Faculty */}
        <div className="admin-card" style={{ gridColumn: '1 / -1', borderTop: "3px solid #dc2626" }}>
          <div className="admin-card-header" style={{ color: "#fca5a5", borderBottomColor: "rgba(239, 68, 68, 0.2)" }}>
            <i className="fa-solid fa-user-xmark" style={{ color: "#ef4444" }}></i>
            <h2>Danger Zone: Delete Faculty</h2>
          </div>
          <div className="admin-card-body" style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "1rem", color: "#fca5a5", fontSize: "0.9rem", lineHeight: 1.5 }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '0.5rem', color: '#ef4444' }}></i>
                <strong>Permanent Action:</strong> This will delete the faculty user account, all subject assignments, and all attendance sessions they conducted. This <em>cannot</em> be undone.<br />
                HODs must be unassigned before deletion.
              </div>
            </div>
            
            <form onSubmit={handleDeleteFaculty} style={{ flex: 1 }}>
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#fca5a5", display: "block" }}>Faculty Email required for deletion</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: "0.5rem" }}>
                  <input type="email" className="admin-input" style={{ flex: 1, borderColor: "rgba(239, 68, 68, 0.5)" }} placeholder="e.g. prof@university.edu" value={delFacEmail} onChange={(e) => setDelFacEmail(e.target.value)} required />
                  <button type="submit" className="admin-btn admin-btn-danger" disabled={isSubmitting}>
                    {isSubmitting ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
              {delFacMsg && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: delFacMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: delFacMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5" }}>
                  {delFacMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
