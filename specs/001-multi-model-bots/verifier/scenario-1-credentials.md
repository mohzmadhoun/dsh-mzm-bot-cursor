# Scenario 1 — In-app auth + clean dump

**Status:** T037 Verifier recipe + Host/Client measured Pass for SC-006 session-dump hygiene and in-app credential write/auth path. Live Desktop operator dump review may still be recorded under `evidence/scenario-1/` when a GUI export is exercised; unit/Host evidence below is the Pass gate for this slice.
**Acceptance slice:** SC-006 / FR-008 (secrets off dump + renderer) · FR-009 posture (primary vs secondary) · FR-012 trust-floor tie-in
**Contract:** [../contracts/in-app-credentials.md](../contracts/in-app-credentials.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Related:** [credentials-ipc.md](./credentials-ipc.md) (T011 / T034) · [t016-llm-route.md](./t016-llm-route.md) · [t020-cred-handoff.md](./t020-cred-handoff.md) · [trust-floor.md](./trust-floor.md)
**Package authority (resolve order + product role):** [`packages/credentials/credentials-local/README.md`](../../../packages/credentials/credentials-local/README.md) — section “Where keys come from” (T036 landed; this recipe restates FR-009 for Verifier)
**Branch:** `cursor/p1-t037-scenario1-92fa`
**Evidence:** [evidence/scenario-1/](./evidence/scenario-1/)

## FR-009 — Primary vs secondary credentials

| Path | Role | Counts for SC-006 Pass? |
|------|------|-------------------------|
| In-app Models / settings → Host `ctx.credentials` → managed `$DSH_HOME/.credentials.yaml` | **Product primary** | Yes (required evidence path) |
| Launch environment (`DEEPSEEK_API_KEY=…`), project `.env`, harness-home `.env` | **Secondary** — development and CI only | No — CI shortcut only; must not be taught as product primary |

**Fail FR-009** if Desktop/Host docs or this recipe teach env/key-file as the product primary auth path, or if SC-006 Pass evidence relies only on env injection without an in-app entry demonstration.

## What this recipe proves (T037)

1. **In-app credential entry** — Models / settings write-only UI stores secrets via Host `credentials.set(ref, value)`; UI may observe non-secret `CredentialInfo` only (`configured` / `source` / `writable` — no value slot).
2. **Bot auth uses Host resolve** — A bot model call resolves its provider `CredentialRef` through Host `ctx.credentials.resolve`; missing credential fails `MISSING_CREDENTIAL` with no silent peer fallback (T016).
3. **SC-006 dump hygiene** — After a scripted authenticated bot session, the durable session event log contains **no raw provider secret values**. Transcript export (`session.export` ZIP) serializes those same session logs as canonical JSONL plus attachments — it does not inject credential store contents — so a clean session log implies a clean export for credential secrets.

Does **not** by itself prove live Desktop GUI export click-path Pass (optional operator stamp below). Does **not** reopen T034 preload/IPC (use [credentials-ipc.md](./credentials-ipc.md) / T034 recipe). Does **not** claim SC-001 / Scenario 2.

## Ordered product path (quickstart Scenario 1)

Follow when running a live Desktop review. Clock is not SC-001; this path is for SC-006 evidence.

| Step | Action | Exit condition |
|------|--------|----------------|
| 1 | Fresh profile (or cleared credentials for providers under test) | No prior secret for the provider under test |
| 2 | Enter credentials **in-app** (Models / settings write-only) | Credential accepted; UI shows configured state without echoing the secret |
| 3 | Create a bot that uses that provider; run one authenticated call | Bot call succeeds via Host resolve (or scripted adapter with Host resolve) |
| 4 | Export / dump session transcript; search for the raw secret | Dump / export text contains **no** raw secret string |

Env/key-file injection **must not** be the only auth path used for SC-006 Pass evidence.

## Commands (rerunnable) — measured Host + Client slices

In this workspace, `pnpm exec` may refuse to run because install rewrites `core.hooksPath`. Prefer the local binary with the lefthook override:

```sh
DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1 ./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/llm-route.spec.ts
```

Proves: Host credential resolve for bot chats; `MISSING_CREDENTIAL` without peer fallback; **session event dump does not contain the seeded secret** (`expect(dump).not.toContain(SECRET_A)`).

```sh
DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1 ./node_modules/.bin/vitest run \
  packages/client/ui-settings-models/tests/components.client.spec.tsx \
  -t 'write-only|credential-only onboarding|stores a typed key'
```

Proves: Models UI stores typed keys write-only via `credentials.set`; Apply status copy does not echo the secret; credential-only onboarding uses the same write path.

```sh
rg -n -i 'credential|secret|api[_-]?key|password' \
  apps/desktop/src/preload-*.ts apps/desktop/src/ipc.ts
```

Proves: Electron preload / `ipc.ts` still expose **no** credential secret IPC (T011 baseline; T034 automation when present on tree).

Optional export composition smoke (no secret fixture required — confirms ZIP streams session JSONL only):

```sh
DSH_LEFTHOOK_ALLOW_HOOKS_PATH_OVERRIDE=1 ./node_modules/.bin/vitest run \
  packages/session-query/session-log-export/tests/archive.host.spec.ts \
  -t 'streams a ZIP with the root log serialized as canonical JSONL'
```

## Assert checklist (all required for Pass)

| # | Criterion | How measured | Pass? |
|---|-----------|--------------|-------|
| 1 | In-app Models write-only stores via `credentials.set`; no secret in status copy | Client vitest (`write-only` / credential-only onboarding) | required |
| 2 | Bot authenticated call resolves Host credential for its own ref | Host vitest `llm-route.spec.ts` (resolves + request/header) | required |
| 3 | Missing credential → `MISSING_CREDENTIAL`; no peer secret reuse | Same Host file, second test | required |
| 4 | Session event dump contains **no** raw provider secret | `JSON.stringify(events).not.toContain(SECRET_*)` in llm-route | required (**SC-006**) |
| 5 | Transcript export composes from session logs / attachments only (no credentials store read) | archive.host ZIP smoke + `archive.ts` contract (serializeSessionLog / readSessionLogText) | required (**SC-006 export**) |
| 6 | No Electron credential secret IPC on preload/`ipc.ts` | `rg` audit (and `no-secret-ipc.spec.ts` when on tree) | required (FR-008 shell) |
| 7 | FR-009: product primary = in-app; env secondary | This table + package README when T036 landed | required (docs) |

## Pass / Fail / Deferred

| Outcome | When |
|---------|------|
| **Pass (SC-006)** | Criteria 1–7 green with **measured** Host dump assert + in-app write path; evidence under `evidence/scenario-1/` |
| **Fail (SC-006)** | Raw secret appears in session dump / export bytes; or Pass evidence used env-only auth without in-app entry |
| **Deferred** | Recipe exists but Verifier has not rerun commands on this SHA — stamp `Deferred` + reason; does **not** mark SC-006 Done |
| **Blocked** | Scenario 0 handshake not Pass (product SC Done closed); or Models write path / Host credentials seam absent |

**Claim tags:** label every SC-006 claim **measured** / **inferred** / **guess**. SC-006 Pass requires **measured** absence of the known secret from the session dump under test.

## Evidence format

Record under `specs/001-multi-model-bots/verifier/evidence/scenario-1/`:

| Artifact | Suggested name | Required? |
|----------|----------------|-----------|
| Verdict stamp | `VERDICT.txt` | Yes |
| Host llm-route stdout | `vitest-llm-route.stdout.txt` | Yes |
| Client Models write-only stdout | `vitest-models-write.stdout.txt` | Yes |
| preload/ipc `rg` capture | `credentials-ipc-rg.txt` | Yes |
| Optional export ZIP smoke stdout | `vitest-export-archive.stdout.txt` | Recommended |
| Optional live Desktop dump excerpt / screenshot | `live-dump-review.(txt\|png)` | Optional |

Minimal stamp template:

```text
VERDICT: Pass|Fail|Deferred
SC: SC-006
SHA: <git rev-parse HEAD>
BRANCH: <branch>
UTC: <ISO-8601>
OPERATOR: <name>
COMMAND_HOST: <llm-route vitest>
COMMAND_CLIENT: <Models write-only vitest>
COMMAND_IPC: rg … preload / ipc.ts
EVIDENCE: evidence/scenario-1/<files>
CRITERIA: 1-7 Pass|Fail
CLAIM: measured|inferred|guess
SCOPE_OUT: <what this Pass does not claim>
DEFER_REASON: <only when Deferred>
```

## Topology / trust floor unchanged

Electron Main invents neither credentials nor LLM routes. Secrets stay on Host `ctx.credentials`; renderer sees `CredentialInfo` only. Phase 1 acceptance tools still MUST NOT send/post externally ([trust-floor.md](./trust-floor.md)).

## Merge-forward note (T036)

T036 landed the FR-009 table in `credentials-local` README. This file keeps the full T037 Pass recipe and assert tables; do not regress to the T036 stub.
