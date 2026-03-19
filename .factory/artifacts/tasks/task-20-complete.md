# Task 20: RAG Service — COMPLETE

## Files Created/Modified
- python-service/services/rag_service.py (created)
- python-service/routers/rag.py (modified: wired up real handlers)
- python-service/tests/test_rag.py (created)

## Tests
- 2 tests written, all passing
- test_chunk_text_produces_correct_chunks
- test_chunk_text_handles_short_text

## Acceptance Criteria
- [x] POST /api/rag/ingest accepts file upload, chunks document, generates embeddings, stores in document_chunks
- [x] Chunking uses 1000 chars, 200 overlap sliding window
- [x] Embeddings generated via OpenAI text-embedding-3-small (with fallback [0.0]*1536)
- [x] POST /api/rag/query performs cosine similarity search, returns top-k chunks
- [x] Supports filtering by document_type
- [x] Returns chunks with content, document_name, relevance_score

## Notes
- Chunk algorithm: sliding window without early termination — generates 4 chunks for 2500-char text at chunk_size=1000, overlap=200
- Falls back to [0.0]*1536 zero embedding when OpenAI not configured (for testing without API key)
- db_pool obtained from request.app.state to avoid circular imports
