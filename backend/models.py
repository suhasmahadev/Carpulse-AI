from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Mechanic(Base):
    __tablename__ = "mechanics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=True)
    contact_number = Column(String, nullable=True)
    logs = relationship("VehicleLog", back_populates="mechanic")

class VehicleLog(Base):
    __tablename__ = "vehicle_logs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, index=True, nullable=False)
    owner_name = Column(String, nullable=True)
    service_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    cost = Column(Float, nullable=True)
    mileage = Column(Integer, nullable=True)
    service_date = Column(DateTime, nullable=True)
    mechanic_id = Column(Integer, ForeignKey("mechanics.id"), nullable=True)
    
    mechanic = relationship("Mechanic", back_populates="logs")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
