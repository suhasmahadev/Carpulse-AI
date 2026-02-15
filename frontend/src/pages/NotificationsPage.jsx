import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllNotifications, createNotification } from "../api/notificationsApi.js";
import "../styles/logs.css";

function formatDateTime(dateString) {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Invalid date";
    }
}

export default function NotificationsPage() {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        phone_number: "",
        message_type: "",
        message_body: "",
        status: "sent",
    });

    useEffect(() => {
        loadNotifications();
    }, []);

    async function loadNotifications() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllNotifications(token);
            setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await createNotification(form, token);
            setShowForm(false);
            setForm({
                phone_number: "",
                message_type: "",
                message_body: "",
                status: "sent",
            });
            loadNotifications();
        } catch (err) {
            console.error(err);
            alert("Failed to create notification");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Notifications Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Send and manage SMS notifications
                </p>
            </div>

            <button className="btn" onClick={() => setShowForm(!showForm)}>
                <i className="fa-solid fa-plus" /> Create Notification
            </button>

            {showForm && (
                <form onSubmit={handleCreate} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Phone Number *</label>
                        <input
                            required
                            value={form.phone_number}
                            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Message Type *</label>
                        <input
                            required
                            value={form.message_type}
                            onChange={(e) => setForm({ ...form, message_type: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Message Body *</label>
                        <textarea
                            required
                            value={form.message_body}
                            onChange={(e) => setForm({ ...form, message_body: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Status *</label>
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                            <option value="sent">Sent</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">
                        Create Notification
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary-outline"
                        onClick={() => setShowForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <section className="log-list">
                {notifications.length === 0 ? (
                    <p>No notifications found.</p>
                ) : (
                    notifications.map((notif) => (
                        <div key={notif.id} className="log-card">
                            <div className="log-info">
                                <h3>{notif.message_type}</h3>
                                <p>
                                    <strong>Phone:</strong> {notif.phone_number}
                                </p>
                                <p>
                                    <strong>Message:</strong> {notif.message_body}
                                </p>
                                <p>
                                    <strong>Status:</strong> {notif.status}
                                </p>
                                <p>
                                    <strong>Created:</strong> {formatDateTime(notif.created_at)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
