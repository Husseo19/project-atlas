# Atlas Backend
## Setup
1. `python -m venv venv`
2. `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in values
5. `uvicorn src.main:app --reload --port 8000`
