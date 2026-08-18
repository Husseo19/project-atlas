import pytest
import httpx
from src.config.supabase import get_supabase_client

@pytest.mark.asyncio
async def test_adaptive_and_bulk_generation():
    supabase = get_supabase_client()
    res = supabase.table('study_objectives').select('id, certification_id').limit(1).execute()
    if not res.data:
        pytest.skip('No objectives found to test with')
    
    obj = res.data[0]
    cid = obj['certification_id']
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Test Adaptive Question
        res_adaptive = await client.post(
            'http://localhost:8000/api/v1/training/generate-adaptive-question',
            json={'objective_id': obj['id'], 'wrong_answer_text': 'QA Test Wrong Answer'}
        )
        assert res_adaptive.status_code == 200, f"Adaptive Error: {res_adaptive.text}"
        data = res_adaptive.json()
        assert 'content' in data
        
        # Test Bulk Generation (1 question)
        events_received = 0
        async with client.stream('GET', f'http://localhost:8000/api/v1/admin/generate-questions-bulk?certification_id={cid}&count=1') as response:
            async for line in response.aiter_lines():
                if line:
                    events_received += 1
                    
        assert events_received > 0, "No SSE events received from bulk generation"
