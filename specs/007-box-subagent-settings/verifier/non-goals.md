# Phase 7 Verifier — explicit non-goals (SC-005)

**Owners:** DH Verifier (absence checks) · DH Electron (no Main bus) · DH Spec (scope) · DH Architect (seam honesty) · PO (scope)
**Status:** Recipe complete (T028) — measured spot-checks land with Verifier stamp under [evidence/non-goals/](./evidence/non-goals/) when SC-005 is claimed
**Linear:** [MOH-384](https://linear.app/momadhoun/issue/MOH-384/t028-verifier-non-goals-recipe-sc-005) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project `P-MOH-2` only
**Acceptance:** Spec FR-006 · FR-007 · FR-008 · FR-009 · FR-010 · FR-011 · SC-005 · Out of Scope · [quickstart.md](../quickstart.md) Scenario 4
**Contract:** [contracts/non-goals.md](../contracts/non-goals.md)
**Seam locks:** [box-computer-seam-locks.md](./box-computer-seam-locks.md)
**Evidence home:** [evidence/non-goals/](./evidence/non-goals/) (optional docs/absence notes; GUI screenshot optional)

## Global Pass / Fail (T028)

**Pass** when every checklist row below holds and no Scenario 1–5 (SC-001…SC-006) recipe **requires** an Out of Scope surface to Pass.

**Fail** T028 (and reopen the owning FR / Scenario) if any of:

- A Phase 7 product Scenario Pass begins requiring user machines / ListMachines / CopyToBox–CopyFromBox / local-exec on user PC (FR-006)
- A Phase 7 product Scenario Pass begins requiring voice, draft-first send-on-behalf, group channels, learn-from-demo, billing chrome, full skill pack, or pixel Grok (FR-007)
- Verifier-as-a-feature is treated as P7 product scope (FR-008)
- Implement PRs rewrite product scope in `specs/001`–`006` (FR-009)
- Full Grok Computer catalog (Update/Reset/box-doctor/…) is treated as a mandatory Pass gate (FR-010)
- Interactive browser click/type is required for computerUse Pass (clarify lock / FR-003)
- Every box backend topology beyond one local Pass path is required (FR-011)
- PTC or brokered remote is required as the Shell Pass path (Architect Path A)
- Full inventory subagent set (executor / video / CloudAgent) is required for Pass
- Electron Main is treated as box / Shell / computerUse / Computer-settings SoT (research R1 / R6)
- Scenario 4 / SC-005 treats absence of those surfaces as Fail

GUI screenshot optional for this docs/absence recipe (FR-013/014 mandatory only for GUI Scenarios 1–3 and Scenario 5 GUI slices).

## Absence checklist

| Non-goal | Pass bar (must **not** be required / must not be SoT) | Status |
|----------|--------------------------------------------------------|--------|
| User machines | No ListMachines / CopyToBox–CopyFromBox / local-exec-on-user-PC required for Pass (FR-006) | Recipe ready — stamp under evidence/non-goals |
| Voice / draft-first / group / learn-from-demo / billing / full skill pack / pixel Grok | None required for Pass (FR-007) | Recipe ready |
| Verifier-as-a-feature | Verifier remains acceptance gate only (FR-008) | Recipe ready |
| Rewrite of `specs/001`–`006` | P7 implement PRs do not product-edit prior feature trees (FR-009 / T033) | Recipe ready — T033 |
| Full Grok Computer catalog | Only **Shell** + **Computer use** rows required; Update/Reset/box-doctor optional (FR-010) | Recipe ready |
| Interactive browser as Pass gate | Screenshot-only + handoff enough (FR-003) | Recipe ready |
| Every box backend topology | One Verifier-reachable **local** Shell/box path enough (FR-011) | Recipe ready |
| PTC / remote as Shell Pass | Local Host sandboxed Shell only for Pass (Path A) | Recipe ready |
| Full inventory subagent set | One computerUse-class path enough | Recipe ready |
| Electron Main box/Shell/computerUse bus | No Main store/bus as SoT (`no-electron-box-shell-computer-bus`) | Recipe ready — T032 Verifier/Electron owns rerun |
| Chrome ≠ substitute | SC-004 — settings-only fails Phase | Covered by Scenario 3 recipe |

---

## User machines (FR-006)

**Acceptance:** Spec Out of Scope · FR-006 · SC-005

Phase 7 Pass MUST NOT require user-machine targeting, CopyToBox/CopyFromBox to user PCs, or local-execution-on-user-machine.

**Spot-check:**

```sh
! rg -n -i 'user.?machine.*(required|must).*Pass|CopyToBox.*(required|must).*Pass|ListMachines.*(required|must).*Pass|local.?exec.*(user).*(required|must).*Pass' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md \
  specs/007-box-subagent-settings/verifier/non-goals.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Voice / draft-first / group / learn-from-demo / billing / skill pack / pixel Grok (FR-007)

**Acceptance:** Spec Out of Scope · FR-007 · SC-005

Phase 7 Pass MUST NOT require those Out of Scope product surfaces.

**Spot-check:**

```sh
! rg -n -i '(voice|draft.?first|group channel|learn.?from.?demo|billing chrome|full skill pack|pixel grok).*(required|must).*Pass|Pass.*(requires|require).*(voice|draft.?first|billing|pixel grok)' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md \
  specs/007-box-subagent-settings/verifier/non-goals.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## Verifier-as-a-feature (FR-008)

**Acceptance:** FR-008 · SC-005 · Out of Scope

Building Verifier MUST NOT be treated as Phase 7 product scope. Verifier remains the acceptance gate for every phase.

**Spot-check:**

```sh
! rg -n -i 'build verifier.*(product|feature).*Pass|Pass.*(requires|require).*verifier.?as.?a.?feature|verifier.*(is|as).*product (feature|scope)' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md
```

**Claim:** Recipe documents absence — Verifier stamps when spot-check is measured.

---

## No rewrite of `specs/001`–`006` (FR-009 / T033)

**Acceptance:** FR-009 · Out of Scope · T033

P7 implement PRs MUST NOT product-edit `specs/001-multi-model-bots/**` … `specs/006-connectors-mcp-events-trust/**`.

**Spot-check:** Documented in [README.md](./README.md) when T033 runs. Example:

```sh
# Against the polish PR tip vs merge-base (expect empty product diff under 001–006)
git diff --name-only origin/master...HEAD -- \
  specs/001-multi-model-bots specs/002-identity-personas \
  specs/003-skills-ux specs/004-routines-cron \
  specs/005-memory-productization specs/006-connectors-mcp-events-trust
```

**Claim:** Recipe + README T033 note — Verifier / Spec confirm on implement PRs.

---

## Full Computer catalog not required (FR-010)

**Acceptance:** FR-010 · SC-005 · [scenario-3-settings-computer.md](./scenario-3-settings-computer.md)

Only **Shell** and **Computer use** rows under Settings → **Computer** are required. Update/Reset/box-doctor/full catalog MUST NOT be Pass gates.

**Spot-check:**

```sh
! rg -n -i '(Update|Reset|box.?doctor|full (grok )?catalog).*(required|must).*Pass|Pass.*(requires|require).*(Update|Reset|box.?doctor)' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md
rg -n 'FR-010|Update/Reset|catalog not required' \
  specs/007-box-subagent-settings/verifier/scenario-3-settings-computer.md \
  specs/007-box-subagent-settings/verifier/non-goals.md
```

**Claim:** Scenario 3 recipe already notes FR-010 — spot-check confirms no over-strict gate.

---

## Interactive browser not a Pass gate (FR-003)

**Acceptance:** FR-003 · clarify lock · SC-005 · [scenario-2-computer-use.md](./scenario-2-computer-use.md)

computerUse Pass = screenshot-only (or equiv.) + parent handoff. Interactive browser click/type MUST NOT be required.

**Spot-check:**

```sh
! rg -n -i 'interactive browser.*(required|must).*Pass|Pass.*(requires|require).*interactive browser|click.?/?type.*(required|must).*Pass' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md
rg -n 'interactive browser not required|screenshot-only|FR-003' \
  specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md \
  specs/007-box-subagent-settings/verifier/non-goals.md
```

**Claim:** Scenario 2 recipe already locks screenshot-only — spot-check confirms.

---

## Local Shell only / no PTC-as-Pass (FR-011 · Path A)

**Acceptance:** FR-011 · Architect Path A · [scenario-1-shell-box.md](./scenario-1-shell-box.md)

One Verifier-reachable **local** Host sandboxed Shell tool success is enough. PTC / brokered remote MUST NOT be required for Shell Pass.

**Spot-check:**

```sh
! rg -n -i 'PTC.*(required|must).*Pass|Pass.*(requires|require).*PTC|brokered remote.*(required|must).*Pass|Pass.*(requires|require).*(brokered )?remote.*(Shell|box)' \
  specs/007-box-subagent-settings/verifier/scenario-*.md \
  specs/007-box-subagent-settings/verifier/README.md
rg -n 'FR-011|local only|PTC/remote not Pass' \
  specs/007-box-subagent-settings/verifier/scenario-1-shell-box.md \
  specs/007-box-subagent-settings/verifier/non-goals.md
```

**Claim:** Scenario 1 recipe already locks local-only — spot-check confirms.

---

## No Electron box / Shell / computerUse bus

**Acceptance:** research R1 / R6 · T013/T014/T032 · [contracts/non-goals.md](../contracts/non-goals.md)

Electron Main MUST NOT be the durable box / Shell / computerUse / Computer-settings SoT.

| Observation | Pass | Fail |
|-------------|------|------|
| IPC surface | Lifecycle-only desktop host channels | `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` on Node IPC |
| Store / write | Absent in Main / preload | Main box/Shell/computerUse/settings store as SoT |
| Guard | `apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts` green | Spec Fail or missing exclusion docs |

**Rerun (T032 — Electron / Verifier owns):**

```sh
pnpm exec vitest run apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts
rg -n 'shell-exec|box-ready|computer-use-control|computer-screenshot|computer-settings-mutate' \
  apps/desktop/src/host-protocol.ts apps/desktop/src/ipc.ts | head -20
```

**Claim:** Recipe documents bar — T032 re-validates after story work.

---

## Traceability

| Artifact | Role |
|----------|------|
| [../contracts/non-goals.md](../contracts/non-goals.md) | Contract absence table |
| [box-computer-seam-locks.md](./box-computer-seam-locks.md) | Full seam lock set |
| [scenario-5-full-replay.md](./scenario-5-full-replay.md) | SC-006 composite (T030 — Verifier owns; must keep non-goals green) |
| [evidence/non-goals/](./evidence/non-goals/) | Measured-check home (optional) |
| [../spec.md](../spec.md) Out of Scope · FR-006…FR-011 · SC-005 | Normative non-goals |
| T028 / T032 / T033 | Absences + bus guard + no-rewrite |
