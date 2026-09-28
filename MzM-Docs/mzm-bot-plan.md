# MzM Bot — Final Project Plan

| Field | Value |
|-------|-------|
| **Status** | ACCEPTED v0.3 — P1 (MOH-37) Done; P2 (MOH-88) Done; P3 Skills UX (MOH-142) Done; P4 Routines cron (MOH-188) Done; **P5** Memory (MOH-228) Done on master 2026-09-28 (T001–T037; polish [#196](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/196) @ `16cafad98d`; MOH-262 Duplicate canceled); **next = P6** Connectors/MCP + event routines + trust — held until PO opens epic |
| **Date** | 2026-09-25 (living §10 updated 2026-09-28 P5 Done → P6 hold) |
| **Owners** | DH Product Owner Assistant (draft) · DH Spec (requirements review) · DH Lead (gates) · DH Architect (seams) |
| **Repo** | `C:\Users\Mohammed\Desktop\DSH - MzM Bot` (`mohzmadhoun/dsh-mzm-bot`) |
| **Inputs** | `MzM-Docs/mzm-bot-initial-plan.md` · `docs/designs/mzbot-wedge-to-grok-like.md` · `.specify/memory/constitution.md` · MzM Bot Plan room freeze |

This is the **solid program plan** for MzM Bot (DeepSeek Harness → GrokBot-like Electron). It is **not** a Spec Kit feature spec. Spec Kit runs **per phase** after this plan is accepted.

---

## 1. Product goal

**North star (C):** A DeepSeek Harness Electron desktop that feels GrokBot-like — multi-bot team with personas, skills, routines, memory, connectors, easy UI, and bot-to-bot — **plus** MzM’s differentiator: **per-bot model/provider**.

**First ship (A / Phase 1):** Stop Mohammed’s daily Alt-Tab for model reasons:

1. Create ≥2 bots with **different** models/providers.
2. **Async 1:1** bot→bot messaging (recipient acts or handoff is visible).
3. Electron UI good enough for a real work session — **not** Grok chrome parity.

**Customer:** Mohammed (founder = user). Measured pain = model lock on one stack.

---

## 2. Non-goals (program-level)

- Do not specify or build full Grok parity in one Spec Kit feature.
- Do not invent Linear tickets from this plan or the inventory — tickets come from Spec Kit `tasks` / `taskstoissues` **per phase**.
- Do not treat design docs or `mzm-bot-initial-plan.md` as the live board.
- Do not fork a parallel messaging bus in Electron (Host mailbox only).
- Do not put local Shell/box into Phase 1.
- Do not expand team/bots without Mohammed asking.

---

## 3. Strategy lock (A→C)

| Letter | Meaning |
|--------|---------|
| **A** | Wedge: per-bot models + basic 1:1 messaging + usable Electron UI on durable DSH seams |
| **C** | Full GrokBot-comparable product surface on DSH |
| **A→C** | Chosen path: ship A first; later phases cherry-pick from the inventory toward C |

Constitution principles still bind: wedge-first, Spec-driven delivery, product over theater, verify against spec, seam honesty.

---

## 4. Clear phases

Each phase = one Spec Kit loop: `specify → clarify → plan → tasks → analyze → implement`.  
**DH Verifier gates Done every phase** (never deferred to P7).

### P0 — Foundation (baseline, done)

| | |
|--|--|
| **In** | Spec Kit constitution v1.0.0; Spec Kit + gstack init; A→C design doc; AGENTS.md commit format; Grok inventory (`mzm-bot-initial-plan.md`) |
| **Out** | Feature ship; Linear board fill |
| **Exit** | Constitution ratified; tooling present; this plan accepted |
| **Status** | Done except acceptance of this plan |

### P1 — Wedge A (done on master)

| | |
|--|--|
| **Entry gate (before Electron/Runtime fan-out)** | Shell↔Host topology locked: **bundled-Node Desktop Host child + shipped authenticated Host HTTP/WS data plane + Node IPC lifecycle-only + `dsh-app://`**. Topology handshake must pass Verifier before feature tasks. *(Freeze wording amended 2026-09-27 — T040 / open B; was “framed pipes”; see §12.)* |
| **In** | Chat-only Host (sessions + llm adapters + tools registry **without** local shell backends); **user-initiated basic bot create**; per-bot model via Host isolate/`ctx.llm`; async 1:1 via **Host mailbox/inbox only**; **chat progress updates + final result delivery**; Electron shell UI sufficient for design success criteria; trust floor (below) |
| **Out** | Box/Shell; MCP; group channels; voice; send-on-behalf; user machines; pixel Grok chrome; CreateAgent-from-peer; event-driven routines; 1Password connector; chat chrome beyond progress+final delivery |
| **Exit (Verifier-provable)** | ≥2 bots, different models; real session without Alt-Tab for model reasons; recipient acts or handoff visible; TTFT multi-model team session < 30 min on clean machine (documented); Verifier re-runs that path on Electron |
| **Status** | **Done** — epic [MOH-37](https://linear.app/momadhoun/issue/MOH-37/p1-wedge-a-per-bot-models-11-messaging-electron-ui); specs under `specs/001-multi-model-bots`. **Deferred (non-blocking for P2):** SC-005 live desktop full replay (`verifier/evidence/scenario-5/VERDICT.txt` = Deferred; recipe present). |

### P2 — Identity / personas (done)

| | |
|--|--|
| **In** | Job/voice/anti-jobs; rename/avatar; sidebar sections; delete-confirm; **ADR only** for agent vs user memory layers (no memory UX) |
| **Out** | Memory productization (P5); skills library (P3) |
| **Exit (Verifier-provable)** | User can create/rename/delete (with confirm) bots and edit job, voice, anti-jobs, avatar, sidebar section; anti-jobs persist on the profile and appear in bot overview; Verifier re-runs that path |
| **Status** | **Done** — epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas); specs under `specs/002-identity-personas/`. Product Verifier Pass [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104). |

### P3 — Skills UX (done)

| | |
|--|--|
| **In** | Load/discover + authoring; thin managed pack (not every playbook) |
| **Out** | Full managed skill catalog parity; learn-from-demonstration |
| **Exit** | User can attach/run a skill on a bot; Verifier covers load + one authoring path |
| **Status** | **Done** — epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux); specs under `specs/003-skills-ux/`. US1–US4 + polish + SC-001…SC-005 stamped; product Verifier Pass [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`. |

### P4 — Routines (cron only) (done)

| | |
|--|--|
| **In** | Create/pause/resume + pane list; Host jobs; **no** event listeners |
| **Out** | Slack/GitHub/email/etc triggers (P6); recall UX (P5) |
| **Exit** | Cron routine fires and is visible in pane; pause/resume verified |
| **Status** | **Done** — epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only); specs under `specs/004-routines-cron/`. SC-001…SC-005 Pass; product close [#166](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/166) @ `aca0c2b7c5`. |

### P5 — Memory productization (done)

| | |
|--|--|
| **In** | Profile / log / note + recall UX; agent vs user memory layers per [adr/agent-vs-user-memory-layers.md](./adr/agent-vs-user-memory-layers.md) |
| **Out** | Full Grok memory chrome parity beyond agreed ADR; P6 connectors/events; P7 Box/Shell |
| **Exit (Verifier-provable)** | Write profile/log/note fact → restart → recall returns it; Verifier scripted path documented; SO 11+12 desktop visual evidence for GUI |
| **Status** | **Done** — epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization); specs under `specs/005-memory-productization/`. T001–T037 complete (MOH-262 Duplicate canceled); polish close [#196](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/196) @ `16cafad98d`. |

### P6 — Connectors / MCP + event routines + trust productization (next — held)

| | |
|--|--|
| **In** | MCP/connectors; event-triggered routines; richer trust/permissions productization; 1Password-class credential UX if needed |
| **Out** | Box/computer parity (P7) |
| **Exit (Verifier-provable)** | One connector: install → auth → successful tool call; one event-triggered routine fires end-to-end; one denied-permission path proven; secrets absent from session dumps |

### P7 — Computer / box + subagent parity + settings chrome

| | |
|--|--|
| **In** | Box/Shell backends; computerUse-class subagents; settings/chrome polish toward Grok-easy |
| **Out** | Treating “Verifier” as a P7 feature — Verifier already gates every phase |
| **Exit (Verifier-provable)** | One local Shell/box tool path proven; one computerUse-class subagent path proven; settings rows required for those daily paths present (chrome polish ≠ Verifier substitute) |

---

## 5. Auth recommendation (pre-specify ship/no-ship)

| Option | Role |
|--------|------|
| **In-app (LOCKED primary — Mohammed 2026-09-25)** | Electron main → OS secure store / Host credential seam. Secrets off renderer; not in session dumps. Matches P1 trust floor. |
| **Env / key files** | Dev/CI only |
| **1Password / connector vault** | Wait for **P6** |

**Decision:** Mohammed ship/no-ship **accepted** — P1 auth primary = **in-app**. Env/keys = dev/CI only. 1Password/connectors wait for P6.

---

## 6. P1 trust floor (Architect lock)

- Same Desktop Host + one `$DSH_HOME/profiles/desktop`
- Isolated agent scopes (per-bot model; no shared tool privilege)
- Async 1:1 = Host mailbox — **no Electron parallel bus**
- Named auth path (above)
- Tools that cannot send/post externally
- No MCP in P1
- Sessions are not credential dumps

---

## 7. Spec Kit + Linear hang

| When | What |
|------|------|
| Once | `/speckit-constitution` (done) |
| Each phase | `specify → clarify → plan → tasks → analyze → implement` |
| After `tasks` | `/speckit-taskstoissues` → Linear (one milestone/epic per phase; no pre-loading later phases) |
| Always | Design docs + this plan = direction; Linear = live tasks only |

**Do not** run Spec Kit specify until: (1) this plan accepted, (2) auth primary ship/no-ship’d.

---

## 8. Roles & gates

| Role | Owns |
|------|------|
| **Mohammed** | Ship / no-ship (auth, phase exits, releases) |
| **DH Lead** | Phase gates, handoffs, living plan coherence |
| **DH Spec** | Spec Kit artifacts, acceptance criteria, clarify |
| **DH Architect** | Seam map, topology, plugin ownership |
| **DH Electron / Runtime** | Shell vs Host implementation within accepted plan |
| **DH Verifier** | Done evidence every phase |
| **DH Product Owner Assistant** | Scope cuts, backlog order, plan updates |

---

## 9. Inventory → phase map (cut list)

Source: `MzM-Docs/mzm-bot-initial-plan.md` §16–17 + Appendix B.

| Inventory area | Phase |
|----------------|-------|
| Per-bot multi-model (MzM wedge) | **P1** |
| User-initiated basic bot create | **P1** |
| Chat progress updates + final result delivery | **P1** |
| Basic async 1:1 multi-agent | **P1** |
| Shell↔Host topology / Electron usable UI | **P1** |
| Personas / anti-jobs / sidebar / delete | **P2** |
| Skills UX | **P3** |
| Routines cron | **P4** |
| Memory productization | **P5** |
| Connectors / MCP / event routines / rich trust | **P6** |
| Box / subagents / settings chrome | **P7** |
| Voice, draft-first send-on-behalf, group channels, user machines, learn-from-demo, billing chrome, full skill pack, pixel Grok | **Explicitly OUT** until a later named phase amends this plan |

---

## 10. Immediate next gates

1. ~~**@DH Spec** re-reads v0.3 — LGTM~~ **DONE** 2026-09-26 — Spec LGTM; P1 specify at `specs/001-multi-model-bots`.
2. ~~Mohammed ship/no-ship on auth~~ **DONE** — in-app primary.
3. ~~`/speckit-specify` for P1 only~~ **DONE** (branch `cursor/p1-specify-92fa`).
4. ~~P1 wedge A implement + Verifier gates~~ **DONE** 2026-09-27 — epic MOH-37 Done on master. **Note:** P1 SC-005 live Desktop full replay remains **Deferred** (does **not** block later phases).
5. ~~P2 Spec Kit design + implement + Verifier~~ **DONE** — epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88/p2-identity-personas); Pass [#104](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/104).
6. ~~P3 Spec Kit design + implement + Verifier~~ **DONE** 2026-09-27 — epic [MOH-142](https://linear.app/momadhoun/issue/MOH-142/p3-skills-ux); SC-005 Pass [#136](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/136) @ `337f25a964`; specs `specs/003-skills-ux/`.
7. ~~**P4 Spec Kit design + implement + Verifier**~~ **DONE** 2026-09-28 — epic [MOH-188](https://linear.app/momadhoun/issue/MOH-188/p4-routines-cron-only); SC-001…SC-005 Pass [#166](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/166) @ `aca0c2b7c5`; specs `specs/004-routines-cron/`.
8. ~~**P5 Spec Kit design + implement + Verifier**~~ **DONE** 2026-09-28 — epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228/p5-memory-productization); T001–T037 complete (MOH-262 Duplicate canceled); polish [#196](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/196) @ `16cafad98d`; specs `specs/005-memory-productization/`.
9. **Next — P6 kick (held):** Connectors / MCP + event routines + trust productization — **PO opens epic** on **DeepSeek Harness - Cursor** when ready → then Spec Kit specify → new `specs/006-…` (do not rewrite 001–005). Lead does **not** invent the P6 epic. Living gate: [living-next-gate.md](./living-next-gate.md).

---

## 11. Change control

Amendments to phases or P1 exit criteria require: PO draft → Spec/Lead/Architect ack → Mohammed ship/no-ship if scope or decision rights change. Bump this doc’s status line (v0.1 → v0.2…).

---

## 12. Room freeze record

Frozen 2026-09-25 in channel **MzM Bot Plan** by DH Spec / DH Lead / DH Architect / DH Product Owner Assistant:

- P4 cron before P6 events (do not bundle)
- P1 chat-only; box → P7
- One shell↔Host topology only (bundled-Node Desktop Host child + shipped authenticated Host HTTP/WS data plane + Node IPC lifecycle-only + `dsh-app://`)
- Auth primary **LOCKED**: in-app (Mohammed 2026-09-25)
- Verifier every phase
- v0.3 Spec four-edit patch: P2 exit (no “anti-job visibility”); §9 + P1 In basic create + chat progress/final; P6/P7 Verifier-provable exits

**Amendment (2026-09-27, T040 / open B):** Room-freeze bullet above replaces literal “framed pipes” with the **shipped authenticated Host HTTP/WS data plane** (Architect pick 2). Lock intent unchanged: lifecycle IPC + `dsh-app://` + no parallel bus. Wording-only; does **not** block implement. Cross-link: [research.md R1](../specs/001-multi-model-bots/research.md#r1--shellhost-process-topology).
