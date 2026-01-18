# Pellucid Insights - Google ADK Backend

Multi-agent AI system using Google's Agent Development Kit (ADK) for generating personalized astrological insights.

## Architecture

This backend implements a **deep agent architecture** with specialized agents:

- **Orchestrator Agent**: Routes requests and coordinates workflow
- **Vedic Astrology Agent**: Analyzes birth charts, planetary positions, dashas
- **Numerology Agent**: Calculates life path numbers and patterns
- **Chinese Astrology Agent**: Determines zodiac signs and elements
- **Pattern Synthesis Agent**: Cross-references insights from all systems
- **Response Refinement Agent**: Ensures grounded, calm tone
- **Quality Validator Agent**: Validates output quality with iterative loops

## Directory Structure

```
adk-backend/
├── agents/              # Agent implementations
│   ├── orchestrator.py
│   ├── vedic_agent.py
│   ├── numerology_agent.py
│   ├── chinese_agent.py
│   ├── synthesis_agent.py
│   ├── refinement_agent.py
│   └── validator_agent.py
├── tools/               # Agent tools and utilities
│   ├── astrology_tools.py
│   ├── numerology_tools.py
│   └── cache.py
├── config/              # Configuration
│   ├── prompts.py
│   └── settings.py
├── main.py              # FastAPI application
├── requirements.txt
├── Dockerfile
└── README.md
```

## Setup

### Prerequisites
- Python 3.11+
- Google Cloud account with Gemini API access
- $300 Google Cloud credits (or API key)

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Configuration

Create `.env` file:

```bash
GOOGLE_API_KEY=your_gemini_api_key_here
ENVIRONMENT=development
ENABLE_CACHING=true
```

### Run Locally

```bash
# Start FastAPI server
uvicorn main:app --reload --port 8080

# Server will be available at http://localhost:8080
# API docs at http://localhost:8080/docs
```

## API Endpoints

### Generate Reading
```http
POST /api/adk/generate-reading
Content-Type: application/json

{
  "name": "John Doe",
  "birthDate": "1990-01-15",
  "birthTime": "14:30",
  "birthCity": "New York",
  "focusArea": "career"
}
```

### Health Check
```http
GET /health
```

## Integration with Next.js

The Next.js frontend can switch between OpenAI and ADK backends using feature flags:

```typescript
// In .env.local
USE_ADK_BACKEND=true
ADK_BACKEND_URL=http://localhost:8080
```

## Deployment

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --config cloudbuild.yaml

# Or manually
docker build -t gcr.io/PROJECT_ID/pellucid-adk-backend .
docker push gcr.io/PROJECT_ID/pellucid-adk-backend
gcloud run deploy pellucid-adk-backend \
  --image gcr.io/PROJECT_ID/pellucid-adk-backend \
  --region us-central1 \
  --allow-unauthenticated
```

## Cost Optimization

- **Free Tier**: Gemini offers 1,000 requests/day free
- **Caching**: Enabled by default for deterministic calculations
- **Model Selection**: Uses Flash-Lite/Flash for most agents, Pro only when needed
- **Expected Cost**: $0.009-0.017 per reading (optimized)

## Testing

```bash
# Run unit tests
pytest tests/ -v

# Run integration tests
pytest tests/integration/ -v

# Test single endpoint
curl -X POST http://localhost:8080/api/adk/generate-reading \
  -H "Content-Type: application/json" \
  -d @test_data/sample_request.json
```

## Monitoring

- Cloud Run logs: `gcloud run logs read pellucid-adk-backend`
- Metrics: Available in Google Cloud Console
- Error tracking: Integrated with Cloud Logging

## Development

### Adding New Agents

1. Create agent file in `agents/`
2. Define agent configuration with model, instructions, tools
3. Register in orchestrator workflow
4. Add tests in `tests/`

### Adding New Tools

1. Create tool function in `tools/`
2. Decorate with `@tool` or use `FunctionTool`
3. Add to relevant agent's tool list
4. Document parameters and return types

## License

Private - Pellucid Insights
