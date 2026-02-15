from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import engine, Base
from routers import auth, vehicle_service_logs

# Create Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Carpulse AI")

# CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(vehicle_service_logs.router)

@app.get("/")
def read_root():
    return {"message": "Carpulse AI Backend is running"}
