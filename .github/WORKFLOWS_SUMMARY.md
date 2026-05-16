# GitHub Actions Workflows Summary

Quick reference for all CI/CD workflows in this repository.

## Workflows at a Glance

| Workflow | Trigger | Purpose | Duration |
|----------|---------|---------|----------|
| **Frontend CI** | Push, PR | Lint, type-check, build Next.js | 5-10 min |
| **Backend CI** | Push, PR | Lint, test, coverage, Docker build | 10-15 min |
| **Integration Tests** | Push, PR, Nightly | E2E tests across full stack | 15-20 min |
| **Dual Backend Tests** | Backend changes | Verify OpenAI & ADK switching | 10-15 min |
| **Code Quality** | Push, PR | SonarQube, Trivy, CodeQL | 10-15 min |
| **PR Checks** | PR opened | Title validation, changelog check | 2-5 min |
| **Deploy** | main branch | Deploy to Vercel & Cloud Run | 10-15 min |

## Workflow Details

### 1️⃣ Frontend CI
**File:** `.github/workflows/frontend-ci.yml`

Runs linting, type checking, and builds the Next.js application.

**Triggers:**
- Push to `[master, main, develop, insightbridge-agents]`
- PR to `[master, main, develop]`
- File paths: `app/`, `components/`, `lib/`, `package.json`, config files

**Jobs:**
1. **build-and-lint** (Node 18.x, 20.x)
   - ESLint
   - TypeScript compilation
   - Next.js build
   
2. **security-scan**
   - npm audit
   - Trufflehog (secret scanning)

**Status Badge:**
```markdown
![Frontend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml/badge.svg)
```

---

### 2️⃣ Backend CI
**File:** `.github/workflows/backend-ci.yml`

Tests and validates the Python FastAPI backend.

**Triggers:**
- Push to `[master, main, develop, insightbridge-agents]`
- PR to `[master, main, develop]`
- File path: `adk-backend/`

**Jobs:**
1. **test-and-lint** (Python 3.10, 3.11, 3.12)
   - Flake8 linting
   - Black formatting check
   - isort import check
   - MyPy type checking
   - Pytest with coverage
   - Upload to Codecov

2. **integration-tests**
   - Start FastAPI server
   - Health check
   - Run smoke tests
   - Upload logs

3. **docker-build**
   - Build Docker image
   - Cache layers

**Status Badge:**
```markdown
![Backend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml/badge.svg)
```

---

### 3️⃣ Integration Tests
**File:** `.github/workflows/integration-tests.yml`

End-to-end tests across frontend, backend, and database.

**Triggers:**
- Every push
- Every PR
- Nightly at 2 AM UTC

**Services:**
- Supabase PostgreSQL (Docker)

**Jobs:**
1. **integration**
   - Build Next.js
   - Start FastAPI backend
   - Start Next.js frontend
   - Health checks
   - API endpoint tests
   - Backend fallback tests

2. **api-contract-tests**
   - Start backend server
   - Run contract tests
   - Verify API schemas

**Status Badge:**
```markdown
![Integration Tests](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/integration-tests.yml/badge.svg)
```

---

### 4️⃣ Dual Backend Tests
**File:** `.github/workflows/dual-backend-tests.yml`

Verifies the feature flag system for switching between backends.

**Triggers:**
- Backend/API file changes
- Push to main branches
- PRs to main branches

**Jobs:**
1. **test-openai-backend**
   - Build with `USE_ADK_BACKEND=false`
   - Test OpenAI endpoint

2. **test-adk-backend**
   - Start ADK backend
   - Build with `USE_ADK_BACKEND=true`
   - Test ADK endpoint

3. **test-backend-switching**
   - Verify feature flag toggling
   - Config validation

4. **summary**
   - Print results summary

**Status Badge:**
```markdown
![Dual Backend Tests](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/dual-backend-tests.yml/badge.svg)
```

---

### 5️⃣ Code Quality
**File:** `.github/workflows/code-quality.yml`

Advanced code analysis and security scanning.

**Triggers:**
- Push to `[master, main, develop]`
- Every PR

**Jobs:**
1. **sonarqube** (optional)
   - SonarQube code scanning

2. **dependency-check**
   - Trivy vulnerability scan
   - SARIF upload to GitHub

3. **lighthouse** (optional)
   - Performance audit
   - Accessibility check

4. **codeql-analysis** (JavaScript, Python)
   - CodeQL database generation
   - Security pattern detection

**Status Badge:**
```markdown
![Code Quality](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/code-quality.yml/badge.svg)
```

---

### 6️⃣ PR Checks
**File:** `.github/workflows/pr-checks.yml`

Automated checks for pull request quality.

**Triggers:**
- PR opened, synchronized, or reopened

**Jobs:**
1. **pr-validation**
   - Check title format
   - Changelog validation
   - Test coverage check

2. **diff-check**
   - Analyze file changes
   - Detect breaking changes
   - Estimate review effort

3. **required-checks**
   - Summary of checks

**Status Badge:**
```markdown
![PR Checks](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/pr-checks.yml/badge.svg)
```

---

### 7️⃣ Deploy
**File:** `.github/workflows/deploy.yml`

Production deployment to Vercel and Google Cloud Run.

**Triggers:**
- Push to `[master, main]`
- Manual trigger (`workflow_dispatch`)

**Prerequisites:**
- ✅ All CI/CD workflows passed
- ✅ Branch protection rules satisfied

**Jobs:**
1. **check-tests-passed**
   - Verify status checks

2. **deploy-frontend**
   - Deploy to Vercel (production)
   - Set environment variables

3. **deploy-backend**
   - Build Docker image
   - Push to Artifact Registry
   - Deploy to Cloud Run
   - Set environment variables

4. **smoke-test-production**
   - Test frontend health
   - Test backend health
   - Run smoke tests

5. **notify-deployment**
   - Send Slack notification

**Status Badge:**
```markdown
![Deploy](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/deploy.yml/badge.svg)
```

---

## Quick Start

### View Workflow Status
1. Go to **Actions** tab
2. Click on workflow name
3. Click on specific run
4. View logs and artifacts

### Trigger Manually
```bash
# Deploy workflow (if configured)
gh workflow run deploy.yml -r main

# Specific backend CI
gh workflow run backend-ci.yml -r develop
```

### View Logs
```bash
# List recent workflow runs
gh run list

# View specific run logs
gh run view <RUN_ID> --log
```

### Debug Workflow
1. Click on failed job
2. Expand steps to see detailed output
3. Check "Run" sections for commands
4. Look for error messages

## Environment Variables

### In Workflows
Set via repository secrets (Settings → Secrets → Actions):
```
OPENAI_API_KEY
GOOGLE_API_KEY
NEXT_PUBLIC_SUPABASE_URL
...
```

### Accessing in Workflows
```yaml
env:
  MY_VAR: ${{ secrets.MY_SECRET }}
```

## Artifacts

Workflows generate artifacts (logs, reports):
1. Go to workflow run
2. Scroll to "Artifacts" section
3. Download zip file
4. Extract and view

**Common artifacts:**
- `.next/` - Next.js build
- `pytest-results/` - Python test results
- Coverage reports (`.coverage`, `htmlcov/`)
- Server logs

## Caching

Workflows cache dependencies:
- **npm**: `node_modules/`
- **pip**: Python packages via `setup-python`
- **Docker**: Build layers via Buildx

Speed up subsequent runs:
- Same `package-lock.json` = cache hit
- Same `requirements.txt` = cache hit
- Different = cache miss (full install)

## Timeouts

Default timeouts:
- Frontend CI: 10 minutes
- Backend CI: 15 minutes
- Integration tests: 30 minutes
- Deploy: 30 minutes

Increase if needed in workflow YAML:
```yaml
jobs:
  slow-job:
    runs-on: ubuntu-latest
    timeout-minutes: 60
```

## Status Checks

All workflows become "status checks" on PRs.

**Required status checks** (must pass before merge):
- See `.github/BRANCH_PROTECTION.md`

**Optional status checks** (visible but not required):
- code-quality / sonarqube
- code-quality / lighthouse

## Common Issues

| Issue | Solution |
|-------|----------|
| Workflow won't run | Check trigger conditions and file paths |
| Secret not found | Verify secret is set in Settings → Secrets |
| Build fails locally but passes in CI | Check for platform differences (Windows vs Linux) |
| Long workflow duration | Check for parallel jobs, cache configuration |
| Port already in use | Ensure cleanup between workflow runs |

## Viewing Results

### GitHub Web UI
- **Actions** tab → Select workflow → Click run → View logs

### CLI
```bash
gh run list --workflow frontend-ci.yml
gh run view <RUN_ID> --log
gh run download <RUN_ID> --dir ./artifacts
```

### Local Debugging
Run workflow locally using **act**:
```bash
brew install act
act -l                    # List workflows
act push                  # Simulate push event
act -j build-and-lint     # Run specific job
```

## Next Steps

1. ✅ Set up GitHub secrets (see CI_CD.md)
2. ✅ Configure branch protection (see BRANCH_PROTECTION.md)
3. ✅ Add status badges to README
4. ✅ Monitor first few runs
5. ✅ Adjust timeouts as needed

## Reference

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [act - Run workflows locally](https://github.com/nektos/act)
