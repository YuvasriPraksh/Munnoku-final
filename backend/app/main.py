from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from backend.app.api.routes import router

app = FastAPI(
    title="MUNNOKKU — Bovine Mastitis Early Forecasting API",
    description="AI-Based Decision Support Prototype for Early Forecasting of Bovine Mastitis in Indian Dairy Farms.",
    version="1.0.0"
)

# CORS Middleware setup
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
