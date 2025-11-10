from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from vanna.remote import VannaDefault
"""Flexible import of Groq/OpenAI chat backends depending on installed vanna version"""
using_openai_compat = False
try:
    # Newer vanna versions expose a dedicated Groq backend
    from vanna.groq import Groq_Chat  # type: ignore
except Exception:
    try:
        # Fallback to OpenAI-compatible backend and route to Groq's OpenAI API
        from vanna.openai import OpenAI_Chat as Groq_Chat  # type: ignore
        using_openai_compat = True
        print("⚠️  vanna.groq not found; falling back to OpenAI-compatible backend for Groq")
    except Exception:
        Groq_Chat = None  # type: ignore
        print("❌ Neither vanna.groq nor vanna.openai backends are available. Please upgrade/install 'vanna'.")
import sqlalchemy

load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg://localhost:5432/analytics_db")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
PORT = int(os.getenv("PORT", 8000))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

# Initialize FastAPI
app = FastAPI(title="Vanna AI Analytics API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Vanna AI with Groq (or OpenAI-compatible fallback)
if Groq_Chat is not None:
    class MyVanna(VannaDefault, Groq_Chat):  # type: ignore
        def __init__(self, config=None):
            VannaDefault.__init__(self, config=config)
            Groq_Chat.__init__(self, config=config)  # type: ignore

    groq_config = {
        'api_key': GROQ_API_KEY,
        'model': 'llama3-70b-8192',
    }
    # If using OpenAI-compatible backend, provide Groq's base URL as OpenAI proxy
    if using_openai_compat:
        groq_config.update({
            'base_url': 'https://api.groq.com/openai/v1',
            'api_base': 'https://api.groq.com/openai/v1',
        })
    vanna = MyVanna(config=groq_config)
else:
    # Last-resort fallback: basic Vanna without chat backend to avoid hard crash
    class MyVanna(VannaDefault):
        def __init__(self, config=None):
            super().__init__(config=config)
    vanna = MyVanna(config={})

# Connect to PostgreSQL
try:
    vanna.connect_to_postgres(url=DATABASE_URL)
    print(f"✅ Connected to PostgreSQL database")
except Exception as e:
    print(f"❌ Failed to connect to database: {e}")

# Train Vanna on schema (you would typically do this once)
try:
    # Get all table information
    engine = sqlalchemy.create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Train on schema
        vanna.train(ddl="""
        CREATE TABLE vendors (
            id TEXT PRIMARY KEY,
            vendor_id TEXT UNIQUE,
            name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            country TEXT
        );
        
        CREATE TABLE invoices (
            id TEXT PRIMARY KEY,
            invoice_number TEXT UNIQUE,
            vendor_id TEXT,
            invoice_date TIMESTAMP,
            due_date TIMESTAMP,
            status TEXT,
            total_amount DECIMAL,
            amount_paid DECIMAL,
            amount_due DECIMAL,
            category TEXT,
            FOREIGN KEY (vendor_id) REFERENCES vendors(vendor_id)
        );
        
        CREATE TABLE line_items (
            id TEXT PRIMARY KEY,
            invoice_id TEXT,
            description TEXT,
            quantity DECIMAL,
            unit_price DECIMAL,
            amount DECIMAL,
            category TEXT,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        );
        
        CREATE TABLE payments (
            id TEXT PRIMARY KEY,
            invoice_id TEXT,
            payment_date TIMESTAMP,
            amount DECIMAL,
            payment_method TEXT,
            FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        );
        """)
        
        # Train on sample queries
        vanna.train(
            question="What is the total spend in the last 90 days?",
            sql="""
            SELECT SUM(total_amount) as total_spend
            FROM invoices
            WHERE invoice_date >= NOW() - INTERVAL '90 days'
            AND status NOT IN ('CANCELLED', 'DRAFT');
            """
        )
        
        vanna.train(
            question="List top 5 vendors by spend",
            sql="""
            SELECT v.name, SUM(i.total_amount) as total_spend
            FROM vendors v
            JOIN invoices i ON v.vendor_id = i.vendor_id
            WHERE i.status NOT IN ('CANCELLED', 'DRAFT')
            GROUP BY v.name
            ORDER BY total_spend DESC
            LIMIT 5;
            """
        )
        
        vanna.train(
            question="Show overdue invoices",
            sql="""
            SELECT invoice_number, vendor_id, due_date, amount_due
            FROM invoices
            WHERE due_date < NOW()
            AND status IN ('PENDING', 'APPROVED')
            ORDER BY due_date;
            """
        )
        
    print("✅ Vanna AI trained on schema and sample queries")
except Exception as e:
    print(f"⚠️  Warning during training: {e}")

# Request/Response models
class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    sql: str
    results: list
    error: str = None

@app.get("/")
async def root():
    return {
        "message": "Vanna AI Analytics API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected" if vanna else "disconnected"
    }

@app.post("/query", response_model=QueryResponse)
async def query_data(request: QueryRequest):
    """
    Process natural language query and return SQL + results
    """
    try:
        # Generate SQL from natural language
        sql = vanna.generate_sql(request.question)
        
        if not sql:
            raise HTTPException(
                status_code=400,
                detail="Could not generate SQL from the question. Please try rephrasing."
            )
        
        # Execute SQL and get results
        results = vanna.run_sql(sql)
        
        # Convert results to list of dictionaries
        if results is not None and hasattr(results, 'to_dict'):
            results_list = results.to_dict('records')
        elif isinstance(results, list):
            results_list = results
        else:
            results_list = []
        
        return QueryResponse(
            sql=sql,
            results=results_list,
            error=None
        )
        
    except Exception as e:
        error_message = str(e)
        print(f"Error processing query: {error_message}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {error_message}"
        )

@app.post("/train")
async def train_vanna(question: str, sql: str):
    """
    Train Vanna on a new question-SQL pair
    """
    try:
        vanna.train(question=question, sql=sql)
        return {"message": "Training successful"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Training failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Vanna AI server on http://localhost:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
