# T004 — Memory seam locks (implementers)

**Status:** Setup seam locks documented (no product behavior)
**Owners:** DH Spec (author) · DH Architect (Option lock) · DH Verifier (rerun against recipes)
**Linear:** [MOH-241](https://linear.app/momadhoun/issue/MOH-241) (T004) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance:** research R1 / R3–R7 · [contracts/non-goals.md](../contracts/non-goals.md) · PO-locked Host Memory catalog Option
**Branch:** `cursor/p5-setup-spec-t001-t004-fe1d`
**Start contracts:** [../contracts/README.md](../contracts/README.md)

## Measurable Done

| Lock | Pass bar | Fail if |
|------|----------|---------|
| Host Memory catalog SoT | Durable `MemoryRecord` rows live on **Desktop Host** (prefer Agent Teams / Host journal); Client projects via authenticated Host HTTP/WS only | Electron Main or Client-only store is treated as SoT |
| No Electron Main memory bus | Main↔Host IPC is **lifecycle-only**; memory-catalog / write / list / browse / recall / inject payloads **forbidden** on that channel | Memory CRUD or inject travels Node IPC |
| Transcript ≠ curated catalog | Pass write/recall uses Host Memory catalog rows (profile/log/note), not unrecalled chat lines alone | “Recall” is only a transcript dump |
| Write Pass = UI | Pass writes go through **user-visible** memory write surfaces; bot-tool write optional / not Pass (FR-015 / SC-009) | Pass requires bot-tool write |
| Recall Pass = surface + inject | After restart: (1) browse/recall surfaces the facts; (2) Host injects ≥1 curated fact on a subsequent turn (session-log reconstructable); LLM wording not scored | Surface-only Pass, or scoring model prose |
| Kinds × layers orthogonal | profile / log / note MAY live on agent **or** user layer; no kind→layer locks as Pass (FR-017 / SC-010) | Pass fails solely because a kind sits on the “non-typical” layer |

---

## Lock detail (research crosswalk)

### 1. Host Memory catalog is SoT — R1

| Surface | Role |
|---------|------|
| Desktop Host + prefer `packages/experimental/agent-team/` journal | Own CRUD, durability, projection, model-visible inject |
| Client / Web | Write + browse/recall UI; mutate/list via Host Remotes only |
| Electron Main (`apps/desktop`) | Spawn Host; lifecycle IPC; load `dsh-app://` — **no** memory SoT |

Do **not** reopen Architect Option tables in [research.md](../research.md) R1 (rejected: Main bus, Client-only SoT, premature standalone package).

### 2. No Electron Main memory bus — R7

Forbidden on Main↔Host IPC (extend `apps/desktop/src/host-protocol.ts` like identity + skills + routines):

- memory-catalog
- memory-write
- memory-list / memory-browse
- memory-recall
- memory-injection

Data plane: shipped authenticated **Host HTTP/WS** only. Guard expectation: Foundational T010–T011 + non-goals absence (clone P4 routines / P3 skills bus).

### 3. Transcript ≠ curated Memory catalog — R6

Chat transcript is conversation-scoped history. It MUST NOT substitute for curated profile/log/note rows. Pass fails if “recall” is only unrecalled chat lines without catalog write.

### 4. Write Pass = user-visible UI — R4

Pass writes: user-visible profile / log / note surfaces. Empty content rejects with a clear user-visible reason and writes nothing. Bot-initiated tool write MAY exist later — **not** required for Pass (SC-009).

### 5. Recall Pass = surface + one model-visible path — R5

After restart (or Verifier durable reload):

1. **Surface:** browse/recall returns written curated facts with kinds distinguishable.
2. **Model-visible:** Host makes ≥1 curated fact available to a subsequent bot turn via the cheapest Host context / instruction injection path (sibling to P2 persona-prefix / P3 skill-instructions). Verifier proves injection/application ran; does **not** score LLM reply wording (FR-014 / FR-016).

Any model-visible fact MUST be reconstructable from the session log.

### 6. Kinds × layers orthogonal — R3

| Axis | Values | Rule |
|------|--------|------|
| Kind | `profile` \| `log` \| `note` | All three required for Pass write/recall coverage |
| Layer | `agent` (per `botId`) \| `user` (account-wide) | ≥1 agent-scoped and ≥1 user-scoped fact for Pass |
| Orthogonality | Any kind on either layer | ADR “typical contents” are illustrative only — **not** Pass locks (SC-010) |

---

## Spot-check recipe note (Verifier)

1. **Fail if** product or recipe treats chat transcript dump, Client-only persistence, or Electron Main store as Memory Pass.
2. **Fail if** Pass gate requires bot-tool write, edit/delete UX, Grok chrome, P6 connectors/MCP/events, or P7 Box/Shell.
3. **Pass only if** write/list/recall evidence uses Host Memory catalog APIs + Client projections, and recall evidence includes surface **and** one Host inject path.
4. GUI scenarios still need FR-011/012 desktop screenshots/recordings committed under `verifier/evidence/` + PR embeds (SO 11+12) — owned by scenario recipes / T005 README, not this doc.

## Regression guard wording

> P5 Memory Pass path is **Host-owned Memory catalog** (prefer Agent Teams / Host journal) + user-visible write UI + surface recall after restart + one model-visible Host inject. Electron Main has no memory bus. Transcript is not curated memory. Kinds and layers are orthogonal. Bot-tool write and edit/delete are optional for Pass.

## Non-overlap

- T002 / T003 own inventory files (`host-memory-inventory.md`, `memory-inject-inventory.md`) — not this doc.
- T005 owns `verifier/README.md` scenario map — not this doc.
