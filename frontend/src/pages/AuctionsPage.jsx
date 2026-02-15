import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
    getAllAuctions,
    createAuction,
    createBid,
    getBidsForAuction,
} from "../api/auctionApi.js";
import "../styles/logs.css";

function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "Invalid date";
    }
}

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

export default function AuctionsPage() {
    const { token } = useAuth();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showAuctionForm, setShowAuctionForm] = useState(false);
    const [showBidForm, setShowBidForm] = useState(false);
    const [selectedAuctionBids, setSelectedAuctionBids] = useState(null);

    const [auctionForm, setAuctionForm] = useState({
        port: "",
        auction_date: "",
        base_price_per_kg: "",
        recommended_price_per_kg: "",
    });

    const [bidForm, setBidForm] = useState({
        auction_id: "",
        buyer_name: "",
        bid_price_per_kg: "",
        quantity_kg: "",
    });

    useEffect(() => {
        loadAuctions();
    }, []);

    async function loadAuctions() {
        setLoading(true);
        setError("");
        try {
            const data = await getAllAuctions(token);
            setAuctions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setError("Failed to load auctions.");
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateAuction(e) {
        e.preventDefault();
        try {
            await createAuction(
                {
                    port: auctionForm.port,
                    auction_date: auctionForm.auction_date,
                    base_price_per_kg: parseFloat(auctionForm.base_price_per_kg),
                    recommended_price_per_kg: auctionForm.recommended_price_per_kg
                        ? parseFloat(auctionForm.recommended_price_per_kg)
                        : null,
                },
                token
            );
            setShowAuctionForm(false);
            setAuctionForm({
                port: "",
                auction_date: "",
                base_price_per_kg: "",
                recommended_price_per_kg: "",
            });
            loadAuctions();
        } catch (err) {
            console.error(err);
            alert("Failed to create auction");
        }
    }

    async function handleCreateBid(e) {
        e.preventDefault();
        try {
            await createBid(
                {
                    auction_id: bidForm.auction_id,
                    buyer_name: bidForm.buyer_name,
                    bid_price_per_kg: parseFloat(bidForm.bid_price_per_kg),
                    quantity_kg: parseFloat(bidForm.quantity_kg),
                    timestamp: new Date().toISOString(),
                },
                token
            );
            setShowBidForm(false);
            setBidForm({
                auction_id: "",
                buyer_name: "",
                bid_price_per_kg: "",
                quantity_kg: "",
            });
            alert("Bid created successfully");
        } catch (err) {
            console.error(err);
            alert("Failed to create bid");
        }
    }

    async function handleViewBids(auctionId) {
        try {
            const bids = await getBidsForAuction(auctionId, token);
            setSelectedAuctionBids({ auctionId, bids });
        } catch (err) {
            console.error(err);
            alert("Failed to load bids");
        }
    }

    return (
        <div className="logs-page">
            <div className="logs-header">
                <h2>Auctions Management</h2>
                <p style={{ marginTop: "8px", color: "#666" }}>
                    Manage auctions, bids, and pricing strategies
                </p>
            </div>

            <button className="btn" onClick={() => setShowAuctionForm(!showAuctionForm)}>
                <i className="fa-solid fa-plus" /> Create Auction
            </button>
            <button
                className="btn"
                style={{ marginLeft: "10px" }}
                onClick={() => setShowBidForm(!showBidForm)}
            >
                <i className="fa-solid fa-gavel" /> Place Bid
            </button>

            {showAuctionForm && (
                <form onSubmit={handleCreateAuction} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Port *</label>
                        <input
                            required
                            value={auctionForm.port}
                            onChange={(e) => setAuctionForm({ ...auctionForm, port: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Auction Date *</label>
                        <input
                            type="date"
                            required
                            value={auctionForm.auction_date}
                            onChange={(e) =>
                                setAuctionForm({ ...auctionForm, auction_date: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Base Price per kg *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={auctionForm.base_price_per_kg}
                            onChange={(e) =>
                                setAuctionForm({ ...auctionForm, base_price_per_kg: e.target.value })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Recommended Price per kg</label>
                        <input
                            type="number"
                            step="0.01"
                            value={auctionForm.recommended_price_per_kg}
                            onChange={(e) =>
                                setAuctionForm({ ...auctionForm, recommended_price_per_kg: e.target.value })
                            }
                        />
                    </div>
                    <button type="submit" className="btn">
                        Create Auction
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary-outline"
                        onClick={() => setShowAuctionForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {showBidForm && (
                <form onSubmit={handleCreateBid} style={{ marginTop: "20px" }}>
                    <div className="form-group">
                        <label>Auction ID *</label>
                        <input
                            required
                            value={bidForm.auction_id}
                            onChange={(e) => setBidForm({ ...bidForm, auction_id: e.target.value })}
                            placeholder="UUID of auction"
                        />
                    </div>
                    <div className="form-group">
                        <label>Buyer Name *</label>
                        <input
                            required
                            value={bidForm.buyer_name}
                            onChange={(e) => setBidForm({ ...bidForm, buyer_name: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Bid Price per kg *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            value={bidForm.bid_price_per_kg}
                            onChange={(e) => setBidForm({ ...bidForm, bid_price_per_kg: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Quantity (kg) *</label>
                        <input
                            type="number"
                            step="0.1"
                            required
                            value={bidForm.quantity_kg}
                            onChange={(e) => setBidForm({ ...bidForm, quantity_kg: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="btn">
                        Place Bid
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary-outline"
                        onClick={() => setShowBidForm(false)}
                    >
                        Cancel
                    </button>
                </form>
            )}

            {loading && <p>Loading...</p>}
            {error && <p className="error-text">{error}</p>}

            <section className="log-list">
                {auctions.length === 0 ? (
                    <p>No auctions found.</p>
                ) : (
                    auctions.map((auction) => (
                        <div key={auction.id} className="log-card">
                            <div className="log-info">
                                <h3>Auction at {auction.port}</h3>
                                <p>
                                    <strong>Date:</strong> {formatDate(auction.auction_date)}
                                </p>
                                <p>
                                    <strong>Base Price:</strong> ₹{auction.base_price_per_kg}/kg
                                </p>
                                {auction.recommended_price_per_kg && (
                                    <p>
                                        <strong>Recommended:</strong> ₹{auction.recommended_price_per_kg}/kg
                                    </p>
                                )}
                            </div>
                            <div className="log-actions">
                                <button className="btn-edit" onClick={() => handleViewBids(auction.id)}>
                                    View Bids
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>

            {selectedAuctionBids && (
                <div
                    style={{
                        marginTop: "20px",
                        padding: "20px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                    }}
                >
                    <h3>Bids for Auction {String(selectedAuctionBids.auctionId).slice(0, 8)}...</h3>
                    <button onClick={() => setSelectedAuctionBids(null)}>Close</button>
                    {selectedAuctionBids.bids.length === 0 ? (
                        <p>No bids yet.</p>
                    ) : (
                        <ul>
                            {selectedAuctionBids.bids.map((bid) => (
                                <li key={bid.id}>
                                    <strong>{bid.buyer_name}</strong> - ₹{bid.bid_price_per_kg}/kg x{" "}
                                    {bid.quantity_kg} kg ({formatDateTime(bid.timestamp)})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
