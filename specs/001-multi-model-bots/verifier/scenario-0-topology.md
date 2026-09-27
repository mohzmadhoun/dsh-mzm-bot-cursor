# Scenario 0 — Topology handshake evidence recipe

**Status:** Recipe + **Pass** evidence recorded (independent Verifier re-run).
**Owners:** DH Verifier (this recipe + evidence recording) · DH Electron (`topology-handshake.spec.ts`)
**Acceptance:** Spec FR-013, SC-007
**Contract:** [../contracts/topology-handshake.md](../contracts/topology-handshake.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 0
**Architect criteria:** [../architecture.md](../architecture.md#verifier-criteria--topology-handshake)
**Gate home:** [README.md](./README.md#handshake-pass-gate-sc-007--fr-013)
**Evidence:** [evidence/scenario-0/](./evidence/scenario-0/)

## Locked topology (do not reopen)

Pass only against:

1. Bundled-Node **Desktop Host** child (`ELECTRON_RUN_AS_NODE` or documented equivalent)
2. Node IPC **lifecycle-only** (`ready` / `shutdown` / `shutdown-complete` — no chat/mailbox payloads)
3. Primary frame **`dsh-app://`**
4. Authenticated **HTTP + ≥1 WebSocket/stream** to Host `ready.url` (shipped data plane — **not** framed pipes)

## Preconditions

- [x] Checkout includes Desktop apps (`apps/desktop`, `apps/desktop-host`)
- [x] `pnpm install` complete; Desktop Host package resolvable for spawn under test
- [x] Electron automation present: `apps/desktop/tests/topology-handshake.spec.ts` (T005)
- [ ] Optional driver (when added): `apps/desktop/tests/topology/verifier-scenario-0.ts`
- [x] Display available for any GUI path (`DISPLAY` set, or `xvfb-run`); headless IPC/Host-only asserts may still run without a window if Electron automation supports it
- [x] No provider API secrets required for Scenario 0 (topology only)

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
| 1 | **Spawn** — exactly one Desktop Host child with `ELECTRON_RUN_AS_NODE` (or documented equivalent) against desktop profile | Process/env assert in Electron automation | Pass (**measured**) |
| 2 | **IPC lifecycle-only** — `ready` with `url: string` (optional `injections`); no chat/mailbox IPC payloads | IPC message capture | Pass (**measured**) |
| 3 | **Document origin** — primary main frame `dsh-app://app` (or `/` under scheme); foreign frames cannot use privileged preload | Navigation / frame URL assert | Pass (**measured**) |
| 4 | **Authenticated data plane** — HTTP + ≥1 authenticated WS/stream to `ready.url`; no provider API keys in renderer storage | Network / auth round-trip | Pass (**measured**) |
| 5 | **Shutdown** — ordered stop → `shutdown-complete` or clean exit; no second messaging bus | IPC + exit code | Pass (**measured**) |
| 6 | **Negative** — fake mailbox / bot-message over Electron IPC rejected or impossible (no Main handler) | Negative assert in Electron automation (T007) | Pass (**measured**) |

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

## Live Pass run (2026-09-26) — Verifier-owned evidence

**Verdict:** **Pass** (**measured**)

| Field | Value |
|-------|-------|
| Automation SHA under test | `2632992bb393e608c601a424dfadc67e7cc98283` (`origin/cursor/p1-handshake-electron-92fa`) |
| UTC | `2026-09-26T22:50:18Z` |
| Command | `xvfb-run -a pnpm exec vitest run apps/desktop/tests/topology-handshake.spec.ts` |
| Result | 4/4 tests passed, exit 0 |
| Log | [evidence/scenario-0/handshake.log](./evidence/scenario-0/handshake.log) |
| Trace | [evidence/scenario-0/ready-auth.zip](./evidence/scenario-0/ready-auth.zip) |
| Stdout | [evidence/scenario-0/vitest.stdout.txt](./evidence/scenario-0/vitest.stdout.txt) |
| Verdict stamp | [evidence/scenario-0/VERDICT.txt](./evidence/scenario-0/VERDICT.txt) |
| Criteria | 1–6 Pass |

Environment notes (**measured** on this Verifier host):

| Factor | Observation | Claim |
|--------|-------------|-------|
| `xvfb-run` | `/usr/bin/xvfb-run` used for this Pass | **measured** |
| Vitest | workspace `pnpm exec vitest` v4.1.8 | **measured** |
| Provider secrets | not required | **inferred** from contract (topology-only) |
| Optional driver | `verifier-scenario-0.ts` not present; Electron automation is the Pass path | **measured** |

SC-007 Pass is recorded. Product SC-001…SC-006 Done still requires this handshake Pass gate (see [README gate](./README.md#handshake-pass-gate-sc-007--fr-013)); US1–US4 Verifier fan-out remains closed until product owners open those scenarios.
