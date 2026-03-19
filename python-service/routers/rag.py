from fastapi import APIRouter, UploadFile, File, Request
from models.schemas import RagQueryRequest, RagQueryResponse, RagIngestResponse, RagChunk
from services.rag_service import rag_service

router = APIRouter(prefix="/api/rag", tags=["rag"])

@router.post("/query", response_model=RagQueryResponse)
async def query(request_body: RagQueryRequest, request: Request):
    db_pool = getattr(request.app.state, 'db_pool', None)
    chunks = await rag_service.query(
        query=request_body.query,
        k=request_body.k,
        document_type=request_body.filter_document_type,
        db_pool=db_pool,
    )
    return RagQueryResponse(chunks=[RagChunk(**c) for c in chunks])

@router.post("/ingest", response_model=RagIngestResponse)
async def ingest(request: Request, file: UploadFile = File(...)):
    db_pool = getattr(request.app.state, 'db_pool', None)
    content = (await file.read()).decode("utf-8")
    count = await rag_service.ingest_document(
        content=content,
        document_name=file.filename or "unknown",
        document_type="document",
        db_pool=db_pool,
    )
    return RagIngestResponse(document_name=file.filename or "unknown", chunks_created=count)
