# Verifier recipes — Phase 7 Computer / box + subagent parity + settings chrome

**Feature:** `specs/007-box-subagent-settings`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**Architect Path A:** Host sandboxed Shell + `ctx.computerUse` (+ Cua or Host Pass fixture) + `dsh-subagent` spawn-in-process; Settings → **Computer** over Host SoT; Client projects Host HTTP/WS; no Electron Main box/Shell/computerUse/settings bus — see [research.md](../research.md) / [plan.md](../plan.md) / [box-computer-seam-locks.md](./box-computer-seam-locks.md) (T005)
**Setup inventories (T002–T005):** [host-shell-box-inventory.md](./host-shell-box-inventory.md) · [computer-use-inventory.md](./computer-use-inventory.md) · [settings-computer-inventory.md](./settings-computer-inventory.md) · [box-computer-seam-locks.md](./box-computer-seam-locks.md)
**Evidence:** [evidence/](./evidence/) — GUI slices locked as [evidence/shell-box/](./evidence/shell-box/) · [evidence/computer-use/](./evidence/computer-use/) · [evidence/settings/](./evidence/settings/) (FR-014; placeholders via plan tree / T029)
**Linear:** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · tasks [MOH-354](https://linear.app/momadhoun/issue/MOH-354) · T015 [MOH-371](https://linear.app/momadhoun/issue/MOH-371). Project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot.

## T006 — Recipe home + Scenario 1–5 owners map (Setup)

**Verdict:** **Pass** (docs map only — no product SC)
**Stamp:** 2026-09-28 · branch `cursor/p7-setup-verifier-dc28` @ tip of `origin/master` (analyze #236 landed)
**Scope lock:** This stamp creates the Verifier README and owners → quickstart map. It does **not** stamp foundational Pass (T015), Scenario recipes (T019/T023/T027/T028/T030), or product SC-001…SC-006 Done.

| Artifact | Path | Present |
|----------|------|---------|
| Spec | [spec.md](../spec.md) | Yes |
| Plan | [plan.md](../plan.md) | Yes |
| Research (Architect Path A) | [research.md](../research.md) | Yes |
| Data model | [data-model.md](../data-model.md) | Yes |
| Quickstart | [quickstart.md](../quickstart.md) | Yes |
| Contracts | [contracts/](../contracts/) (`README`, shell-box, computer-use, settings, non-goals) | Yes |
| Requirements checklist | [checklists/requirements.md](../checklists/requirements.md) | Yes |
| Analyze report | [analyze-report.md](../analyze-report.md) | Yes (pre-implement) |
| Evidence slice dirs | `evidence/{shell-box,computer-use,settings}/` | Yes (`.gitkeep`; T029 filenames later) |

**Implementer pointers:** Start at [contracts/README.md](../contracts/README.md). Honor Architect **Path A** + Clarify/PO locks in [research.md](../research.md) R0–R6. Do not invent a competing SoT (Electron Main / Client-only).

## Foundational Pass gate (T015)

**Rule:** Product success criteria **SC-001…SC-006** MUST NOT be marked Done without a recorded foundational Pass (Host `BoxBackend` readiness + sandboxed Shell mount + computerUse provider slot + subagent spawn + Computer settings SoT + Host HTTP/WS + Electron exclusion docs + no-Electron-box-shell-computer-bus guard). Product SC evidence stays under Scenario recipes; this section is the foundation gate only.

| Gate artifact | Location |
|---------------|----------|
| Design tree (T001) | [design-tree-complete.md](./design-tree-complete.md) (merged [#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241)) |
| Host Shell/box inventory (T002) | [host-shell-box-inventory.md](./host-shell-box-inventory.md) (merged [#240](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/240)) |
| computerUse inventory (T003) | [computer-use-inventory.md](./computer-use-inventory.md) (merged [#240](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/240)) |
| Settings Computer inventory (T004) | [settings-computer-inventory.md](./settings-computer-inventory.md) (merged [#239](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/239)) |
| Seam locks (T005) | [box-computer-seam-locks.md](./box-computer-seam-locks.md) (merged [#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241)) |
| Verifier recipe home (T006) | this README (merged [#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237)) |
| Host box readiness + Shell + computerUse + subagent + settings SoT + HTTP/WS (T007–T012) | `apps/desktop-host/` + `packages/settings/**` + [computer-use-pass-provider.md](./computer-use-pass-provider.md) (merged [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243)) |
| Electron exclusion docs + no-box-shell-computer bus (T013–T014) | `apps/desktop/` (merged [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244)) |
| Foundational Pass checklist (T015) | this README (checklist below) |
| Living gate (docs only) | merged [#242](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/242) @ `800b1507a6` |

### Foundational Pass checklist — recorded

**Verdict:** **Pass** (foundations only — no product SC)
**Stamp:** 2026-09-28 · tip `origin/master` @ `47cd9dd45f` (includes merged [#242](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/242) living · [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) T007–T012 @ `742b8bf3f6` · [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) T013–T014 @ `47cd9dd45f` · Setup [#241](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/241)/[#240](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/240)/[#239](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/239)/[#237](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/237))
**Linear:** [MOH-371](https://linear.app/momadhoun/issue/MOH-371) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · project `P-MOH-2` only
**Scope lock:** This Pass does **not** mark SC-001…SC-006 Done. Scenario recipes (T019/T023/T027/T028/T030) and product US1–US3 remain open. **No US product work landed before this stamp.** US1 may begin **after Verifier Pass on this T015 PR** merges to master.

| # | Foundation | Task | Pass bar | Evidence | Claim |
|---|------------|------|----------|----------|-------|
| 1 | **BoxBackend readiness SoT** | T007 | Host `readiness: not_ready\|starting\|ready\|failed`, `local: true` for Pass, `updatedAt` — not Electron Main, not Client-only | **measured:** `apps/desktop-host/src/box-readiness.ts` + `computer-settings.ts`; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 2 | **Sandboxed Shell mount** | T008 | Pass local `ctx.shell` via bash/pwsh sandbox + sandbox-local + tool-bash/pwsh on Desktop Host | **measured:** `apps/desktop-host/src/computer.ts` requires `ctx.shell`; profile mount; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 3 | **computerUse provider slot** | T009 | One `ctx.computerUse.register` provider (Cua or Host Pass fixture) documented | **measured:** [computer-use-pass-provider.md](./computer-use-pass-provider.md); `computer-use-pass-fixture.ts`; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 4 | **Subagent spawn** | T010 | `dsh-subagent` + spawn-in-process + tool-subagent available on Desktop Host | **measured:** `computer.ts` requires spawn provider; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 5 | **Computer settings SoT** | T011 | Host settings fields for Shell readiness + Computer use projection | **measured:** `apps/desktop-host/src/computer-settings.ts` + settings packages; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 6 | **Host HTTP/WS Remotes** | T012 | Authenticated Host projection/mutate for box readiness + Computer settings; Client invents no SoT | **measured:** desktop-host Remotes + box-readiness / computer specs; merge [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) | Pass |
| 7 | **Electron exclusion docs** | T013 | host-protocol / ipc forbid `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` on Node IPC | **measured:** `apps/desktop/src/host-protocol.ts` + `ipc.ts`; merge [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) | Pass |
| 8 | **No Electron box/Shell/computer bus** | T014 | Electron Main has no parallel box/Shell/computerUse/Computer-settings store/bus | **measured:** `apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts`; merge [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) | Pass |

**Rerun (idempotent):**

```sh
test -f specs/007-box-subagent-settings/verifier/computer-use-pass-provider.md
test -f specs/007-box-subagent-settings/verifier/box-computer-seam-locks.md
test -f apps/desktop-host/src/box-readiness.ts
test -f apps/desktop-host/src/computer-use-pass-fixture.ts
test -f apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts
rg -n 'shell-exec|box-ready|computer-use-control|computer-screenshot|computer-settings-mutate' apps/desktop/src/host-protocol.ts
pnpm exec vitest run apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts
pnpm exec vitest run apps/desktop-host/tests/box-readiness.spec.ts apps/desktop-host/tests/computer-use-pass-fixture.spec.ts
```

**PO / DH Lead:** Foundations hold on master tip above. Do **not** close product SC Done on this stamp. Leave [MOH-371](https://linear.app/momadhoun/issue/MOH-371) In Progress until this stamp PR merges + Verifier Pass; then Done. **Next:** US1 Shell/box (T016–T019) after Verifier Pass — no US1–US3 product code in this PR. Do **not** edit `MzM-Docs/` here (Lead owns living after Pass).

## FR-013/FR-014 / standing orders 11+12 — desktop visual evidence (mandatory)

**Rule:** Every **GUI** acceptance scenario (US1–US3 / SC-001…SC-003 / SC-006 full replay) requires **desktop screenshot(s) and/or a short screen recording** of the real Desktop app, **committed** under the named evidence slices below **and** embedded in the GUI PR body (absolute `/opt/cursor/artifacts/…` paths for ManagePullRequest uploads — standing order **12**). Unit/jsdom alone **fails** those scenarios (standing order **11** / FR-013). Scenario 4 (non-goals / seam absence) is docs/absence — GUI screenshot optional when no GUI is shown.

**Locked evidence layout (FR-014):**

```text
specs/007-box-subagent-settings/verifier/evidence/
├── shell-box/      # QS1 local Shell/box tool success — screenshots / recording + VERDICT
├── computer-use/   # QS2 computerUse screenshot + parent handoff
└── settings/       # QS3 Settings → Computer rows (chrome ≠ substitute)
```

Mirror walkthrough copies under `/opt/cursor/artifacts/` when Cloud Agent Verifier runs (SO 11). Commit under `verifier/evidence/{shell-box,computer-use,settings}/` and embed in the GUI PR body (SO 12). Cursor agent artifact page links alone MUST NOT satisfy Pass.

## Scenario 1–5 owners map (T006)

Mapped to [quickstart.md](../quickstart.md). Owner columns name who owns scripts/evidence for that scenario (not who implements the product feature alone). Owner labels are **Runtime** / **Client** / **Electron** / **Verifier** per [tasks.md](../tasks.md) ownership legend.

| Scenario | Quickstart | Recipe path (when landed) | Evidence | Primary owners | Acceptance | FR-013/014 |
|----------|------------|---------------------------|----------|----------------|------------|------------|
| **1** Local Shell/box tool success | [Scenario 1](../quickstart.md#scenario-1--local-shell--box-tool-success) | [scenario-1-shell-box.md](./scenario-1-shell-box.md) (T019) · [shell-box.md](../contracts/shell-box.md) | [evidence/shell-box/](./evidence/shell-box/) | **Runtime** + **Client** + **Verifier** | SC-001 | **Required** |
| **2** computerUse screenshot + handoff | [Scenario 2](../quickstart.md#scenario-2--computeruse-class-path-screenshot-only) | [scenario-2-computer-use.md](./scenario-2-computer-use.md) (T023) · [computer-use.md](../contracts/computer-use.md) | [evidence/computer-use/](./evidence/computer-use/) | **Runtime** + **Client** + **Verifier** | SC-002 | **Required** |
| **3** Settings → Computer rows | [Scenario 3](../quickstart.md#scenario-3--settings--computer-rows) | `scenario-3-settings.md` (T027) · [settings.md](../contracts/settings.md) | [evidence/settings/](./evidence/settings/) | **Client** + **Runtime** + **Verifier** | SC-003, SC-004 | **Required** |
| **4** Non-goals absence | [Scenario 4](../quickstart.md#scenario-4--non-goals-absence) | `non-goals.md` (T028) · [contracts/non-goals.md](../contracts/non-goals.md) | optional notes under `evidence/` | **Runtime** + **Electron** + **Verifier** | SC-005 | Docs/absence OK |
| **5** Full Phase 7 replay | [Scenario 5](../quickstart.md#scenario-5--full-phase-7-replay) | `scenario-5-full-replay.md` (T030) · all contracts | all three GUI slices | **Verifier** | SC-006 (+ composite of 1–4 + T015) | **Required** for GUI slices |

Foundational Pass (T015) is **recorded** above. Scenario evidence still required before phase Done. T031 re-validates this map against quickstart after recipes land.

## Owner roles

| Owner | Owns for Verifier evidence |
|-------|----------------------------|
| **Runtime** | Host sandboxed Shell Pass path, box readiness SoT, computerUse provider + subagent spawn, Host settings document / Remotes |
| **Client** | Settings → Computer chrome; Shell/box + computerUse tool/subagent presentation over Host HTTP/WS |
| **Electron** | Thin-shell absence: no Main box/Shell/computerUse/Computer-settings bus (T013/T014/T032); desktop launch path for GUI evidence |
| **Verifier** | Rerunnable recipes, pass/fail stamps, FR-013/014 committed screenshots/recordings + PR embeds, Scenario 5 composite replay |

## Clarify / Architect locks (honor in every recipe)

1. Global Settings → **Computer**; rows **Shell** + **Computer use** (locale-owned English) — FR-004 / FR-016 (R0).
2. computerUse Pass = screenshot-only (or equiv.) + parent handoff; interactive browser click/type **not** required — FR-003 (R0/R3).
3. Box readiness: clear not-ready/starting ≠ ready; exact marketing string not scored — FR-002 (R0).
4. Pass Shell = one Verifier-reachable **local** Host sandboxed Shell tool success; PTC/remote not Pass — FR-011 (R2).
5. Host SoT for box/Shell/computerUse/Computer settings; Client projects Host HTTP/WS; Electron Main lifecycle-only — no product bus (R1/R6).
6. Host Pass fixture OK for computerUse when Cua unreachable; Shell settings row may be read-only readiness (PO + Architect).
7. Settings chrome alone ≠ Phase Pass (SC-004); Scenarios 1–2 still required.
8. FR-013/014 desktop visual evidence required for all GUI scenarios; commit under `verifier/evidence/{shell-box,computer-use,settings}/` + PR embeds (SO 11+12).
9. Linear: epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) / tasks [MOH-354](https://linear.app/momadhoun/issue/MOH-354) — children only via `taskstoissues`; do not invent issue ids (T035).
10. No product rewrite of `specs/001`–`006` in P7 implement PRs (FR-009 / T033).
11. P7 Pass is **not** Electron Main store, Client-only SoT, interactive-browser required, PTC-as-Shell Pass, per-agent gear alone, or settings chrome = Done (T034).

## Linear tracking (T035 note)

| Tracker | Id | Role |
|---------|----|------|
| Epic | [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) | P7 Computer / box + subagent + settings |
| Tasks artifact | [MOH-354](https://linear.app/momadhoun/issue/MOH-354) | Spec Kit tasks home |
| Project | DeepSeek Harness - Cursor (`P-MOH-2`) | **Only** — never GrokBot |

**Rule:** Do **not** invent Linear child issue ids in recipes or stamps. Materialize T001–T035 children only via Spec Kit `taskstoissues` after Verifier Pass on the tasks artifact (constitution §II).

## Prior-spec freeze (T033 note)

Phase 7 implement / Verifier PRs for `specs/007-box-subagent-settings` MUST NOT product-edit `specs/001-multi-model-bots/**` … `specs/006-connectors-mcp-events-trust/**` (FR-009). Document the check here when T033 runs.

## Coordination

- **This file (`verifier/README.md`)** — DH Verifier owns for T006 / T015 / T031 / T033 / T035 stamps.
- Inventories T002–T004, seam locks T005 — Runtime / Client / Electron / Spec own those files under `verifier/`; do not collide with this README.
- Evidence placeholders T029 and Scenario recipes T027/T028/T030 — Verifier-owned follow-ons; T019 Scenario 1 and T023 Scenario 2 recipes are recorded below (SC-001 product Done on master; SC-002 product still open).
- Do **not** edit `MzM-Docs/` in this PR (Lead owns living after Verifier Pass).

## Scenario 1 recipe (T019) — Shell/box

**Verdict:** **Pass** (recipe) · **Product SC-001 Pass** (Desktop evidence)
**Stamp:** 2026-09-28 · branch `cursor/p7-us1-sc001-evidence-dc28` · base `origin/master` @ `930afcfc72`
**Linear:** [MOH-375](https://linear.app/momadhoun/issue/MOH-375/t019-us1-verifier-scenario-1-shellbox-recipe) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only
**Artifact:** [scenario-1-shell-box.md](./scenario-1-shell-box.md)
**Evidence home:** [evidence/shell-box/](./evidence/shell-box/) — media + [VERDICT.txt](./evidence/shell-box/VERDICT.txt) committed
**Scope lock:** Recipe + product SC-001 Desktop Pass. Unit/jsdom alone **fails** GUI Pass. Path A Host SoT; not-ready ≠ Pass; Chrome alone ≠ Shell Pass.

| Check | Status |
|-------|--------|
| Recipe covers SC-001 one local Shell/box success | Yes |
| FR-011 local only (PTC/remote not Pass) | Yes (measured Desktop) |
| Not-ready / starting ≠ Pass (FR-002) | Yes — `00-shell-box-not-ready.png` + `data-shell-box-outcome=not_ready` |
| FR-013/014 evidence under `evidence/shell-box/` | Yes — screenshots + walkthrough.mp4 committed |
| Product SC-001 desktop Pass | **Pass** — see VERDICT.txt |

**Rerun (idempotent):**

```sh
test -f specs/007-box-subagent-settings/verifier/evidence/shell-box/VERDICT.txt
test -f specs/007-box-subagent-settings/verifier/evidence/shell-box/02-shell-box-success.png
rg -n 'Verdict: Pass|SC-001: Pass' specs/007-box-subagent-settings/verifier/evidence/shell-box/VERDICT.txt
```

**PO / DH Lead:** Open PR from `cursor/p7-us1-sc001-evidence-dc28`; embed SO12 `/opt/cursor/artifacts/…` media in PR body (Verifier cannot ManagePullRequest). Close SC-001 / MOH-375 product Done after merge.

## Scenario 2 recipe (T023) — computerUse

**Verdict:** **Pass** (recipe/docs only — **no** product SC-002)
**Stamp:** 2026-09-28 · branch `cursor/p7-us2-verifier-dc28` · base `origin/master` @ `17d2b3efe3`
**Linear:** [MOH-379](https://linear.app/momadhoun/issue/MOH-379/t023-us2-verifier-scenario-2-computeruse-recipe) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · `P-MOH-2` only
**Artifact:** [scenario-2-computer-use.md](./scenario-2-computer-use.md)
**Evidence home:** [evidence/computer-use/](./evidence/computer-use/) (`.gitkeep` placeholder — media required before SC-002 Pass)
**Scope lock:** This stamp delivers the rerunnable Scenario 2 acceptance recipe (SC-002 screenshot/GUI observation + parent handoff; interactive browser **not** required; FR-013/014 SO 11+12). It does **not** stamp product SC-002 Done. Unit/jsdom alone **fails** GUI Pass. Runtime/Client US2 (T020–T022) may still be in flight — they must satisfy this recipe; fill `evidence/computer-use/VERDICT.txt` only after real Desktop screenshots/recording are committed + PR-embedded.

| Check | Status |
|-------|--------|
| Recipe covers SC-002 screenshot + parent handoff | Yes |
| FR-003 interactive browser not required | Yes (Steps A–C) |
| FR-013/014 evidence under `evidence/computer-use/` required | Yes — filenames in recipe; media pending |
| Product SC-002 desktop Pass | **Not claimed** |

**Rerun (idempotent):**

```sh
test -f specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md
test -d specs/007-box-subagent-settings/verifier/evidence/computer-use
test -f specs/007-box-subagent-settings/verifier/evidence/computer-use/.gitkeep
rg -n 'SC-002|FR-003|interactive browser|FR-013|FR-014|SO 11' specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md
```

**PO / DH Lead:** Recipe gate for US2 is ready. Do **not** close SC-002 / MOH-379 product Done until Desktop evidence under `evidence/computer-use/` lands per the recipe. Next product: T020–T022 Host/Client computerUse observation + handoff path.
