from typing import List, Optional
from fastapi import HTTPException
from models.data_models import VehicleServiceLog, Mechanic
from repos.repo import Repo
from vector_store.qdrant_service import QdrantService


qdrant = QdrantService()


class Service:
    def __init__(self, repo: Repo):
        self.repo = repo

    # ---------------- VEHICLE SERVICE LOGS ---------------- #

    async def create_vehicle_service_log(self, log: VehicleServiceLog) -> VehicleServiceLog:
        if isinstance(log, dict):
            log = VehicleServiceLog(**log)

        result = await self.repo.insert(log)

        text_blob = (
            f"{result.vehicle_model} owned by {result.owner_name} had a "
            f"{result.service_type} service costing {result.cost}. "
            f"Description: {result.description}"
        )

        qdrant.upsert_log(
            log_id=str(result.id),
            text=text_blob,
            payload={
                "vehicle_model": result.vehicle_model,
                "owner": result.owner_name,
                "service_type": result.service_type,
                "service_date": result.service_date.isoformat() if result.service_date else None,
                "cost": result.cost,
                "mechanic": result.mechanic_name,
            }
        )

        return result

    async def get_vehicle_service_logs(self, vehicle_id: Optional[str] = None) -> List[VehicleServiceLog]:
        return await self.repo.list(vehicle_id)

    async def get_vehicle_service_log_by_id(self, log_id: str) -> Optional[VehicleServiceLog]:
        return await self.repo.get(log_id)

    async def update_vehicle_service_log(self, log_id: str, log: VehicleServiceLog) -> VehicleServiceLog:
        if isinstance(log, dict):
            log = VehicleServiceLog(**log)

        existing = await self.repo.get(log_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Vehicle service log not found")

        log.id = log_id
        success = await self.repo.update(log)
        if not success:
            raise HTTPException(status_code=404, detail="Vehicle service log not updated")

        return log

    async def delete_vehicle_service_log(self, log_id: str) -> dict:
        deleted = await self.repo.delete(log_id)
        if deleted == 0:
            raise HTTPException(status_code=404, detail="Vehicle service log not found")
        return {"message": f"Vehicle service log {log_id} deleted"}

    async def get_services_by_vehicle_model(self, vehicle_model: str) -> List[VehicleServiceLog]:
        return await self.repo.list_by_vehicle_model(vehicle_model)

    async def get_vehicles_due_soon(self, days_threshold: int = 30) -> List[VehicleServiceLog]:
        return await self.repo.get_vehicles_due_soon(days_threshold)

    async def update_service_cost_by_model(self, vehicle_model: str, new_cost: float) -> bool:
        return await self.repo.update_service_cost_by_model(vehicle_model, new_cost)

    async def delete_by_vehicle_model(self, vehicle_model: str) -> bool:
        return await self.repo.delete_by_vehicle_model(vehicle_model)

    # ---------------- MECHANICS ---------------- #

    async def create_mechanic(self, mechanic: Mechanic) -> Mechanic:
        if isinstance(mechanic, dict):
            mechanic = Mechanic(**mechanic)
        return await self.repo.create_mechanic(mechanic)

    async def list_mechanics(self) -> List[Mechanic]:
        return await self.repo.list_mechanics()
