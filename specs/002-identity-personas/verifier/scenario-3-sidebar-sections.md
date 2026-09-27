# Scenario 3 — Sidebar sections + Unassigned

**Status:** Product SC Pass stamped — see [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host section catalog + assign/unassign + projection) · DH Client (sidebar create/assign/move/unassign + Unassigned render)
**Linear:** [MOH-134](https://linear.app/momadhoun/issue/MOH-134) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T035 — Verifier Scenario 3 recipe covering SC-004
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/sidebar-sections.md](../contracts/sidebar-sections.md)
**Store pick:** [sidebar-store.md](./sidebar-store.md) (T012 — Team journal / agent-team; not settings; not Electron Main)
**Clarify lock 4:** Named sections are optional overlays; Unassigned/default is valid for bots without a named section (no stored Unassigned catalog row required)
**Host path landed:** [#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93) (T031–T033 `createSection` / `assignSection` / projection + Unassigned)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-004 named section + assign survives restart/reload; Unassigned visible for unassigned bots |
| Unassigned honesty | Unassigned/default works **without** requiring a stored Unassigned section entity |
| Product SC stamp | Deferred until Client sidebar section UI (T034) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Sidebar store pick (T012) | US3 Host path | **measured:** [sidebar-store.md](./sidebar-store.md) locks Team journal / agent-team |
| Host section entity + create/rename (T031) | SC-004 Host half | **measured:** merge [#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93) on tip `d33391f10c` |
| Host assign / move / unassign (T032) | SC-004 Host half | **measured:** `sectionId` null/absent ⇒ Unassigned; empty named section may remain ([#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93)) |
| Host projection of sections + Unassigned (T033) | Client-readable views | **measured:** `projectSidebarSections` + `unassignedBotIds` on tip with [#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93) |
| Client sidebar section UI (T034) | SC-004 desktop path | **inferred:** open — create named section, assign/move/unassign, render Unassigned/default |

**Desktop prerequisites** (full Scenario 3 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot; ability to create a named sidebar section, assign/move/unassign bots, and read Unassigned/default grouping.

**Host-only rehearsal** (does **not** alone mark SC-004 Done): Agent Teams vitest path below — proves Host durability of section names + membership + Unassigned projection; Client sidebar chrome remains required for product SC Pass.

---

## Fixtures (deterministic strings)

Use these exact values so Pass/Fail diffs stay greppable:

| Role | Value |
|------|--------|
| Named section (first create) | `Reviews` |
| Named section (rename / second) | `Code Reviews` |
| Bot assigned to named section | `Section Alpha` |
| Bot that stays Unassigned | `Section Beta` |
| Empty-name probe | `''` or whitespace-only (`'   '`) |

---

## Step A — Unassigned/default visible

**User / Verifier path (desktop):**

1. Create (or select) bots **Section Alpha** and **Section Beta** with no named section assignment.
2. Confirm both appear under Unassigned/default in the sidebar (product chrome may label this group Unassigned, Default, or equivalent).
3. Confirm the product does **not** require creating a stored “Unassigned” section entity to show them (clarify lock 4).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'persists createSection / assignSection / unassign'
```

Expect (**measured** on tip with [#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93)): `listSections` / `remoteView` expose `unassignedBotIds` for members with `sectionId` null/absent; durable `sections` catalog has **no** Unassigned row.

| Observation | Pass | Fail |
|-------------|------|------|
| Unassigned visibility | Never-assigned bots readable under Unassigned/default | Hidden until a named Unassigned entity is created |
| Catalog honesty | No stored Unassigned section required | Product invents Unassigned as a named catalog row for Pass |

**Claim tags:** desktop UI → **measured** once T034 lands; Host vitest alone → **measured** (Host half) + **inferred** (does not complete SC-004 without Client sidebar).

---

## Step B — Create named section + assign / move / unassign

**User / Verifier path (desktop):**

1. Create named section **Reviews** (non-empty name).
2. Assign **Section Alpha** to **Reviews** — Alpha listed under that section; **Section Beta** remains under Unassigned/default.
3. Move Alpha to Unassigned (or unassign) — Alpha returns to Unassigned/default; named section **Reviews** may remain empty (not a Fail).
4. Re-assign **Section Beta** to **Reviews** — Beta under named section; Alpha under Unassigned.
5. Optionally rename section to **Code Reviews** — name updates; membership unchanged.
6. Attempt empty / whitespace section create or rename — rejected; prior name/membership unchanged.

**Host observation (when Client UI is not yet available):**

Same vitest case as Step A covers create (trim + reject empty), assign, rename, unassign (`sectionId: null`), empty named section retained, and reassign.

Supporting projection (membership + Unassigned without catalog Unassigned row):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/projection-events.spec.ts -t 'derives named membership and Unassigned'
```

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Create | Named section appears with non-empty name | Empty name accepted; section missing |
| Assign | Bot under named section only | Bot duplicated across sections or missing |
| Move / unassign | Sidebar reflects new membership | Stale prior section listing |
| Empty section after last-bot remove | May remain | Cleanup of empty section **not** required for Pass |
| At-most-one membership | Bot in ≤1 named section (or Unassigned) | Bot listed under two named sections |

---

## Step C — SC-004 durability (restart / reload)

**User / Verifier path (desktop):**

1. After a successful path: named section **Reviews** (or **Code Reviews**) with **Section Beta** assigned; **Section Alpha** under Unassigned/default.
2. Restart the desktop app **or** reload durable Host Team state.
3. Confirm the named section name still appears.
4. Confirm **Section Beta** still appears under that named section.
5. Confirm **Section Alpha** still appears under Unassigned/default.
6. Confirm durability is Host Team journal / agent-team — not an Electron Main–invented section store (T010 / T012).

| Observation | Pass | Fail |
|-------------|------|------|
| Named section after reload | Name + Beta membership present | Name lost, Beta Unassigned, or Main-owned store |
| Unassigned after reload | Alpha under Unassigned/default | Alpha missing or forced into a fake Unassigned entity |
| Store honesty | Host Team journal / agent-team | Electron Main or settings-only Pass path |

**Blocked until T034** for product SC-004 Done. Host create/assign/projection (T031–T033) is a supporting signal only (**inferred** for full SC-004; not a substitute for Client sidebar chrome + Verifier desktop evidence).

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass
Stamp: 2026-09-27 · tip 144a87113365 · desktop DSH Local Build 0.1.6-alpha.2 (DISPLAY=:1 CDP 9222)
Linear: MOH-134 · Epic MOH-88
SC-004: Pass — evidence: evidence/scenario-3/{01-section-created,02-assigned,03-post-reload}.png
Unassigned visible: Pass — evidence: Unassigned chrome in panel screenshots
Empty section name: N/A — not re-probed this run
Store: Host Team journal (not Electron Main)
Blockers: none
```

**Rule:** Do not mark SC-004 Done in Linear / Spec without a filled stamp that includes desktop evidence for (1) named section create + assign, (2) Unassigned/default for unassigned bots, and (3) membership + names after restart/reload once Client UI exists. Host vitest alone may advance section durability confidence but does **not** close US3.

---

## Explicit non-goals

- Client sidebar section UI implementation (T034) — out of this Verifier recipe PR
- Host section catalog / assign / projection implementation (T031–T033) — already on master; not re-opened here
- Collapse/expand chrome as a Pass gate
- Skills grouping / folder trees beyond flat named sections + Unassigned
- Requiring a stored Unassigned catalog row
- Empty-section cleanup as a Pass gate
- Persona / rename / avatar / delete Pass bars (other scenarios)
- Electron Main section store (forbidden; T010 / T012)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 3 | User-facing outline |
| [../contracts/sidebar-sections.md](../contracts/sidebar-sections.md) | Contract Pass bars |
| [sidebar-store.md](./sidebar-store.md) | T012 Host store pick |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| This file | T035 rerunnable Scenario 3 recipe |
| T031 / T032 / T033 | Host section entity · assign/unassign · projection (landed [#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93)) |
| T034 | Client sidebar section UI |
| T042 | Quickstart ↔ recipe gap fix later |

## Evidence for PO / DH Lead

**Recipe delivered (T035).** Product SC Pass **not** stamped. Host sidebar sections + Unassigned projection are on master tip `d33391f10c` ([#93](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/93)). Full Scenario 3 Done waits on Client T034 plus Verifier desktop evidence using Steps A–C above.
