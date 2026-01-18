# Quick Start Guide - Google ADK Backend

## Prerequisites

1. **Python 3.11+** installed
2. **Google Cloud account** with $300 credits
3. **Gemini API key** from Google AI Studio

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

## Step 2: Set Up ADK Backend

```bash
# Navigate to ADK backend directory
cd adk-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# or
cp .env.example .env    # Mac/Linux

# Edit .env and add your Gemini API key
# GOOGLE_API_KEY=your_actual_api_key_here
```

## Step 3: Test ADK Backend Locally

```bash
# Start the FastAPI server
uvicorn main:app --reload --port 8080

# In another terminal, test the health endpoint
curl http://localhost:8080/health

# Test with sample data
curl -X POST http://localhost:8080/api/adk/generate-reading \
  -H "Content-Type: application/json" \
  -d @test_data/sample_request.json
```

## Step 4: Configure Next.js Frontend

```bash
# Navigate to Next.js app
cd ../pellucid-insights

# Update .env.local
# Add these lines:
USE_ADK_BACKEND=true
ADK_BACKEND_URL=http://localhost:8080
```

## Step 5: Test End-to-End

```bash
# Start Next.js dev server
npm run dev

# Open browser to http://localhost:3000
# Submit a reading request
# Should now use ADK backend!
```

## Switching Between Backends

To switch back to OpenAI:
```bash
# In pellucid-insights/.env.local
USE_ADK_BACKEND=false
```

To use ADK:
```bash
USE_ADK_BACKEND=true
```

## Troubleshooting

### "Module not found" errors
```bash
cd adk-backend
pip install -r requirements.txt
```

### "Connection refused" errors
Make sure ADK backend is running:
```bash
cd adk-backend
uvicorn main:app --reload --port 8080
```

### "API key not configured"
Check your `.env` file in `adk-backend/`:
```bash
GOOGLE_API_KEY=your_actual_key_here
```

## Next Steps

- Deploy to Google Cloud Run (see README.md)
- Add caching for better performance
- Monitor costs in Google Cloud Console
- A/B test ADK vs OpenAI outputs
