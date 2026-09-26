# Contract: In-app credentials

**Owners:** DH Runtime (`ctx.credentials` + `dsh-credentials-local`) · DH Client/Web Models UI · Electron Main (no secret IPC)
**Acceptance:** Spec FR-008, FR-009, FR-012 · SC-006 · US4
**PO lock:** In-app auth via credentials-local / Models UI; secrets off renderer

## Primary path

1. User enters provider credential **in-app** (Models / settings write-only UI).
2. Host stores secret behind `CredentialRef` under `$DSH_HOME` via `dsh-credentials-local`; UI may see non-secret `CredentialInfo` only.
3. Bot provider calls resolve via Host `resolve(ref)`.
4. Renderer never receives raw secret values; preload exposes no credential secret API; Main carries no secret IPC.

## Secondary path (non-product)

Env / key-file credentials MAY work for development and CI only. Documented primary product path MUST remain in-app.

## Dump hygiene

Session dump / transcript export for a scripted authenticated session MUST contain **no raw provider credential secrets** (SC-006).

## Failure UX

| Condition | Required |
|-----------|----------|
| Credential missing for needed provider | Direct to in-app entry (not 1Password connector product flow) |
| Invalid / revoked mid-session | Clear failure; offer in-app re-entry; no silent fallback to another bot’s credentials |

## Trust floor tie-ins

- Tools in P1 acceptance surface MUST NOT send/post externally (FR-012).
- No MCP / 1Password connector vault in P1 (deferred P6).

## Non-goals

OS keychain provider swap (later behind same `CredentialRef`); connector vault UX.
