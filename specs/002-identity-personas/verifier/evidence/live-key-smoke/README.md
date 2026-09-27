# Live-key Desktop smoke (PO follow-up)

**Verdict:** Pass — see `VERDICT.txt`

Measured on tip `b6f17280bccdf92c19ca9f4f751621fad24b10df` (`origin/master` at run start):

1. Desktop launched via `pnpm run start:desktop` on `DISPLAY=:1` with Host/Electron inheriting `DEEPSEEK_API_KEY` from the Cloud Agent environment (presence confirmed; value not logged).
2. Fresh **New Session** → blank/hero → short prompt → model reply `LIVE_KEY_SMOKE_OK`.
3. **No** `MISSING_CREDENTIAL` and **no** “Provider API key is missing” copy on the new turn.
4. Agent Team panel opens; **New bot** chrome still present (no feature inventing).

Artifacts also under `/opt/cursor/artifacts/p2-live-key-smoke/` (screenshots + recording).
