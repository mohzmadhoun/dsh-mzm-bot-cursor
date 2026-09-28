# Verifier recipes — Phase 7 Computer / box + subagent parity + settings chrome

**Feature:** `specs/007-box-subagent-settings`
**Role:** DH Verifier evidence home. Recipes are rerunnable acceptance scripts/outlines; they do not implement product features.
**Quickstart outline:** [../quickstart.md](../quickstart.md)
**Contracts:** [../contracts/](../contracts/) — start at [contracts/README.md](../contracts/README.md)
**Architect Path A:** Host sandboxed Shell + `ctx.computerUse` (+ Cua or Host Pass fixture) + `dsh-subagent` spawn-in-process; Settings → **Computer** over Host SoT; Client projects Host HTTP/WS; no Electron Main box/Shell/computerUse/settings bus — see [research.md](../research.md) / [plan.md](../plan.md) / (T005) `box-computer-seam-locks.md` when landed
**Setup inventories (T002–T005):** `host-shell-box-inventory.md` · `computer-use-inventory.md` · `settings-computer-inventory.md` · `box-computer-seam-locks.md` — expected under this directory; not yet required for this T006 stamp
**Evidence:** [evidence/](./evidence/) — GUI slices locked as [evidence/shell-box/](./evidence/shell-box/) · [evidence/computer-use/](./evidence/computer-use/) · [evidence/settings/](./evidence/settings/) (FR-014; placeholders via plan tree / T029)
**Linear:** Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · tasks issue [MOH-354](https://linear.app/momadhoun/issue/MOH-354). **Children only after** Spec Kit `taskstoissues` (constitution §II) following Verifier Pass on the tasks artifact. **Do not invent issue ids.** Project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot.

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

## Foundational Pass gate (T015) — pending

**Rule:** Product success criteria **SC-001…SC-006** MUST NOT be marked Done without a recorded foundational Pass (Host `BoxBackend` readiness + sandboxed Shell mount + computerUse provider slot + subagent spawn + Computer settings SoT + Host HTTP/WS + Electron exclusion docs + no-Electron-box-shell-computer-bus guard). Product SC evidence stays under Scenario recipes; T015 stamps this README when T007–T014 land.

Setup T001–T006 does **not** claim foundational Pass. US1–US3 fan-out waits for that stamp.

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
| **1** Local Shell/box tool success | [Scenario 1](../quickstart.md#scenario-1--local-shell--box-tool-success) | `scenario-1-shell-box.md` (T019) · [shell-box.md](../contracts/shell-box.md) | [evidence/shell-box/](./evidence/shell-box/) | **Runtime** + **Client** + **Verifier** | SC-001 | **Required** |
| **2** computerUse screenshot + handoff | [Scenario 2](../quickstart.md#scenario-2--computeruse-class-path-screenshot-only) | `scenario-2-computer-use.md` (T023) · [computer-use.md](../contracts/computer-use.md) | [evidence/computer-use/](./evidence/computer-use/) | **Runtime** + **Client** + **Verifier** | SC-002 | **Required** |
| **3** Settings → Computer rows | [Scenario 3](../quickstart.md#scenario-3--settings--computer-rows) | `scenario-3-settings.md` (T027) · [settings.md](../contracts/settings.md) | [evidence/settings/](./evidence/settings/) | **Client** + **Runtime** + **Verifier** | SC-003, SC-004 | **Required** |
| **4** Non-goals absence | [Scenario 4](../quickstart.md#scenario-4--non-goals-absence) | `non-goals.md` (T028) · [contracts/non-goals.md](../contracts/non-goals.md) | optional notes under `evidence/` | **Runtime** + **Electron** + **Verifier** | SC-005 | Docs/absence OK |
| **5** Full Phase 7 replay | [Scenario 5](../quickstart.md#scenario-5--full-phase-7-replay) | `scenario-5-full-replay.md` (T030) · all contracts | all three GUI slices | **Verifier** | SC-006 (+ composite of 1–4 + T015) | **Required** for GUI slices |

Foundational Pass (T015) must hold before Scenario evidence counts toward phase Done. T031 re-validates this map against quickstart after recipes land.

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
- Evidence placeholders T029 and Scenario recipes T019/T023/T027/T028/T030 — Verifier-owned follow-ons; not claimed by this Setup stamp.
- Do **not** edit `MzM-Docs/` in this PR (Lead-owned living gate).
