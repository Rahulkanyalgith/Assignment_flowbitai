# Vanna AI Analytics Server

Python FastAPI server powering natural language queries with Vanna AI and Groq LLM.

## Setup

1. **Create Virtual Environment**
```bash
python -m venv venv
```

2. **Activate Virtual Environment**

Windows:
```bash
venv\Scripts\activate
```

Linux/Mac:
```bash
source venv/bin/activate
```

3. **Install Dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure Environment**

Create a `.env` file:
```env
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/analytics_db
GROQ_API_KEY=your_groq_api_key_here
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

5. **Run Server**
```bash
python app.py
```

The server will start on http://localhost:8000

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /query` - Process natural language query
- `POST /train` - Train on new question-SQL pairs

## Example Query

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the total spend in the last 90 days?"}'
```

## Deployment

This can be deployed to:
- Render
- Railway
- Fly.io
- Digital Ocean
- Any platform supporting Python applications

Make sure to set the environment variables in your deployment platform.
