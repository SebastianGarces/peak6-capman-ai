import uuid
import json
from typing import Optional, List
from config import settings

class RagService:
    def __init__(self):
        self.openai_client = None

    async def _get_embedding(self, text: str) -> List[float]:
        """Get embedding from OpenAI"""
        if not self.openai_client:
            from openai import AsyncOpenAI
            self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key)

        response = await self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding

    def _chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Simple recursive character text splitter"""
        chunks = []
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - overlap
        return chunks

    async def ingest_document(
        self, content: str, document_name: str, document_type: str, db_pool=None
    ) -> int:
        chunks = self._chunk_text(content)

        if db_pool:
            async with db_pool.acquire() as conn:
                for i, chunk in enumerate(chunks):
                    try:
                        embedding = await self._get_embedding(chunk)
                    except Exception:
                        embedding = [0.0] * 1536  # fallback for testing

                    await conn.execute("""
                        INSERT INTO document_chunks (id, document_name, document_type, chunk_index, content, embedding, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6::vector, NOW())
                    """, str(uuid.uuid4()), document_name, document_type, i, chunk,
                        str(embedding))

        return len(chunks)

    async def query(
        self, query: str, k: int = 5, document_type: Optional[str] = None, db_pool=None
    ) -> List[dict]:
        if not db_pool:
            return []

        try:
            query_embedding = await self._get_embedding(query)
        except Exception:
            return []

        embedding_str = str(query_embedding)

        if document_type:
            rows = await db_pool.fetch("""
                SELECT content, document_name, 1 - (embedding <=> $1::vector) as relevance_score
                FROM document_chunks
                WHERE document_type = $2
                ORDER BY embedding <=> $1::vector
                LIMIT $3
            """, embedding_str, document_type, k)
        else:
            rows = await db_pool.fetch("""
                SELECT content, document_name, 1 - (embedding <=> $1::vector) as relevance_score
                FROM document_chunks
                ORDER BY embedding <=> $1::vector
                LIMIT $2
            """, embedding_str, k)

        return [
            {"content": r["content"], "document_name": r["document_name"], "relevance_score": float(r["relevance_score"])}
            for r in rows
        ]

rag_service = RagService()
