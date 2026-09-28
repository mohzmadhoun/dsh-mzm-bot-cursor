# Contract: Local Shell / box tool path

**Owners:** DH Runtime / Desktop Host · DH Client · DH Verifier · DH Architect (executor stamp)
**Acceptance:** Spec FR-001, FR-002, FR-011, FR-015 · US1 · SC-001
**Evidence:** `verifier/evidence/shell-box/` (SO 11+12)

## Intent

Prove one successful **local** Shell/box tool invocation against the product’s box/computer backend with a user-visible success outcome. Not catalog theater. Not settings-toggle theater.

## Host obligations

| Obligation | Pass bar |
|------------|----------|
| Box/computer backend | Usable for Pass Shell path; readiness SoT on Host |
| Readiness states | `not_ready` / `starting` / `failed` clearly ≠ `ready` in projection (exact string not scored) |
| Shell/box tool | `bash` / `pwsh` via sandboxed executors (`dsh-bash-sandbox` / `dsh-pwsh-sandbox` + `dsh-sandbox-local` + tools) |
| Success outcome | User-visible success indicator tied to that tool; LLM wording not scored |
| Local Pass | Host local execution world (FR-011); remote/PTC not required for Pass |
| Logging | Model-visible outcomes reconstructable from session log |

**Architect Path A:** research R2 — Pass “box” = Desktop Host sandboxed Shell world.

## Client / Electron obligations

| Obligation | Pass bar |
|------------|----------|
| Projection | Show tool success / not-ready via Host HTTP/WS — not Main IPC SoT |
| Electron Main | Lifecycle only; no shell-exec / box-ready product bus |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| SC-001 | One successful local Shell/box tool with user-visible success |
| Not-ready | Attempt while starting/unavailable MUST NOT be scored as SC-001 Pass |
| Evidence | Desktop screenshot(s) and/or short recording committed under `verifier/evidence/shell-box/` + PR embeds |
| Unit/jsdom alone | Fail |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Settings row present, no tool success | Fail SC-001 (chrome ≠ substitute) |
| Silent success while not ready | Fail FR-002 |
| Electron Main as Shell SoT | Seam violation — Fail |
| Only remote/brokered or PTC-as-Shell Pass path | Fail FR-011 / Architect Path A |
