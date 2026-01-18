# Pellucid Insights - Project Structure

> 📖 **For detailed architecture documentation**, see [ARCHITECTURE.md](file:///d:/Python_practice/Pellucid/ARCHITECTURE.md)

This project now supports **two backend architectures**:

1. **OpenAI Single-Agent** (original)
2. **Google ADK Multi-Agent** (new)

## Directory Structure

```
Pellucid/
├── pellucid-insights/          # Next.js frontend + OpenAI backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-reading/
│   │   │   │   └── route.ts    # ✨ Supports both backends via feature flag
│   │   │   └── answer-prompt/
│   │   │       └── route.ts    # ✨ Supports both backends via feature flag
│   │   ├── page.tsx
│   │   ├── result/
│   │   └── ...
│   ├── lib/
│   │   ├── openai.ts           # OpenAI client (original)
│   │   ├── adk-client.ts       # ✨ NEW: ADK client
│   │   ├── storage.ts
│   │   └── ...
│   ├── .env.local.example      # ✨ Updated with ADK config
│   └── ...
│
└── adk-backend/                # ✨ NEW: Google ADK multi-agent system
    ├── agents/
    │   ├── orchestrator.py     # Main workflow coordinator
    │   ├── specialized_agents.py # 6 specialized agents
    │   └── __init__.py
    ├── tools/
    │   ├── astrology_tools.py  # Vedic calculations (Swiss Ephemeris)
    │   ├── numerology_tools.py # Numerology calculations
    │   ├── chinese_astrology_tools.py # Chinese zodiac
    │   └── __init__.py
    ├── config/
    │   ├── settings.py         # Environment configuration
    │   ├── prompts.py          # Agent system prompts
    │   └── __init__.py
    ├── test_data/
    │   └── sample_request.json
    ├── main.py                 # FastAPI application
    ├── requirements.txt
    ├── Dockerfile
    ├── cloudbuild.yaml
    ├── README.md
    ├── QUICKSTART.md
    └── .env.example
```

## Backend Comparison

| Feature | OpenAI Backend | ADK Backend |
|---------|----------------|-------------|
| **Architecture** | Single LLM call | 6 specialized agents |
| **Model** | GPT-4o-mini | Gemini 2.0 Flash + Thinking |
| **Cost/Reading** | $0.0003 | $0.009-0.017 (optimized) |
| **Latency** | ~2-3 seconds | ~8-12 seconds |
| **Depth** | Generic insights | Multi-system cross-analysis |
| **Calculations** | None | Real birth charts, numerology |
| **Quality Loop** | No | Yes (validator + refinement) |

## Feature Flag System

Both backends are always available. Switch between them using environment variables:

### Use OpenAI (default)
```bash
# In pellucid-insights/.env.local
USE_ADK_BACKEND=false
```

### Use Google ADK
```bash
# In pellucid-insights/.env.local
USE_ADK_BACKEND=true
ADK_BACKEND_URL=http://localhost:8080  # or your Cloud Run URL
```

## Development Workflow

### Option 1: OpenAI Only (Simple)
```bash
cd pellucid-insights
npm run dev
# Uses OpenAI backend automatically
```

### Option 2: ADK Backend (Advanced)
```bash
# Terminal 1: Start ADK backend
cd adk-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --port 8080

# Terminal 2: Start Next.js
cd pellucid-insights
USE_ADK_BACKEND=true npm run dev
```

## Deployment

### Next.js Frontend
- Deploy to Vercel (existing setup)
- Set `USE_ADK_BACKEND=true` in Vercel environment variables if using ADK

### ADK Backend
- Deploy to Google Cloud Run:
  ```bash
  cd adk-backend
  gcloud builds submit --config cloudbuild.yaml
  ```
- Update `ADK_BACKEND_URL` in Vercel to Cloud Run URL

## Cost Management

- **Free tier**: Gemini offers 1,000 requests/day free
- **Your credits**: $300 covers 3-34 months depending on usage
- **Monitoring**: Check Google Cloud Console for API usage

## Next Steps

1. **Test locally**: Follow `adk-backend/QUICKSTART.md`
2. **Compare outputs**: Generate same reading with both backends
3. **Deploy ADK**: When ready, deploy to Cloud Run
4. **A/B test**: Use feature flag to test with real users
