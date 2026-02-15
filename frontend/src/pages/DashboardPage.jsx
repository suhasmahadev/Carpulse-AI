import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/logs.css";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [agentQuery, setAgentQuery] = useState("");

    const handleAgentSubmit = (e) => {
        e.preventDefault();
        if (agentQuery.trim()) {
            navigate(`/chat?query=${encodeURIComponent(agentQuery)}`);
        }
    };

    const modules = [
        {
            title: "Vessels",
            description: "Manage fishing vessels, registrations, and owner information",
            icon: "fa-ship",
            path: "/dashboard/vessels",
            color: "#3b82f6",
        },
        {
            title: "Species",
            description: "Track fish species, categories, and storage requirements",
            icon: "fa-fish",
            path: "/dashboard/species",
            color: "#10b981",
        },
        {
            title: "Catch Batches",
            description: "Monitor catch batches, weights, and quality grades",
            icon: "fa-box",
            path: "/dashboard/catch",
            color: "#f59e0b",
        },
        {
            title: "Auctions",
            description: "Manage auctions, bids, and pricing strategies",
            icon: "fa-gavel",
            path: "/dashboard/auctions",
            color: "#8b5cf6",
        },
        {
            title: "Storage",
            description: "Track storage units, capacity, and temperature logs",
            icon: "fa-warehouse",
            path: "/dashboard/storage",
            color: "#06b6d4",
        },
        {
            title: "Analytics",
            description: "Spoilage prediction and price recommendations",
            icon: "fa-chart-line",
            path: "/dashboard/analytics",
            color: "#ec4899",
        },
        {
            title: "Notifications",
            description: "Send and manage SMS notifications",
            icon: "fa-bell",
            path: "/dashboard/notifications",
            color: "#f97316",
        },
        {
            title: "Agent Console",
            description: "Chat with AI agent for intelligent assistance",
            icon: "fa-robot",
            path: "/chat",
            color: "#6366f1",
        },
    ];

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Marine Fishery Management Dashboard</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Centralized control panel for all fishery operations
                </p>
            </div>

            {/* Agent Input Capsule */}
            <div
                style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "32px",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
            >
                <form onSubmit={handleAgentSubmit}>
                    <label
                        htmlFor="agent-query"
                        style={{
                            display: "block",
                            color: "white",
                            fontWeight: "600",
                            marginBottom: "12px",
                            fontSize: "16px",
                        }}
                    >
                        Ask the Marine Agent
                    </label>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <input
                            id="agent-query"
                            type="text"
                            value={agentQuery}
                            onChange={(e) => setAgentQuery(e.target.value)}
                            placeholder="e.g., What's the status of my latest catch batch?"
                            style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "none",
                                fontSize: "15px",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            className="btn"
                            style={{
                                background: "white",
                                color: "#667eea",
                                fontWeight: "600",
                                padding: "12px 24px",
                                border: "none",
                                cursor: "pointer",
                            }}
                        >
                            <i className="fa-solid fa-paper-plane" style={{ marginRight: "8px" }} />
                            Ask
                        </button>
                    </div>
                </form>
            </div>

            {/* Module Cards Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "20px",
                    marginTop: "24px",
                }}
            >
                {modules.map((module) => (
                    <div
                        key={module.path}
                        onClick={() => navigate(module.path)}
                        style={{
                            background: "white",
                            borderRadius: "12px",
                            padding: "24px",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            transition: "all 0.3s ease",
                            border: "1px solid #e5e7eb",
                            position: "relative",
                            overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-4px)";
                            e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.12)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "10px",
                                background: module.color,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "16px",
                            }}
                        >
                            <i
                                className={`fa-solid ${module.icon}`}
                                style={{ color: "white", fontSize: "20px" }}
                            />
                        </div>
                        <h3
                            style={{
                                margin: "0 0 8px 0",
                                fontSize: "18px",
                                fontWeight: "600",
                                color: "#111827",
                            }}
                        >
                            {module.title}
                        </h3>
                        <p
                            style={{
                                margin: 0,
                                fontSize: "14px",
                                color: "#6b7280",
                                lineHeight: "1.5",
                            }}
                        >
                            {module.description}
                        </p>
                        <div
                            style={{
                                position: "absolute",
                                bottom: "12px",
                                right: "12px",
                                color: module.color,
                                opacity: 0.3,
                                fontSize: "12px",
                            }}
                        >
                            <i className="fa-solid fa-arrow-right" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
