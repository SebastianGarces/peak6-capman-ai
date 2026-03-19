from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from config import settings
from routers import scenarios, grading, rag

db_pool = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global db_pool
    try:
        db_pool = await asyncpg.create_pool(settings.database_url)
        app.state.db_pool = db_pool
    except Exception:
        app.state.db_pool = None
    yield
    if db_pool:
        await db_pool.close()

app = FastAPI(title="CapMan AI Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenarios.router)
app.include_router(grading.router)
app.include_router(rag.router)

@app.get("/api/health")
async def health():
    db_status = "disconnected"
    if db_pool:
        try:
            async with db_pool.acquire() as conn:
                await conn.fetchval("SELECT 1")
            db_status = "connected"
        except Exception:
            pass
    return {
        "status": "ok",
        "model": settings.llm_scenario_model,
        "db": db_status,
    }
