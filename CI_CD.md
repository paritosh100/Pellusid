# CI/CD Pipeline Documentation

This document explains the GitHub Actions CI/CD pipeline for Pellucid Insights.

## Overview

The CI/CD pipeline is designed to ensure code quality, security, and reliability across both the Next.js frontend and Python FastAPI backend. The pipeline includes:

- **Frontend CI**: Linting, type checking, building
- **Backend CI**: Linting, type checking, unit tests, integration tests, Docker builds
- **Integration Tests**: E2E tests across both frontend and backend
- **Dual Backend Tests**: Verify both OpenAI and ADK backends work correctly
- **Code Quality**: SonarQube, security scanning, CodeQL analysis
- **Deployment**: Automated deployment to Vercel (frontend) and Cloud Run (backend)

## Workflows

### 1. Frontend CI (`frontend-ci.yml`)

Runs on: Push to `[master, main, develop, insightbridge-agents]`, PRs to `[master, main, develop]`

**Steps:**
1. Install Node dependencies
2. Run ESLint
3. TypeScript type checking
4. Next.js build
5. NPM audit (security)
6. Secret scanning

**Artifacts:**
- Next.js build output (`.next/`)

**Status Badges:**
```markdown
[![Frontend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml)
```

### 2. Backend CI (`backend-ci.yml`)

Runs on: Push to `[master, main, develop, insightbridge-agents]`, PRs to `[master, main, develop]`

Tests across Python 3.10, 3.11, and 3.12.

**Steps:**

#### Test & Lint Job
1. Install Python dependencies
2. Flake8 linting
3. Black code formatting check
4. isort import ordering check
5. MyPy type checking
6. Pytest with coverage
7. Upload coverage to Codecov

#### Integration Tests Job
1. Start FastAPI backend on port 8080
2. Health check (`/health` endpoint)
3. Run smoke tests
4. Upload server logs

#### Docker Build Job
1. Build Docker image for Cloud Run deployment
2. Cache layers for faster builds

**Artifacts:**
- Test results (`.pytest_cache/`)
- Server logs (on failure)
- Coverage reports

**Status Badges:**
```markdown
[![Backend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml)
```

### 3. Integration Tests (`integration-tests.yml`)

Runs on: Every push, every PR, nightly at 2 AM UTC

Tests the complete system: frontend + backend + database.

**Services:**
- Supabase PostgreSQL (mocked with Docker)

**Steps:**
1. Install Node and Python dependencies
2. Build Next.js app
3. Start ADK backend on port 8080
4. Start Next.js on port 3000
5. Health checks for both servers
6. E2E tests with Playwright (if configured)
7. API endpoint tests
8. Backend switching tests (OpenAI fallback)

**Environment Variables:**
- `USE_ADK_BACKEND=true` (uses Google ADK)
- Fallback to `USE_ADK_BACKEND=false` (uses OpenAI)

**Artifacts:**
- Integration test logs
- API test logs

### 4. Dual Backend Tests (`dual-backend-tests.yml`)

Runs on: Changes to backend/API files

Specifically tests the feature flag system for switching between OpenAI and ADK backends.

**Jobs:**

#### Test OpenAI Backend
1. Build Next.js with `USE_ADK_BACKEND=false`
2. Start frontend server
3. Call `/api/generate-reading` endpoint
4. Verify response format

#### Test ADK Backend
1. Start FastAPI backend
2. Build Next.js with `USE_ADK_BACKEND=true`
3. Start frontend server
4. Call `/api/generate-reading` endpoint
5. Verify response format

#### Test Backend Switching
1. Verify feature flag can be toggled
2. Verify configuration loading
3. Verify API clients can switch

### 5. Code Quality (`code-quality.yml`)

Runs on: Every push and PR

**Tools:**
- SonarQube (if configured)
- Trivy (vulnerability scanning)
- Lighthouse (performance)
- CodeQL (code analysis)

**Steps:**
1. Trivy FS scan (dependency vulnerabilities)
2. Upload SARIF to GitHub Security tab
3. Lighthouse CI (if frontend is deployed)
4. CodeQL initialization and analysis

### 6. PR Checks (`pr-checks.yml`)

Runs on: PR opened/synchronized/reopened

**Validations:**
1. PR title format (conventional commits recommended)
2. Changelog entry check
3. Test coverage check
4. Breaking API changes detection
5. Large PR detection (>500 lines)
6. File change summary

### 7. Deploy (`deploy.yml`)

Runs on: Push to `master` or `main` (manual trigger available)

**Prerequisites:**
- All CI/CD workflows must pass
- Must be on main/master branch

**Steps:**

#### Deploy Frontend (Vercel)
1. Check all tests passed
2. Deploy to Vercel production
3. Set environment variables

#### Deploy Backend (Google Cloud)
1. Authenticate with GCP
2. Build Docker image
3. Push to Artifact Registry
4. Deploy to Cloud Run
5. Set environment variables

#### Smoke Tests
1. Test production frontend (`https://insightbridge.app/`)
2. Test production backend health check
3. Run production smoke tests

#### Notifications
1. Send Slack notification on success

**Secrets Required:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `GCP_SA_KEY`
- `GCP_PROJECT_ID`
- `SLACK_WEBHOOK_URL`

## GitHub Secrets Configuration

The following secrets must be set in GitHub repository settings:

### API Keys
```
OPENAI_API_KEY              # OpenAI API key (sk-...)
GOOGLE_API_KEY              # Google Generative AI key (AIza...)
```

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL                # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY           # Supabase public key
SUPABASE_SERVICE_ROLE_KEY               # Supabase service role key
```

### Deployment (Vercel)
```
VERCEL_TOKEN                # Vercel API token
VERCEL_ORG_ID               # Vercel organization ID
VERCEL_PROJECT_ID           # Vercel project ID
```

### Cloud Run/GCP
```
GCP_PROJECT_ID              # Google Cloud Project ID
GCP_SA_KEY                  # Service Account JSON key (base64 encoded)
DATABASE_URL                # Cloud SQL or Supabase connection string
ADK_BACKEND_URL             # Cloud Run backend URL
```

### Code Quality
```
SONAR_HOST_URL              # SonarQube host (optional)
SONAR_TOKEN                 # SonarQube token (optional)
```

### Notifications
```
SLACK_WEBHOOK_URL           # Slack webhook for deployment notifications
GITHUB_TOKEN                # GitHub token (auto-provided)
```

## Running Tests Locally

### Using Make

```bash
# Install everything
make install

# Run all tests
make test

# Run specific tests
make test-frontend
make test-backend
make test-integration

# Code quality checks
make lint
make type-check

# Development
make dev
make dev-adk              # With ADK backend
```

### Manual

#### Frontend Tests
```bash
# Install dependencies
npm install

# Lint and type check
npm run lint
npx tsc --noEmit

# Build
npm run build

# Run tests (if configured)
npm run test

# Run E2E tests (if configured)
npm run test:e2e
```

#### Backend Tests
```bash
# Navigate to backend
cd adk-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate    # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/ -v

# With coverage
pytest tests/ --cov=. --cov-report=html

# Smoke tests
python smoke_test.py

# Run specific test
pytest tests/test_api.py::test_generate_reading_normal_mode -v

# Integration tests
pytest tests/ -v -m integration
```

## Continuous Deployment Flow

```
Feature Branch
    ↓
    ├→ Frontend CI (Pass/Fail)
    ├→ Backend CI (Pass/Fail)
    ├→ Integration Tests (Pass/Fail)
    ├→ Code Quality (Pass/Fail)
    ├→ PR Checks (Info)
    ↓
Pull Request Review
    ↓
Merge to Main/Master
    ↓
    ├→ All workflows run again
    ├→ Deploy to Vercel (Frontend)
    ├→ Deploy to Cloud Run (Backend)
    ├→ Production Smoke Tests
    ├→ Slack Notification
    ↓
Production (insightbridge.app)
```

## Troubleshooting

### Frontend CI Fails

**Issue:** TypeScript type errors
```
Solution: Run npx tsc --noEmit locally and fix errors
```

**Issue:** ESLint errors
```
Solution: Run npm run lint locally and fix issues
```

**Issue:** Build fails
```
Solution: Check .next.config.ts, ensure all imports are correct
```

### Backend CI Fails

**Issue:** Import errors
```
Solution: Add adk-backend to PYTHONPATH: export PYTHONPATH=/path/to/adk-backend
```

**Issue:** Missing dependencies
```
Solution: pip install -r requirements.txt (ensure virtual env is activated)
```

**Issue:** Tests fail due to GOOGLE_API_KEY
```
Solution: Set GOOGLE_API_KEY in .env or as environment variable
```

### Integration Tests Timeout

**Issue:** Server takes too long to start
```
Solution: Increase sleep duration in workflow, check system resources
```

**Issue:** Port 8080 or 3000 already in use
```
Solution: Kill existing processes: lsof -i :8080 | kill -9 $PID
```

### Deployment Fails

**Issue:** Secrets not configured
```
Solution: Set all required secrets in GitHub repository settings
```

**Issue:** Cloud Run service doesn't start
```
Solution: Check Cloud Run logs: gcloud run logs read pellucid-adk-backend
```

**Issue:** Vercel deployment rejected
```
Solution: Check Vercel logs, ensure build succeeds locally
```

## Performance Optimization

### Caching

Workflows use GitHub Actions cache:
- `npm` dependencies cached in `node_modules`
- `pip` dependencies cached via `setup-python`
- Docker build layers cached via Buildx

### Parallel Execution

- Backend CI tests run across Python 3.10, 3.11, 3.12 in parallel
- Frontend and Backend CI run independently
- Integration tests run only after both pass

### Conditional Execution

- Docker build runs only on backend changes
- Frontend tests skip on backend-only changes
- E2E tests skip if Playwright not configured

## Monitoring & Debugging

### View Workflow Status

1. Go to **Actions** tab in GitHub
2. Select workflow (e.g., "Frontend CI")
3. Click on a run to see detailed logs

### Common Log Locations

- **Frontend build errors**: "Build Next.js application" step
- **Backend test failures**: "Run pytest with coverage" step
- **Integration test issues**: "Start ADK backend server" or "Test /api/generate-reading" steps
- **Deployment issues**: "Deploy to Vercel" or "Deploy to Cloud Run" steps

### View Artifacts

1. Go to workflow run page
2. Scroll to bottom: "Artifacts" section
3. Download logs, coverage reports, or build output

### GitHub Actions Dashboard

- Workflow status at repo homepage
- Click on status icon to see details
- Each job shows duration and pass/fail status

## Best Practices

1. **Commit messages**: Use conventional commits format (feat:, fix:, docs:, etc.)
2. **PR titles**: Keep under 80 characters, describe the change
3. **Tests**: Add tests for new features (catch failures before merge)
4. **Secrets**: Never commit `.env` files or API keys
5. **Large PRs**: Break into smaller PRs (<500 lines) for faster reviews
6. **Branches**: Create feature branches from `develop`, merge to `main` via PR

## Future Improvements

- [ ] E2E tests with Playwright
- [ ] Performance benchmarks (Lighthouse)
- [ ] Load testing (k6)
- [ ] Automated dependency updates (Dependabot)
- [ ] Coverage reports with badges
- [ ] Slack notifications for test failures
- [ ] Rollback automation on deployment failure
- [ ] Blue-green deployment strategy

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Google Cloud Run](https://cloud.google.com/run/docs)
- [pytest Documentation](https://docs.pytest.org/)
- [Next.js Testing](https://nextjs.org/docs/testing)
