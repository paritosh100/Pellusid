# GitHub Actions CI/CD - Quick Start Guide

Get your CI/CD pipeline running in 5 minutes.

## 📋 What Was Created

- **7 GitHub Actions workflows** (automated testing & deployment)
- **4 test files** for backend validation
- **Configuration files** (pytest, Makefile)
- **Comprehensive documentation**

## ⚡ 3-Step Quick Start

### Step 1: Push to GitHub (2 minutes)
```bash
# Make sure you're on insightbridge-agents branch
git status

# Stage all CI/CD files
git add .github/ adk-backend/tests/ adk-backend/pytest.ini Makefile CI_CD*.md

# Commit
git commit -m "ci: add comprehensive CI/CD pipeline with 7 workflows"

# Push
git push origin insightbridge-agents
```

### Step 2: Configure GitHub Secrets (2 minutes)
Go to **Settings → Secrets and variables → Actions → New repository secret**

Add these 3 required secrets:
```
OPENAI_API_KEY          = sk-... (your OpenAI API key)
GOOGLE_API_KEY          = AIza... (your Google Generative AI key)
NEXT_PUBLIC_SUPABASE_URL = https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ... (your Supabase key)
SUPABASE_SERVICE_ROLE_KEY = eyJ... (your Supabase role key)
```

**For deployment to Vercel/Cloud Run, add later:**
```
VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID (for frontend)
GCP_PROJECT_ID, GCP_SA_KEY (for backend)
```

### Step 3: Create a Pull Request (1 minute)
1. Go to GitHub repo
2. Click "New pull request"
3. **From:** `insightbridge-agents` → **To:** `main` (or `master`)
4. Click "Create pull request"
5. Watch workflows run! 🎉

## 🚀 What Happens Now

When you open a PR, GitHub automatically runs:

1. **Frontend CI** (5 min)
   - ESLint checks
   - TypeScript validation
   - Next.js build

2. **Backend CI** (10 min)
   - Unit tests (pytest)
   - Code style checks (Flake8, Black)
   - Type checking (MyPy)
   - Coverage reports

3. **Integration Tests** (15 min)
   - Full stack E2E tests
   - API endpoint validation
   - Backend switching tests

4. **Code Quality** (10 min)
   - Security scanning
   - Dependency checks
   - Code analysis

5. **PR Checks** (1 min)
   - Title validation
   - Changelog check
   - Diff analysis

**All must pass before merging!**

## 🔍 View Workflow Status

Click the **Actions** tab in GitHub to see:
- Real-time workflow execution
- Test results
- Coverage reports
- Deployment status

## 💻 Test Locally (Optional)

Run tests on your machine before pushing:

```bash
# Install everything
make install

# Run all tests
make test

# Run specific checks
make lint          # Check code style
make type-check    # TypeScript & MyPy
make test-backend  # Python tests only

# See all commands
make help
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `CI_CD.md` | Full documentation (secrets, troubleshooting) |
| `CI_CD_SETUP_CHECKLIST.md` | Step-by-step setup & verification |
| `.github/WORKFLOWS_SUMMARY.md` | Quick reference for each workflow |
| `.github/BRANCH_PROTECTION.md` | Branch protection setup |
| `CI_CD_SUMMARY.txt` | Overview of what was created |

## ✅ Success Checklist

- [ ] Files pushed to GitHub
- [ ] Actions tab shows 7 workflows
- [ ] Secrets configured (at minimum: API keys + Supabase)
- [ ] PR created and workflows are running
- [ ] All checks passing (or showing expected failures)
- [ ] Can run `make test` locally

## ⚠️ Common Issues

### "Workflow not running"
- Check trigger conditions: workflow only runs on main branches or PRs
- Make sure files are in correct path: `.github/workflows/`
- Verify branch name matches (master vs main)

### "Secret not found"
- Go to **Settings → Secrets → Actions**
- Verify secret name matches exactly
- For repo-level secrets, shouldn't need org-level

### "Tests fail in CI but pass locally"
- Different Node/Python version
- Missing environment variable
- OS difference (Windows vs Linux)

### "Port already in use"
- Kill existing process on 8080 or 3000
- Or restart your terminal

## 🎯 Next Steps

1. **Merge PR to main/master**
   - After PR approved and all checks pass
   - Deploy workflow will automatically trigger
   - Frontend deploys to Vercel
   - Backend deploys to Cloud Run

2. **Set up branch protection** (optional)
   - Go to **Settings → Branches**
   - Add rule for `main`/`master`
   - Require status checks
   - See `.github/BRANCH_PROTECTION.md` for details

3. **Add status badges to README** (nice to have)
   ```markdown
   ![Frontend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/frontend-ci.yml/badge.svg)
   ![Backend CI](https://github.com/paritoshkrcg/pellucid-insights/actions/workflows/backend-ci.yml/badge.svg)
   ```

## 📞 Need Help?

1. **Check logs in Actions tab** - Click workflow → Click failed job → Expand step
2. **Read CI_CD.md** - Comprehensive troubleshooting guide
3. **Run locally with make** - `make test` to match CI environment
4. **Check documentation** - All 4 docs cover different aspects

## 🎉 What You Now Have

✨ **Continuous Integration**
- Automated testing on every push/PR
- Code quality checks
- Security scanning

✨ **Continuous Deployment**
- Auto-deploy to production (main branch)
- Frontend → Vercel
- Backend → Google Cloud Run

✨ **Developer Experience**
- Local commands mirror CI (Makefile)
- Clear error messages
- Fast feedback loops
- Caching for speed

✨ **Team Collaboration**
- PR checks ensure quality
- Required status checks
- Code review integration
- Slack notifications (optional)

---

**Questions?** See `CI_CD.md` for the full guide.

**Ready?** Create that PR and watch the magic happen! 🚀
