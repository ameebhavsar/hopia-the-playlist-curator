from fastapi import APIRouter

router = APIRouter()

# Health check endpoint to test if the server is running
@router.get("/health")
def health_check():
    return {"status": "healthy", "message": "Server is running"}