from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.routes import health, weather


# Load environment variables from .env file
load_dotenv()

# Create FastAPI instance
app = FastAPI()

# CORS middleware to allow requests from frontend on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes:

# Health check endpoint to test if the server is running
app.include_router(health.router, prefix="/api", tags=["health"])

# Weather fetching endpoint
app.include_router(weather.router, prefix="/api", tags=["weather"])    

@app.get("/")
def health_check():
    return {"status": "ok"}

