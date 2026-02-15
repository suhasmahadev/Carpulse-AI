from typing import Dict, Optional, List
from datetime import datetime

from services.marine_service import MarineService
from repos.marine_repo import MarineRepo
from models.data_models import (
    Vessel,
    Species,
    CatchBatch,
    SpoilagePrediction,
)

repo = MarineRepo()
service = MarineService(repo)


# ===================================================
# UTIL
# ===================================================

def normalize_dt(dt):
    if dt is None:
        return None
    if isinstance(dt, str):
        return datetime.fromisoformat(dt)
    return dt


# ===================================================
# VESSELS
# ===================================================

async def register_vessel(
    registration_number: str,
    owner_name: str,
    vessel_type: str,
    capacity_kg: int,
    home_port: str,
    owner_phone: Optional[str] = None
) -> Dict:
    try:
        vessel = Vessel(
            registration_number=registration_number,
            owner_name=owner_name,
            vessel_type=vessel_type,
            capacity_kg=capacity_kg,
            home_port=home_port,
            owner_phone=owner_phone
        )

        res = await service.create_vessel(vessel)
        return {"success": True, "data": res.dict()}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def list_all_vessels() -> Dict:
    vessels = await service.list_vessels()
    return {"success": True, "data": [v.dict() for v in vessels]}


# ===================================================
# SPECIES
# ===================================================

async def add_species(
    name: str,
    category: str,
    avg_shelf_life_hours: int,
    ideal_temp_min: float,
    ideal_temp_max: float
) -> Dict:
    try:
        species = Species(
            name=name,
            category=category,
            avg_shelf_life_hours=avg_shelf_life_hours,
            ideal_temp_min=ideal_temp_min,
            ideal_temp_max=ideal_temp_max
        )

        res = await service.create_species(species)
        return {"success": True, "data": res.dict()}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def list_all_species() -> Dict:
    species = await service.list_species()
    return {"success": True, "data": [s.dict() for s in species]}


# ===================================================
# CATCH MANAGEMENT
# ===================================================

async def register_catch_batch(
    vessel_id: str,
    species_id: str,
    catch_weight_kg: float,
    catch_time: str,
    landing_port: str,
    current_status: str,
    ice_applied_time: Optional[str] = None,
    quality_grade: Optional[str] = None
) -> Dict:
    try:
        batch = CatchBatch(
            vessel_id=vessel_id,
            species_id=species_id,
            catch_weight_kg=catch_weight_kg,
            catch_time=normalize_dt(catch_time),
            landing_port=landing_port,
            ice_applied_time=normalize_dt(ice_applied_time) if ice_applied_time else None,
            quality_grade=quality_grade,
            current_status=current_status
        )

        res = await service.create_catch_batch(batch)
        return {"success": True, "data": res.dict()}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def list_catch_batches(status: Optional[str] = None) -> Dict:
    batches = await service.get_catch_batches(status)
    return {"success": True, "data": [b.dict() for b in batches]}


# ===================================================
# AUCTION ANALYTICS
# ===================================================

async def get_total_auctions() -> Dict:
    auctions = await service.list_auctions()
    return {"success": True, "count": len(auctions)}


async def get_total_bids_for_auction(auction_id: str) -> Dict:
    bids = await service.list_bids(auction_id)
    return {"success": True, "count": len(bids)}


# ===================================================
# SPOILAGE MONITORING
# ===================================================

async def get_spoilage_prediction(batch_id: str) -> Dict:
    try:
        prediction = await service.get_spoilage_by_batch(batch_id)
        return {"success": True, "data": prediction.dict()}
    except Exception as e:
        return {"success": False, "message": str(e)}


async def get_high_risk_batches(threshold: float = 0.7) -> Dict:
    batches = await service.get_catch_batches(None)
    high_risk = []
    errors = []

    for b in batches:
        try:
            pred = await service.get_spoilage_by_batch(str(b.id))
            if pred and pred.predicted_risk >= threshold:
                high_risk.append({
                    "batch_id": str(b.id),
                    "risk": pred.predicted_risk,
                    "recommended_action": pred.recommended_action
                })
        except Exception as e:
            errors.append({
                "batch_id": str(b.id),
                "error": str(e)
            })

    return {
        "success": True,
        "data": high_risk,
        "errors": errors if errors else None
    }


# ===================================================
# AUTOMATION: AUTO FLAG HIGH RISK
# ===================================================

async def auto_flag_high_risk_batches(threshold: float = 0.7) -> Dict:
    """
    Automatically:
    - Detect high spoilage risk
    - Update batch status to 'high_risk'
    """

    batches = await service.get_catch_batches(None)
    flagged = []
    errors = []

    for b in batches:
        try:
            pred = await service.get_spoilage_by_batch(str(b.id))

            if pred and pred.predicted_risk >= threshold:
                await service.update_catch_status(str(b.id), "high_risk")
                flagged.append(str(b.id))

        except Exception as e:
            errors.append({
                "batch_id": str(b.id),
                "error": str(e)
            })

    return {
        "success": True,
        "flagged_batches": flagged,
        "errors": errors if errors else None
    }


# ===================================================
# STORAGE MONITORING
# ===================================================

async def get_temperature_logs(storage_id: str) -> Dict:
    logs = await service.get_temperature_logs(storage_id)
    return {"success": True, "data": [l.dict() for l in logs]}


# ===================================================
# NOTIFICATIONS
# ===================================================

async def list_notifications() -> Dict:
    logs = await service.list_notifications()
    return {"success": True, "data": [l.dict() for l in logs]}
