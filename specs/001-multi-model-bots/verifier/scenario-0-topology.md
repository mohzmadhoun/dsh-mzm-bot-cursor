# Scenario 0 — Topology handshake evidence recipe

**Status:** Recipe ready; **live Electron Pass run blocked** until DH Electron lands T005 automation.
**Owners:** DH Verifier (this recipe + evidence recording) · DH Electron (`topology-handshake.spec.ts`)
**Acceptance:** Spec FR-013, SC-007
**Contract:** [../contracts/topology-handshake.md](../contracts/topology-handshake.md)
**Architect criteria:** [../architecture.md](../architecture.md#verifier-criteria--topology-handshake)
**Gate home:** [README.md](./README.md#handshake-pass-gate-sc-007--fr-013)

## Locked topology (do not reopen)

Pass only against:

1. Bundled-Node **Desktop Host** child (`ELECTRON_RUN_AS_NODE` or documented equivalent)
2. Node IPC **lifecycle-only** (`ready` / `shutdown` / `shutdown-complete` — no chat/mailbox payloads)
3. Primary frame **`dsh-app://`**
4. Authenticated **HTTP + ≥1 WebSocket/stream** to Host `ready.url` (shipped data plane — **not** framed pipes)

## Preconditions

- [ ] Checkout includes Desktop apps (`apps/desktop`, `apps/desktop-host`)
- [ ] `pnpm install` complete; Desktop Host package resolvable for spawn under test
- [ ] Electron automation present: `apps/desktop/tests/topology-handshake.spec.ts` (T005)
- [ ] Optional driver (when added): `apps/desktop/tests/topology/verifier-scenario-0.ts`
- [ ] Display available for any GUI path (`DISPLAY` set, or `xvfb-run`); headless IPC/Host-only asserts may still run without a window if Electron automation supports it
- [ ] No provider API secrets required for Scenario 0 (topology only)

## Commands (rerunnable)

Primary (Electron-owned automation — required for Pass):

```sh
pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts
```

Optional Verifier driver (when T006 driver file exists; wraps/records the same Electron asserts):

```sh
pnpm exec vitest run apps/desktop/tests/topology/verifier-scenario-0.ts
```

Headless display wrapper when the Electron path needs a virtual framebuffer:

```sh
xvfb-run -a pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts
```

Record evidence under `specs/001-multi-model-bots/verifier/evidence/scenario-0/` (create on first Pass/Fail run):

| Artifact | Suggested name | Required? |
|----------|----------------|-----------|
| Pass/Fail log (spawn → ready → HTTP/WS → shutdown) | `handshake.log` | Yes |
| Screenshot or trace of `ready` + authenticated Host round-trip | `ready-auth.(png\|webm\|zip)` | Yes (one of) |
| Vitest / driver stdout capture | `vitest.stdout.txt` | Recommended |
| Verdict stamp | `VERDICT.txt` containing `Pass` or `Fail` + UTC ISO time + git SHA | Yes |

## Assert checklist (all required for Pass)

Copy into the evidence log; each row must be **measured** (not inferred):

| # | Criterion | How measured | Pass? |
|---|-----------|--------------|-------|
| 1 | **Spawn** — exactly one Desktop Host child with `ELECTRON_RUN_AS_NODE` (or documented equivalent) against desktop profile | Process/env assert in Electron automation | |
| 2 | **IPC lifecycle-only** — `ready` with `url: string` (optional `injections`); no chat/mailbox IPC payloads | IPC message capture | |
| 3 | **Document origin** — primary main frame `dsh-app://app` (or `/` under scheme); foreign frames cannot use privileged preload | Navigation / frame URL assert | |
| 4 | **Authenticated data plane** — HTTP + ≥1 authenticated WS/stream to `ready.url`; no provider API keys in renderer storage | Network / auth round-trip | |
| 5 | **Shutdown** — ordered stop → `shutdown-complete` or clean exit; no second messaging bus | IPC + exit code | |
| 6 | **Negative** — fake mailbox / bot-message over Electron IPC rejected or impossible (no Main handler) | Negative assert in Electron automation (T007) | |

## Evidence format (SC-007)

Minimal Pass package:

```text
VERDICT: Pass
SC: SC-007
SHA: <git rev-parse HEAD>
UTC: <ISO-8601>
COMMAND: pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts
LOG: evidence/scenario-0/handshake.log
TRACE: evidence/scenario-0/ready-auth.<ext>
CRITERIA: 1-6 Pass
```

Minimal Fail package uses the same fields with `VERDICT: Fail` and names the first failing criterion id.

## Blocked — live Pass run (2026-09-26)

**Verdict for this Verifier slice:** **blocked** (recipe exists; real artifact Pass not yet runnable).

| Missing artifact | Owner task | Effect |
|------------------|------------|--------|
| `apps/desktop/tests/topology-handshake.spec.ts` | T005 / DH Electron | Cannot execute Scenario 0 automation or record Pass |
| `apps/desktop/tests/topology/` helpers (as needed) | T005 | Same |
| Optional `apps/desktop/tests/topology/verifier-scenario-0.ts` | T006 driver | Deferred until T005 exists; recipe alone satisfies Verifier doc deliverable |

Environment notes for when Electron lands (measured on this Verifier host unless noted):

| Factor | Observation | Claim |
|--------|-------------|-------|
| `DISPLAY` | `:1` present | **measured** — GUI path possible |
| `xvfb-run` | `/usr/bin/xvfb-run` present | **measured** — headless fallback available |
| `electron` on PATH | not found as bare bin | **measured** — use workspace `electron` via pnpm/`apps/desktop` devDependency |
| Provider secrets | not needed for Scenario 0 | **inferred** from contract (topology-only) |
| Electron handshake branch | `cursor/p1-handshake-electron-92fa` had no remote tip / no T005 files at recipe authoring | **measured** vs `origin/cursor/p1-analyze-92fa` |

**Do not** mark SC-007 Pass or open product SC-001…SC-006 Done until the Electron automation exists and this recipe records Pass evidence.

## After Electron T005 lands

1. Rebase/merge Verifier branch onto Electron handshake branch if needed.
2. Run the Commands section; fill Assert checklist from measured output.
3. Write evidence files under `evidence/scenario-0/`.
4. Update this section: remove Blocked table; set **Verdict: Pass** or **Fail** with SHA.
5. Only then may product scenario Done claims proceed (see [README gate](./README.md#handshake-pass-gate-sc-007--fr-013)).
