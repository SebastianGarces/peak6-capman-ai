from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncpg
from config import settings
from routers import scenarios, grading, rag


async def verify_internal_token(x_internal_token: str = Header(default="")):
    if not settings.internal_api_token:
        return  # No token configured, skip validation (dev mode)
    if x_internal_token != settings.internal_api_token:
        raise HTTPException(status_code=401, detail="Invalid internal token")

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

app.include_router(scenarios.router, dependencies=[Depends(verify_internal_token)])
app.include_router(grading.router, dependencies=[Depends(verify_internal_token)])
app.include_router(rag.router, dependencies=[Depends(verify_internal_token)])

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
