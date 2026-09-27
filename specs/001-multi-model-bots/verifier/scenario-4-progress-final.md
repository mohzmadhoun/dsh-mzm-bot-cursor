# Scenario 4 — Progress + final (SC-004)

**Status:** SC-004 keyless **Pass** stamped (composite re-run after T030 on `master`). Composite FR-006 proof for ≥1 Host-stream progress **and** session-log final on a scripted chat path. **T029** + **T030** are both on `master`; measured evidence under [evidence/scenario-4/](./evidence/scenario-4/). Live Desktop (optional criterion 6) remains Skipped.
**Owners:** DH Verifier (this recipe + evidence) · DH Electron/Client (T029–T030 `ui-chat`) · DH Runtime (session/agent streams + durable session log)
**Acceptance:** Spec FR-006 · SC-004 · US3 scenario 2 (quickstart Scenario 4)
**Contract:** [../contracts/chat-progress-final.md](../contracts/chat-progress-final.md)
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 4
**Data model:** [../data-model.md](../data-model.md) Chat turn (`progressUpdates`, `finalResult`, optional `linkedMailboxMessageId`)
**Branch (T032 recipe):** `cursor/p1-t032-scenario4-92fa` (landed). **Stamp branch (SC-004 Pass):** `cursor/p1-t032-sc004-stamp-92fa` (base `master` @ T030)

## What this recipe proves (SC-004)

Against [chat-progress-final.md](../contracts/chat-progress-final.md):

| Contract phase | Obligation | Slice |
|----------------|------------|-------|
| In flight | ≥1 progress update before completion on Verifier-scripted path | [t029-chat-progress.md](./t029-chat-progress.md) — `data-chat-progress="host-stream"` from Host `assistant/live-chunk` |
| Complete | Final result delivered in chat for that turn/path | [t030-chat-final.md](./t030-chat-final.md) (when present) — `data-chat-final="session-log"` from durable `assistant/message` / turn completion |
| Handoff-linked | When work is caused by mailbox message, progress/final attributable to that path | T030 optional `linkedMailboxMessageId` / `data-linked-mailbox-message-id` (mailbox-caused turns) |

**Fail rules:**

1. Fail if the scripted path shows a final without ≥1 in-flight Host-stream progress marker (`data-chat-progress="host-stream"` while the turn is open).
2. Fail if progress clears / turn completes without a user-visible session-log final (`data-chat-final="session-log"`).
3. Fail if Electron Main / preload synthesize a parallel chat-progress or chat-final IPC protocol (`dsh-desktop:chat-progress*`, `dsh-desktop:chat-final*`, or equivalent).
4. Fail mailbox-caused attribution checks if a turn attributable to Host mailbox receipt lacks `linkedMailboxMessageId` on the closing final when T030 is in scope.

Does **not** claim Scenario 0 / SC-007, Scenario 2 / SC-001–002, or Scenario 3 / SC-003 Pass. Does **not** require richer chat chrome or pixel Grok parity (contract non-goals). Does **not** own T031 handoff-row chrome beyond the optional mailbox id on the final.

## Preconditions

- [x] Checkout includes **T029** on base (`master` @ T029 merge or later) — **measured** required for progress half
- [x] Checkout includes **T030** (`t030-chat-final.md` + Client/shell suites) — required before SC-004 Pass; until then stamp `T030: Deferred` / `VERDICT: Deferred` (recipe presence alone is not SC-004 Pass)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] Scenario 0 / SC-007 Topology handshake **Pass** recorded ([README](./README.md#handshake-pass-gate-sc-007--fr-013)) — required before product SC Done
- [ ] No provider API secrets required for the keyless composite below (client projection fixtures)
- [ ] Optional live Desktop path: scripted chat in one window; Display / `xvfb-run` if GUI

## Commands (rerunnable) — composite keyless Pass gate

Reuse T029 + T030 focused suites. Prefer the local vitest binary when `pnpm exec` refuses `core.hooksPath` rewrite.

### T029 — Host-stream progress (on `master`)

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  -t 'T029|Host-stream chat progress|Host assistant/live-chunk progress'

./node_modules/.bin/vitest run \
  apps/desktop/tests/no-shell-chat-progress-ipc.spec.ts
```

### T030 — Session-log final + optional mailbox attribution (on `master` after PR #60)

Skip and stamp `T030: Deferred` only when these paths are absent from HEAD (historical pre-merge check).

```sh
./node_modules/.bin/vitest run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  packages/client/ui-chat/tests/team-message-source.client.spec.ts \
  -t 'T030|session log|linkedMailbox|mailbox attribution|cold-resume mailbox|mid-turn team-message'

./node_modules/.bin/vitest run \
  apps/desktop/tests/no-shell-chat-final-ipc.spec.ts
```

### One-shot wrapper (stop on first failure; skip T030 block when files missing)

```sh
set -euo pipefail
EVIDENCE=specs/001-multi-model-bots/verifier/evidence/scenario-4
mkdir -p "$EVIDENCE"
VITEST=./node_modules/.bin/vitest

$VITEST run \
  packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
  packages/client/ui-chat/tests/chat-view.client.spec.tsx \
  -t 'T029|Host-stream chat progress|Host assistant/live-chunk progress' \
  | tee "$EVIDENCE/vitest-t029-ui-chat.log"

$VITEST run \
  apps/desktop/tests/no-shell-chat-progress-ipc.spec.ts \
  | tee "$EVIDENCE/vitest-t029-shell.log"

if [[ -f apps/desktop/tests/no-shell-chat-final-ipc.spec.ts ]]; then
  $VITEST run \
    packages/client/ui-chat/tests/conversation-node-definitions.client.spec.ts \
    packages/client/ui-chat/tests/chat-view.client.spec.tsx \
    packages/client/ui-chat/tests/team-message-source.client.spec.ts \
    -t 'T030|session log|linkedMailbox|mailbox attribution|cold-resume mailbox|mid-turn team-message' \
    | tee "$EVIDENCE/vitest-t030-ui-chat.log"

  $VITEST run \
    apps/desktop/tests/no-shell-chat-final-ipc.spec.ts \
    | tee "$EVIDENCE/vitest-t030-shell.log"
else
  echo "T030 absent on checkout — stamp T030: Deferred; do not Pass SC-004" \
    | tee "$EVIDENCE/t030-absent.txt"
fi
```

Slice recipes remain authoritative for per-task evidence homes: [t029-chat-progress.md](./t029-chat-progress.md) · [t030-chat-final.md](./t030-chat-final.md) (when present on checkout).

## Optional live Desktop path (operator)

When recording a live SC-004 Desktop stamp (in addition to keyless Pass):

1. Launch Desktop under test; open a session that can run a scripted chat (may reuse Scenario 2 or 3 session).
2. Start a turn that streams Host session/agent events.
3. **Before completion:** observe ≥1 progress update (`data-chat-progress="host-stream"` on streaming row and/or open-turn status).
4. **After completion:** observe final result in chat (`data-chat-final="session-log"`).
5. If the turn was caused by a Host mailbox message, confirm attribution (`data-linked-mailbox-message-id` when T030 is in scope).
6. Fail immediately if progress or final required Electron Main-synthesized chat IPC.

## Pass criteria

| # | Criterion | How measured | Required |
|---|-----------|--------------|----------|
| 1 | ≥1 Host-stream progress before settlement (`data-chat-progress="host-stream"`) | T029 ui-chat vitest | Yes |
| 2 | Shell MUST NOT invent chat-progress IPC | T029 `no-shell-chat-progress-ipc` | Yes |
| 3 | Session-log final after completion (`data-chat-final="session-log"`) | T030 ui-chat vitest | Yes (for SC-004 Pass) |
| 4 | Shell MUST NOT invent chat-final IPC | T030 `no-shell-chat-final-ipc` | Yes (for SC-004 Pass) |
| 5 | Optional mailbox attribution on mailbox-caused turns | T030 linkedMailbox tests | Yes when claiming handoff-linked contract phase |
| 6 | Live Desktop scripted chat observation | Optional stamp under evidence | Optional (keyless gate may Pass without it once 1–4 green) |

**Claim tags:** label every SC-004 claim **measured** / **inferred** / **guess**. SC-004 Pass requires **measured** suite exits (0) for criteria 1–4 with T029 **and** T030 on the same checkout.

| Outcome | When |
|---------|------|
| **Pass (SC-004 keyless)** | Criteria 1–4 green on one checkout that includes T029+T030; VERDICT + logs under `evidence/scenario-4/`; progress + final + shell negatives all **measured** |
| **Fail (SC-004)** | Any of 1–4 red; or shell-synthesized progress/final IPC; or final without prior Host-stream progress on the scripted path |
| **Deferred (SC-004)** | Recipe present (T032) but T030 not yet on checkout, or composite not yet re-run after T030 lands — stamp `VERDICT: Deferred` + `DEFER_REASON`. **Does not** mark SC-004 Done |
| **Blocked** | Missing T029, Scenario 0 Fail, or Desktop/ui-chat harness unusable |

## Evidence home

Record under [evidence/scenario-4/](./evidence/scenario-4/):

| Artifact | Suggested name | Required? |
|----------|----------------|-----------|
| Verdict stamp | `VERDICT.txt` | Yes |
| T029 ui-chat stdout | `vitest-t029-ui-chat.log` | Yes for Pass |
| T029 shell stdout | `vitest-t029-shell.log` | Yes for Pass |
| T030 ui-chat stdout | `vitest-t030-ui-chat.log` | Yes for Pass |
| T030 shell stdout | `vitest-t030-shell.log` | Yes for Pass |
| T030 absent note | `t030-absent.txt` | When T030 missing (Deferred) |
| Live Desktop note / screenshot | `live-desktop.(txt\|png)` | Optional |

Minimal stamp template:

```text
VERDICT: Pass|Fail|Deferred|Blocked
SC: SC-004
SHA: <git rev-parse HEAD>
BRANCH: <branch>
UTC: <ISO-8601>
OPERATOR: <name>
RECIPE: specs/001-multi-model-bots/verifier/scenario-4-progress-final.md
T029: Pass|Fail
T030: Pass|Fail|Deferred
SHELL_PROGRESS_IPC: Pass|Fail
SHELL_FINAL_IPC: Pass|Fail|Deferred
LIVE: Pass|Deferred|Fail|Skipped
EVIDENCE: evidence/scenario-4/<files>
CLAIM: measured|inferred|guess
DEFER_REASON: <only when Deferred>
BLOCKER: <only when Blocked>
```

## Topology unchanged

Locked Desktop topology remains: Electron Main + preload lifecycle IPC only; Web under `dsh-app://` talks Host HTTP/WS. Progress rides Host session/agent streams; finals ride the durable session log — Shell MUST NOT synthesize a parallel progress or final protocol ([contract](../contracts/chat-progress-final.md)).

## Related

- Contract: [../contracts/chat-progress-final.md](../contracts/chat-progress-final.md)
- Quickstart Scenario 4: [../quickstart.md](../quickstart.md)
- T029 Host-stream progress: [t029-chat-progress.md](./t029-chat-progress.md) · evidence [evidence/t029-chat-progress/](./evidence/t029-chat-progress/)
- T030 session-log finals: [t030-chat-final.md](./t030-chat-final.md) · evidence [evidence/t030-chat-final/](./evidence/t030-chat-final/)
- Scenario 0 topology gate: [scenario-0-topology.md](./scenario-0-topology.md)
- Scenario 3 mailbox (optional same-session reuse): [scenario-3-mailbox.md](./scenario-3-mailbox.md)
