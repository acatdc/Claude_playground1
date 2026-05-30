# Claude Playground

## External Data Relay (GitHub Actions)

External APIs are accessed via GitHub Actions workflows (Anthropic sandbox blocks direct HTTP to non-whitelisted hosts).

**GH_TOKEN** is stored in Claude Code environment variables.  
⚠️ Token expires: **2026-08-28** — needs renewal before that date.  
Scopes required: `repo` + `workflow`

### How it works
1. I trigger `.github/workflows/graphql.yml` via GitHub API (`api.github.com` is whitelisted)
2. The workflow runs the request from GitHub's runners (no IP restrictions)
3. Result is saved to `_result.json`, committed, and I pull + read it

### Repo
`acatdc/Claude_playground1`
