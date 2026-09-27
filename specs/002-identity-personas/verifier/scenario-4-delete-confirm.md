# Scenario 4 — Delete confirm / cancel / confirm

**Status:** Product SC Pass stamped — see [evidence/scenario-4/VERDICT.txt](./evidence/scenario-4/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host identity remove) · DH Client (confirm UI + sidebar/overview absence)
**Linear:** [MOH-129](https://linear.app/momadhoun/issue/MOH-129) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T030 — Verifier Scenario 4 recipe covering SC-005
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 4
**Contract:** [../contracts/delete-confirm.md](../contracts/delete-confirm.md)
**Clarify lock 5:** Delete Pass = removal from sidebar, overview entry points, and section membership only; transcript/mailbox wipe is **not** a Pass gate and MUST NOT fail Pass solely because history remains
**Host path landed:** [#89](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/89) (T026 `deleteBot` identity tombstone)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-005 confirm required · cancel safe · identity removal from sidebar/overview/section membership |
| Non-observation | **Do not** fail Pass solely because transcripts/mailbox history remain (clarify lock 5) |
| Product SC stamp | Deferred until Client delete confirm UI (T027) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host `deleteBot` identity tombstone (T026) | SC-005 Host half | **measured:** merge [#89](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/89) on tip `99181eeef1` |
| Client delete confirm flow (T027) | SC-005 desktop path | **inferred:** open — `idle` → `pending-confirm` → `cancelled` \| `deleted` |
| Optional shell confirm bridge (T028) | Confirm still required before Host delete | **inferred:** prefer Client confirm; shell dialog lifecycle-only if used |
| Delete failure keeps bot listed (T029) | Mid-flight Host reject UX | **inferred:** open until Client + Host error path lands |

**Desktop prerequisites** (full Scenario 4 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot; ability to start delete, cancel/dismiss confirm, confirm delete, and read sidebar + overview (+ section membership when US3 chrome exists).

**Host-only rehearsal** (does **not** alone mark SC-005 Done): Agent Teams vitest path below — proves Host identity omission + mailbox non-wipe; Client confirm step remains required for product SC Pass.

**UI state machine** ([data-model.md](../data-model.md) Delete confirmation):

```text
idle → pending-confirm → cancelled → idle
                      ↘ deleted (identity removal for Pass)
```

---

## Fixtures (deterministic strings)

Use these exact values so Pass/Fail diffs stay greppable:

| Role | Value |
|------|--------|
| Bot to delete `displayName` | `Delete Target` |
| Peer that must survive | `Peer Survives` |
| Optional section name (when US3 UI exists) | `Delete Section` |
| Optional mailbox probe text | `still queued after identity delete` |

---

## Step A — Confirm required + cancel safe

**User / Verifier path (desktop):**

1. Create (or select) bot **Delete Target**; note it appears in sidebar and overview. Optionally assign it to named section **Delete Section** when US3 UI exists.
2. Start delete — product MUST enter `pending-confirm` (explicit confirmation required). Bot MUST still appear in sidebar/overview while pending.
3. Cancel or dismiss without confirming — state returns to idle; bot and profile fields unchanged; section membership (if any) unchanged.
4. Do **not** call Host `deleteBot` on cancel.

**Host observation (when Client UI is not yet available):**

Host has no separate “pending-confirm” Durable state — confirm is a Client (or optional shell) gate before `deleteBot`. Until T027 lands, Host rehearsal covers only the confirm/remove half (Step B). Cancel-safe is a Client gate observation.

| Observation | Pass | Fail |
|-------------|------|------|
| Start delete | Explicit confirm UI / gate shown | Delete completes with no confirm step |
| While pending | Bot still listed; profile unchanged | Bot already gone or fields wiped |
| Cancel / dismiss | Returns idle; bot + profile intact | Bot removed or profile mutated |

**Claim tags:** desktop UI observations → **measured**; Host vitest alone cannot prove cancel-safe → **inferred** until Client T027.

---

## Step B — Confirm delete → identity removal (SC-005)

**User / Verifier path (desktop):**

1. Start delete again on **Delete Target** → `pending-confirm`.
2. Confirm delete → Host permanent identity removal.
3. Confirm bot is **absent** from:
   - Sidebar roster
   - Overview entry points
   - Section membership lists (named section **Delete Section** must not still list this bot; empty named section may remain — not a Fail)
4. Peer **Peer Survives** remains listed.
5. Transcript / mailbox history for the deleted bot MAY remain per Host/session rules — **do not** Fail Pass solely because they remain (clarify lock 5).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists deleteBot tombstone'
```

Expect (**measured** on tip with [#89](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/89)):

- `deleteBot` appends `active` → `deleted` tombstone; clears `sectionId`
- `listMembers` / `agentTeams/view` omit the deleted bot (FR-008)
- Peer member remains
- Pending mailbox rows targeting the deleted bot are **not** wiped (clarify lock 5)
- Reject paths (already-deleted / missing / non-Lead / abort) leave remaining active identity intact

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Sidebar after confirm | Delete Target absent | Still listed |
| Overview after confirm | Delete Target absent | Still listed / stale entry |
| Section membership | Bot id absent from named section lists | Still listed under a section |
| Peer | Peer Survives still listed | Peer removed as collateral |
| Transcript / mailbox | May remain | **Not** a Fail when history remains |
| Mid-flight Host reject (T029) | Clear failure; bot still listed | Silent wipe or optimistic remove without success |

**Claim tags:** Host vitest → **measured** (Host half); full SC-005 Done needs Client confirm + desktop absence evidence → **inferred** until T027 + Verifier desktop run.

---

## Step C — Durability after confirm (optional supporting)

**User / Verifier path (desktop):**

1. After successful confirm delete (Step B).
2. Restart the desktop app **or** reload durable Host Team state.
3. Confirm **Delete Target** remains absent from sidebar, overview, and section membership.
4. Confirm **Peer Survives** remains.

Restart after cancel (Step A) is also a supporting check: cancelled delete must not tombstone the bot across reload.

| Observation | Pass | Fail |
|-------------|------|------|
| After confirmed delete + reload | Target still absent; peer present | Target reappears from Electron-invented store or stale projection |
| After cancel + reload | Target still present with prior profile | Target missing without confirm |

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass
Stamp: 2026-09-27 · tip 144a87113365 · desktop DSH Local Build 0.1.6-alpha.2 (DISPLAY=:1 CDP 9222)
Linear: MOH-129 · Epic MOH-88
SC-005: Pass — evidence: evidence/scenario-4/{01-pending-confirm,02-cancelled,03-deleted}.png
Confirm required: Pass — evidence: 01-pending-confirm.png
Cancel safe: Pass — evidence: 02-cancelled.png + operator-notes.txt
Identity removal: Pass — evidence: 03-deleted.png
Transcript/mailbox wipe: N/A (not a Pass gate; clarify lock 5)
Blockers: none
```

**Rule:** Do not mark SC-005 Done in Linear / Spec without a filled stamp that includes desktop evidence for (1) confirm required, (2) cancel safe, and (3) post-confirm absence from sidebar and overview once Client UI exists. Host vitest alone may advance identity-removal confidence but does **not** close US4.

---

## Explicit non-goals

- Client delete confirm UI implementation (T027) — out of this Verifier recipe PR
- Optional Electron shell confirm bridge (T028) — out of this Verifier recipe PR unless product ships it; still no Main identity store
- Host delete failure UX polish (T029) — out of this Verifier recipe PR
- Mandatory transcript / mailbox wipe for Pass
- Soft-delete / archive / recovery UX
- Skills library / memory UX / persona edit / rename / avatar / section create as Pass gates for this scenario
- Electron Main identity store (forbidden; T010)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 4 | User-facing outline |
| [../contracts/delete-confirm.md](../contracts/delete-confirm.md) | Contract Pass bars |
| [../data-model.md](../data-model.md) Delete confirmation | UI state machine |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| [non-goals.md](./non-goals.md) | Transcript/mailbox wipe absence (T040 asserted) |
| This file | T030 rerunnable Scenario 4 recipe |
| T026 | Host `deleteBot` (landed [#89](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/89)) |
| T027 / T028 / T029 | Client confirm · optional shell · failure UX |
| T042 | Quickstart ↔ recipe gap fix later |

## Evidence for PO / DH Lead

**Recipe delivered (T030).** Product SC Pass **not** stamped. Host `deleteBot` identity tombstone is on master tip `99181eeef1` ([#89](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/89)). Full Scenario 4 Done waits on Client T027 (confirm/cancel) plus Verifier desktop evidence using Steps A–C above; T029 failure path is a supporting gate, not a substitute for the happy-path stamp.
