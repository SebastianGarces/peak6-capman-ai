import pytest
from services.rag_service import RagService

def test_chunk_text_produces_correct_chunks():
    service = RagService()
    text = "A" * 2500
    chunks = service._chunk_text(text, chunk_size=1000, overlap=200)
    # With chunk_size=1000 and overlap=200 (step=800):
    # start=0, end=1000 -> chunk[0:1000], next start=800
    # start=800, end=1800 -> chunk[800:1800], next start=1600
    # start=1600, end=2600 -> chunk[1600:2500] (capped), next start=2400
    # start=2400, end=3400 -> chunk[2400:2500] (capped), next start=3200
    # start=3200 >= 2500 -> loop ends
    # That's 4 chunks
    assert len(chunks) == 4

def test_chunk_text_handles_short_text():
    service = RagService()
    chunks = service._chunk_text("Short text")
    assert len(chunks) == 1
    assert chunks[0] == "Short text"
