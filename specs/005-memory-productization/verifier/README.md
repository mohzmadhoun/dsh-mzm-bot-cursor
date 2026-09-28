# Verifier recipes — Phase 5 Memory productization

**Feature:** `specs/005-memory-productization`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**PO / Architect lock:** Host Memory catalog SoT (research R1; prefer Agent Teams / Host journal) — see [research.md](../research.md) / [plan.md](../plan.md)
**Setup inventories:** [host-memory-inventory.md](./host-memory-inventory.md) (T002) · [memory-inject-inventory.md](./memory-inject-inventory.md) (T003) · [memory-seam-locks.md](./memory-seam-locks.md) (T004)
**Evidence:** [evidence/](./evidence/) — foundation stamp under [evidence/foundation-host/](./evidence/foundation-host/); Scenario 1 SC-001/SC-002/SC-003 under [evidence/scenario-1/](./evidence/scenario-1/) (T016/T019/T022); Scenario 2 SC-004 under [evidence/scenario-2/](./evidence/scenario-2/) (T026); Scenario 3 SC-005/SC-010 under [evidence/scenario-3/](./evidence/scenario-3/) (T030 [#195](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/195)); non-goals [non-goals.md](./non-goals.md) + [evidence/non-goals/](./evidence/non-goals/) (alias [evidence/scenario-4/](./evidence/scenario-4/)); Scenario 5 [scenario-5-full-replay.md](./scenario-5-full-replay.md) + [evidence/scenario-5/](./evidence/scenario-5/) (T033/T035 stamped); GUI media + PR embeds for Scenario recipes (SO 11+12)
**Linear:** Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228) · T001 [MOH-238](https://linear.app/momadhoun/issue/MOH-238) · T002 [MOH-239](https://linear.app/momadhoun/issue/MOH-239) · T003 [MOH-240](https://linear.app/momadhoun/issue/MOH-240) · T004 [MOH-241](https://linear.app/momadhoun/issue/MOH-241) · T005 [MOH-242](https://linear.app/momadhoun/issue/MOH-242) · T013 [MOH-250](https://linear.app/momadhoun/issue/MOH-250) · T016 [MOH-253](https://linear.app/momadhoun/issue/MOH-253) · T030 [MOH-268](https://linear.app/momadhoun/issue/MOH-268) · T031 [MOH-269](https://linear.app/momadhoun/issue/MOH-269) · T032 [MOH-270](https://linear.app/momadhoun/issue/MOH-270) · T033 [MOH-271](https://linear.app/momadhoun/issue/MOH-271) · T034 [MOH-272](https://linear.app/momadhoun/issue/MOH-272) · T035 [MOH-273](https://linear.app/momadhoun/issue/MOH-273) · T036 [MOH-274](https://linear.app/momadhoun/issue/MOH-274) · T037 [MOH-275](https://linear.app/momadhoun/issue/MOH-275)

## Foundational Pass gate (T013)

**Rule:** Product success criteria **SC-001…SC-010** MUST NOT be marked Done without a recorded foundational Pass (Host `MemoryRecord` + catalog + Host projection/mutations + inject-bind doc + Electron exclusion docs + no-Electron-memory-bus guard + transcript≠memory regression). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location |
|---------------|----------|
| Host memory inventory (T002) | [host-memory-inventory.md](./host-memory-inventory.md) |
| Memory inject inventory (T003) | [memory-inject-inventory.md](./memory-inject-inventory.md) |
| Memory seam locks (T004) | [memory-seam-locks.md](./memory-seam-locks.md) |
| Host types + catalog + Remotes (T006–T008) | `packages/experimental/agent-team/` (merged [#178](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/178)) |
| Inject-bind doc (T009) | [memory-inject-bind.md](./memory-inject-bind.md) (merged [#176](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/176)) |
| Electron exclusion + no-memory-bus (T010–T011) | `apps/desktop/` (merged [#177](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/177)) |
| Transcript ≠ memory (T012) | [transcript-not-memory.md](./transcript-not-memory.md) (merged [#176](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/176)) |
| Foundational Pass checklist (T013) | this README (checklist below) |
| Evidence (post-merge rerun) | [evidence/foundation-host/](./evidence/foundation-host/) |

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only)
**Stamp:** 2026-09-28 · tip `origin/master` @ `bb73a3eac0` (includes merged [#178](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/178) T006–T008 · [#177](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/177) T010–T011 · [#176](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/176) T009/T012 · [#175](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/175)/[#174](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/174)/[#173](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/173) Setup)
**Linear:** [MOH-250](https://linear.app/momadhoun/issue/MOH-250) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Scope lock:** This Pass does **not** mark SC-001…SC-010 Done. Scenario recipes and product US1–US5 implementation remain open. US fan-out may begin after this stamp lands on master.

| # | Foundation | Task | Pass bar | Evidence | Claim |
|---|------------|------|----------|----------|-------|
| 1 | **MemoryRecord types** | T006 | Host `MemoryRecord` with branded `memoryId`, `kind: profile\|log\|note`, `layer: agent\|user`, `botId` required when agent / null when user, non-empty `content`, `createdAt`, `updatedAt` | **measured:** `packages/experimental/agent-team/src/types.ts` exports `MemoryRecord` / `MemoryKind` / `MemoryLayer`; merge [#178](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/178) | Pass |
| 2 | **Host catalog** | T007 | Durable write/list by bot + account-wide user rows on Host journal `team/memory` — not Electron Main, not transcript, not Client-only SoT | **measured:** `TeamService.writeMemory` / `listMemories`; journal append `team/memory`; focused agent-team vitest **3 passed** ([evidence](./evidence/foundation-host/vitest-memory.log)) | Pass |
| 3 | **Host Remotes / projection** | T008 | Authenticated Host HTTP/WS mutations + Client-readable memory projection; Client invents no SoT | **measured:** `@Remote('writeMemory')` / `@Remote('listMemories')`; `projectMemory` / `projectMemories` / `view.memories` | Pass |
| 4 | **Inject-bind doc** | T009 | Host `MemoryRecallInject` / instruction-bind approach locked; Verifier observes wiring not LLM wording | **measured:** [memory-inject-bind.md](./memory-inject-bind.md); merge [#176](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/176) | Pass |
| 5 | **Electron exclusion docs** | T010 | host-protocol / ipc forbid memory-catalog, write, list/browse, recall, injection on Node IPC | **measured:** exclusion comments in `apps/desktop/src/host-protocol.ts` (+ ipc); merge [#177](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/177) | Pass |
| 6 | **No Electron memory bus** | T011 | Electron Main has no parallel memory store/bus/write/recall/inject | **measured:** `apps/desktop/tests/no-electron-memory-bus.spec.ts` — **3 passed** ([evidence](./evidence/foundation-host/vitest-electron-bus.log)) | Pass |
| 7 | **Transcript ≠ memory** | T012 | P5 Pass path is Host catalog write/list/recall + Host inject — not transcript dump; Client-only persistence is not SoT | **measured:** [transcript-not-memory.md](./transcript-not-memory.md); merge [#176](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/176) | Pass |

**Rerun (idempotent):**

```sh
pnpm exec vitest run packages/experimental/agent-team -t 'memory|Memory|writeMemory|listMemories'
pnpm exec vitest run apps/desktop/tests/no-electron-memory-bus.spec.ts
test -f specs/005-memory-productization/verifier/memory-inject-bind.md
test -f specs/005-memory-productization/verifier/transcript-not-memory.md
rg -n "export interface MemoryRecord" packages/experimental/agent-team/src/types.ts
rg -n "team/memory" packages/experimental/agent-team/src/journal.ts
rg -n "@Remote\\('writeMemory'\\)|@Remote\\('listMemories'\\)" packages/experimental/agent-team/src/index.ts
rg -n 'memory-catalog|memory-injection' apps/desktop/src/host-protocol.ts
```

**PO / DH Lead:** Foundations hold on master tip above. Do **not** close product SC Done on this stamp. Leave [MOH-250](https://linear.app/momadhoun/issue/MOH-250) In Progress until this stamp PR merges; then Done. Next: US1 write profile (T014+) + Scenario 1 recipe.

## FR-011/012 / standing orders 11+12 — desktop visual evidence (mandatory)

**Rule:** Every **GUI** acceptance scenario (US1–US5 / SC-001…SC-005 / SC-007 full replay) requires **desktop screenshot(s) and/or a short screen recording** of the real Desktop app, **committed** under `specs/005-memory-productization/verifier/evidence/` **and** embedded in the GUI PR body (absolute `/opt/cursor/artifacts/…` paths for ManagePullRequest uploads). Unit/jsdom alone **fails** those scenarios. Scenario 4 (non-goals / seam absence) is docs/absence — GUI screenshot optional.

Evidence layout (T032 placeholders present):

```text
specs/005-memory-productization/verifier/evidence/
├── scenario-1/   # QS1 write profile/log/note — screenshots / recording + VERDICT.txt · README.md
├── scenario-2/   # QS2 recall after restart
├── scenario-3/   # QS3 agent vs user layers
├── scenario-4/   # alias → non-goals (QS4 / SC-006) — docs/absence ok
├── non-goals/    # canonical SC-006 / SC-008…010 measured absence checks
└── scenario-5/   # QS5 full replay (T033 Verifier)
```

## Scenario 1–5 owners map (T034 re-validated)

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature). Owner labels are **Runtime** / **Client** / **Electron** / **Verifier** per T005.

| Scenario | Quickstart | Recipe path | Evidence | Primary owners | Acceptance | FR-011/012 |
|----------|------------|-------------|----------|----------------|------------|------------|
| **1** Write profile / log / note | [Scenario 1](../quickstart.md#scenario-1--write-profile--log--note) | [scenario-1-write-kinds.md](./scenario-1-write-kinds.md) (T016 SC-001 · T019 SC-002 · T022 SC-003 stamped) · [write-kinds.md](../contracts/write-kinds.md) | [evidence/scenario-1/](./evidence/scenario-1/) | **Runtime** + **Client** + **Verifier** | SC-001, SC-002, SC-003, SC-009 | **Required** |
| **2** Recall after restart | [Scenario 2](../quickstart.md#scenario-2--recall-after-restart) | [scenario-2-recall.md](./scenario-2-recall.md) (T026 SC-004 stamped) · [recall.md](../contracts/recall.md) | [evidence/scenario-2/](./evidence/scenario-2/) | **Runtime** + **Client** + **Verifier** | SC-004 | **Required** |
| **3** Agent vs user layers | [Scenario 3](../quickstart.md#scenario-3--agent-vs-user-layers) | [scenario-3-layers.md](./scenario-3-layers.md) (T030 SC-005/SC-010 stamped) · [layers.md](../contracts/layers.md) | [evidence/scenario-3/](./evidence/scenario-3/) | **Runtime** + **Client** + **Verifier** | SC-005, SC-010 | **Required** |
| **4** Non-goals / seam absence | [Scenario 4](../quickstart.md#scenario-4--non-goals--seam-absence) | [non-goals.md](./non-goals.md) (T031) · [transcript-not-memory.md](./transcript-not-memory.md) · T011/T035 bus guard · [contracts/non-goals.md](../contracts/non-goals.md) | [evidence/non-goals/](./evidence/non-goals/) (alias [evidence/scenario-4/](./evidence/scenario-4/)) | **Runtime** + **Electron** + **Verifier** | SC-006, SC-008…010 | Docs/absence ok |
| **5** Full Phase 5 replay | [Scenario 5](../quickstart.md#scenario-5--full-phase-5-replay) | [scenario-5-full-replay.md](./scenario-5-full-replay.md) (T033 SC-007 stamped) · all contracts | [evidence/scenario-5/](./evidence/scenario-5/) | **Verifier** | SC-007 (+ composite of 1–4 + T013) | **Required** |

Foundational Pass (T013) must hold before Scenario evidence counts toward phase Done. T033 full-replay recipe + T035 bus reconfirm stamped under [evidence/scenario-5/](./evidence/scenario-5/).

### T034 map re-validation stamp

**Verdict:** **Pass** (docs map consistency)
**Stamp:** 2026-09-28 · polish branch `cursor/p5-polish-docs-fe1d` rebased on master tip `bc01ee30ac` (T030 [#195](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/195) · T028 [#192](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/192))
**Checks:** quickstart Scenario 1–5 sections link recipes + evidence dirs; this table matches; T030 scenario-3 media stamped; T032 placeholders present under non-goals / scenario-4 / scenario-5.

**Seam honesty (T037):** Memory Pass is Host Memory catalog write/list/recall + Host inject — **not** “transcript dump,” **not** “Electron Main store,” **not** “Client-only SoT.” See [transcript-not-memory.md](./transcript-not-memory.md) · [non-goals.md](./non-goals.md).

## T036 — No rewrite of `specs/001`–`004`

**Rule:** Phase 5 implement / Verifier PRs for `specs/005-memory-productization` MUST NOT product-edit:

- `specs/001-multi-model-bots/**`
- `specs/002-identity-personas/**`
- `specs/003-skills-ux/**`
- `specs/004-routines-cron/**`

Prior-phase trees stay frozen unless a separate, explicitly scoped phase PR owns the change. Spec Kit feature work for Memory lives only under `specs/005-memory-productization/`.

**Spot-check (per implement PR tip vs merge-base):**

```sh
git diff --name-only origin/master...HEAD -- \
  specs/001-multi-model-bots specs/002-identity-personas \
  specs/003-skills-ux specs/004-routines-cron
# Expect empty output for P5 Memory productization PRs.
```

**Claim:** Documented here (T036). File measured output under [evidence/non-goals/](./evidence/non-goals/) when stamping SC-006.

## T037 — Pass-path language (no forbidden SoT wording)

**Rule:** Product and Verifier docs MUST NOT document Memory Pass as any of:

1. “transcript dump” / chat dump alone as curated memory
2. “Electron Main store” / Main bus as durable Memory SoT
3. “Client-only SoT” / Client-local persistence alone as durable Memory SoT

Affirmative Pass path: **Host Memory catalog** (prefer Agent Teams / Host journal `team/memory`) + user-visible write UI + surface recall after restart + one model-visible Host inject.

**Spot-check:**

```sh
# Fail if product paths affirm Memory Pass *as* those forbidden SoTs
! rg -n -i 'documents Memory Pass as|Pass as (transcript dump|Electron Main store|Client-only SoT)|Pass via (transcript dump|Electron Main store|Client-only SoT)|Memory Pass (is|=) (transcript dump|Electron Main store|Client-only SoT)' \
  apps/desktop-host/src \
  packages/experimental/client-ui-agent-team/src/client \
  --glob '!**/node_modules/**' --glob '!**/lib/**'
# Affirm Host SoT + T037 seam honesty in Verifier README
rg -n 'Host Memory catalog SoT|Seam honesty \(T037\)' \
  apps/desktop-host/src/index.ts \
  specs/005-memory-productization/verifier/README.md
```

**Claim:** Documented here (T037). Product Host comment + Client JSDoc already forbid Main/transcript paths; Verifier README affirms Host SoT.

## Owner roles (T005)

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Runtime** | Host Memory catalog durability, list/browse after restart, model-visible inject path (wiring only — not LLM wording), agent/user layer honesty |
| **Client** | Memory write / browse / recall / layer surfaces on Desktop Web (Host HTTP/WS only) |
| **Electron** | Thin-shell absence: no Main memory bus/store/IPC SoT (T010/T011); desktop launch path for GUI evidence |
| **Verifier** | Rerunnable recipes, pass/fail stamps, FR-011/012 committed screenshots/recordings + PR embeds, Scenario 5 composite replay |

## Clarify / Architect locks (honor in every recipe)

1. Host Memory catalog is SoT — Client and Electron Main invent no durable memory rows (R1 / FR-004).
2. Agent layer per `botId`; user layer account-wide (ADR; R2 / FR-006/007).
3. Kinds × layers orthogonal — no kind→layer locks as Pass (FR-017 / SC-010).
4. Write Pass = user-visible UI; bot-tool write optional (FR-015 / SC-009).
5. Recall Pass = surface browse/recall after restart **and** one model-visible Host inject path; do **not** score LLM wording (FR-005/014/016 / SC-004).
6. No Electron Main memory bus — lifecycle IPC only; memory traffic on authenticated Host HTTP/WS (R7).
7. Transcript ≠ curated memory — chat dump alone fails Pass (R6). Memory Pass is **not** transcript dump, Electron Main store, or Client-only SoT (T037).
8. FR-011/012 desktop visual evidence required for all GUI scenarios; commit under `verifier/evidence/` + PR embeds (SO 11+12).
9. No product rewrite of `specs/001`–`004` in P5 implement PRs (T036).

## Fan-out policy

- Setup T001–T005 may land before Host foundation.
- **US1–US5 product work unblocked** after T006–T013 land on master (this stamp). Product SC still require Scenario recipes + FR-011/012 evidence.
- Scenario 5 requires Scenarios 1–4 (or equivalent) plus foundational Pass.
- Quickstart non-goals MUST NOT appear in Pass criteria ([quickstart.md](../quickstart.md) Scenario 4).
- Polish docs T031/T032/T034/T036/T037 land here; T033 full replay + T035 bus recheck stay Verifier-owned.

## Rerun Setup (idempotent)

```sh
test -f specs/005-memory-productization/spec.md
test -f specs/005-memory-productization/plan.md
test -f specs/005-memory-productization/research.md
test -f specs/005-memory-productization/data-model.md
test -f specs/005-memory-productization/quickstart.md
test -f specs/005-memory-productization/contracts/README.md
test -f specs/005-memory-productization/checklists/requirements.md
test -f specs/005-memory-productization/verifier/README.md
test -f specs/005-memory-productization/verifier/non-goals.md
test -f specs/005-memory-productization/verifier/evidence/scenario-3/README.md
test -f specs/005-memory-productization/verifier/evidence/non-goals/README.md
test -f specs/005-memory-productization/verifier/evidence/scenario-4/README.md
test -f specs/005-memory-productization/verifier/evidence/scenario-5/README.md
rg -n 'Scenario 1–5 owners map' specs/005-memory-productization/verifier/README.md
rg -n 'T036 — No rewrite' specs/005-memory-productization/verifier/README.md
rg -n 'T037 — Pass-path language' specs/005-memory-productization/verifier/README.md
rg -n 'standing orders 11\+12' specs/005-memory-productization/verifier/README.md
rg -n 'Foundational Pass checklist — recorded' specs/005-memory-productization/verifier/README.md
```

**PO / DH Lead:** T013 foundational checklist **Pass** (T006–T012 on master tip above). Polish docs T031/T032/T034/T036/T037 on this branch — leave Linear In Progress until Verifier/PO close. Do **not** mark product SC Done on this stamp. T033 / T035 remain Verifier-owned.
