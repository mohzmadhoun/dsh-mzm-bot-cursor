# Phase 4 Verifier — explicit non-goals (SC-004)

**Owners:** DH Verifier (absence checks) · DH Runtime (Host catalog SoT) · DH Electron (no Main bus) · PO (scope)
**Status:** Complete — T029 SC-004 absence recipe + measured spot-checks (docs/absence; GUI screenshot optional)
**Linear:** T029 [MOH-222](https://linear.app/momadhoun/issue/MOH-222) · Epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188)
**Acceptance:** Spec FR-006 · FR-008 · SC-004 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 4
**Contract:** [contracts/non-goals.md](../contracts/non-goals.md)
**Schedule ≠ Routines:** [schedule-not-routines.md](./schedule-not-routines.md)
**Optional jobs:** [optional-jobs-visibility.md](./optional-jobs-visibility.md)
**Evidence home:** [evidence/non-goals/](./evidence/non-goals/) (T030) · alias [evidence/scenario-4/](./evidence/scenario-4/)

## Global Pass / Fail (T029)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-007) recipe **requires** an Out of Scope surface to Pass.

**Fail** T029 (and reopen the owning FR / Scenario) if any of:

- A Phase 4 product Scenario Pass begins requiring event-triggered routines (Slack/GitHub/email/webhook/…)
- A Phase 4 product Scenario Pass begins requiring memory recall UX (P5)
- A Phase 4 product Scenario Pass begins requiring Box / Shell / computer-use parity (P7)
- A Phase 4 product Scenario Pass begins requiring MCP / connectors / 1Password-class vault UX (P6)
- Electron Main is treated as durable Routines SoT (parallel bus / timers / fire IPC)
- Routines Pass is claimed via “mount `dsh-schedule` / Schedule overlay alone”
- `dsh-jobs` is treated as Routine catalog or cron SoT
- Scenario 4 / SC-004 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-010/011 mandatory only for GUI Scenarios 1–3 and 5).

## Absence checklist

| Non-goal | Pass bar (must **not** be required / must not be SoT) | Status |
|----------|--------------------------------------------------------|--------|
| Event-triggered routines | No Slack/GitHub/email/webhook event path required for Pass (P6) | **measured** — see [Event listeners](#event-listeners-p6) |
| Memory recall UX | No memory profile/log/note/recall product flow required for P4 Pass (P5) | **measured** — see [Memory UX](#memory-ux-p5) |
| Box / Shell / computer-use | No Box/local Shell/computer-use parity required for Pass (P7) | **measured** — see [Box / Shell / computer-use](#box--shell--computer-use-p7) |
| MCP / connectors / vault UX | No MCP skill catalog or vault UX required for Pass (P6) | **measured** — see [MCP / vault UX](#mcp--vault-ux-p6) |
| Electron Main routines bus | No Main store/bus/timers/fire IPC as SoT (`no-electron-routines-bus`) | **measured** — see [No Electron routines bus](#no-electron-routines-bus) |
| `dsh-schedule` as Routines SoT | Session reminders only; not “enable Schedule overlay” Pass path | **measured** — see [Schedule ≠ Routines SoT](#schedule--routines-sot) |
| `dsh-jobs` as catalog/cron SoT | Optional in-flight visibility only | **measured** — see [Jobs ≠ catalog SoT](#jobs--catalog-sot) |

---

## Event listeners (P6)

**Acceptance:** Spec Out of Scope · FR-006 · SC-004 · research R9

Phase 4 Pass MUST NOT require event-triggered routines.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Cron create / list / pause / fire alone | Requiring Slack/GitHub/email/webhook event listeners for Done |
| Product surfaces | May omit event ingress | Scenario Pass blocked on missing event UX |

**Spot-check:**

```sh
# Expect no Scenario Pass criterion that requires event listeners.
! rg -n -i 'event.?listener.*(required|must).*Pass|Pass.*(requires|require).*event.?trigger|webhook.*(required|must).*Pass' \
  specs/004-routines-cron/verifier/scenario-*.md \
  specs/004-routines-cron/verifier/README.md \
  specs/004-routines-cron/verifier/non-goals.md
```

**Claim:** **measured** — Scenario 1–5 recipes omit event listeners as a Pass gate.

---

## Memory UX (P5)

**Acceptance:** Spec Out of Scope · P5 deferral

Phase 4 Pass MUST NOT require memory productization / recall UX.

| Observation | Pass | Fail |
|-------------|------|------|
| Scenario Pass criteria | Routines cron path alone | Requiring memory profile/log/note/recall for Done |

**Spot-check:**

```sh
! rg -n -i 'memory (profile|log|note|recall).*(required|must).*Pass|Pass.*(memory (profile|UX|recall))' \
  specs/004-routines-cron/verifier/scenario-*.md \
  specs/004-routines-cron/verifier/README.md
```

**Claim:** **measured** — no Scenario recipe requires memory UX for Pass.

---

## Box / Shell / computer-use (P7)

**Acceptance:** Spec Out of Scope · P7 deferral

Phase 4 Pass MUST NOT require Box / local Shell / computer-use parity.

**Spot-check:**

```sh
! rg -n -i 'box.*(required|must).*Pass|computer.?use.*(required|must).*Pass|local shell.*(required|must).*Pass' \
  specs/004-routines-cron/verifier/scenario-*.md \
  specs/004-routines-cron/verifier/README.md
```

**Claim:** **measured** — Scenario recipes do not gate Pass on Box/Shell/computer-use.

---

## MCP / vault UX (P6)

**Acceptance:** Spec Out of Scope · P6 deferral

Phase 4 Pass MUST NOT require MCP / connectors / 1Password-class vault UX.

**Spot-check:**

```sh
# Product UX phrases only — not harness dsh-mcp package names in infra.
! rg -n -i 'mcp skill catalog|1password|vault UX|mcp connector.*(required|must)' \
  packages/experimental/client-ui-agent-team/src \
  apps/desktop/src apps/desktop-host/src \
  --glob '!**/node_modules/**' --glob '!**/lib/**' --glob '!**/tests/**' --glob '!**/README*.md'
```

**Claim:** **measured** when no product Pass-path hits. Harness MCP packages alone do not Fail (**inferred**).

---

## No Electron routines bus

**Acceptance:** FR-008 · research R7 · T010/T011 · [contracts/non-goals.md](../contracts/non-goals.md)

Electron Main MUST NOT be the durable Routines SoT.

| Observation | Pass | Fail |
|-------------|------|------|
| IPC surface | Lifecycle-only `DESKTOP_HOST_*` + `DESKTOP_IPC` | `dsh-desktop:` routine/cron-fire/last-run channels |
| Store / timers | Absent in Main / preload | Main `createRoutine` / cron timers as SoT |
| Guard | `apps/desktop/tests/no-electron-routines-bus.spec.ts` green | Spec Fail or missing exclusion docs |

**Rerun:**

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-routines-bus.spec.ts
rg -n 'routine-catalog|cron-fire|last-run|pause-routine' \
  apps/desktop/src/host-protocol.ts apps/desktop/src/ipc.ts | head -20
```

**Claim:** **measured** — guard + exclusion comments hold (T033 re-validates after story work).

---

## Schedule ≠ Routines SoT

**Acceptance:** research R2 · T004/T012 · [schedule-not-routines.md](./schedule-not-routines.md)

P4 Routines Pass MUST NOT be “enable Schedule overlay” / mount `dsh-schedule` alone.

| Observation | Pass | Fail |
|-------------|------|------|
| Pass surface | Host Routine catalog + bot routines pane | Header `ui-schedule` / session reminders alone |
| Product copy | Distinguishes session Schedule from Host routines | Documents Routines as “enable Schedule overlay” |
| Imports | Zero `@deepseek-ai/dsh-schedule` under `agent-team` Routines path | Schedule catalog used as SoT |

**Spot-check:**

```sh
! rg -n -i 'enable Schedule overlay|mount.*(dsh-schedule|Schedule overlay).*Routines|Routines.*(enable|via).*Schedule overlay' \
  packages/experimental/client-ui-agent-team/src \
  apps/desktop/src apps/desktop-host/src \
  specs/004-routines-cron/verifier/README.md \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
# Expect zero @deepseek-ai/dsh-schedule imports under agent-team Routines SoT
! rg -n "@deepseek-ai/dsh-schedule" packages/experimental/agent-team/src
test -f specs/004-routines-cron/verifier/schedule-not-routines.md
```

**Claim:** **measured** — Client locale `botRoutinesHint` states Schedule/ui-schedule is **not** the Pass surface; schedule-not-routines guard present; no “enable Schedule overlay” product path (T034).

---

## Jobs ≠ catalog SoT

**Acceptance:** research R5/R6 · T013 · [optional-jobs-visibility.md](./optional-jobs-visibility.md)

`dsh-jobs` MAY show in-flight fire visibility only — never Routine catalog / cron SoT.

| Observation | Pass | Fail |
|-------------|------|------|
| Catalog SoT | Host `team/routine` journal | Jobs records as pane list / pause authority |
| Pass independence | last-run from Host `RoutineRecord.lastRunAt` | Requiring jobs UI for SC-003 |

**Spot-check:**

```sh
test -f specs/004-routines-cron/verifier/optional-jobs-visibility.md
! rg -n -i 'jobs.*(required|must).*Pass|Pass.*(requires|require).*jobs.*(catalog|SoT)' \
  specs/004-routines-cron/verifier/scenario-*.md \
  specs/004-routines-cron/verifier/README.md
```

**Claim:** **measured** — optional-jobs doc + Scenario recipes do not require jobs for Pass. Optional T026 left unchecked.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/non-goals.md](../contracts/non-goals.md) | Contract absence table |
| [schedule-not-routines.md](./schedule-not-routines.md) | Schedule ≠ Routines SoT |
| [optional-jobs-visibility.md](./optional-jobs-visibility.md) | Jobs visibility only |
| [scenario-5-full-replay.md](./scenario-5-full-replay.md) | SC-005 composite (must keep non-goals green) |
| [evidence/non-goals/](./evidence/non-goals/) | Measured-check home (T030) |
| [../spec.md](../spec.md) Out of Scope · FR-006 · FR-008 · SC-004 | Normative non-goals |
| T029 / T033 / T034 | SC-004 absences + bus guard + Schedule-overlay copy polish |
