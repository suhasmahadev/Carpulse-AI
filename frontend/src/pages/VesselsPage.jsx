import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllVessels, createVessel, deleteVessel } from "../api/vesselsApi.js";
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

export default function VesselsPage() {
    const { token } = useAuth();
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        registration_number: "",
        owner_name: "",
        owner_phone: "",
        vessel_type: "",
        capacity_kg: "",
        home_port: "",
    });

    useEffect(() => {
        loadVessels();
    }, []);

    async function loadVessels() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllVessels(token);
            setVessels(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load vessels.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await createVessel(
                {
                    ...form,
                    capacity_kg: parseInt(form.capacity_kg),
                },
                token
            );
            setShowForm(false);
            setForm({
                registration_number: "",
                owner_name: "",
                owner_phone: "",
                vessel_type: "",
                capacity_kg: "",
                home_port: "",
            });
            loadVessels();
        } catch (err) {
            console.error(err);
            alert("Failed to create vessel");
        }
    }

    async function handleDelete(id) {
        if (!confirm("Delete this vessel?")) return;
        try {
            await deleteVessel(id, token);
            loadVessels();
        } catch (err) {
            console.error(err);
            alert("Failed to delete vessel");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Vessels Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Manage fishing vessels, registrations, and owner information
                </p>
            </div>

            <button className="btn" onClick={() => setShowForm(!showForm)}>
                <i className="fa-solid fa-plus" /> Add Vessel
            </button>

            {showForm && (
                <form onSubmit={handleCreate} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Registration Number *</label>
                        <input
                            required
                            value={form.registration_number}
                            onChange={(e) => setForm({ ...form, registration_number: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Owner Name *</label>
                        <input
                            required
                            value={form.owner_name}
                            onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Owner Phone</label>
                        <input
                            value={form.owner_phone}
                            onChange={(e) => setForm({ ...form, owner_phone: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Vessel Type *</label>
                        <input
                            required
                            value={form.vessel_type}
                            onChange={(e) => setForm({ ...form, vessel_type: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Capacity (kg) *</label>
                        <input
                            type="number"
                            required
                            value={form.capacity_kg}
                            onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Home Port *</label>
                        <input
                            required
                            value={form.home_port}
                            onChange={(e) => setForm({ ...form, home_port: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Create Vessel
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
                {vessels.length === 0 ? (
                    <p>No vessels found. Add one!</p>
                ) : (
                    vessels.map((vessel) => (
                        <div key={vessel.id} className="log-card">
                            <div className="log-info">
                                <h3>{vessel.registration_number}</h3>
                                <p>
                                    <strong>Owner:</strong> {vessel.owner_name}
                                </p>
                                {vessel.owner_phone && (
                                    <p>
                                        <strong>Phone:</strong> {vessel.owner_phone}
                                    </p>
                                )}
                                <p>
                                    <strong>Type:</strong> {vessel.vessel_type}
                                </p>
                                <p>
                                    <strong>Capacity:</strong> {vessel.capacity_kg} kg
                                </p>
                                <p>
                                    <strong>Home Port:</strong> {vessel.home_port}
                                </p>
                                <p>
                                    <strong>Created:</strong> {formatDateTime(vessel.created_at)}
                                </p>
                            </div>
                            <div className="log-actions">
                                <button className="btn-delete" onClick={() => handleDelete(vessel.id)}>
                                    <i className="fa-solid fa-trash" /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
