from typing import Optional, List
from uuid import uuid4, UUID
from datetime import datetime, timedelta, timezone, date

from models.data_models import (
    Vessel, Species, CatchBatch,
    ColdStorageUnit, TemperatureLog,
    Auction, Bid, SpoilagePrediction,
    NotificationLog
)
from db import PostgresDB


# -----------------------------
# Utilities
# -----------------------------

def normalize_dt(dt):
    if dt is None:
        return None
    if isinstance(dt, str):
        dt = datetime.fromisoformat(dt)
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt


def row_to_dict(row):
    return {
        k: str(v) if isinstance(v, UUID) else v
        for k, v in dict(row).items()
    }


# =====================================================
# MARINE FISHERY REPO
# =====================================================

class MarineRepo:

    # =====================================================
    # VESSELS
    # =====================================================

    async def create_vessel(self, v: Vessel):
        v.id = v.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO vessels VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())""",
                UUID(v.id),
                v.registration_number,
                v.owner_name,
                v.owner_phone,
                v.vessel_type,
                v.capacity_kg,
                v.home_port,
            )
        return v

    async def list_vessels(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM vessels")
        return [Vessel(**row_to_dict(r)) for r in rows]

    async def delete_vessel(self, vessel_id: str):
        async with PostgresDB.pool.acquire() as conn:
            r = await conn.execute(
                "DELETE FROM vessels WHERE id=$1", UUID(vessel_id)
            )
        return int(r.split()[-1])


    # =====================================================
    # SPECIES
    # =====================================================

    async def create_species(self, s: Species):
        s.id = s.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO species VALUES ($1,$2,$3,$4,$5,$6)""",
                UUID(s.id),
                s.name,
                s.category,
                s.avg_shelf_life_hours,
                s.ideal_temp_min,
                s.ideal_temp_max,
            )
        return s

    async def list_species(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM species")
        return [Species(**row_to_dict(r)) for r in rows]


    # =====================================================
    # CATCH BATCHES
    # =====================================================

    async def create_catch_batch(self, c: CatchBatch):
        c.id = c.id or str(uuid4())
        c.catch_time = normalize_dt(c.catch_time)
        c.ice_applied_time = normalize_dt(c.ice_applied_time)

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO catch_batches VALUES
                ($1,$2,$3,$4,$5,$6,$7,$8,$9)""",
                UUID(c.id),
                UUID(c.vessel_id),
                UUID(c.species_id),
                c.catch_weight_kg,
                c.catch_time,
                c.landing_port,
                c.ice_applied_time,
                c.quality_grade,
                c.current_status,
            )
        return c

    async def list_catch_batches(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM catch_batches")
        return [CatchBatch(**row_to_dict(r)) for r in rows]

    async def update_catch_status(self, batch_id: str, status: str):
        async with PostgresDB.pool.acquire() as conn:
            r = await conn.execute(
                "UPDATE catch_batches SET current_status=$1 WHERE id=$2",
                status,
                UUID(batch_id),
            )
        return r.endswith("1")


    # =====================================================
    # COLD STORAGE
    # =====================================================

    async def create_storage_unit(self, s: ColdStorageUnit):
        s.id = s.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO cold_storage_units VALUES
                ($1,$2,$3,$4,$5)""",
                UUID(s.id),
                s.location,
                s.max_capacity_kg,
                s.current_load_kg,
                s.current_temp,
            )
        return s

    async def list_storage_units(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM cold_storage_units")
        return [ColdStorageUnit(**row_to_dict(r)) for r in rows]

    async def log_temperature(self, t: TemperatureLog):
        t.id = t.id or str(uuid4())
        t.timestamp = normalize_dt(t.timestamp)

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO temperature_logs VALUES
                ($1,$2,$3,$4)""",
                UUID(t.id),
                UUID(t.storage_unit_id),
                t.recorded_temp,
                t.timestamp,
            )
        return t

    async def get_temperature_logs(self, storage_id: str):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM temperature_logs WHERE storage_unit_id=$1",
                UUID(storage_id),
            )
        return [TemperatureLog(**row_to_dict(r)) for r in rows]


    # =====================================================
    # AUCTIONS
    # =====================================================

    async def create_auction(self, a: Auction):
        a.id = a.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO auctions VALUES
                ($1,$2,$3,$4,$5)""",
                UUID(a.id),
                a.port,
                a.auction_date,
                a.base_price_per_kg,
                a.recommended_price_per_kg,
            )
        return a

    async def list_auctions(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM auctions")
        return [Auction(**row_to_dict(r)) for r in rows]


    async def create_bid(self, b: Bid):
        b.id = b.id or str(uuid4())
        b.timestamp = normalize_dt(b.timestamp)

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO bids VALUES
                ($1,$2,$3,$4,$5,$6)""",
                UUID(b.id),
                UUID(b.auction_id),
                b.buyer_name,
                b.bid_price_per_kg,
                b.quantity_kg,
                b.timestamp,
            )
        return b

    async def list_bids_by_auction(self, auction_id: str):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM bids WHERE auction_id=$1",
                UUID(auction_id),
            )
        return [Bid(**row_to_dict(r)) for r in rows]


    # =====================================================
    # SPOILAGE PREDICTIONS
    # =====================================================

    async def create_spoilage_prediction(self, s: SpoilagePrediction):
        s.id = s.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO spoilage_predictions VALUES
                ($1,$2,$3,$4,$5,NOW())""",
                UUID(s.id),
                UUID(s.catch_batch_id),
                s.predicted_risk,
                s.confidence_score,
                s.recommended_action,
            )
        return s

    async def get_spoilage_by_batch(self, batch_id: str):
        async with PostgresDB.pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM spoilage_predictions WHERE catch_batch_id=$1",
                UUID(batch_id),
            )
        return SpoilagePrediction(**row_to_dict(row)) if row else None


    # =====================================================
    # NOTIFICATIONS (Twilio logs)
    # =====================================================

    async def log_notification(self, n: NotificationLog):
        n.id = n.id or str(uuid4())

        async with PostgresDB.pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO notifications_log VALUES
                ($1,$2,$3,$4,$5,NOW())""",
                UUID(n.id),
                n.phone_number,
                n.message_type,
                n.message_body,
                n.status,
            )
        return n

    async def list_notifications(self):
        async with PostgresDB.pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM notifications_log")
        return [NotificationLog(**row_to_dict(r)) for r in rows]
