# Research: Phase 3 — Skills UX

**Feature**: `specs/003-skills-ux`
**Date**: 2026-09-27
**Inputs**: [spec.md](./spec.md) (Clarified) · `MzM-Docs/mzm-bot-plan.md` P3 · `MzM-Docs/mzm-bot-initial-plan.md` §6 · constitution v1.0.0 · predecessors `specs/001-multi-model-bots`, `specs/002-identity-personas` · skill family `packages/skill/`

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

---

## R1 — Thin managed pack membership (plan lock)

**Decision:** For Phase 3 Verifier Pass, the thin managed pack contains **exactly one** platform-shipped **managed skill** discoverable in the Desktop skills surface (≥1 satisfied by one). Exact technical id / on-disk path is chosen in tasks within `packages/skill/` (filesystem provider, badge-class bundle, or Desktop-profile mount). Product **display name** MUST be human-readable in discovery. Pass does **not** require inventory §6 catalog completeness or any site-playbook set.

**Rationale:** PO/plan simplest path; clarify deferred membership to plan/Architect; FR-008 / SC-004 / US4; living plan “thin managed pack (not every playbook).”

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Ship full inventory §6 managed list | Violates P3 Out / FR-008 |
| Zero managed skills (user-only) | Violates exit “load” + thin pack In; SC-001 needs managed discover/load |
| Large multi-skill “thin” pack | Unnecessary for Pass; theater |

---

## R2 — Discover / load ownership

**Decision:** Host mounts managed + user skill sources into `ctx.skills` (reuse skill registry + filesystem provider patterns). Client/Web shows a skills discovery/library surface. **Load** for Pass = making a discovered skill **available to attach** (select/use-for-attach). A separate multi-step load ritual is **not** required. Loaded/available state persists across restart/reload for managed pack presence and user skills.

**Rationale:** Clarify Q2; FR-001/002 / SC-001; reuse `dsh-skill` / `dsh-skill-filesystem` / session `skills/list` where Client already consumes Host catalog.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Electron Main skill catalog | Parallel bus; violates thin shell |
| Renderer-only skill list | Not Host-durable; fails SC-001 |
| Mandatory multi-step “download/load” wizard | Rejected in clarify; YAGNI |

---

## R3 — User skill authoring

**Decision:** One in-app authoring path creates/edits **user-authored** skills with **non-empty display name** and **non-empty instructional body**. Save with either empty **MUST** be rejected with a clear user-visible reason; incomplete skills MUST NOT appear as saved discoverable skills. Persist Host-durably under a user skill root (filesystem provider user directory or Host-equivalent). Edit/re-save replaces prior values.

**Rationale:** Clarify Q1; FR-006/007/013 / SC-003; inventory skill-authoring culture without learn-from-demonstration.

**Alternatives considered:** Allow empty body (rejected); learn-from-demonstration authoring (P3 Out); Agent-only auto-author without UI (fails one authoring path UX).

---

## R4 — Per-bot attach (multi allowed)

**Decision:** Persist **skill attachments** as associations of skill id → bot id on **Host-owned bot identity** (preferred extension of Agent Teams bot record) or an equivalent Host attachment map keyed by bot. Attachments are **per-bot**; attaching to A does not attach to B. A bot **MAY** have multiple attachments; Pass proves **≥1**. Detach/delete optional and **not** a Pass gate. Preferred store: extend bot identity (simplest); optional Architect confirm only if Runtime prefers a separate service.

**Rationale:** Clarify Q3; FR-003/005 / SC-002/006; constitution seam honesty (Host owns durable agent state).

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Global-only “enabled skills” with no per-bot view | Violates attach-on-a-bot exit + SC-006 |
| Electron Main attachment store | Parallel bus |
| Force single attachment only | Unnecessarily restricts; multi allowed is simpler product model |

---

## R5 — Run / active observability

**Decision:** “Run” for Pass is satisfied by **either** (a) a dedicated product **run** control on the bot’s skills surface, **or** (b) a session turn that applies the attached skill, provided the desktop UI shows **run/active** state for that bot (not merely global catalog listing). Proving LLM reply wording that quotes the skill is **not** required.

**Rationale:** Clarify Q4; FR-004 / SC-002; mirrors P2 instruction-adherence stance.

**Alternatives considered:** Require dedicated Run button only (over-constrains); require LLM text match (non-deterministic; rejected).

---

## R6 — Instruction application after attach

**Decision:** After attach, compose each attached skill’s instructional content into that bot’s **instructions** for subsequent turns via the existing persona / system-prompt instruction seam (same family as P2 FR-013). Verifier Pass measures attach/run UI + desktop visual evidence; it does **not** score LLM replies (FR-014 / SC-007).

**Rationale:** Clarify Q5; reuse `dsh-persona` / system-prompt bind rather than a second prompt channel.

**Alternatives considered:** UI-only attach without instruction bind (violates clarify); new prompt protocol (YAGNI).

---

## R7 — Desktop visual evidence (standing order 11)

**Decision:** Every GUI acceptance scenario (US1–US3 / SC-001…003/005) requires real Desktop screenshots and/or short screen recordings under `specs/003-skills-ux/verifier/evidence/` (may mirror `/opt/cursor/artifacts/`). Unit/jsdom alone **fails** those scenarios (FR-012). Plan and later Verifier recipes MUST cite this rule; do not weaken in tasks.

**Rationale:** Spec FR-012; PO standing order 11; DH Spec/Verifier agent standing orders.

**Alternatives considered:** Vitest-only Pass (forbidden for GUI).

---

## R8 — Relationship to P1 / P2

**Decision:** P3 **extends** P1 bots and P2 identity surfaces. Create-bot, persona, mailbox, model assignment remain owned by `specs/001-*` / `specs/002-*`. Do not reopen those contracts except by reference. Skills discovery may live as a new surface or as a section on bot overview — either is fine if FR-001…004 observables hold.

**Rationale:** Living plan / Lead kickoff; no rewrite of 001/002.

---

## R9 — Explicit non-goals (research)

**Decision:** Out of P3 implement and Pass: full managed catalog; learn-from-demonstration; plugin/connector skills; memory product UX; routines; MCP; Box/Shell; detach-as-Pass-gate; pixel Grok chrome.

**Rationale:** Plan §4 P3 Out; FR-009/010; SC-004.

---

## Coverage vs Technical Context

| Technical Context item | Resolution |
|------------------------|------------|
| Language / deps / platform | Existing DSH + Electron stack (no new runtime) |
| Storage | Host skills mount + user skill root + bot attachments (R2–R4) |
| Testing | Vitest + Desktop Verifier + FR-012 evidence (R7) |
| Thin pack membership | Exactly one managed skill (R1) |
| Instruction bind | Persona/system-prompt seam (R6) |
| Architect coordination | Not spawned; optional confirm on attachment store during tasks (R4) |
