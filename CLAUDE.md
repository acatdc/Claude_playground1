# Claude Playground

## External Data Relay (GitHub Actions)

External APIs are accessed via GitHub Actions (Anthropic sandbox blocks direct HTTP to non-whitelisted hosts).  
No tokens needed — relay triggers automatically on push. Use `/query` command.

### How it works
1. I write request to `_query.json` and push to main
2. GitHub Actions triggers automatically, runs the request from GitHub's runners
3. Result saved to `_result.json`, committed back
4. I pull and read the result

⚠️ If `workflow_dispatch` is ever needed: GH_TOKEN expires **2026-08-28**

### Repo
`acatdc/Claude_playground1`
