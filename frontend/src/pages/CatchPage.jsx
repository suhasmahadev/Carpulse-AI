import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getAllCatchBatches,
    createCatchBatch,
    updateCatchStatus,
} from "../api/catchApi.js";
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

export default function CatchPage() {
    const { token } = useAuth();
    const [catchBatches, setCatchBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        vessel_id: "",
        species_id: "",
        catch_weight_kg: "",
        catch_time: "",
        landing_port: "",
        ice_applied_time: "",
        quality_grade: "",
        current_status: "stored",
    });

    useEffect(() => {
        loadCatchBatches();
    }, [filter]);

    async function loadCatchBatches() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllCatchBatches(token, filter || null);
            setCatchBatches(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load catch batches.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await createCatchBatch(
                {
                    vessel_id: form.vessel_id,
                    species_id: form.species_id,
                    catch_weight_kg: parseFloat(form.catch_weight_kg),
                    catch_time: new Date(form.catch_time).toISOString(),
                    landing_port: form.landing_port,
                    ice_applied_time: form.ice_applied_time
                        ? new Date(form.ice_applied_time).toISOString()
                        : null,
                    quality_grade: form.quality_grade || null,
                    current_status: form.current_status,
                },
                token
            );
            setShowForm(false);
            setForm({
                vessel_id: "",
                species_id: "",
                catch_weight_kg: "",
                catch_time: "",
                landing_port: "",
                ice_applied_time: "",
                quality_grade: "",
                current_status: "stored",
            });
            loadCatchBatches();
        } catch (err) {
            console.error(err);
            alert("Failed to create catch batch");
        }
    }

    async function handleUpdateStatus(batchId, newStatus) {
        try {
            await updateCatchStatus(batchId, newStatus, token);
            loadCatchBatches();
        } catch (err) {
            console.error(err);
            alert("Failed to update status");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Catch Batches Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Monitor catch batches, weights, and quality grades
                </p>
            </div>

            <div style={{ marginBottom: "20px" }}>
                <label>
                    <strong>Filter by Status: </strong>
                </label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{ marginLeft: "10px", padding: "5px" }}
                >
                    <option value="">All</option>
                    <option value="stored">Stored</option>
                    <option value="auctioned">Auctioned</option>
                    <option value="transported">Transported</option>
                    <option value="spoiled">Spoiled</option>
                    <option value="high_risk">High Risk</option>
                </select>
            </div>

            <button className="btn" onClick={() => setShowForm(!showForm)}>
                <i className="fa-solid fa-plus" /> Add Catch Batch
            </button>

            {showForm && (
                <form onSubmit={handleCreate} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Vessel ID *</label>
                        <input
                            required
                            value={form.vessel_id}
                            onChange={(e) => setForm({ ...form, vessel_id: e.target.value })}
                            placeholder="UUID of vessel"
                        />
                    </div>
                    <div className="form-group">
                        <label>Species ID *</label>
                        <input
                            required
                            value={form.species_id}
                            onChange={(e) => setForm({ ...form, species_id: e.target.value })}
                            placeholder="UUID of species"
                        />
                    </div>
                    <div className="form-group">
                        <label>Catch Weight (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={form.catch_weight_kg}
                            onChange={(e) => setForm({ ...form, catch_weight_kg: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Catch Time *</label>
                        <input
                            type="datetime-local"
                            required
                            value={form.catch_time}
                            onChange={(e) => setForm({ ...form, catch_time: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Landing Port *</label>
                        <input
                            required
                            value={form.landing_port}
                            onChange={(e) => setForm({ ...form, landing_port: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ice Applied Time</label>
                        <input
                            type="datetime-local"
                            value={form.ice_applied_time}
                            onChange={(e) => setForm({ ...form, ice_applied_time: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Quality Grade</label>
                        <input
                            value={form.quality_grade}
                            onChange={(e) => setForm({ ...form, quality_grade: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Current Status *</label>
                        <select
                            value={form.current_status}
                            onChange={(e) => setForm({ ...form, current_status: e.target.value })}
                        >
                            <option value="stored">Stored</option>
                            <option value="auctioned">Auctioned</option>
                            <option value="transported">Transported</option>
                            <option value="spoiled">Spoiled</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">
                        Create Catch Batch
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
                {catchBatches.length === 0 ? (
                    <p>No catch batches found.</p>
                ) : (
                    catchBatches.map((batch) => (
                        <div key={batch.id} className="log-card">
                            <div className="log-info">
                                <h3>Batch {String(batch.id).slice(0, 8)}...</h3>
                                <p>
                                    <strong>Vessel ID:</strong> {String(batch.vessel_id).slice(0, 8)}...
                                </p>
                                <p>
                                    <strong>Species ID:</strong> {String(batch.species_id).slice(0, 8)}...
                                </p>
                                <p>
                                    <strong>Weight:</strong> {batch.catch_weight_kg} kg
                                </p>
                                <p>
                                    <strong>Catch Time:</strong> {formatDateTime(batch.catch_time)}
                                </p>
                                <p>
                                    <strong>Landing Port:</strong> {batch.landing_port}
                                </p>
                                {batch.quality_grade && (
                                    <p>
                                        <strong>Quality:</strong> {batch.quality_grade}
                                    </p>
                                )}
                                <p>
                                    <strong>Status:</strong> {batch.current_status}
                                </p>
                            </div>
                            <div className="log-actions">
                                <select
                                    onChange={(e) => handleUpdateStatus(batch.id, e.target.value)}
                                    defaultValue={batch.current_status}
                                >
                                    <option value="">Update Status</option>
                                    <option value="stored">Stored</option>
                                    <option value="auctioned">Auctioned</option>
                                    <option value="transported">Transported</option>
                                    <option value="spoiled">Spoiled</option>
                                    <option value="high_risk">High Risk</option>
                                </select>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
