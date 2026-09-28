# Implementation Plan: Phase 7 — Computer / box + subagent parity + settings chrome

**Branch**: `cursor/p7-plan-dc28` | **Date**: 2026-09-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-box-subagent-settings/spec.md` (Status: Clarified Session 2026-09-28; clarify merged PR #230 @ `3c232d67df`)

**Linear**: Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350) · plan [MOH-353](https://linear.app/momadhoun/issue/MOH-353) · project **DeepSeek Harness - Cursor** (`P-MOH-2`) only — never GrokBot. `taskstoissues` after `/speckit-tasks` only.

**Clarify locks (do not reopen):** (1) Global Settings → **Computer**; rows **Shell** + **Computer use**. (2) computerUse Pass = screenshot-only (or equiv.) + parent handoff; interactive browser **not** required. (3) Box readiness = clear not-ready/starting ≠ ready; exact string not scored. (4) Evidence = `verifier/evidence/shell-box/`, `computer-use/`, `settings/`.

**Architect / Path A lock (do not reopen):** Host SoT — sandboxed `ctx.shell` (`dsh-bash-sandbox`/`dsh-pwsh-sandbox` + `dsh-sandbox-local` + tool-bash/pwsh); `ctx.computerUse` + one provider (Cua when reachable, else Host Pass fixture); `dsh-subagent` + spawn-in-process; Client Settings → **Computer** over Host settings document; Node IPC lifecycle-only — forbid `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate`. See [research.md](./research.md) + MOH-353 Architect comment `292420d5-…`.

**PO simplest-path locks (do not reopen):** (1) Host Pass fixture OK for computerUse if Cua unreachable; (2) Shell settings row = read-only readiness sufficient. MOH-353 comment `6da26b6f-…`.

**Note**: Filled by `/speckit-plan` + Architect seam stamp. Do **not** create `tasks.md` in this command. Do **not** rewrite FRs in `specs/001`–`006`. No product code. No `MzM-Docs/` living edits in this PR.

## Summary

Ship Phase 7 computer/box on durable **Host-owned** seams: prove one **local sandboxed Shell** tool success (`bash`/`pwsh` on Host backend); prove one **computerUse-class** subagent path (`ctx.computerUse` + subagent spawn) with screenshot + parent handoff; expose Settings → **Computer** rows **Shell** and **Computer use** (Client section over Host settings SoT). Client mutates/lists via **authenticated Host HTTP/WS**. Electron Main stays lifecycle-only. Settings chrome ≠ Verifier substitute (SC-004). Out: user machines; voice; draft-first; group channels; learn-from-demo; billing; full skill pack; pixel Grok; Verifier-as-feature; interactive-browser Pass gate; PTC/remote as Pass Shell gate; rewrite `specs/001`–`006`.

## Technical Context

**Language/Version**: TypeScript (ESM), Node `^22.19 || >=24`, Electron Desktop packaging

**Primary Dependencies**: DeepSeek Harness Cordis plugins (`@deepseek-ai/dsh-*`), Desktop Host (`apps/desktop-host`), thin Electron shell (`apps/desktop`), Agent Teams / Host bot identity + P1–P6 predecessors; Web client under Desktop wrapper; Path A seams: `dsh-shell` / `dsh-bash-sandbox` / `dsh-pwsh-sandbox` / `dsh-sandbox-local` / `dsh-tool-bash` / `dsh-tool-pwsh`, `dsh-computer-use` + experimental Cua Driver provider **or** Host Pass fixture, `dsh-subagent` + `dsh-subagent-spawn-in-process` + `dsh-tool-subagent`; locale-owned Client UI copy + `settings.section`

**Storage**: Host-owned box readiness + Host settings document (Computer / Shell / Computer use fields); panes/surfaces are **Client projections**; no Electron Main durable box/shell/computerUse store; no Client-only SoT

**Testing**: Vitest unit/behavior; Desktop Verifier scripted path for SC-001…SC-006 with FR-013/014 visual evidence under named slices; absence checks (no Main bus; no user-machines/interactive-browser/PTC-as-Shell Pass; no 001–006 rewrite); Linear children only after `taskstoissues`

**Target Platform**: Electron Desktop (Windows-first for Mohammed; mac/Linux as Verifier environment allows)

**Project Type**: desktop-app (Electron shell + **bundled-Node Desktop Host child** + Web client)

**Performance Goals**: No separate TTFT SLO for P7; Pass measures Shell tool success, computerUse screenshot + handoff, settings row visibility — not LLM reply latency

**Constraints**:
- P7 In only: Box/Shell backends; computerUse-class subagents; settings rows for those daily paths
- Out: user machines; voice; draft-first; group; learn-from-demo; billing; full skill pack; pixel Grok; Verifier-as-feature; interactive-browser as Pass gate; PTC/remote as Pass Shell; rewrite `specs/001`–`006`
- Clarify + Architect + PO locks as header
- Topology freeze: dual-process Desktop Host child; **Node IPC lifecycle-only**; data plane = **shipped authenticated Host HTTP/WS** + `dsh-app://`
- FR-013 / FR-014 / standing orders 11+12 mandatory for GUI scenarios
- Constitution v1.0.0 wedge-first; model-visible ⟺ logged where Shell/computerUse outcomes reach the model

**Scale/Scope**: Single primary user (Mohammed); one local Shell path; one computerUse-class path; operable Computer settings rows — not Grok chrome parity

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Wedge-First A→C | PASS | P7 advances box/Shell + computerUse-class + settings toward C; one path each — no full Grok theater |
| II. Spec-Driven Delivery | PASS | Artifacts under `specs/007-box-subagent-settings/`; Linear MOH-353←MOH-350; tasks after plan |
| III. Product Over Theater | PASS | One real Shell tool, one screenshot+handoff subagent, required settings rows; Host fixture OK; read-only Shell readiness OK |
| IV. Verify Against Spec | PASS | SC-001…006 + contracts + FR-013/014 desktop evidence; chrome ≠ substitute (SC-004) |
| V. Simplicity & Seam Honesty | PASS | Path A: sandboxed Host shell + computerUse registry + subagent spawn; Client projects; no Electron Main bus |
| Stack & Seam Constraints | PASS | DSH + Electron dual-process + Spec Kit + Linear on P-MOH-2 |

**Post-design re-check:** PASS — clarify + Architect Path A + PO simplest-path locked. Complexity Tracking empty.

### Topology one-liner (Architect Path A — locked)

Bundled-Node **Desktop Host child** + shipped authenticated **Host HTTP/WS** data plane + Node IPC **lifecycle-only** + `dsh-app://`. Forbidden on Main↔Host IPC (extend `apps/desktop/src/host-protocol.ts`): `shell-exec`, `box-ready`, `computer-use-control`, `computer-screenshot`, `computer-settings-mutate`.

## Project Structure

### Documentation (this feature)

```text
specs/007-box-subagent-settings/
├── spec.md              # Clarified feature spec (PR #230)
├── plan.md              # This file
├── research.md          # Phase 0 (clarify + Architect Path A + PO locks)
├── data-model.md        # Phase 1 — Box / ShellToolCall / ComputerUseRun / Settings
├── quickstart.md        # Phase 1 validation guide
├── contracts/           # Phase 1 interface contracts
│   ├── README.md
│   ├── shell-box.md
│   ├── computer-use.md
│   ├── settings.md
│   └── non-goals.md
├── checklists/          # From specify/clarify
└── tasks.md             # /speckit-tasks — NOT created by this plan command
```

### Source Code (repository root) — touch targets for later implement

```text
apps/desktop/                          # Thin Electron shell; lifecycle IPC only; host-protocol exclusions
apps/desktop-host/                     # Desktop Host child; shell/sandbox + computerUse + subagent + settings
packages/shell/shell/                  # ctx.shell seam
packages/shell/bash-sandbox/           # Pass POSIX executor (Path A)
packages/shell/pwsh-sandbox/           # Pass Windows executor (Path A)
packages/shell/tool-bash/              # Model-facing bash tool
packages/shell/tool-pwsh/              # Model-facing pwsh tool
packages/sandbox/sandbox-local/        # Sandbox backend (base path)
packages/computer-use/computer-use/    # Provider registry
packages/experimental/computer-use-cua-driver-mcp/   # Preferred when Verifier-reachable
packages/experimental/computer-use-cua-driver-native/# Alternate Cua path
# Host Pass fixture provider (tasks) when Cua unreachable — must ctx.computerUse.register
packages/subagent/subagent/            # Delegation seam
packages/subagent/subagent-spawn-in-process/
packages/subagent/tool-subagent/
# Web/client UI — settings.section Computer (Shell + Computer use); tool/subagent cards; locale-owned copy
# Verifier evidence: specs/007-box-subagent-settings/verifier/evidence/{shell-box,computer-use,settings}/
```

**Structure Decision:** Extend Desktop dual-process layout. **Host-owned** sandboxed Shell + computerUse + subagent + settings seams; Client projects over HTTP/WS. Exact file paths finalized in tasks within these seams.

## Phase 0 — Research

See [research.md](./research.md). Clarify Session 2026-09-28 locks honored. **Architect Path A locked**. **PO simplest-path locked**.

## Phase 1 — Design

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Contracts | [contracts/](./contracts/) |
| Quickstart | [quickstart.md](./quickstart.md) |

### Capability → ownership → contract (plan matrix)

| Capability | Host (Runtime / Desktop Host) | Electron / Client | Contract |
|------------|-------------------------------|-------------------|----------|
| Local Shell/box tool success | Sandboxed `ctx.shell` + tools; readiness SoT; success logged/projected | User-visible tool success; readiness ≠ ready when starting | [shell-box.md](./contracts/shell-box.md) |
| computerUse-class path | `ctx.computerUse` + one provider; subagent spawn; screenshot + handoff | User-visible screenshot + handoff indicator | [computer-use.md](./contracts/computer-use.md) |
| Settings rows | Host settings document fields | Global Settings → Computer (**Shell** / **Computer use**); Shell row may be read-only readiness | [settings.md](./contracts/settings.md) |
| Non-goals + absence | No user machines / interactive-browser / PTC-as-Shell Pass / Main bus / 001–006 rewrite | Absence checks | [non-goals.md](./contracts/non-goals.md) |

### Locks honored

| Lock | Plan treatment |
|------|----------------|
| Settings → Computer; Shell + Computer use | R0 / R4 + settings; FR-004 / FR-016 / SC-003 |
| Screenshot-only computerUse Pass | R0 / R3 + computer-use; FR-003 / SC-002 |
| Readiness clear ≠ ready | R0 / R2 + shell-box; FR-002 |
| Evidence slices | R5; FR-014 |
| Host sandboxed Shell | R2 Architect |
| computerUse + subagent (+ Cua or Host fixture) | R3 Architect + PO |
| Shell row read-only readiness OK | R4 PO |
| host-protocol exclusions | R6 |
| Chrome ≠ Verifier substitute | FR-005 / SC-004 |
| SO 11+12 | R5; FR-013/014 |

### Complexity Tracking

> None — no constitution violations.

## Next (held)

After **Verifier Pass** on this plan PR: `/speckit-tasks` → analyze → `taskstoissues` on DeepSeek Harness - Cursor → implement. Architect Path A is locked — do not reopen. Living gate / plan file updates remain DH Lead / PO-owned (not this PR). **Stop after plan** — do not start tasks in this spawn.
