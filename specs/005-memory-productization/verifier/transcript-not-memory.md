# T012 — Transcript ≠ curated memory; Client ≠ SoT

**Status:** Guard documented (Foundational T012)
**Owners:** DH Spec (author) · DH Verifier (rerun) · PO (scope)
**Linear:** [MOH-249](https://linear.app/momadhoun/issue/MOH-249) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance:** research R6 · [contracts/non-goals.md](../contracts/non-goals.md) · [memory-seam-locks.md](./memory-seam-locks.md) lock 3 · Architect / PO Host Memory catalog Option
**Branch:** `cursor/p5-foundational-spec-docs-fe1d`

## Measurable Done

| Check | Pass bar |
|-------|----------|
| Transcript role | Chat transcript / Session surface described as **conversation-scoped history only** |
| Pass path | P5 Memory Pass is **Host Memory catalog** write/list/recall + one Host inject — **not** “dump transcript as curated memory” |
| Client role | Client projects Host rows via HTTP/WS; **Client-only persistence is not SoT** |
| Spot-check | Focused Host/Client note: transcript dump alone or Client-local store alone fails Verifier for Memory |
| Non-goal | No product code path documents Memory Pass as transcript-only or Client-only SoT |

---

## What transcript is (today)

| Surface | Role |
|---------|------|
| Session log / chat transcript | Conversation-scoped messages and tool events for a session |
| Session surface / mailbox | Peer messaging + Session UI projection |
| Model-visible ⟺ logged | Anything that reaches a model request must be reconstructable from the session log — **including** Host inject of curated catalog facts |

Transcript remains required for session honesty. It is **not** the curated Memory catalog.

## What P5 Memory Pass requires

| Capability | Owner | Not |
|------------|-------|-----|
| Durable `MemoryRecord` (profile / log / note × agent / user) | Host Agent Teams journal / Memory catalog (T006–T008) | Electron Main; Client local; chat dump |
| Write / list / browse | Host HTTP/WS Remote + Client projection | Transcript scrape as write; Client inventing SoT rows |
| Surface recall after restart | Host catalog projection | Replaying unrecalled chat lines alone |
| Model-visible inject | Host `MemoryRecallInject` bind ([memory-inject-bind.md](./memory-inject-bind.md)) | Stuffing full transcript into prompt as “memory” |

## Spot-check recipe note (Host / Client)

1. **Fail if** Verifier or product copy treats dumping the chat transcript / Session surface as Memory Pass.
2. **Fail if** Pass evidence relies on Client-only persistence (localStorage, Client file, Electron Main store) as the durable SoT for curated facts.
3. **Pass only if** write/list/recall evidence uses Host Memory catalog APIs and Client projections of those rows, and recall evidence includes surface return **plus** one Host inject path when claiming SC-004.
4. Optional: auto-suggest from transcript into a **user-confirmed** catalog write may exist later — it still MUST land as a Host `MemoryRecord`; unrecalled chat alone never Passes.

## Regression guard wording

> P5 Memory Pass path is **not** “transcript dump as curated memory” and **not** “Client-only persistence as SoT.” Chat transcript remains conversation-scoped history. Host-owned Memory catalog (prefer Agent Teams / Host journal) + user-visible write UI + surface recall after restart + one model-visible Host inject is the SoT (research R6; Architect / PO Option).

## Non-overlap

- T004 / [memory-seam-locks.md](./memory-seam-locks.md) owns the full seam lock set — this file is the focused T012 regression guard.
- T009 / [memory-inject-bind.md](./memory-inject-bind.md) owns the normative inject approach — this file forbids transcript as a substitute for that path.
- T010–T011 own Electron Main exclusion docs + no-memory-bus test — adjacent thin-shell guard, not this file.
- T031 / Scenario 4 non-goals recipe expands SC-006…010 absence checks later.
