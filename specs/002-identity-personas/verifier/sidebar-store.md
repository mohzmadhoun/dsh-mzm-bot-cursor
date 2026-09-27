# T012 — Host store for sidebar sections (SC-004)

**Status:** Store pick locked (Foundational doc; no product store code in this PR)
**Owners:** DH Architect (this pick) · DH Runtime (T031–T033 implement) · DH Verifier (Scenario 3 / SC-004) · PO (scope)
**Linear:** [MOH-111](https://linear.app/momadhoun/issue/MOH-111) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T012 — pick and document Host store for sidebar sections (Team journal vs `packages/settings/settings` / `packages/settings/settings-file`); Unassigned/default allowed without a stored section row (clarify lock 4; research R4)
**Contract:** [sidebar-sections.md](../contracts/sidebar-sections.md)
**Data model:** [data-model.md](../data-model.md) — Sidebar section + Bot.`sectionId`
**Surfaces:** Agent Teams Host (`packages/experimental/agent-team/`) · Desktop Host mailbox · Desktop Web Client (read projection only)

## Measurable Done (this doc)

| Check | Pass bar |
|-------|----------|
| Store chosen | One normative Host durability path named |
| Unassigned | Null/absent Bot.`sectionId` ⇒ Unassigned/default; **no** stored Unassigned section row |
| Ownership | Host / Runtime only; Electron Main MUST NOT own section catalog or membership |
| Non-goals | No T031 store code here; no settings namespace for P2 sections; no edits under `packages/experimental/agent-team/` in this PR |

---

## Requirement (FR-006 / SC-004 / clarify lock 4)

From [spec.md](../spec.md), research R4, and the sidebar-sections contract:

- Persist **named** sidebar section names and membership across restart/reload.
- Support **Unassigned/default** for bots never assigned to a named section (named sections are optional overlays).
- A bot belongs to at most one named section (or Unassigned).
- Empty named sections may remain after last-bot remove (not a Pass failure).

---

## Options considered

| Option | Store | How Unassigned works | Cost / risk |
|--------|-------|----------------------|-------------|
| **A — Team journal (chosen)** | Named section catalog + membership on Lead Team journal / projection under `packages/experimental/agent-team/` (same durability path as Bot identity / `sectionId` from T005–T006) | `sectionId` null/absent; no catalog row for Unassigned | One Host durability path; matches research R1 Host ownership |
| **B — Settings namespace** | `ctx.settings` + `dsh-settings-file` namespace (e.g. under `packages/settings/settings/`) for section catalog (and possibly membership) | Could omit Unassigned row, but membership would still need Bot.`sectionId` or a second map | Splits identity durability across session journal vs `settings.yaml`; Team-scoped product data in a plugin-config seam; dual-write / restart consistency hazard |
| **C — Split** | Settings for section **names**; Team journal for Bot.`sectionId` membership | Same Unassigned rule on Bot | Two stores for one user-visible grouping; Client/Host must join on every read; reject for P2 |

---

## Chosen store (normative for T031+)

**Team journal / Agent Teams Host projection** — Option A.

| Decision | Choice |
|----------|--------|
| **Primary store** | Lead Team **journal + projection** owned by `@deepseek-ai/dsh-experimental-agent-team` (`packages/experimental/agent-team/`) |
| **Named section catalog** | Host-durable rows: opaque `SidebarSectionId` + non-empty `name` (and Host-owned within-section order as needed for `botIds`) on the same Team durability path |
| **Membership pointer** | Existing Bot identity field `sectionId` on `team/member` / roster snapshot (T005–T006); assign / move / unassign mutate this pointer |
| **Unassigned/default** | `sectionId` **null or absent** ⇒ Unassigned/default grouping; **do not** persist an Unassigned section entity (clarify lock 4) |
| **Ordered `botIds`** | Projected (and optionally Host-ordered) from roster members whose `sectionId` matches a named catalog id; empty named sections keep their catalog row with empty membership |
| **Electron Main** | Lifecycle / framed Host mailbox only — **no** parallel section catalog, membership map, or IPC-owned store (research R1; T010) |
| **Settings** | **Not** used for P2 sidebar sections |

### Why A (simplest path)

1. **Already on the path:** Bot.`sectionId` is Host-durable on the Team journal (T006). Putting the named catalog beside membership keeps one restart/reload story for SC-004.
2. **Team-scoped identity, not plugin config:** Settings namespaces are for runtime-editable plugin configuration (`dsh-settings` / `dsh-settings-file`). Sidebar sections are product roster grouping for one Team Lead — same owner as create/rename/persona/delete.
3. **No dual durability:** Options B/C force Client/Host to reconcile `settings.yaml` with Lead session events for one sidebar view; Option A avoids that seam for P2.
4. **Clarify lock 4 stays cheap:** Unassigned is absence of membership, not a sentinel row to create, migrate, or delete.

### Why not B / C

- Settings is the wrong capability seam for Team roster overlays (config document vs session-journal identity).
- Split names vs membership doubles failure modes (name survives, membership lost, or the reverse) without a P2 requirement that forces it.

---

## Data shapes & process boundaries

Named before mechanisms (T031 owns wire/event names):

| Shape | Owner process | Durable? | Notes |
|-------|---------------|----------|-------|
| `SidebarSection` catalog row `{ id, name }` (+ Host order for members if required) | **Desktop Host** (dsh Runtime / agent-team) | Yes — Team journal | Named sections only |
| Bot.`sectionId` | **Desktop Host** | Yes — `team/member` / roster | `null` / absent = Unassigned |
| Unassigned/default grouping | Derived in Host projection / Client render | No stored row | Clarify lock 4 |
| Sidebar UI chrome | **Desktop Web Client** under Electron | No (reads Host projection) | Create/assign/unassign call Host mutations |
| Electron Main | Shell lifecycle + Host mailbox | No identity/section store | Must not invent catalog or membership |

**Forbidden:** Electron Main section store; Client-only ephemeral sections as Pass path; settings-backed P2 section catalog.

---

## Plugin / package ownership

| Concern | Owner | Package / app |
|---------|-------|---------------|
| Store pick (this doc) | Architect → Spec/Verifier home | `specs/002-identity-personas/verifier/sidebar-store.md` |
| Section catalog + mutations | **Runtime** | `packages/experimental/agent-team/` (T031–T032) |
| Projection to Client | **Runtime** | `packages/experimental/agent-team/src/projection.ts` (T033) |
| Sidebar UI | **Client/Web** | `packages/experimental/client-ui-agent-team/` (T034) |
| Settings packages | **Unused for P2 sections** | `packages/settings/settings/`, `packages/settings/settings-file/` |
| Electron shell | Lifecycle only | `apps/desktop/` — no section bus |

---

## Verifier observation (feeds Scenario 3 / SC-004)

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Named path | Create named section, assign bot, restart/reload → same name + membership | Membership or name lost |
| Unassigned | Bot never assigned (or unassigned) appears under Unassigned/default **without** requiring a stored Unassigned row | Product requires creating an Unassigned section entity to show unassigned bots |
| Store honesty | Durability is Host Team journal / agent-team; no Electron Main section store | Main-owned or settings-only Pass path for P2 |

Exact Scenario 3 recipe markdown remains T035 (`scenario-3-sidebar-sections.md`).

---

## Handoff to DH Spec / Runtime

**Spec (acceptance criteria to formalize if needed):** FR-006 / SC-004 already state WHAT; this doc closes plan open gap #1 / research R4 tasks gap (HOW store).

**Runtime (T031+):**

1. Implement named section catalog + create/rename (reject empty name) on Team journal / projection — **do not** introduce a settings namespace for P2.
2. Implement assign / move / unassign updating Bot.`sectionId`; `null` ⇒ Unassigned; never materialize an Unassigned catalog row.
3. Project section names + membership + Unassigned to Client (T033).
4. Keep Electron Main free of section state (T010 / research R1).

**Out of this PR:** Any code under `packages/experimental/agent-team/`, settings packages, or Desktop apps.

---

## Open questions

| # | For | Question | Default if unanswered |
|---|-----|----------|------------------------|
| 1 | Runtime | Exact Team event / snapshot field names for the section catalog (new `team/section*` vs embed in existing projection state) | New Host-owned catalog on the Team projection, appended via journal transactions consistent with `team/member` |
| 2 | Runtime | Whether within-section `botIds` order is an explicit persisted list or derived roster order | Derived from Host roster order among members sharing `sectionId` unless UX requires drag-reorder in P2 |
| 3 | PO / Lead | Any product need for **user-global** sections spanning Teams? | **No** for P2 — sections are per Team Lead journal |

---

## Cross-links

- Research R4 / tasks gap: [research.md](../research.md)
- Plan open gap #1: [plan.md](../plan.md)
- Tasks T012 / T031–T035: [tasks.md](../tasks.md)
- Verifier home: [README.md](./README.md)
)
