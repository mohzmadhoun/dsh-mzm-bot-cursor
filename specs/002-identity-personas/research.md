# Research: Phase 2 — Identity / Personas

**Feature**: `specs/002-identity-personas`
**Date**: 2026-09-27
**Inputs**: [spec.md](./spec.md) (Clarified) · `MzM-Docs/mzm-bot-plan.md` P2 · `MzM-Docs/mzm-bot-initial-plan.md` §2 / §4 · constitution v1.0.0 · predecessor `specs/001-multi-model-bots` (P1 Done)

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

---

## R1 — Durable bot identity ownership

**Decision:** Host owns all durable bot identity mutations (persona profile, display name, avatar marker, section membership, delete). Electron Main does **not** store identity or invent a parallel bus. Client/Web edits via Host RPC / projections (same topology as P1).

**Rationale:** Constitution seam honesty; P1 locks Host mailbox + Host bot create; FR-002/004/005/006/008 require restart/reload durability Verifier can observe on Host state.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Electron Main identity store | Parallel stack; violates thin-shell / Host ownership |
| Renderer-only localStorage personas | Lost on profile wipe; not Host-durable; weak vs SC-001 |
| Rewrite P1 bot-create feature dir | Forbidden — Lead kickoff / living plan |

---

## R2 — Persona fields → bot instructions

**Decision:** Persist **job**, **voice**, and **anti-jobs** on the bot’s durable persona profile. After save, compose those fields into that bot’s **instructions** for subsequent turns via the existing per-agent persona / system-prompt seam (`@deepseek-ai/dsh-persona` shadowing deployment persona / equivalent Host instruction bind). Empty fields contribute no instruction text. **Verifier Pass** measures durable profile + overview visibility (SC-001/002); it does **not** require proving specific LLM reply wording (SC-008 / clarify).

**Rationale:** Clarify 2026-09-27 Q1; FR-013; inventory “one job, explicit anti-jobs”; reuse `dsh-persona` rather than inventing a second prompt channel.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| UI-only storage (no instruction bind) | Violates clarify resolution and FR-013 |
| Verifier gates LLM adherence | Explicitly rejected in clarify; non-deterministic |
| New prompt protocol outside system-prompt | New seam; YAGNI for P2 |

---

## R3 — Avatar capability

**Decision:** Avatar for P2 Pass = **preset visual markers** (shape and/or color) sufficient to distinguish bots in sidebar and overview. Arbitrary image-file upload is **out** of P2 Pass.

**Rationale:** Clarify 2026-09-27 Q3; FR-005 / SC-003; inventory notes avatar shape/color.

**Alternatives considered:** Image upload / URL avatars (defer; not required for Pass).

---

## R4 — Sidebar sections

**Decision:** Support **named sidebar sections** plus an **Unassigned/default** grouping for bots never assigned to a named section. Named sections are optional overlays. Persist section names and membership Host-durably. Collapse/expand chrome is helpful but not required for Pass. Empty sections may remain after last-bot delete (edge case).

**Rationale:** Clarify 2026-09-27 Q4; FR-006 / SC-004; inventory §2.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Require every bot in a user-named section | Rejected in clarify |
| Flat list only | Violates P2 In / exit |
| Client-only ephemeral grouping | Fails restart/reload SC-004 |

**Tasks gap (not blocking plan):** Exact Host store (Team journal vs settings service) — Runtime/Architect pick during tasks within Host seams.

---

## R5 — Delete with confirmation

**Decision:** Delete requires an **explicit confirmation** step; cancel/dismiss leaves the bot and profile unchanged. On confirm, remove the bot from **sidebar**, **overview entry points**, and **section membership** for Pass. Transcript/mailbox cleanup follows Host/session ownership rules and is **not** a separate P2 Pass gate.

**Rationale:** Clarify 2026-09-27 Q5; FR-007/008 / SC-005; inventory delete-with-confirm culture.

**Alternatives considered:** Soft-delete/archive (not required); mandatory transcript wipe before Pass (rejected in clarify).

---

## R6 — Memory layers ADR (docs only)

**Decision:** Land one ADR under **`MzM-Docs/adr/`** whose **filename identifies agent vs user memory layers** (recommended: `agent-vs-user-memory-layers.md`). ADR distinguishes **agent-scoped** (per-bot) vs **user-scoped** (shared across bots) memory at product/data-model level and states P2 ships **no** memory product UX. Create the `MzM-Docs/adr/` tree on implement if absent. No profile/log/note recall or write UX in P2.

**Rationale:** Clarify 2026-09-27 Q2; FR-009/010 / SC-006; living plan ADR-only; initial-plan §4 early seam honesty for P5.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| ADR under `docs/adr/` or `.agents/notes/` | Clarify locks `MzM-Docs/adr/` |
| Ship memory UX in P2 “while we’re here” | Violates P2 Out / P5 deferral |
| Skip ADR until P5 | Violates FR-009 / SC-006 and risks rewrite |

---

## R7 — Relationship to P1

**Decision:** P2 **extends** P1 Bot identity created via Host `createBot` (displayName + model assignment). P1 create path remains available. Persona fields may be empty at create and edited afterward. Do not reopen P1 mailbox, model-assignment, auth, or topology contracts except by reference.

**Rationale:** Spec Out of Scope; Lead kickoff “new feature dir”; bot-create-model.md listed personas as P1 non-goals — those move here.

---

## R8 — Verifier ownership & catalog

**Decision:**

- Product SC-001…SC-008: DH Verifier on real desktop app against this feature’s quickstart scenarios.
- Instruction application (SC-008): assert saved fields are present in the bot’s instruction/prompt assembly (or equivalent Host wiring observation) — **not** LLM reply text.
- Memory SC-006: file presence + non-goal statement under `MzM-Docs/adr/`; no recall demo.
- Topology handshake from P1 remains a prerequisite environment assumption; P2 does not re-litigate it.

**Rationale:** Spec FR-012; clarify Verifier boundaries.

---

## R9 — Language / stack (Technical Context)

**Decision:** Same stack as P1 — TypeScript / Node (^22.19 \|\| ≥24) DeepSeek Harness Cordis plugins; Electron desktop (`apps/desktop` + `apps/desktop-host`); pnpm workspaces; Vitest + Spec Kit Verifier paths; Linear project **DeepSeek Harness - Cursor** after `taskstoissues`.

**Rationale:** Constitution stack constraints + repo AGENTS.md.

---

## Resolved NEEDS CLARIFICATION checklist

| Item | Status |
|------|--------|
| Instruction bind vs UI-only | Resolved R2 (clarify) |
| Memory ADR location/filename | Resolved R6 (clarify) |
| Avatar Pass bar | Resolved R3 (clarify) |
| Unassigned vs required sections | Resolved R4 (clarify) |
| Delete vs transcript wipe | Resolved R5 (clarify) |
| Identity ownership Host vs Electron | Resolved R1 |
| P1 relationship | Resolved R7 |
| Verifier catalog | Resolved R8 |
| Stack | Resolved R9 |
| Sidebar store exact API | Deferred to tasks (R4 tasks gap) — not a specify ambiguity |
