"""
FastAPI application for ADK backend
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
from agents.orchestrator import run_reading_workflow, run_journal_answer_workflow
from config.settings import settings

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Pellucid Insights - ADK Backend",
    description="Multi-agent AI system using Google ADK for astrological insights",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request/Response Models
class ReadingRequest(BaseModel):
    """Request model for generating a reading"""
    name: str = Field(..., description="User's full name")
    birthDate: str = Field(..., description="Birth date in YYYY-MM-DD format")
    birthTime: Optional[str] = Field(None, description="Birth time in HH:MM format (24-hour)")
    birthCity: str = Field(..., description="City of birth")
    focusArea: Optional[str] = Field(None, description="Current focus area or question")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "birthDate": "1990-01-15",
                "birthTime": "14:30",
                "birthCity": "New York",
                "focusArea": "career transition"
            }
        }


class JournalAnswerRequest(BaseModel):
    """Request model for answering journal prompts"""
    journalPrompt: str = Field(..., description="The journal question to answer")
    userInputs: Dict[str, Any] = Field(..., description="User context data")
    readingId: Optional[str] = Field(None, description="Associated reading ID")


class ReadingResponse(BaseModel):
    """Response model for readings"""
    headline: str
    coreTheme: str
    strengths: list[str]
    watchOuts: list[str]
    next7Days: list[str]
    journalPrompt: str
    disclaimer: str
    _metadata: Optional[Dict[str, Any]] = None


class JournalAnswerResponse(BaseModel):
    """Response model for journal answers"""
    answer: str


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    environment: str


# API Endpoints
@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {
        "message": "Pellucid Insights ADK Backend",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        environment=settings.environment
    )


@app.post("/api/adk/generate-reading", response_model=ReadingResponse)
async def generate_reading(request: ReadingRequest):
    """
    Generate a personalized astrological reading using multi-agent workflow
    
    This endpoint coordinates multiple specialized AI agents:
    1. Vedic Astrology Agent
    2. Numerology Agent
    3. Chinese Astrology Agent
    4. Pattern Synthesis Agent
    5. Response Refinement Agent
    6. Quality Validator Agent
    
    Returns a comprehensive reading in Pellucid's format.
    """
    try:
        logger.info(f"Generating reading for {request.name}")
        
        # Convert request to dict
        user_data = request.model_dump()
        
        # Run multi-agent workflow
        result = await run_reading_workflow(user_data)
        
        logger.info(f"Reading generated successfully for {request.name}")
        
        return ReadingResponse(**result)
        
    except Exception as e:
        logger.error(f"Error generating reading: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate reading: {str(e)}"
        )


@app.post("/api/adk/answer-prompt", response_model=JournalAnswerResponse)
async def answer_journal_prompt(request: JournalAnswerRequest):
    """
    Generate an answer to a journal prompt
    
    Uses a simplified workflow to provide thoughtful, reflective responses
    to user's journal questions.
    """
    try:
        logger.info(f"Answering journal prompt: {request.journalPrompt[:50]}...")
        
        # Run journal answer workflow
        answer = await run_journal_answer_workflow(
            request.journalPrompt,
            request.userInputs
        )
        
        logger.info("Journal answer generated successfully")
        
        return JournalAnswerResponse(answer=answer)
        
    except Exception as e:
        logger.error(f"Error answering journal prompt: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate answer: {str(e)}"
        )


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {
        "error": "Not Found",
        "message": "The requested endpoint does not exist",
        "path": str(request.url)
    }


@app.exception_handler(500)
async def internal_error_handler(request, exc):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return {
        "error": "Internal Server Error",
        "message": "An unexpected error occurred"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.environment == "development"
    )
