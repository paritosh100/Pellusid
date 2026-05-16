# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Pellucid Insights** is a dual-backend application that generates personalized life-pattern insights using AI. The frontend is a Next.js application with two interchangeable backend systems:
- **OpenAI backend**: Single GPT-4o-mini call (fast, low-cost)
- **Google ADK backend**: Multi-agent orchestration with Gemini 2.0 Flash (deeper analysis, quality validation loop)

The application stores readings, feedback, and analytics in Supabase PostgreSQL.

## Architecture & Key Concepts

### Dual-Backend Design

The backend is selected via a feature flag (`USE_ADK_BACKEND`):

```
Frontend (Next.js) → API Routes → [Feature Flag Decision]
                                  ├→ OpenAI backend (direct LLM call) OR
                                  └→ Google ADK backend (FastAPI service on localhost:8080 or Cloud Run)
                                      └→ Multi-agent orchestration (6 agents, 3 phases)
                                      └→ Supabase storage
```

**Cost/latency tradeoff:**
- OpenAI: ~$0.0003/reading, 2-3 sec latency, simple but generic
- ADK: ~$0.01/reading, 8-12 sec latency, rich analysis with quality validation

**Feature flag config** (`.env.local`):
```
USE_ADK_BACKEND=true                              # or false
ADK_BACKEND_URL=http://localhost:8080            # for local dev
```

### Backend Architectures

#### OpenAI Backend (TypeScript/JavaScript)
- **File**: `lib/openai.ts`
- **Flow**: Single prompt call → GPT-4o-mini → Defensive JSON parsing
- **Output schema**: `ReadingResponse` (headline, coreTheme, strengths, watchOuts, next7Days, journalPrompt, disclaimer)

#### Google ADK Backend (Python FastAPI)
- **Entry point**: `adk-backend/main.py` (FastAPI app on port 8080)
- **Orchestration**: `adk-backend/agents/orchestrator.py`
- **Phase 1 (parallel)**: 3 specialized agents
  - Vedic Astrology Agent (Swiss Ephemeris calculations)
  - Numerology Agent (life path, expression numbers)
  - Chinese Astrology Agent (zodiac animal, element)
- **Phase 2**: Pattern Synthesis Agent (gemini-2.0-flash-thinking for extended reasoning)
- **Phase 3 (max 2 loops)**: Response Refinement → Quality Validator → Repeat if validation fails
- **New agents** (in progress):
  - `agents/reading_agent.py`: Produces readings (absorbs Next.js `/api/generate-reading`)
  - `agents/bridge_agent.py`: Handles bridge report generation and chat
  - `agents/hybrid_orchestrator.py`: Hybrid system coordination
- **Tools**:
  - `tools/ayurveda_tools.py`
  - `tools/lunar_tools.py`
  - `tools/tarot_tools.py`
- **Storage**: `storage/supabase.py` (Supabase PostgreSQL operations)

### Data Models

**User Input Schema** (validated in both frontends):
```typescript
{
  name: string;           // Max 100 chars
  birthDate: string;      // YYYY-MM-DD
  birthTime?: string;     // HH:mm (optional)
  birthCity: string;      // Max 100 chars
  focusArea?: string;     // Max 200 chars (optional)
}
```

**Reading Response** (both backends produce same schema):
```typescript
{
  headline: string;               // 6-12 words
  coreTheme: string;              // 2-3 sentences, empathetic
  strengths: string[];            // Exactly 3 items, ≤12 words each
  watchOuts: string[];            // Exactly 2 items, ≤12 words each
  next7Days: string[];            // Exactly 3 verb-led items, ≤10 words
  journalPrompt: string;          // Single reflective question
  disclaimer: string;             // Reminder this is a lens, not truth
  _metadata?: {...}               // ADK only: systems analyzed, model used
}
```

**Database** (Supabase PostgreSQL):
- `readings`: Generated readings with user inputs
- `reading_feedback`: User feedback (5-star, text, section reactions)
- `journal_answers`: AI-generated journal responses
- `analytics_events`: User interactions (reading_generated, feedback_submitted, journal_answered)

## Development Commands

### Frontend (Next.js)

```bash
# Install dependencies (from pellucid-insights root)
npm install

# Development server (uses OpenAI by default)
npm run dev          # Runs on http://localhost:3000

# With ADK backend enabled (requires backend running on 8080)
# Edit .env.local: USE_ADK_BACKEND=true
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Linting
npm run lint
```

### Backend (Python FastAPI)

```bash
# Navigate to adk-backend
cd adk-backend

# Create/activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Development server (hot reload)
uvicorn main:app --reload --port 8080

# Run tests
pytest                     # All tests
pytest tests/ -v           # Verbose
pytest -k test_name        # Single test
pytest --cov               # With coverage

# Run smoke test (checks all agent phases)
python smoke_test.py
```

### Environment Setup

**Frontend** (`.env.local`):
```bash
# Required
OPENAI_API_KEY=sk-...

# Backend selection
USE_ADK_BACKEND=false                           # or true
ADK_BACKEND_URL=http://localhost:8080

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Optional
OPENAI_MODEL=gpt-4o-mini  # Default if not specified
```

**Backend** (`adk-backend/.env`):
```bash
GOOGLE_API_KEY=AIza...
ENVIRONMENT=development
ENABLE_CACHING=true
```

## File Structure (Key Files)

```
pellucid-insights/
├── app/
│   ├── api/
│   │   ├── generate-reading/route.ts        ← Main reading endpoint (will absorb to backend)
│   │   ├── answer-prompt/route.ts           ← Journal response endpoint
│   │   ├── bridge/generate-report/route.ts  ← Bridge report endpoint
│   │   └── bridge/chat/route.ts             ← Bridge chat endpoint
│   ├── page.tsx                             ← Home form (client component)
│   └── result/page.tsx                      ← Results page (server component)
├── components/                              ← React components (mostly client)
├── lib/
│   ├── openai.ts                            ← OpenAI client + system/user prompts
│   ├── adk-client.ts                        ← ADK backend HTTP client
│   ├── types.ts                             ← TypeScript interfaces
│   └── utils.ts                             ← Utilities (validation, parsing)
└── middleware.ts                            ← Supabase auth middleware

adk-backend/
├── main.py                                  ← FastAPI app entry point
├── agents/
│   ├── orchestrator.py                      ← Phase orchestration (Vedic→Numerology→Chinese→Synthesis→Refinement)
│   ├── specialized_agents.py                ← 3 specialized agents + synthesis
│   ├── reading_agent.py                     ← NEW: produces final readings
│   ├── bridge_agent.py                      ← NEW: bridge functionality
│   ├── fusion_agent.py                      ← NEW: multi-system fusion
│   └── hybrid_orchestrator.py               ← NEW: hybrid system coordination
├── config/
│   ├── settings.py                          ← Pydantic settings (env vars, model configs)
│   └── prompts.py                           ← System prompts for all agents
├── schemas/
│   ├── reading.py                           ← Reading request/response schemas
│   └── bridge.py                            ← Bridge schemas
├── tools/
│   ├── ayurveda_tools.py                    ← NEW: Ayurvedic system tools
│   ├── lunar_tools.py                       ← NEW: Lunar cycle tools
│   ├── tarot_tools.py                       ← NEW: Tarot divination tools
│   └── [existing tools]                     ← Vedic, numerology, Chinese astrology
├── storage/
│   └── supabase.py                          ← Database operations
├── tests/                                    ← Unit + integration tests
├── requirements.txt                         ← Python dependencies
└── Dockerfile                               ← Cloud Run deployment
```

## Important Patterns & Constraints

### Content Guidelines

The reading generator is **constrained to avoid certain language**:

✅ **Allowed**:
- Patterns, tendencies, cycles, signals, reflection
- Concrete actions and examples
- Personalized references (name, city context)

❌ **Prohibited** (these must never appear in readings):
- Astrology, zodiac, horoscope, sign, planets, houses
- Absolute claims or predictions ("you will...", "definitely...")
- Medical, legal, or financial advice

**Enforcement**: System prompts explicitly ban these terms. Quality validator agent checks for violations.

### Server/Client Boundaries

**Strict rule**: All API key operations happen on the server.

- ✅ API calls (OpenAI, Gemini, Supabase) happen in Next.js API routes or FastAPI backend
- ✅ Next.js API routes read `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` (never exposed to client)
- ❌ Client code never sees API keys or makes direct external API calls

### Dynamic Rendering

All reading-related pages use `export const dynamic = "force-dynamic"` to prevent static generation (readings are user-specific, not cacheable).

### Error Handling

Both backends use **defensive parsing**:
- OpenAI response: Strip markdown code fences before JSON parsing
- ADK response: Validate schemas with Pydantic, re-call on validation failure (max 2 loops)
- Client: Graceful fallbacks, no throwing on malformed responses

## Development Workflows

### Testing the Dual-Backend Feature Flag

```bash
# Terminal 1: Backend (if testing ADK)
cd adk-backend
uvicorn main:app --reload --port 8080

# Terminal 2: Frontend
cd pellucid-insights
# Edit .env.local: USE_ADK_BACKEND=true or false
npm run dev
```

**Test flow**:
1. Fill out home form (name, birthDate, birthCity)
2. Submit → generates reading using selected backend
3. Redirect to `/result?rid={readingId}`
4. Verify reading content + metadata

### Adding a New Agent

1. Create agent file in `adk-backend/agents/[agent_name].py`
2. Define system prompt in `adk-backend/config/prompts.py`
3. Implement tool functions in `adk-backend/tools/[tools].py`
4. Call from orchestrator (`agents/orchestrator.py`) with proper error handling
5. Validate output matches `ReadingResponse` schema
6. Add tests in `adk-backend/tests/`

**Example pattern** (from existing agents):
```python
@tool
def tool_name(param: str) -> dict:
    """Tool description visible to agent."""
    # Implementation
    return {"result": "..."}

async def some_agent(user_data: dict) -> dict:
    client = genai.GenerativeAI(api_key=...)
    model = client.agentic.Model(...)
    response = await model.process_tool_call(...)
    return {"insight": "..."}
```

### Running a Single Test

```bash
# From adk-backend/
pytest tests/test_agents.py::test_vedic_agent -v
pytest tests/test_orchestrator.py -v --cov adk-backend
```

### Checking Smoke Tests

The `smoke_test.py` validates all phases of the ADK orchestration:
```bash
cd adk-backend
python smoke_test.py
```

Looks for successful execution of Vedic, Numerology, Chinese, Synthesis, Refinement, and Validation phases.

## Deployment

### Frontend (Vercel)

Push to GitHub → Vercel automatically deploys. Environment variables set in Vercel dashboard.

### Backend (Google Cloud Run)

```bash
cd adk-backend
gcloud builds submit --config cloudbuild.yaml

# Or manually with Docker:
docker build -t pellucid-adk .
docker run -p 8080:8080 -e GOOGLE_API_KEY=... pellucid-adk
```

Endpoint: `https://pellucid-adk-backend-xyz.run.app/health` (check status)

## Common Debugging

### "OPENAI_API_KEY environment variable is required"
- Check `.env.local` exists in pellucid-insights root
- Check key format starts with `sk-`

### ADK backend returns 500 error
- Check backend is running: `curl http://localhost:8080/health`
- Check `.env` in adk-backend/ has `GOOGLE_API_KEY`
- Check Python dependencies: `pip install -r requirements.txt`
- Run smoke test: `python smoke_test.py`

### Reading appears generic/low quality
- If using OpenAI: Likely the prompt lacks context (try filling all fields including focusArea)
- If using ADK: Might be validation loop failing silently (check Cloud Run logs)
- Check content guidelines aren't being violated (no absolute claims, no medical advice)

### Supabase auth not working
- Check `NEXT_PUBLIC_SUPABASE_URL` and keys in `.env.local`
- Check RLS policies allow the operation (readings table should allow authenticated users)
- Check user is logged in: `supabase.auth.getSession()`

## Current Branch Context

**Branch**: `insightbridge-agents`

This branch adds new agents and evolves the backend:
- New reading/bridge agent architecture
- New tools (tarot, lunar, ayurveda)
- Hybrid orchestration system
- Integration with existing ADK multi-agent pipeline

When modifying:
- Preserve backward compatibility with existing `/adk/reading` endpoint
- Follow the `ReadingResponse` output schema strictly
- Test both `USE_ADK_BACKEND=true` and `false` modes
- Keep prompts in `config/prompts.py` (not hardcoded in agents)

## Related Documentation

- `README.md`: Feature overview, installation, API reference
- `ARCHITECTURE.md`: Deep dive on both backends, phase workflows, cost/latency analysis
- `PROJECT_STRUCTURE.md`: Detailed file-by-file breakdown
- `A_B.md`: A/B testing framework
- `.env.local.example`: Environment variable template
