# Data Model: Phase 7 — Computer / box + subagent parity + settings chrome

**Feature**: `specs/007-box-subagent-settings`
**Date**: 2026-09-28
**Source**: [spec.md](./spec.md) · [research.md](./research.md) · clarify locks PR #230 · Bot entities from `specs/001`–`006`

Logical entities for plan/tasks. Persistence stays **Host-owned** (box readiness + Host settings document + tool/subagent outcomes). **Architect Path A locked:** sandboxed Host Shell; `ctx.computerUse` + subagent spawn; Client Computer section over Host settings SoT. Extends P1–P6 Bot / session projection — does **not** replace model assignment, persona, skills, routines, memory, or connectors. Does **not** use Electron Main or Client local store as SoT.

---

## BoxBackend (Host SoT)

Shared Linux (or equivalent) computer environment used by agents for Shell and GUI computer work — distinct from the user’s personal machine (FR-006 Out).

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `boxId` | Branded opaque Host id (or singleton product key) | Required when multi-instance; singleton OK for Pass |
| `readiness` | `not_ready` \| `starting` \| `ready` \| `failed` | Required; `starting` / `not_ready` / `failed` MUST be distinguishable from `ready` in UI (exact marketing string NOT scored) |
| `local` | boolean | Pass path = Host local execution world (sandboxed Shell); FR-011 |
| `updatedAt` | Timestamp | Required |

**Relationships:** Backs Shell/box tool calls and computerUse-class observation. **Not** a user machine. **Not** Electron Main. Pass “box” = Desktop Host cwd / sandbox policy world (Architect R2) — not brokered remote, not user PC.

**Validation:** Attempts while not `ready` MUST surface clear not-ready / starting / failure and MUST NOT count as Story 1 Pass (FR-002). Brokered remote topologies optional beyond Pass.

**Persistence:** Host-projected readiness (settings document or Remote fact — Architect).

---

## ShellBoxToolCall (observable outcome)

One invocation of a Shell/box tool against the box/computer backend.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `callId` | Opaque id | Required |
| `boxId` | → BoxBackend | Required when multi-box; implied singleton OK |
| `botId` | → Bot | Required for Pass path |
| `toolName` | `bash` / `pwsh` (or product projection of those tools) | Required — Path A tools |
| `outcome` | `success` \| `error` \| `not_ready` | Required; Pass needs `success` with user-visible indicator |
| `visibility` | User-visible success / not-ready / error indicator | Success required for SC-001 |

**Relationships:** Success proves Story 1 / SC-001. LLM reply wording not scored (FR-015). Model-visible outcomes MUST be reconstructable from the session log.

**Validation:** Catalog label or settings toggle alone is insufficient (FR-001).

---

## ComputerUseRun (computerUse-class subagent path)

One computerUse-class subagent execution that observes box desktop/browser GUI.

| Field | Type / notes | Rules |
|-------|--------------|-------|
| `runId` | Opaque id | Required |
| `parentBotId` | → Bot | Required |
| `childId` / subagent handle | Opaque | Required when continuable/identifiable; one-shot OK if handoff visible |
| `capabilityClass` | `computerUse` (product string may differ) | Capability class = box GUI observation |
| `observation` | ≥1 screenshot or equivalent GUI artifact reference | Required for Pass (FR-003) |
| `handoff` | Parent-visible progress/result indicator | Required for Pass |
| `interactiveBrowser` | boolean | **Not** required true for Pass |

**Relationships:** Proves Story 2 / SC-002. Full executor/video/CloudAgent set not required.

**Validation:** Parent text claim without GUI artifact fails Pass. Interactive click/type alone without observation artifact fails Pass.

**Composition (Architect R3):** `dsh-computer-use` + one provider (Cua MCP/native when reachable, else Host Pass fixture that `register()`s on `ctx.computerUse`) + `dsh-subagent` + `dsh-subagent-spawn-in-process` + tool-subagent.

---

## ComputerSettingsProjection (Client view)

User-visible Global Settings → **Computer** section for daily paths.

| Observable | Rules |
|------------|-------|
| Section | Labeled **Computer** (locale-owned English for Verifier) |
| Shell row | Labeled **Shell** (or clearly labeled control group) — FR-004; **PO:** read-only readiness sufficient |
| Computer use row | Labeled **Computer use** — FR-004 |
| Scope | Global Settings — per-agent gear alone fails FR-016 |
| Pass coupling | Presence MUST NOT satisfy SC-001/SC-002 alone (FR-005 / SC-004) |

**Not required for Pass:** Update/Reset computer, box-doctor, full catalog, billing, voice, user-machine rows (FR-010 / Out).

**Composition (Architect R4):** Client `settings.section` **Computer** over Host settings document namespaces via `settings.describe` / scope Remotes.

---

## VerifierEvidenceSlice

| Field | Rules |
|-------|-------|
| `slice` | `shell-box` \| `computer-use` \| `settings` |
| `path` | Under `specs/007-box-subagent-settings/verifier/evidence/<slice>/` |
| `media` | Desktop screenshot(s) and/or short screen recording (SO 11) |
| `prEmbed` | Absolute `/opt/cursor/artifacts/…` in GUI PR body (SO 12) |

---

## State transitions

### BoxBackend.readiness

```text
not_ready ──start──► starting ──ok──► ready
                │
                └──fail──► failed
ready ──loss──► not_ready | failed
```

Pass Shell/box tool requires `ready` at invocation success. `starting` / `not_ready` / `failed` attempts are non-Pass for SC-001 (may be documented Fail evidence).

### ShellBoxToolCall.outcome

```text
invoke → success | error | not_ready
```

### ComputerUseRun

```text
start → observing (screenshot+) → handoff_visible → complete | progressed
```

Pass needs observing artifact + handoff_visible (FR-003).

---

## Traceability

| Entity | Requirements | Acceptance |
|--------|--------------|------------|
| BoxBackend | FR-002, FR-011 | US1 readiness; SC-001 gating |
| ShellBoxToolCall | FR-001, FR-015 | US1; SC-001 |
| ComputerUseRun | FR-003, FR-015 | US2; SC-002 |
| ComputerSettingsProjection | FR-004, FR-005, FR-010, FR-016 | US3; SC-003, SC-004 |
| VerifierEvidenceSlice | FR-012, FR-013, FR-014 | SC-001–003, SC-006 |
