import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getSpoilageByBatch,
    evaluateSpoilage,
    recommendAuctionPrice,
} from "../api/analyticsApi.js";
import "../styles/logs.css";

export default function AnalyticsPage() {
    const { token } = useAuth();

    const [spoilageQuery, setSpoilageQuery] = useState("");
    const [spoilageResult, setSpoilageResult] = useState(null);

    const [evalForm, setEvalForm] = useState({
        catch_batch_id: "",
        avg_temperature: "",
        hours_since_catch: "",
    });
    const [evalResult, setEvalResult] = useState(null);

    const [priceForm, setPriceForm] = useState({
        species_name: "",
        catch_weight_kg: "",
        recent_avg_price: "",
        demand_index: "",
    });
    const [priceResult, setPriceResult] = useState(null);

    async function handleGetSpoilage() {
        try {
            const result = await getSpoilageByBatch(spoilageQuery, token);
            setSpoilageResult(result);
        } catch (err) {
            console.error(err);
            setSpoilageResult({ error: err.message });
        }
    }

    async function handleEvaluateSpoilage(e) {
        e.preventDefault();
        try {
            const result = await evaluateSpoilage(
                {
                    catch_batch_id: evalForm.catch_batch_id,
                    avg_temperature: parseFloat(evalForm.avg_temperature),
                    hours_since_catch: parseFloat(evalForm.hours_since_catch),
                },
                token
            );
            setEvalResult(result);
        } catch (err) {
            console.error(err);
            setEvalResult({ error: err.message });
        }
    }

    async function handleRecommendPrice(e) {
        e.preventDefault();
        try {
            const result = await recommendAuctionPrice(
                {
                    species_name: priceForm.species_name,
                    catch_weight_kg: parseFloat(priceForm.catch_weight_kg),
                    recent_avg_price: parseFloat(priceForm.recent_avg_price),
                    demand_index: parseFloat(priceForm.demand_index),
                },
                token
            );
            setPriceResult(result);
        } catch (err) {
            console.error(err);
            setPriceResult({ error: err.message });
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Analytics Dashboard</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Spoilage prediction and price recommendations
                </p>
            </div>

            {/* Spoilage Prediction by Batch ID */}
            <section style={{ marginBottom: "40px" }}>
                <h3>Spoilage Prediction by Batch ID</h3>
                <div style={{ marginBottom: "20px" }}>
                    <input
                        placeholder="Enter Batch ID"
                        value={spoilageQuery}
                        onChange={(e) => setSpoilageQuery(e.target.value)}
                        style={{ padding: "8px", marginRight: "10px", width: "300px" }}
                    />
                    <button className="btn" onClick={handleGetSpoilage}>
                        Get Spoilage
                    </button>
                </div>
                {spoilageResult && (
                    <div
                        style={{
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        {spoilageResult.error ? (
                            <p style={{ color: "red" }}>Error: {spoilageResult.error}</p>
                        ) : (
                            <>
                                <p>
                                    <strong>Risk:</strong> {spoilageResult.predicted_risk}
                                </p>
                                <p>
                                    <strong>Confidence:</strong> {spoilageResult.confidence_score}
                                </p>
                                <p>
                                    <strong>Action:</strong> {spoilageResult.recommended_action}
                                </p>
                            </>
                        )}
                    </div>
                )}
            </section>

            {/* Evaluate Spoilage (ML) */}
            <section style={{ marginBottom: "40px" }}>
                <h3>Evaluate Spoilage (ML)</h3>
                <form onSubmit={handleEvaluateSpoilage} style={{ marginBottom: "20px" }}>
                    <div className="form-group">
                        <label>Catch Batch ID *</label>
                        <input
                            required
                            value={evalForm.catch_batch_id}
                            onChange={(e) => setEvalForm({ ...evalForm, catch_batch_id: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Avg Temperature (°C) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={evalForm.avg_temperature}
                            onChange={(e) => setEvalForm({ ...evalForm, avg_temperature: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Hours Since Catch *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={evalForm.hours_since_catch}
                            onChange={(e) => setEvalForm({ ...evalForm, hours_since_catch: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Evaluate
                    </button>
                </form>
                {evalResult && (
                    <div
                        style={{
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            marginBottom: "20px",
                        }}
                    >
                        {evalResult.error ? (
                            <p style={{ color: "red" }}>Error: {evalResult.error}</p>
                        ) : (
                            <pre>{JSON.stringify(evalResult, null, 2)}</pre>
                        )}
                    </div>
                )}
            </section>

            {/* Recommend Auction Price (ML) */}
            <section>
                <h3>Recommend Auction Price (ML)</h3>
                <form onSubmit={handleRecommendPrice}>
                    <div className="form-group">
                        <label>Species Name *</label>
                        <input
                            required
                            value={priceForm.species_name}
                            onChange={(e) => setPriceForm({ ...priceForm, species_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Catch Weight (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={priceForm.catch_weight_kg}
                            onChange={(e) => setPriceForm({ ...priceForm, catch_weight_kg: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Recent Avg Price *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={priceForm.recent_avg_price}
                            onChange={(e) => setPriceForm({ ...priceForm, recent_avg_price: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Demand Index *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={priceForm.demand_index}
                            onChange={(e) => setPriceForm({ ...priceForm, demand_index: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Recommend Price
                    </button>
                </form>
                {priceResult && (
                    <div
                        style={{
                            padding: "15px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            marginTop: "20px",
                        }}
                    >
                        {priceResult.error ? (
                            <p style={{ color: "red" }}>Error: {priceResult.error}</p>
                        ) : (
                            <pre>{JSON.stringify(priceResult, null, 2)}</pre>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}
