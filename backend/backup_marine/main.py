import os
import uvicorn
from contextlib import asynccontextmanager

from fastapi.middleware.cors import CORSMiddleware
from google.adk.cli.fast_api import get_fast_api_app

from routers import (
    vessels,
    species,
    catch_batches,
    auctions,
    storage,
    analytics,
    notifications,
)

from routers.auth import router as auth_router
from auth_db import Base as AuthBase, engine as auth_engine

from services.ml_service import ml_service
from db import PostgresDB


AGENT_DIR = os.path.dirname(os.path.abspath(__file__))

ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

SERVE_WEB_INTERFACE = True


# -------------------- FastAPI App --------------------

app = get_fast_api_app(
    agents_dir=AGENT_DIR,
    allow_origins=[],
    web=SERVE_WEB_INTERFACE,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Auth --------------------

AuthBase.metadata.create_all(bind=auth_engine)
app.include_router(auth_router)


# -------------------- Marine Routers --------------------

app.include_router(vessels.router, prefix="/vessels", tags=["Vessels"])
app.include_router(species.router, prefix="/species", tags=["Species"])
app.include_router(catch_batches.router, prefix="/catch", tags=["Catch"])
app.include_router(auctions.router, prefix="/auctions", tags=["Auctions"])
app.include_router(storage.router, prefix="/storage", tags=["Storage"])
app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])


# -------------------- Lifespan: Postgres Bootstrap --------------------

@asynccontextmanager
async def lifespan(app):
    await PostgresDB.connect()

    async with PostgresDB.pool.acquire() as conn:

        # Vessels
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS vessels (
            id UUID PRIMARY KEY,
            registration_number TEXT NOT NULL,
            owner_name TEXT NOT NULL,
            owner_phone TEXT,
            vessel_type TEXT,
            capacity_kg INTEGER,
            home_port TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """)

        # Species
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS species (
            id UUID PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            avg_shelf_life_hours INTEGER,
            ideal_temp_min REAL,
            ideal_temp_max REAL
        );
        """)

        # Catch Batches
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS catch_batches (
            id UUID PRIMARY KEY,
            vessel_id UUID REFERENCES vessels(id),
            species_id UUID REFERENCES species(id),
            catch_weight_kg REAL,
            catch_time TIMESTAMP,
            landing_port TEXT,
            ice_applied_time TIMESTAMP,
            quality_grade TEXT,
            current_status TEXT
        );
        """)

        # Cold Storage
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS cold_storage_units (
            id UUID PRIMARY KEY,
            location TEXT,
            max_capacity_kg REAL,
            current_load_kg REAL,
            current_temp REAL
        );
        """)

        # Temperature Logs
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS temperature_logs (
            id UUID PRIMARY KEY,
            storage_unit_id UUID REFERENCES cold_storage_units(id),
            recorded_temp REAL,
            timestamp TIMESTAMP
        );
        """)

        # Auctions
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS auctions (
            id UUID PRIMARY KEY,
            port TEXT,
            auction_date DATE,
            base_price_per_kg REAL,
            recommended_price_per_kg REAL
        );
        """)

        # Bids
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS bids (
            id UUID PRIMARY KEY,
            auction_id UUID REFERENCES auctions(id),
            buyer_name TEXT,
            bid_price_per_kg REAL,
            quantity_kg REAL,
            timestamp TIMESTAMP
        );
        """)

        # Spoilage Predictions
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS spoilage_predictions (
            id UUID PRIMARY KEY,
            catch_batch_id UUID REFERENCES catch_batches(id),
            predicted_risk REAL,
            confidence_score REAL,
            recommended_action TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """)

        # Notifications
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS notifications_log (
            id UUID PRIMARY KEY,
            phone_number TEXT,
            message_type TEXT,
            message_body TEXT,
            status TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
        """)

    yield


app.router.lifespan_context = lifespan


# -------------------- ML Warning --------------------

if not ml_service.is_ready():
    print("[ML] Warning: Marine ML models not loaded.")


# -------------------- Run --------------------

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8080)),
    )
