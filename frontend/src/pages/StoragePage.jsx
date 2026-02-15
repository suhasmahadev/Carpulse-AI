import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getAllStorageUnits,
    createStorageUnit,
    logTemperature,
    getTemperatureLogs,
} from "../api/storageApi.js";
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

export default function StoragePage() {
    const { token } = useAuth();
    const [storageUnits, setStorageUnits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showStorageForm, setShowStorageForm] = useState(false);
    const [showTempForm, setShowTempForm] = useState(false);
    const [selectedStorageLogs, setSelectedStorageLogs] = useState(null);

    const [storageForm, setStorageForm] = useState({
        location: "",
        max_capacity_kg: "",
        current_load_kg: "",
        current_temp: "",
    });

    const [tempForm, setTempForm] = useState({
        storage_unit_id: "",
        recorded_temp: "",
    });

    useEffect(() => {
        loadStorageUnits();
    }, []);

    async function loadStorageUnits() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllStorageUnits(token);
            setStorageUnits(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load storage units.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateStorage(e) {
        e.preventDefault();
        try {
            await createStorageUnit(
                {
                    location: storageForm.location,
                    max_capacity_kg: parseFloat(storageForm.max_capacity_kg),
                    current_load_kg: parseFloat(storageForm.current_load_kg),
                    current_temp: parseFloat(storageForm.current_temp),
                },
                token
            );
            setShowStorageForm(false);
            setStorageForm({
                location: "",
                max_capacity_kg: "",
                current_load_kg: "",
                current_temp: "",
            });
            loadStorageUnits();
        } catch (err) {
            console.error(err);
            alert("Failed to create storage unit");
        }
    }

    async function handleLogTemp(e) {
        e.preventDefault();
        try {
            await logTemperature(
                {
                    storage_unit_id: tempForm.storage_unit_id,
                    recorded_temp: parseFloat(tempForm.recorded_temp),
                    timestamp: new Date().toISOString(),
                },
                token
            );
            setShowTempForm(false);
            setTempForm({
                storage_unit_id: "",
                recorded_temp: "",
            });
            alert("Temperature logged successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to log temperature");
        }
    }

    async function handleViewTempLogs(storageId) {
        try {
            const logs = await getTemperatureLogs(storageId, token);
            setSelectedStorageLogs({ storageId, logs });
        } catch (err) {
            console.error(err);
            alert("Failed to load temperature logs");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Storage Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Track storage units, capacity, and temperature logs
                </p>
            </div>

            <button className="btn" onClick={() => setShowStorageForm(!showStorageForm)}>
                <i className="fa-solid fa-plus" /> Add Storage Unit
            </button>
            <button
                className="btn"
                style={{ marginLeft: "10px" }}
                onClick={() => setShowTempForm(!showTempForm)}
            >
                <i className="fa-solid fa-thermometer" /> Log Temperature
            </button>

            {showStorageForm && (
                <form onSubmit={handleCreateStorage} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Location *</label>
                        <input
                            required
                            value={storageForm.location}
                            onChange={(e) => setStorageForm({ ...storageForm, location: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Max Capacity (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={storageForm.max_capacity_kg}
                            onChange={(e) =>
                                setStorageForm({ ...storageForm, max_capacity_kg: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Current Load (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={storageForm.current_load_kg}
                            onChange={(e) =>
                                setStorageForm({ ...storageForm, current_load_kg: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Current Temp (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={storageForm.current_temp}
                            onChange={(e) => setStorageForm({ ...storageForm, current_temp: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Create Storage Unit
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary-outline"
                        onClick={() => setShowStorageForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {showTempForm && (
                <form onSubmit={handleLogTemp} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Storage Unit ID *</label>
                        <input
                            required
                            value={tempForm.storage_unit_id}
                            onChange={(e) => setTempForm({ ...tempForm, storage_unit_id: e.target.value })}
                            placeholder="UUID of storage unit"
                        />
                    </div>
                    <div className="form-group">
                        <label>Recorded Temp (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={tempForm.recorded_temp}
                            onChange={(e) => setTempForm({ ...tempForm, recorded_temp: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Log Temperature
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary-outline"
                        onClick={() => setShowTempForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <section className="log-list">
                {storageUnits.length === 0 ? (
                    <p>No storage units found.</p>
                ) : (
                    storageUnits.map((unit) => (
                        <div key={unit.id} className="log-card">
                            <div className="log-info">
                                <h3>{unit.location}</h3>
                                <p>
                                    <strong>Capacity:</strong> {unit.current_load_kg} / {unit.max_capacity_kg} kg
                                </p>
                                <p>
                                    <strong>Current Temp:</strong> {unit.current_temp}°C
                                </p>
                            </div>
                            <div className="log-actions">
                                <button className="btn-edit" onClick={() => handleViewTempLogs(unit.id)}>
                                    View Logs
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {selectedStorageLogs && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                    }}
                >
                    <h3>Temperature Logs for {String(selectedStorageLogs.storageId).slice(0, 8)}...</h3>
                    <button onClick={() => setSelectedStorageLogs(null)}>Close</button>
                    {selectedStorageLogs.logs.length === 0 ? (
                        <p>No logs yet.</p>
                    ) : (
                        <ul>
                            {selectedStorageLogs.logs.map((log) => (
                                <li key={log.id}>
                                    {log.recorded_temp}°C at {formatDateTime(log.timestamp)}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
