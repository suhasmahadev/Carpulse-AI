import { useState } from "react";
import api from "../../api/apiClient";
import { useAdminData } from "./AdminDataContext";

export default function AdminDepartments() {
  const { departments, hodMap, fetchDepartments, loading } = useAdminData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Department Creation
  const [deptId, setDeptId] = useState("");
  const [deptName, setDeptName] = useState("");
  const [deptMsg, setDeptMsg] = useState("");

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptMsg(""); setIsSubmitting(true);
    try {
      const res = await api.post("/academic/departments", { id: deptId, name: deptName });
      setDeptMsg(`✅ Created dept: ${res.data.name}`);
      setDeptId(""); setDeptName("");
      fetchDepartments();
    } catch (err) {
      setDeptMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Assign HOD
  const [hodDeptId, setHodDeptId] = useState("");
  const [hodFacCode, setHodFacCode] = useState("");
  const [hodMsg, setHodMsg] = useState("");

  const handleAssignHOD = async (e) => {
    e.preventDefault();
    setHodMsg(""); setIsSubmitting(true);
    try {
      const res = await api.put(`/academic/manage/departments/${hodDeptId}/assign-hod`, {
        faculty_code: hodFacCode
      });
      setHodMsg(`✅ ${res.data.message}`);
      setHodDeptId(""); setHodFacCode("");
      fetchDepartments();
    } catch (err) {
      setHodMsg("❌ " + (err.response?.data?.detail || err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Departments</h1>
        <p>Manage academic departments and assign Heads of Department</p>
      </div>

      <div className="admin-grid admin-grid-2">
        {/* Left List */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}>
          <div className="admin-card-header">
            <i className="fa-solid fa-layer-group"></i>
            <h2>Department Directory</h2>
          </div>
          <div className="admin-card-body" style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ color: "#94a3b8" }}>Loading departments...</p>
            ) : departments.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {departments.map(d => (
                  <div key={d.id} style={{
                    padding: "1.25rem",
                    background: "rgba(0,0,0,0.3)",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <strong style={{ fontSize: "1.05rem", color: "#e2e8f0" }}>{d.name}</strong>
                      <span className="admin-badge info">{d.id}</span>
                    </div>
                    {hodMap[d.id] ? (
                      <div style={{ fontSize: "0.85rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <i className="fa-solid fa-crown"></i>
                        HOD: {hodMap[d.id].name} ({hodMap[d.id].faculty_code})
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic" }}>
                        No HOD assigned
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#64748b" }}>No departments found.</p>
            )}
          </div>
        </div>

        {/* Right Forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Create Department */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-folder-plus"></i>
              <h2>Create New Department</h2>
            </div>
            <form onSubmit={handleCreateDept} className="admin-card-body">
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Department ID</label>
                <input type="text" className="admin-input" placeholder="e.g. dept_cs, dept_ai" value={deptId} onChange={e => setDeptId(e.target.value)} required />
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Department Name</label>
                <input type="text" className="admin-input" placeholder="e.g. Computer Science" value={deptName} onChange={e => setDeptName(e.target.value)} required />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "0.5rem" }}>
                Create Department
              </button>
              {deptMsg && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: deptMsg.startsWith("❌") ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)", color: deptMsg.startsWith("❌") ? "#fca5a5" : "#6ee7b7", fontSize: "0.9rem" }}>
                  {deptMsg}
                </div>
              )}
            </form>
          </div>

          {/* Assign HOD */}
          <div className="admin-card">
            <div className="admin-card-header">
              <i className="fa-solid fa-user-tie"></i>
              <h2>Assign Head of Department</h2>
            </div>
            <form onSubmit={handleAssignHOD} className="admin-card-body">
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Select Department</label>
                <select className="admin-select" value={hodDeptId} onChange={e => setHodDeptId(e.target.value)} required>
                  <option value="" disabled>-- Choose Department --</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Faculty Code</label>
                <input type="text" className="admin-input" placeholder="e.g. 4MH23" value={hodFacCode} onChange={e => setHodFacCode(e.target.value)} required />
              </div>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "0.5rem", background: "linear-gradient(135deg, #059669, #10b981)" }}>
                Assign Role
              </button>
              {hodMsg && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: hodMsg.startsWith("❌") ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)", color: hodMsg.startsWith("❌") ? "#fca5a5" : "#6ee7b7", fontSize: "0.9rem" }}>
                  {hodMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
