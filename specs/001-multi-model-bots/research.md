# Research: Phase 1 Wedge A — Multi-Model Bots

**Feature**: `specs/001-multi-model-bots`
**Date**: 2026-09-26
**Inputs**: [spec.md](./spec.md) (Clarified) · [architecture.md](./architecture.md) (Architect MOH-40) · `MzM-Docs/mzm-bot-plan.md` P1 · constitution v1.0.0

All Technical Context unknowns from plan.md are resolved below. Format: Decision / Rationale / Alternatives.

---

## R1 — Shell↔Host process topology

**Decision:** Entry gate = Electron Main spawns one **bundled Electron-as-Node Desktop Host** child (`apps/desktop-host`) against `$DSH_HOME/profiles/desktop`; **Node IPC is lifecycle-only** (`ready` / `fatal` / `shutdown` / `update-tasks`); primary window loads **`dsh-app://`**; application data plane is the **shipped authenticated Host HTTP/WS** (not a second bus).

**Rationale:** Matches shipped Desktop ([architecture.md](./architecture.md), thin-wrapper / RunAsNode notes). Spec FR-013 / SC-007 require Verifier-recorded handshake pass before product Done. Architect names the six handshake criteria in architecture.md; DH Electron + DH Verifier own scripts.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| Reintroduce framed pipes for all app I/O | Regresses Web reuse; large rewrite; blocks wedge (Architect novel-seam pick rejected) |
| Hybrid framed control + HTTP app | Two transports; no product gain over shipped IPC events |
| Electron-only mailbox / model router | Violates Host-mailbox and seam-honesty locks |

**Open B (amended 2026-09-27, T040 — not blocking implement):** Program plan freeze string updated in [`MzM-Docs/mzm-bot-plan.md`](../../MzM-Docs/mzm-bot-plan.md) (P1 entry gate + §12 Room freeze): “framed pipes” → **shipped authenticated Host HTTP/WS data plane**. Wording-only (Architect pick 2). Plan **honors lock intent** (lifecycle IPC + `dsh-app://` + no parallel bus) and **scripts the shipped data plane**. Verifier must not require a reintroduced framed-pipe stack.

---

## R2 — Async 1:1 messaging path

**Decision:** **Host mailbox only** via experimental **Agent Teams** Lead-log mailbox → target Agent inbox. No Electron Main/preload messaging bus for bot-to-bot.

**Rationale:** Spec FR-004/005; constitution seam honesty; Architect pick A. Durable handoff survives cold resume; UI can observe via Host session/RPC projections.

**Alternatives considered:**

| Option | Why not |
|--------|---------|
| New Host mailbox plugin + independent root Sessions | Duplicates Team mailbox; new seam |
| Parent↔child `send_message` only | Not true peer; weak vs FR-004 bot-to-bot |
| Electron IPC “mailbox” | Explicit non-goal / lock violation |

**Runtime gap (plan task, not research open):** `SpawnTeammateRequest` must carry per-bot LLM `ModelSelection` / `agentOptions` at create (Architect noted). Spec names WHAT; Runtime picks HOW within Team + agent create.

---

## R3 — Per-bot model / provider assignment

**Decision:** Each Bot binds one **`ModelSelection`** (`provider` + `model` [+ optional reasoning effort]) via Host agent create / `installModelSelection` + `ctx.llm` adapters. Electron Main does not route models.

**Rationale:** Spec FR-002/003/011; reuse agent options + llm adapters (Architect). Verifier Pass for “different models” = **any two distinct configured model/provider assignments** in the verification environment (clarify 2026-09-26) — not a fixed marketing catalog.

**Alternatives considered:** Fixed marketing provider list in spec (rejected in clarify); Main-process model router (violates Host ownership).

---

## R4 — In-app credentials

**Decision:** Primary auth = **in-app** via Host **`ctx.credentials` + `dsh-credentials-local`** (Models / Settings write-only UI). Secrets never on renderer trust surface; never in session dumps/transcript exports. Env/key files = **dev/CI only** (FR-009).

**Rationale:** Mohammed ship/no-ship 2026-09-25; Spec FR-008/009; Architect pick I for P1.

**Alternatives considered:**

| Option | Why not for P1 |
|--------|----------------|
| Electron Main OS secure store as credentials provider | New provider + secret IPC risk; defer behind same `CredentialRef` seam |
| Dual-write keychain + Host file | Two sources of truth |
| 1Password / connector vault | Deferred to P6 |

---

## R5 — Chat progress + final delivery

**Decision:** Reuse existing Host session/agent stream events for progress and turn-completion / assistant result for final. Client Web chat under Electron shows them; shell does not synthesize progress.

**Rationale:** Spec FR-006; Architect — no new chat protocol.

**Alternatives considered:** Custom Electron progress bus (rejected); richer Grok chrome (explicit non-goal).

---

## R6 — Desktop UI surface

**Decision:** Usable Web client under Desktop Electron wrapper: bot create, model assign, chat (progress+final), handoff visibility, in-app credential entry. No developer tooling on happy path.

**Rationale:** Spec FR-007 / US3; reuse Desktop Web wrapper.

---

## R7 — Trust floor / Host capability

**Decision:** Phase 1 Host is **chat-oriented**: sessions, llm adapters, tool registry **without** local Shell/Box backends for acceptance. Per-bot scopes isolate model assignment; no shared tool privilege by default; tools in acceptance surface MUST NOT send/post externally.

**Rationale:** Spec FR-010–012; program trust floor.

---

## R8 — Verifier ownership & catalog

**Decision:**

- Topology handshake evidence scripts: **DH Electron + DH Verifier** (Spec owns acceptance text only).
- Product SC-001…SC-006: Verifier on real desktop app after handshake Pass.
- ≥2 models: any two distinct configured assignments available in the environment.

**Rationale:** Clarify session 2026-09-26; Architect Verifier criteria section.

---

## R9 — Experimental Agent Teams acceptance

**Decision:** Mount experimental Agent Teams for P1 messaging. Task-board productization deferred. Promotion of experimental package is later; presence of unused board OK if acceptance does not depend on it.

**Rationale:** Architect pick A; smallest durable peer mailbox reuse.

**Open (Lead/Mohammed ack tracked):** Explicit accept of experimental package for wedge with promotion deferred.

---

## R10 — Language / stack (Technical Context)

**Decision:** TypeScript / Node (^22.19 \|\| ≥24) DeepSeek Harness Cordis plugins; Electron desktop (`apps/desktop` + `apps/desktop-host`); pnpm workspaces; Vitest + Spec Kit Verifier paths; Linear project **DeepSeek Harness - Cursor** after `taskstoissues`.

**Rationale:** Constitution stack constraints + repo AGENTS.md.

---

## Resolved NEEDS CLARIFICATION checklist

| Item | Status |
|------|--------|
| Shell↔Host topology HOW for plan | Resolved R1 (open B freeze wording amended T040 → [`mzm-bot-plan.md`](../../MzM-Docs/mzm-bot-plan.md) §12) |
| Mailbox implementation seam | Resolved R2 |
| Model assignment seam | Resolved R3 |
| Auth primary storage | Resolved R4 |
| Chat event source | Resolved R5 |
| UI host | Resolved R6 |
| Trust floor | Resolved R7 |
| Verifier catalog + script owners | Resolved R8 |
| Architect ownership map | Folded from `architecture.md` (MOH-40 Done) — not “Architect pending” |
