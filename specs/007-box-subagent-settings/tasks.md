# Tasks: Phase 7 — Computer / box + subagent parity + settings chrome

**Input**: Design documents from `/workspace/specs/007-box-subagent-settings/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Spec does **not** request TDD unit-test tasks. Required **Verifier recipes** for FR-012…FR-014 / SC-001…SC-006 and [quickstart.md](./quickstart.md) Scenarios 1–5 are implementation deliverables (not optional examples). Every GUI recipe MUST require desktop screenshots and/or short screen recordings **committed** under `verifier/evidence/{shell-box|computer-use|settings}/` + PR embeds (standing orders **11** + **12**). Non-goals (Scenario 4) may be docs/absence checks.

**Organization**: Shared Host box-readiness + sandboxed Shell mount + computerUse registry + Computer settings SoT foundations (Phase 2) **block** all user-story fan-out. Stories follow **spec priority** (all P1): US1 Shell/box → US2 computerUse-class → US3 Settings rows. Chrome polish ≠ Verifier substitute (FR-005 / SC-004).

**Linear**: Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · tasks gate [MOH-354](https://linear.app/momadhoun/issue/MOH-354) · Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356). **T001–T035 filed** — map [verifier/linear-taskstoissues.md](./verifier/linear-taskstoissues.md) (MOH-357…MOH-391). Project **DeepSeek Harness - Cursor** / `P-MOH-2` only — never GrokBot.

**Branch**: Setup Spec slice (`cursor/p7-setup-spec-dc28`); Runtime T002–T003 inventories already on master via #240

**Architect Path A + clarify + PO locks (honor in every story/recipe)**:

1. **Host SoT** — sandboxed `ctx.shell` (`dsh-bash-sandbox` / `dsh-pwsh-sandbox` + `dsh-sandbox-local` + `dsh-tool-bash` / `dsh-tool-pwsh`); readiness on Host (research R1/R2).
2. **computerUse** — `ctx.computerUse` + **one** provider (prefer Cua when Verifier-reachable; else **Host Pass fixture** that still `register()`s) + `dsh-subagent` + `dsh-subagent-spawn-in-process` + `dsh-tool-subagent`; Pass = screenshot-only + parent handoff; interactive browser **not** required (research R3; FR-003).
3. **Settings** — Client Global `settings.section` **Computer** with locale-owned rows **Shell** and **Computer use** over Host settings document; **Shell** row = read-only readiness sufficient (PO); per-agent gear alone fails FR-016 (research R4).
4. **Evidence slices** — `verifier/evidence/shell-box/`, `computer-use/`, `settings/` (FR-014; R5).
5. **host-protocol exclusions** — forbid on Node IPC: `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate` (research R6).
6. **Chrome ≠ substitute** — SC-003 alone MUST NOT grant SC-001/SC-002 (FR-005 / SC-004).
7. FR-013/FR-014 / SO 11+12 desktop visual evidence required for all GUI scenarios (US1–US3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User-story label (`[US1]`…`[US3]`) on story-phase tasks only
- Every task includes exact file paths

## Path Conventions

Desktop dual-process layout from [plan.md](./plan.md):

- Electron shell: `apps/desktop/src/`, `apps/desktop/tests/`
- Desktop Host: `apps/desktop-host/`
- Shell seam: `packages/shell/shell/`, `packages/shell/bash-sandbox/`, `packages/shell/pwsh-sandbox/`, `packages/shell/tool-bash/`, `packages/shell/tool-pwsh/`
- Sandbox: `packages/sandbox/sandbox-local/`
- computerUse: `packages/computer-use/computer-use/`; Cua providers `packages/experimental/computer-use-cua-driver-mcp/`, `packages/experimental/computer-use-cua-driver-native/`; Host Pass fixture home decided in inventory (under `apps/desktop-host/` or `packages/experimental/`)
- Subagent: `packages/subagent/subagent/`, `packages/subagent/subagent-spawn-in-process/`, `packages/subagent/tool-subagent/`
- Host settings: `packages/settings/settings/`, `packages/settings/settings-file/`
- Client Settings shell: `packages/client/ui-settings/`, `packages/client/ui-settings-general/`; new Computer section under `packages/client/ui-settings-computer/` (create if absent) or inventory-named sibling
- Tool/subagent cards / Agent Teams UI: `packages/experimental/client-ui-agent-team/src/client/`
- Host protocol exclusions: `apps/desktop/src/host-protocol.ts`, `apps/desktop/src/ipc.ts`
- Feature Verifier recipes: `specs/007-box-subagent-settings/verifier/`

**Do not** rewrite `specs/001-multi-model-bots/**` … `specs/006-connectors-mcp-events-trust/**`. **Do not** invent user-machines, interactive-browser Pass gate, PTC-as-Shell Pass, Verifier-as-feature, or pixel Grok Computer catalog as Pass requirements.

### Ownership legend

| Owner | Typical tasks |
|-------|----------------|
| **DH Runtime / Desktop Host** | Box readiness SoT, sandboxed Shell mount, computerUse provider + subagent spawn, Host settings document, Host HTTP/WS Remotes |
| **DH Electron** | `host-protocol.ts` exclusions + `no-electron-*-bus` regression — no SoT |
| **DH Client / Web** | Settings → Computer chrome; tool/subagent presentation over Host HTTP/WS |
| **DH Verifier** | Recipes, evidence dirs, SO 11+12 stamps, non-goals / full replay |
| **DH Spec** | Scope lock; recipe FR mapping; no invented Linear ids until `taskstoissues` |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orient implementers to P7 Architect Path A seams; create Verifier recipe home; no product behavior yet

- [x] T001 Confirm feature design tree is complete (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/*`, `checklists/requirements.md`) under `specs/007-box-subagent-settings/` and point implementers at [contracts/README.md](./contracts/README.md) + Architect Path A / PO locks in [research.md](./research.md) / [plan.md](./plan.md) — **Owner: DH Spec**
- [x] T002 [P] Inventory Host sandboxed Shell + sandbox-local + tool-bash/pwsh composition in `packages/shell/**`, `packages/sandbox/sandbox-local/`, and Desktop Host under `apps/desktop-host/` against [data-model.md](./data-model.md) `BoxBackend` / `ShellBoxToolCall` — record findings in `specs/007-box-subagent-settings/verifier/host-shell-box-inventory.md` — **Owner: DH Runtime**
- [x] T003 [P] Inventory `ctx.computerUse` + Cua providers + Host Pass-fixture candidates + subagent spawn path in `packages/computer-use/computer-use/`, `packages/experimental/computer-use-cua-driver-{mcp,native}/`, `packages/subagent/{subagent,subagent-spawn-in-process,tool-subagent}/`, and `apps/desktop-host/` for [contracts/computer-use.md](./contracts/computer-use.md) — `specs/007-box-subagent-settings/verifier/computer-use-inventory.md` — **Owner: DH Runtime**
- [x] T004 [P] Inventory Client `settings.section` registration pattern (Models/Plugins/General) in `packages/client/ui-settings*/src/client/` and Host settings document Remotes in `packages/settings/**` + `apps/desktop-host/` for [contracts/settings.md](./contracts/settings.md) — `specs/007-box-subagent-settings/verifier/settings-computer-inventory.md` — **Owner: DH Electron / Client**
- [x] T005 [P] Document seam locks for implementers: Host sandboxed Shell Pass; computerUse + Cua-or-Host-fixture + spawn-in-process; Settings → Computer over Host SoT; Shell row read-only readiness OK; screenshot-only Pass; host-protocol exclusions; chrome ≠ substitute — `specs/007-box-subagent-settings/verifier/box-computer-seam-locks.md` (research R0–R6; [contracts/non-goals.md](./contracts/non-goals.md)) — **Owner: DH Spec**
- [x] T006 Create Verifier recipe directory `specs/007-box-subagent-settings/verifier/README.md` listing Scenario 1–5 owners (Runtime / Client / Electron / Verifier) mapped to [quickstart.md](./quickstart.md) and mandating FR-013/014 desktop screenshots/recordings **committed** under `verifier/evidence/{shell-box,computer-use,settings}/` + PR embeds (SO 11+12); note Linear children only after `taskstoissues` — **Owner: DH Verifier / DH Spec**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared Host box readiness + Shell/computerUse mount points + Computer settings SoT + thin-shell exclusions that MUST complete before ANY user story fan-out

**⚠️ CRITICAL**: No US1–US3 product work until T007–T015 land.

### Shared Host model + protocol + substrate

- [x] T007 Define Host `BoxBackend` readiness projection (`readiness: not_ready|starting|ready|failed`, `local: true` for Pass, `updatedAt`) as Host SoT (settings document field or Remote fact — pick one in inventory) wired for Desktop Host in `apps/desktop-host/` + `packages/settings/**` (or inventory-named Host module) per [data-model.md](./data-model.md) — **not** Electron Main, **not** Client-only SoT — **Owner: DH Runtime**
- [x] T008 Mount Pass local sandboxed Shell path on Desktop Host: compose `dsh-bash-sandbox` and/or `dsh-pwsh-sandbox` + `dsh-sandbox-local` + `dsh-tool-bash` / `dsh-tool-pwsh` so `ctx.shell` can run one Verifier-reachable local tool — `apps/desktop-host/` cordis profile / plugin list + `packages/shell/**` / `packages/sandbox/sandbox-local/` per research R2 / [contracts/shell-box.md](./contracts/shell-box.md) — **Owner: DH Runtime**
- [x] T009 Mount `dsh-computer-use` provider registry on Desktop Host and reserve one provider slot (Cua MCP/native when reachable **or** Host Pass fixture that `ctx.computerUse.register`s); document chosen Pass provider home in `specs/007-box-subagent-settings/verifier/computer-use-pass-provider.md` — wire `packages/computer-use/computer-use/` + `apps/desktop-host/` (+ fixture package under `apps/desktop-host/` or `packages/experimental/` as inventory picks) — **Owner: DH Runtime**
- [x] T010 Ensure `dsh-subagent` + `dsh-subagent-spawn-in-process` + `dsh-tool-subagent` are available on Desktop Host for computerUse-class delegation — `packages/subagent/**` + `apps/desktop-host/` per research R3 — **Owner: DH Runtime**
- [x] T011 Define Host settings document fields for Computer section projection (Shell readiness + Computer use enablement/config as needed for FR-004; Shell may be read-only readiness) in `packages/settings/**` + `apps/desktop-host/` per [data-model.md](./data-model.md) `ComputerSettingsProjection` / research R4 — **Owner: DH Runtime**
- [x] T012 Expose Host HTTP/WS projection (and mutate where required) for box readiness + Computer settings fields on the authenticated Desktop Host data plane in `apps/desktop-host/` + settings Remotes — Client MUST NOT persist SoT; no Main IPC product bus — **Owner: DH Runtime**
- [x] T013 [P] Extend `apps/desktop/src/host-protocol.ts` comments/exclusion documentation so `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, and `computer-settings-mutate` are **forbidden** on Node IPC (same pattern as P1–P6; research R6) — **Owner: DH Electron**
- [x] T014 [P] Add architecture/regression guard that Electron Main has no parallel box/Shell/computerUse/Computer-settings store/bus in `apps/desktop/tests/no-electron-box-shell-computer-bus.spec.ts` (and document expected absence in `apps/desktop/src/ipc.ts` / `apps/desktop/src/host-protocol.ts`) per research R6 / [contracts/non-goals.md](./contracts/non-goals.md) — **Owner: DH Electron**
- [x] T015 Foundational checklist stamp in `specs/007-box-subagent-settings/verifier/README.md` (T007–T014 complete; no US product work before this stamp) — **Owner: DH Spec / DH Verifier**

**Checkpoint**: Foundation ready — Host readiness + Shell/computerUse/subagent mounts + settings SoT + protocol exclusions + absence guards; user stories may begin.

---

## Phase 3: User Story 1 — Prove one local Shell / box tool path (Priority: P1) 🎯 MVP

**Goal**: One successful local Shell/box tool invocation against the Host sandboxed Shell backend with a user-visible success outcome ([contracts/shell-box.md](./contracts/shell-box.md); SC-001)

**Independent Test**: On Desktop with ≥1 bot and ready local Shell backend (or documented readiness Fail), invoke one `bash`/`pwsh` tool; observe user-visible success; not-ready attempts MUST NOT count as Pass ([quickstart.md](./quickstart.md) Scenario 1)

### Implementation for User Story 1

- [x] T016 [US1] Host Shell/box success path: when `BoxBackend.readiness=ready`, one local sandboxed `bash` or `pwsh` tool call produces `ShellBoxToolCall.outcome=success` with session-logged model-visible outcome (`packages/shell/**` + `apps/desktop-host/`); LLM wording not scored (FR-001/011/015) — **Owner: DH Runtime**
- [x] T017 [US1] Host not-ready / starting / failed path: attempts while not `ready` surface clear distinguishable state and MUST NOT be scored as SC-001 Pass (`outcome=not_ready` or equivalent projection) — `apps/desktop-host/` + Host readiness SoT from T007 (FR-002; exact marketing string not scored) — **Owner: DH Runtime**
- [x] T018 [P] [US1] Client projects Shell/box tool success and not-ready indicators via Host HTTP/WS (tool card / conversation surface under `packages/experimental/client-ui-agent-team/src/client/` or inventory-named Client tool UI) — no Main IPC SoT; locale-owned copy — **Owner: DH Client / Web**
- [x] T019 [US1] Add Verifier Scenario 1 recipe in `specs/007-box-subagent-settings/verifier/scenario-1-shell-box.md` covering SC-001 (one local Shell/box tool success; FR-011 local only; not-ready ≠ Pass) and **requiring** FR-013/014 desktop evidence under `specs/007-box-subagent-settings/verifier/evidence/shell-box/` (unit/jsdom alone fails; SO 11+12) — **Owner: DH Verifier**

**Checkpoint**: US1 Shell/box path works independently with Verifier recipe + evidence path.

---

## Phase 4: User Story 2 — Prove one computerUse-class subagent path (Priority: P1)

**Goal**: One computerUse-class subagent path produces ≥1 user-visible screenshot (or equivalent GUI observation) **and** a parent-visible handoff ([contracts/computer-use.md](./contracts/computer-use.md); SC-002)

**Independent Test**: On Desktop with ready backend + parent bot, start one computerUse-class path; confirm screenshot artifact + parent handoff; interactive browser click/type NOT required ([quickstart.md](./quickstart.md) Scenario 2)

### Implementation for User Story 2

- [x] T020 [US2] Host computerUse Pass provider: register Cua Driver MCP/native **or** Host Pass fixture on `ctx.computerUse` such that one observation path can emit a durable user-visible screenshot (or equivalent GUI artifact) — `packages/computer-use/computer-use/` + chosen provider under `packages/experimental/computer-use-cua-driver-{mcp,native}/` **or** Host fixture home from T009 — must `register()` (PO + Architect; FR-003) — **Owner: DH Runtime**
- [x] T021 [US2] Host computerUse-class subagent path: parent bot delegates via `dsh-subagent` + `dsh-subagent-spawn-in-process` (+ `dsh-tool-subagent`) producing `ComputerUseRun` with `observation` (≥1 screenshot/equiv.) + `handoff` parent-visible; `interactiveBrowser` not required true — `packages/subagent/**` + `apps/desktop-host/` (FR-003/015) — **Owner: DH Runtime**
- [x] T022 [P] [US2] Client projects user-visible screenshot/GUI observation artifact + parent handoff/result indicator via Host HTTP/WS under `packages/experimental/client-ui-agent-team/src/client/` (or inventory-named conversation/subagent UI); locale-owned copy; no Main IPC SoT — **Owner: DH Client / Web**
- [x] T023 [US2] Add Verifier Scenario 2 recipe in `specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md` covering SC-002 (screenshot-only minimum + parent handoff; interactive browser not required) with FR-013/014 evidence under `specs/007-box-subagent-settings/verifier/evidence/computer-use/` — **Owner: DH Verifier**

**Checkpoint**: US2 computerUse-class path independently testable on Desktop.

---

## Phase 5: User Story 3 — Settings rows for Shell/box and computerUse daily paths (Priority: P1)

**Goal**: Global Settings → **Computer** shows locale-owned rows **Shell** and **Computer use**; presence MUST NOT substitute for SC-001/SC-002 ([contracts/settings.md](./contracts/settings.md); SC-003 / SC-004)

**Independent Test**: Open Global Settings → Computer; confirm **Shell** and **Computer use** rows; confirm per-agent gear alone insufficient; confirm chrome alone ≠ Phase Pass ([quickstart.md](./quickstart.md) Scenario 3)

### Implementation for User Story 3

- [x] T024 [US3] Client register Global `settings.section` **Computer** (locale-owned English dictionary strings for Verifier) in `packages/client/ui-settings-computer/src/client/` (create package/section if absent) following Models/Plugins `settings.section` pattern in `packages/client/ui-settings*/src/client/`; wire into Desktop Client profile — **Owner: DH Client / Web**
- [x] T025 [US3] Client **Shell** and **Computer use** rows (or clearly labeled control groups) under Settings → Computer; **Shell** may be read-only Host readiness projection (PO); rows call Host HTTP/WS Remotes only — `packages/client/ui-settings-computer/src/client/` + `locales.ts`; per-agent gear alone MUST NOT satisfy FR-016 — **Owner: DH Client / Web**
- [x] T026 [US3] Host settings projection supplies Computer-section fields for Client rows (Shell readiness + Computer use config as needed) via authenticated Remotes — `packages/settings/**` + `apps/desktop-host/` — no Electron Main Computer-settings SoT (FR-004/010/016) — **Owner: DH Runtime** · stamp `verifier/computer-settings-projection.md` (T011/T012 sufficient; Shell read-only guard + row map)
- [x] T027 [US3] Add Verifier Scenario 3 recipe in `specs/007-box-subagent-settings/verifier/scenario-3-settings.md` covering SC-003 (both rows under Computer) **and** SC-004 (chrome alone fails Phase; Stories 1–2 still required) with FR-013/014 evidence under `specs/007-box-subagent-settings/verifier/evidence/settings/` — **Owner: DH Verifier**
