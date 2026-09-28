# Research: Phase 5 — Memory productization

**Feature**: `specs/005-memory-productization`
**Date**: 2026-09-28
**Inputs**: [spec.md](./spec.md) (Clarified Session 2026-09-28) · `MzM-Docs/mzm-bot-plan.md` P5 · `MzM-Docs/adr/agent-vs-user-memory-layers.md` (Accepted) · constitution v1.0.0 · predecessors `specs/001`–`004` · **PO-locked Architect Option** (MOH-233 / mission brief) · Clarify merged PR #169 @ `749d75626f`

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

**Do not reopen** the Host Memory catalog SoT Option — PO locked.

---

## R1 — Host-owned Memory catalog is the SoT (PO-locked Architect Option)

**Decision:** Phase 5 curated memory is a **Host-owned Memory catalog**. Durable `MemoryRecord` rows live on Host. Client write / browse / recall surfaces **project** Host state over authenticated Host HTTP/WS Remotes. Electron Main and Client local stores MUST NOT be SoT.

**Persistence home (choice):** Prefer extend **`packages/experimental/agent-team/`** Host journal — same pattern as P2 persona (`team/member`), P3 skill attachments, and P4 routines (`team/routine`). Adjacent Host service only if Agent Teams cannot hold account-wide user-layer rows without breaking Lead journal invariants; default assumption for tasks is Agent Teams journal paths (see R2). Exact file/API names land in `/speckit-tasks`.

**Rationale:** Mirrors P2–P4 Host SoT + Client projection; supports agent vs user layers, restart durability, and Host instruction injection for model-visible recall; avoids a second durable bus.

**Alternatives considered:**

| # | Option | Verdict |
|---|--------|---------|
| 1 | Electron Main owns memory store; Host reads via IPC | **Reject** — parallel bus/storage; violates dual-process lock and FR-006 |
| 2 | Client-only / browser local persistence as SoT | **Reject** — fails restart across Host child and layer honesty |
| 3 | New standalone memory package as first SoT without Agent Teams | **Defer** — YAGNI unless Agent Teams journal cannot express user-layer account scope |
| 4 | **Host-owned Memory catalog (Agent Teams / Host journal)** | **Choose (PO-locked)** |

---

## R2 — Agent layer per bot; user layer account-wide (ADR)

**Decision:** Honor `MzM-Docs/adr/agent-vs-user-memory-layers.md` without rewrite:

| Layer | Scope | Catalog keying (logical) |
|-------|-------|--------------------------|
| **Agent memory** | One bot | `botId` required on each agent-scoped `MemoryRecord` |
| **User memory** | Account / user across bots | No owning `botId` (or explicit account/user scope); available in every bot context for browse/recall |

**Journal sketch (tasks refine):** e.g. Lead path `team/memory` (or split `team/agent-memory` + `team/user-memory`) with `layer: agent|user`. Transcript / session chat log remains **out** of this catalog.

**Rationale:** ADR Accepted in P2; Spec FR-006 / FR-007 / US5; clarify Session 2026-09-28.

**Alternatives considered:** Single undifferentiated store (ADR reject); layer rewrite in P5 (forbidden).

---

## R3 — Kinds × layers orthogonal (clarify lock)

**Decision:** Vocabulary kinds **profile / log / note** MAY live on **either** agent or user layer. ADR “typical contents” rows are illustrative only — **not** kind→layer locks. Pass still requires all three kinds written and recalled, plus ≥1 agent-scoped and ≥1 user-scoped fact.

**Rationale:** Clarify Q3 Session 2026-09-28; FR-017 / SC-010.

**Alternatives considered:** Default lock profile→user only (rejected by clarify).

---

## R4 — Write Pass = user-visible UI (bot-tool optional)

**Decision:** Phase 5 Pass writes happen through **user-visible** memory write surfaces (profile / log / note). Bot-initiated tool write MAY exist later or as complementary wiring but is **not** required for Pass (FR-015 / SC-009). Empty content rejects with a clear user-visible reason and writes nothing.

**Rationale:** Clarify Q1; Spec FR-001…003, FR-015.

**Alternatives considered:** Require tool write for Pass (rejected).

---

## R5 — Recall Pass = surface + one model-visible path

**Decision:** After restart (or Verifier durable reload):

1. **Surface recall:** User-visible memory browse/recall returns the written curated facts with kinds distinguishable.
2. **Model-visible recall:** Host makes ≥1 curated fact available to a subsequent bot turn via the cheapest Host **context / instruction injection** path (sibling to P2 persona-prefix and P3 skill-instructions binds). Verifier proves the injection/application path ran; **does not** score LLM reply wording (FR-014 / FR-016).

**Session-log honesty:** Any fact that becomes model-visible MUST be reconstructable from the session log (constitution / AGENTS “model-visible ⟺ logged”). Prefer a documented scoped instruction section (e.g. `agent-teams:memory-recall`) assembled from Host catalog rows for that turn’s bot (agent-layer for that `botId` + user-layer account rows), not a silent Main-side inject.

**Rationale:** Clarify Q2; FR-005, FR-016 / SC-004; existing Agent Teams bind pattern.

**Alternatives considered:** Surface-only Pass (rejected); require specific LLM paraphrase (rejected); dump full transcript as “recall” (rejected — FR-006).

---

## R6 — Transcript ≠ curated memory

**Decision:** Chat transcript is conversation-scoped history. It MUST NOT substitute for curated profile/log/note rows in the Memory catalog. Pass fails if “recall” is only unrecalled chat lines without catalog write.

**Rationale:** ADR + Spec edge cases / FR-006.

**Alternatives considered:** Auto-promote transcript to memory for Pass (out of scope / theater).

---

## R7 — Topology & no Electron Main memory bus

**Decision:**
- **Electron shell** (`apps/desktop`): spawn Host child; lifecycle IPC only; load `dsh-app://`. Does **not** own memory records, write/browse/recall SoT, or injection bus.
- **Desktop Host** (`apps/desktop-host` + Host plugins, prefer Agent Teams): Memory CRUD, durable catalog, projection API, model-visible instruction bind.
- **Client / Web:** Memory write + browse/recall UI; locale-owned copy; mutate/list via Host Remotes only.
- **Main ↔ Host IPC:** lifecycle-only (`ready` / `fatal` / `shutdown-complete` / `update-tasks` + Main `shutdown` / `update-tasks`). **Forbidden** on that channel: memory-catalog, memory-write, memory-list/browse, memory-recall, memory-injection payloads. Extend `apps/desktop/src/host-protocol.ts` exclusion list like identity + skills + routines (P4 R7 pattern).
- **Data plane:** memory mutations + projections travel **shipped authenticated Host HTTP/WS** only.
- **Guard expectation:** Verifier non-goals / tasks include a “no Electron memory bus” absence check (clone P4 routines bus / P3 skills bus recipe).

**Rationale:** PO lock; Spec FR-006; dual-process freeze from P1–P4.

**Alternatives considered:** Memory payloads on Node IPC (forbidden).

---

## R8 — Standing orders 11+12 (GUI Verifier evidence)

**Decision:** Every GUI acceptance scenario (Stories 1–5 / SC-001…005, SC-007) requires real desktop screenshots and/or short screen recordings (**SO 11**), **committed** under `specs/005-memory-productization/verifier/evidence/<slice>/` and **embedded** in the GUI PR body via absolute `/opt/cursor/artifacts/…` paths (**SO 12**). Unit/jsdom alone fails GUI Pass. Docs/absence-only non-goals checks may skip embeds.

**Rationale:** Spec FR-011 / FR-012; mission brief.

**Alternatives considered:** Artifact page links alone (rejected by FR-012).

---

## R9 — Non-goals unchanged

**Decision:** Full Grok memory chrome parity beyond ADR, connectors/MCP/event routines (P6), Box/Shell (P7), edit/delete as Pass gates, bot-tool write as Pass gate, kind→layer locks, and rewriting `specs/001`–`004` remain Out. Absence does not fail Pass (SC-006, SC-008…010).

**Rationale:** Spec Out of Scope; plan P5 Out.

---

## Seam map (summary)

```text
User (Desktop Client memory write / browse / recall UI)
    │  write profile|log|note · list/browse · layer filter  (Host HTTP/WS Remotes only)
    ▼
Desktop Host  ──►  Host Memory catalog (SoT) — agent layer per botId; user layer account-wide
              ──►  Host instruction/context inject for model-visible recall (session-log reconstructable)
              ──►  prefer packages/experimental/agent-team/ journal (extend P4 team/routine pattern)
Electron Main ──►  lifecycle IPC only; NO memory durable store / write / recall / inject bus
Transcript    ──►  NOT curated Memory catalog SoT
```
