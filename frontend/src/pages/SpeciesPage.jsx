import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getAllSpecies, createSpecies } from "../api/speciesApi.js";
import "../styles/logs.css";

export default function SpeciesPage() {
    const { token } = useAuth();
    const [species, setSpecies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: "",
        category: "",
        avg_shelf_life_hours: "",
        ideal_temp_min: "",
        ideal_temp_max: "",
    });

    useEffect(() => {
        loadSpecies();
    }, []);

    async function loadSpecies() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllSpecies(token);
            setSpecies(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load species.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e) {
        e.preventDefault();
        try {
            await createSpecies(
                {
                    ...form,
                    avg_shelf_life_hours: parseInt(form.avg_shelf_life_hours),
                    ideal_temp_min: parseFloat(form.ideal_temp_min),
                    ideal_temp_max: parseFloat(form.ideal_temp_max),
                },
                token
            );
            setShowForm(false);
            setForm({
                name: "",
                category: "",
                avg_shelf_life_hours: "",
                ideal_temp_min: "",
                ideal_temp_max: "",
            });
            loadSpecies();
        } catch (err) {
            console.error(err);
            alert("Failed to create species");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Species Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Track fish species, categories, and storage requirements
                </p>
            </div>

            <button className="btn" onClick={() => setShowForm(!showForm)}>
                <i className="fa-solid fa-plus" /> Add Species
            </button>

            {showForm && (
                <form onSubmit={handleCreate} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Name *</label>
                        <input
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category *</label>
                        <input
                            required
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Avg Shelf Life (hours) *</label>
                        <input
                            type="number"
                            required
                            value={form.avg_shelf_life_hours}
                            onChange={(e) => setForm({ ...form, avg_shelf_life_hours: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ideal Temp Min (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={form.ideal_temp_min}
                            onChange={(e) => setForm({ ...form, ideal_temp_min: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Ideal Temp Max (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={form.ideal_temp_max}
                            onChange={(e) => setForm({ ...form, ideal_temp_max: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Create Species
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
                {species.length === 0 ? (
                    <p>No species found. Add one!</p>
                ) : (
                    species.map((sp) => (
                        <div key={sp.id} className="log-card">
                            <div className="log-info">
                                <h3>{sp.name}</h3>
                                <p>
                                    <strong>Category:</strong> {sp.category}
                                </p>
                                <p>
                                    <strong>Shelf Life:</strong> {sp.avg_shelf_life_hours} hours
                                </p>
                                <p>
                                    <strong>Ideal Temp:</strong> {sp.ideal_temp_min}°C to {sp.ideal_temp_max}°C
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}
