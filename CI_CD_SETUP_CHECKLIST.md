# CI/CD Setup Checklist

This checklist will help you get the CI/CD pipeline fully configured and running.

## ✅ Files Created

### GitHub Actions Workflows
- [x] `.github/workflows/frontend-ci.yml` - Frontend build, lint, type-check
- [x] `.github/workflows/backend-ci.yml` - Backend test, lint, coverage, docker build
- [x] `.github/workflows/integration-tests.yml` - E2E tests across full stack
- [x] `.github/workflows/dual-backend-tests.yml` - Feature flag backend switching tests
- [x] `.github/workflows/code-quality.yml` - SonarQube, Trivy, CodeQL, Lighthouse
- [x] `.github/workflows/pr-checks.yml` - PR validation and diff analysis
- [x] `.github/workflows/deploy.yml` - Production deployment to Vercel & Cloud Run

### Configuration Files
- [x] `adk-backend/pytest.ini` - Pytest configuration
- [x] `Makefile` - Local development commands
- [x] `package.json` - Updated with test scripts

### Documentation Files
- [x] `CI_CD.md` - Comprehensive CI/CD documentation
- [x] `.github/WORKFLOWS_SUMMARY.md` - Quick reference for all workflows
- [x] `.github/BRANCH_PROTECTION.md` - Branch protection setup guide

### Test Files
- [x] `adk-backend/tests/test_api.py` - API endpoint tests (existing)
- [x] `adk-backend/tests/test_schemas.py` - Schema validation tests
- [x] `adk-backend/tests/test_storage.py` - Database operation tests
- [x] `adk-backend/tests/test_config.py` - Configuration tests

## 🔧 Setup Steps

### Step 1: Push Files to GitHub
```bash
git add .github/workflows/
git add adk-backend/pytest.ini
git add adk-backend/tests/
git add Makefile
git add CI_CD.md
git add CI_CD_SETUP_CHECKLIST.md
git commit -m "feat: add comprehensive CI/CD pipeline"
git push origin insightbridge-agents
```

### Step 2: Create GitHub Secrets
Go to **Settings → Secrets and variables → Actions → New repository secret**

Add these secrets:

#### API Keys (Required)
```
OPENAI_API_KEY          = sk-...
GOOGLE_API_KEY          = AIza...
```

#### Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL              = https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY         = eyJ...
SUPABASE_SERVICE_ROLE_KEY             = eyJ...
```

#### Vercel (For Frontend Deployment)
```
VERCEL_TOKEN            = (from https://vercel.com/account/tokens)
VERCEL_ORG_ID           = (from Vercel dashboard)
VERCEL_PROJECT_ID       = (from Vercel dashboard)
```

#### GCP/Cloud Run (For Backend Deployment)
```
GCP_PROJECT_ID          = your-gcp-project-id
GCP_SA_KEY              = (base64 encoded service account JSON)
DATABASE_URL            = postgres://user:pass@host/db (optional)
ADK_BACKEND_URL         = https://pellucid-adk-*.run.app
```

#### Notifications (Optional)
```
SLACK_WEBHOOK_URL       = https://hooks.slack.com/services/...
```

#### Code Quality (Optional)
```
SONAR_HOST_URL          = https://sonarqube.example.com
SONAR_TOKEN             = sonar-token-here
```

### Step 3: Verify Workflows Appear
1. Go to **Actions** tab on GitHub
2. Should see all 7 workflows listed
3. Click on each to view details

### Step 4: Set Up Branch Protection
1. Go to **Settings → Branches**
2. Click **Add rule**
3. Pattern: `main` or `master`
4. Follow guide in `.github/BRANCH_PROTECTION.md`
5. Add required status checks from workflow names

### Step 5: Test Each Workflow

#### Frontend CI
```bash
# Create a test PR with frontend changes
git checkout -b test/frontend-ci
# Make a change to app/page.tsx
git add app/
git commit -m "test: frontend ci"
git push origin test/frontend-ci
# Open PR and watch workflow run
```

#### Backend CI
```bash
# Create a test PR with backend changes
git checkout -b test/backend-ci
# Make a change to adk-backend/main.py
git add adk-backend/
git commit -m "test: backend ci"
git push origin test/backend-ci
# Open PR and watch workflow run
```

#### Dual Backend Tests
```bash
git checkout -b test/dual-backend
# Change to lib/adk-client.ts
touch lib/adk-client.ts
git add lib/
git commit -m "test: dual backend"
git push origin test/dual-backend
```

### Step 6: Local Testing (Optional)

#### Install act (to run workflows locally)
```bash
# macOS
brew install act

# Ubuntu
sudo apt-get install act

# Or from source
# https://github.com/nektos/act
```

#### Run workflows locally
```bash
# List workflows
act -l

# Run specific workflow
act -j build-and-lint

# Simulate push event
act push -e .act/push.json
```

### Step 7: Configure Notifications (Optional)

#### Slack Integration
1. Create Slack webhook: https://api.slack.com/apps
2. Add to GitHub secrets as `SLACK_WEBHOOK_URL`
3. Workflows will post deployment notifications

#### Email Notifications
Already built into GitHub:
1. **Settings → Notifications**
2. Configure email preferences
3. Workflows send notifications automatically

### Step 8: Add Status Badges to README

Add to `README.md`:
```markdown
## CI/CD Status

[![Frontend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml)
[![Backend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml)
[![Integration Tests](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/integration-tests.yml)
[![Dual Backend Tests](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/dual-backend-tests.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/dual-backend-tests.yml)
[![Code Quality](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/code-quality.yml/badge.svg)](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/code-quality.yml)
```

### Step 9: Create Pull Request

Create a PR to merge your CI/CD changes:
```bash
# Switch to main/master
git checkout main

# Create PR branch
git checkout -b ci-cd/add-pipelines

# Push and create PR
git push origin ci-cd/add-pipelines
# Go to GitHub and create PR
```

All workflows will run on the PR!

## 📋 Verification Checklist

- [ ] All 7 workflows appear in **Actions** tab
- [ ] Frontend CI passes
- [ ] Backend CI passes
- [ ] Integration tests pass
- [ ] Code quality checks pass
- [ ] Dual backend tests pass
- [ ] PR checks run successfully
- [ ] All secrets are configured
- [ ] Branch protection rules are set
- [ ] Status badges show in README
- [ ] Can run `make test` locally
- [ ] Can run `make lint` locally
- [ ] Smoke tests pass

## 🚀 Deploying CI/CD

### Prerequisites
- [ ] All workflows passing
- [ ] Secrets configured
- [ ] Branch protection set up
- [ ] PR reviewed and approved

### Merge to Main
```bash
git checkout main
git pull origin main
git merge --no-ff ci-cd/add-pipelines
git push origin main
```

### Monitor First Deployment
1. Go to **Actions** tab
2. Watch **Deploy** workflow
3. Check **Vercel** for frontend deployment
4. Check **Cloud Run** for backend deployment
5. Run production smoke tests

## 🔍 Monitoring & Maintenance

### Daily
- Check **Actions** for workflow status
- Review failed workflows
- Fix issues in test runs

### Weekly
- Review test coverage reports
- Check for failing tests
- Update dependencies if needed

### Monthly
- Review workflow performance
- Optimize slow workflows
- Update documentation
- Review branch protection rules

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `CI_CD.md` | Full CI/CD documentation |
| `.github/WORKFLOWS_SUMMARY.md` | Quick workflow reference |
| `.github/BRANCH_PROTECTION.md` | Branch protection setup |
| `CI_CD_SETUP_CHECKLIST.md` | This file - setup instructions |
| `Makefile` | Local development commands |

## 🆘 Troubleshooting

### Workflow won't start
- Check trigger conditions (branches, file paths)
- Verify secrets are set
- Check GitHub Actions quota

### Tests failing in CI but pass locally
- Different OS (Windows vs Linux)
- Different Python/Node version
- Missing env variables
- Run `make test` locally to match CI

### Secrets not working
- Verify secret name matches workflow
- Check scope (repo-level vs org-level)
- Try recreating secret

### Deploy fails
- Check Cloud Run logs
- Verify GCP permissions
- Check service account key
- Test backend locally first

## 📞 Support

For issues:
1. Check workflow logs in **Actions** tab
2. Read relevant documentation above
3. Run locally with `make` commands
4. Check `.github/` files for examples

## ✨ Next Steps

1. **Add E2E tests** with Playwright
2. **Add performance benchmarks** with Lighthouse
3. **Add load testing** with k6
4. **Enable auto-updates** with Dependabot
5. **Add coverage badges**
6. **Set up SonarQube** integration
7. **Configure Slack notifications**

## 📝 Notes

- Workflows run on `ubuntu-latest` (Linux)
- Some tests may be OS-specific
- Cold Docker builds take longer
- First workflow run may be slower
- Artifact retention set to 7 days

---

**Last Updated:** 2026-05-12
**Status:** ✅ Ready for deployment
