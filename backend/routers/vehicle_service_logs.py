from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from db import get_db
from models import VehicleLog, User
from auth_security import get_current_user

router = APIRouter(prefix="/vehicle_service_logs", tags=["Vehicle Logs"])

# Schemas
class VehicleLogBase(BaseModel):
    vehicle_id: str
    owner_name: Optional[str] = None
    service_type: str
    description: Optional[str] = None
    cost: Optional[float] = None
    mileage: Optional[int] = None
    service_date: Optional[datetime] = None
    mechanic_id: Optional[int] = None

class VehicleLogCreate(VehicleLogBase):
    pass

class VehicleLogResponse(VehicleLogBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Routes
@router.get("/", response_model=List[VehicleLogResponse])
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(VehicleLog).all()

@router.post("/", response_model=VehicleLogResponse)
def create_log(
    log: VehicleLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_log = VehicleLog(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@router.put("/{log_id}", response_model=VehicleLogResponse)
def update_log(
    log_id: int,
    log_update: VehicleLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_log = db.query(VehicleLog).filter(VehicleLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    for key, value in log_update.dict().items():
        setattr(db_log, key, value)
    
    db.commit()
    db.refresh(db_log)
    return db_log

@router.delete("/{log_id}")
def delete_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_log = db.query(VehicleLog).filter(VehicleLog.id == log_id).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Log not found")
    
    db.delete(db_log)
    db.commit()
    return {"ok": True}

@router.get("/api/mechanics/")
def get_mechanics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Return mock or real mechanics. For now, empty list or query DB if model exists
    from models import Mechanic
    return db.query(Mechanic).all()
