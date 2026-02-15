from fastapi import APIRouter, status
from typing import Optional
from pydantic import BaseModel

from services.marine_service import MarineService
from repos.marine_repo import MarineRepo
from services.ml_service import ml_service
from models.data_models import SpoilagePrediction

router = APIRouter()
repo = MarineRepo()
service = MarineService(repo)


# =====================================================
# 1️⃣ GET SPOILAGE PREDICTION BY BATCH
# =====================================================

@router.get("/spoilage/{batch_id}", response_model=SpoilagePrediction)
async def get_spoilage(batch_id: str):
    """
    Retrieve spoilage prediction for a catch batch.
    """
    return await service.get_spoilage_by_batch(batch_id)


# =====================================================
# 2️⃣ SPOILAGE RISK EVALUATION (ML)
# =====================================================

class SpoilageRequest(BaseModel):
    catch_batch_id: str
    avg_temperature: float
    hours_since_catch: float


@router.post("/evaluate-spoilage")
async def evaluate_spoilage(req: SpoilageRequest):
    """
    ML-based spoilage risk evaluation.

    Uses:
    - catch_batch_id
    - avg_temperature
    - hours_since_catch
    """

    if not ml_service.is_ready():
        return {
            "success": False,
            "message": "ML model not available. Train it first."
        }

    result = ml_service.predict_spoilage_risk(
        avg_temperature=req.avg_temperature,
        hours_since_catch=req.hours_since_catch,
    )

    prediction = SpoilagePrediction(
        catch_batch_id=req.catch_batch_id,
        predicted_risk=result["risk_score"],
        confidence_score=result["confidence"],
        recommended_action=result["recommended_action"],
    )

    await service.create_spoilage_prediction(prediction)

    return {
        "success": True,
        "message": "Spoilage risk evaluated successfully",
        "data": result,
    }


# =====================================================
# 3️⃣ AUCTION PRICE RECOMMENDATION (ML)
# =====================================================

class AuctionPriceRequest(BaseModel):
    species_name: str
    catch_weight_kg: float
    recent_avg_price: float
    demand_index: float


@router.post("/recommend-auction-price")
async def recommend_auction_price(req: AuctionPriceRequest):
    """
    ML-based auction price recommendation.

    Uses:
    - species_name
    - catch_weight_kg
    - recent_avg_price
    - demand_index
    """

    if not ml_service.is_ready():
        return {
            "success": False,
            "message": "ML model not available. Train it first."
        }

    result = ml_service.recommend_price(
        species_name=req.species_name,
        catch_weight_kg=req.catch_weight_kg,
        recent_avg_price=req.recent_avg_price,
        demand_index=req.demand_index,
    )

    return {
        "success": True,
        "message": "Recommended auction price generated",
        "data": result,
    }
