import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/apiClient";
import { useAdminData } from "./AdminDataContext";

export default function AdminDashboardHome() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [iaAnalytics, setIaAnalytics] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Intelligence: analytics (once)
    api.get("/academic/analytics/admin").then(r => setAnalytics(r.data)).catch(() => {});
    api.get("/academic/admin/ia-analytics").then(r => setIaAnalytics(r.data)).catch(() => {});

    // Alerts: poll every 60 seconds
    const fetchAlerts = () =>
      api.get("/academic/alerts").then(r => setAlerts(r.data || [])).catch(() => {});
    fetchAlerts();
    const alertTimer = setInterval(fetchAlerts, 60000);
    return () => clearInterval(alertTimer);
  }, []);

  const downloadReport = async (type, format) => {
    try {
      const endpoint = format === 'excel' 
        ? `/academic/reports/${type}/excel` 
        : `/academic/reports/${type}`;
      
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      alert("Failed to download report: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Dashboard System Overview</h1>
        <p>Monitor key metrics, alerts, and system health</p>
      </div>

      {alerts.length > 0 && (
        <div className="admin-alert-banner">
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '1.5rem' }}></i>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.2rem' }}>System Alerts Active</strong>
            {alerts.map((a, i) => (
              <div key={i} style={{ fontSize: '0.9rem', opacity: 0.9 }}>{a.message}</div>
            ))}
          </div>
        </div>
      )}

      <div className="admin-grid admin-grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Students</span>
          <span className="admin-stat-value" style={{ color: "#38bdf8" }}>{analytics?.total_students || '—'}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Total Faculty</span>
          <span className="admin-stat-value" style={{ color: "#a78bfa" }}>{analytics?.total_faculty || '—'}</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Avg. Attendance</span>
          <span className="admin-stat-value" style={{ color: "#34d399" }}>{analytics?.overall_avg_attendance || '—'}%</span>
        </div>
      </div>

      <div className="admin-grid admin-grid-2">
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card-header">
            <i className="fa-solid fa-chart-line"></i>
            <h2>System Performance & Internal Assessments</h2>
          </div>
          <div className="admin-card-body">
            {iaAnalytics ? (
              <div className="admin-grid admin-grid-4">
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Total IA Records</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 700 }}>{iaAnalytics.total_assessments}</p>
                </div>
                <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "0.5rem" }}>System Average</p>
                  <p style={{ fontSize: "1.8rem", fontWeight: 700, color: "#fef08a" }}>{iaAnalytics.system_average_marks}</p>
                </div>
                
                <div style={{ background: "rgba(5, 150, 105, 0.15)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(5, 150, 105, 0.3)" }}>
                  <p style={{ fontSize: "0.85rem", color: "#6ee7b7", marginBottom: "0.5rem", fontWeight: 600 }}>🏆 Top Subjects</p>
                  {iaAnalytics.top_subjects?.length > 0 ? iaAnalytics.top_subjects.map((sub, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: "#e2e8f0" }}>{sub.subject_code}</span>
                      <span style={{ fontWeight: 700, color: "#fff" }}>{sub.average_marks}</span>
                    </div>
                  )) : <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Not enough data</p>}
                </div>

                <div style={{ background: "rgba(220, 38, 38, 0.15)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(220, 38, 38, 0.3)" }}>
                  <p style={{ fontSize: "0.85rem", color: "#fca5a5", marginBottom: "0.5rem", fontWeight: 600 }}>⚠️ Low Performing Subjects</p>
                  {iaAnalytics.low_performing_subjects?.length > 0 ? iaAnalytics.low_performing_subjects.map((sub, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                      <span style={{ color: "#e2e8f0" }}>{sub.subject_code}</span>
                      <span style={{ fontWeight: 700, color: "#fff" }}>{sub.average_marks}</span>
                    </div>
                  )) : <p style={{ fontSize: '0.85rem', opacity: 0.5 }}>Not enough data</p>}
                </div>
              </div>
            ) : <p style={{ color: "#94a3b8" }}>Loading analytics...</p>}
          </div>
        </div>

        {/* Data Exports */}
        <div className="admin-card">
          <div className="admin-card-header">
            <i className="fa-solid fa-file-export"></i>
            <h2>System Data Exports</h2>
          </div>
          <div className="admin-grid admin-grid-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Export Students</span>
              <button onClick={() => downloadReport('students', 'csv')} className="admin-btn admin-btn-primary">
                <i className="fa-solid fa-file-csv"></i> Download CSV
              </button>
              <button onClick={() => downloadReport('students', 'excel')} className="admin-btn" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                <i className="fa-solid fa-file-excel"></i> Download XLSX
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "0.5rem" }}>Export Faculty</span>
              <button onClick={() => downloadReport('faculty', 'csv')} className="admin-btn admin-btn-primary">
                <i className="fa-solid fa-file-csv"></i> Download CSV
              </button>
              <button onClick={() => downloadReport('faculty', 'excel')} className="admin-btn" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.4)" }}>
                <i className="fa-solid fa-file-excel"></i> Download XLSX
              </button>
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Link */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem", textAlign: "center" }}>
          <i className="fa-solid fa-robot" style={{ fontSize: "3rem", color: "#38bdf8", marginBottom: "1rem" }}></i>
          <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>AI Assistant</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Get instant insights, analyze data, and manage the system intelligently.</p>
          <button onClick={() => navigate('/admin/ai-assistant')} className="admin-btn admin-btn-primary" style={{ width: "100%", padding: "1rem" }}>
            Open Assistant <i className="fa-solid fa-arrow-right" style={{ marginLeft: "0.5rem" }}></i>
          </button>
        </div>
      </div>
    </>
  );
}
