import { useState } from "react";
import api from "../../api/apiClient";

export default function AdminSystemAccess() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register User
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regMsg, setRegMsg] = useState("");

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setRegMsg(""); setIsSubmitting(true);
    try {
      const res = await api.post("/auth/register", {
        name: regName, email: regEmail, password: regPassword, role: regRole,
      });
      setRegMsg(`✅ User created: ${res.data.name} (${res.data.role})`);
      setRegName(""); setRegEmail(""); setRegPassword(""); setRegRole("student");
    } catch (err) {
      setRegMsg("❌ " + (err.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>System Access Control</h1>
        <p>Manage authentication and register new external users</p>
      </div>

      <div className="admin-grid admin-grid-2">
        {/* Registration */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-user-plus"></i>
            <h2>Register System Users</h2>
          </div>
          <form onSubmit={handleRegisterUser} className="admin-card-body">
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Full Name</label>
              <input type="text" className="admin-input" placeholder="e.g. John Doe" value={regName} onChange={(e) => setRegName(e.target.value)} required />
            </div>
            
            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Email Address</label>
              <input type="email" className="admin-input" placeholder="john@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>Password</label>
              <input type="password" className="admin-input" placeholder="Strong password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
            </div>

            <div className="admin-form-group">
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block" }}>User Role</label>
              <select className="admin-select" value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                <option value="student">Student (Limited Access)</option>
                <option value="faculty">Faculty (Standard Access)</option>
                <option value="hod">HOD (Elevated Access)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" disabled={isSubmitting} style={{ width: "100%", marginTop: "1rem" }}>
              <i className="fa-solid fa-shield-halved"></i> Create Account
            </button>
            
            {regMsg && (
              <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "8px", background: regMsg.startsWith("✅") ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: regMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5" }}>
                {regMsg}
              </div>
            )}
          </form>
        </div>

        {/* Info panel */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-circle-info"></i>
            <h2>Access Guidelines</h2>
          </div>
          <div className="admin-card-body">
            <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1rem" }}>
              Creating users through this portal will only generate the authentication records for login. You must also link these accounts to their physical records in the Faculty or Students pages.
            </p>
            <ul style={{ color: "#cbd5e1", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.75rem", paddingLeft: "1.5rem" }}>
              <li><strong>Student:</strong> Link to USN after creation.</li>
              <li><strong>Faculty:</strong> Automatically bound if email matches their physical record during creation.</li>
              <li><strong>HOD / Admin:</strong> Proceed with caution. Admins have global system destroy privileges.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
