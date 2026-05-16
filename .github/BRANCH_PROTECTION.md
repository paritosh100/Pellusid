# Branch Protection Rules

This document outlines recommended branch protection rules for the `master` and `main` branches.

## Setup Instructions

1. Go to **Settings** → **Branches**
2. Click **Add rule**
3. Configure the following:

## Master/Main Branch Protection

**Pattern:** `master` or `main`

### Basic Settings

- ✅ Require a pull request before merging
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require code review from code owners
  - **Required number of reviewers:** 1

- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  
### Required Status Checks

Add the following required checks:
```
frontend-ci / build-and-lint
frontend-ci / security-scan

backend-ci / test-and-lint
backend-ci / integration-tests
backend-ci / docker-build

integration-tests / integration
integration-tests / api-contract-tests

code-quality / sonarqube
code-quality / dependency-check
code-quality / codeql-analysis

dual-backend-tests / test-openai-backend
dual-backend-tests / test-adk-backend
dual-backend-tests / test-backend-switching
```

### Additional Rules

- ✅ Require branches to be up to date before merging
- ✅ Restrict who can push to matching branches
  - Only allow: `<admin-team>` or specific users
- ✅ Include administrators (enforce the above rules for admins too)
- ✅ Require status checks to pass before merging
- ✅ Require code review before merging

## Develop Branch Protection (Optional)

**Pattern:** `develop`

- ✅ Require a pull request before merging
  - ✅ Dismiss stale pull request approvals
  - **Required reviewers:** 1
- ✅ Require status checks
  - Same checks as main (or subset)
- ❌ Require code owner review (optional for develop)

## Insightbridge-Agents Branch (Feature Branch)

No branch protection needed - open for rapid development.

## Code Owners

Create `.github/CODEOWNERS` file:

```
# Frontend changes
app/                    @paritoshkrcg
components/             @paritoshkrcg
lib/                    @paritoshkrcg

# Backend changes
adk-backend/            @paritoshkrcg

# All changes
*                       @paritoshkrcg
```

## Workflow for Contributors

1. Create feature branch from `develop`:
   ```bash
   git checkout -b feature/my-feature develop
   ```

2. Make changes and commit:
   ```bash
   git commit -m "feat: describe change"
   ```

3. Push to GitHub:
   ```bash
   git push origin feature/my-feature
   ```

4. Open Pull Request
   - Target: `develop` (for internal features) or `main` (for production)
   - Add description following template
   - Request review

5. Wait for CI/CD to pass:
   - All status checks must pass
   - Code review required
   - Merge conflicts must be resolved

6. Merge PR
   - Use "Create a merge commit" (preserves history)
   - Delete branch after merge

## Status Check Timeout

If a check is hanging:
1. Check the workflow logs
2. Comment on PR with findings
3. Admin can dismiss check temporarily if needed
4. Re-run check once fixed

## Dismissing Status Checks

Only repository admins can dismiss required status checks. This should be rare and documented:

```markdown
@paritoshkrcg dismissing test-backend-ci due to flaky test infrastructure
Will re-run after fixes are deployed
```

## Syncing Branches

After merging to `main`:
```bash
# Sync develop with main
git checkout develop
git pull origin develop
git merge origin/main
git push origin develop
```

## Emergency Hotfixes

For urgent production fixes:
1. Create branch from `main`
2. Follow same PR/review process
3. Merge to `main` (production)
4. Merge back to `develop` to keep in sync

## GitHub Actions Required Checks

All workflow checks become required status checks automatically. Ensure:
- Workflows are reliable (no flaky tests)
- Timeouts are reasonable (30 min max)
- Secrets are properly configured
- Coverage thresholds are realistic

## Troubleshooting

### "Required status check failed"
- Click on the failed check to view logs
- Fix the issue and push new commit
- Workflow reruns automatically

### "Stale branch"
- Click "Update branch" button in PR
- Or locally: `git pull origin main && git push origin feature-branch`

### "No reviews"
- Request review from code owners
- At least 1 approval required

### "Status check pending"
- Wait for workflow to complete
- Check Actions tab if taking >10 minutes
- Can be manually re-triggered if needed

## Bypass (Emergency Only)

In true emergencies, admins can:
1. Go to branch protection settings
2. Temporarily "Include administrators" disabled
3. Merge without checks
4. **MUST** re-enable immediately after
5. Document in commit message why bypass was needed

❌ **Never do this casually** - it defeats the purpose of CI/CD

## Monitoring

GitHub provides insights:
1. Settings → Branches → Branch protection rules
2. View merge status trends
3. See which checks are slowest
4. Identify problematic PRs

## Reference

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-review/about-status-checks)
- [Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)
