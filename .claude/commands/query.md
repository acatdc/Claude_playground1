# /query — External Data Relay

Query any external API (GraphQL, REST) via GitHub Actions relay.

## How to use

When the user asks to query an external source:

1. Build `_query.json` with this format:
```json
{
  "url": "https://target-api.com/endpoint",
  "method": "POST",
  "headers": { "Authorization": "Bearer TOKEN" },
  "body": { "query": "...", "variables": {} }
}
```
`headers` and `body` are optional.

2. Push to main to trigger the relay:
```bash
git add _query.json
git commit -m "query"
git push origin main
```

3. Record current HEAD and poll until a new commit appears:
```bash
BEFORE=$(git rev-parse origin/main)
# poll every 5s
until [ "$(git ls-remote origin main | cut -f1)" != "$BEFORE" ]; do sleep 5; done
git pull origin main
```

4. Read and present `_result.json` to the user in a clean, readable format.

## Known sources

### GMX Solana GraphQL
- URL: `https://gmx-solana-sqd.squids.live/gmx-solana-base:prod/api/graphql`
- Method: `POST`
- Body: `{ "query": "...", "variables": {} }`

## Notes
- Each query takes ~30-60 seconds (GitHub Actions startup time)
- `_result.json` is overwritten on each query
- Token expires: **2026-08-28** — remind user to renew GH_TOKEN in environment variables
