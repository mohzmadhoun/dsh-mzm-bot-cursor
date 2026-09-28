# Scenario 3 — Agent vs user memory layers

**Status:** Recipe + SC-005 / SC-010 Pass stamped — see [evidence/scenario-3/VERDICT.txt](./evidence/scenario-3/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host catalog isolation) · DH Client/Web (layer-distinguishable UI)
**Linear:** [MOH-268](https://linear.app/momadhoun/issue/MOH-268) (T030) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T030 — Scenario 3 / SC-005 (agent isolation + user sharing after save + restart/recall) **and** SC-010 (kinds × layers orthogonal; no kind→layer lock) with mandatory FR-011/012 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/layers.md](../contracts/layers.md)
**ADR:** `MzM-Docs/adr/agent-vs-user-memory-layers.md`
**Architect locks:** Host Memory catalog SoT; agent isolation + user sharing; kinds × layers orthogonal; transcript ≠ either layer; no Electron Main memory bus

## Measurable Done (this recipe — T030 / SC-005 / SC-010)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps 1–5 with Pass/Fail and evidence tags |
| SC coverage | SC-005 — agent isolation + user sharing after save **and** after cold restart/recall; SC-010 — no kind→layer lock required for Pass |
| FR-011 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-3/` — unit/jsdom alone **fails** |
| FR-012 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **measured:** `evidence/scenario-3/VERDICT.txt` Pass for SC-005 + SC-010 |

Supporting Host/Client halves (not alone Done):

| Check | Owner task | Pass bar | Status |
|-------|------------|----------|--------|
| Host agent isolation | T027 | Bot B `listMemories(botId=B)` MUST NOT include A’s agent-layer rows as B’s | **measured:** Host vitest `US5 T027` |
| Host user sharing | T027 | Same user-layer row available in A and B after save **and** Host restart | **measured:** same |
| Orthogonality (Host) | T029 | Host allows any kind on either layer; **no** kind→layer lock tables as Pass | **measured:** see Orthogonality check |
| Orthogonality (Client) | T029 / T028 | Client write/browse does not require kind→layer locks for Pass | **measured:** independent kind + layer selects |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T013) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host layers (T027) | Agent isolation + user sharing | **measured:** [#193](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/193) |
| Client layer UI (T028) | Layer select + browse filter/labels | **measured:** [#192](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/192) |
| Orthogonality doc (T029) | FR-017 / SC-010 Host+Client check | **measured:** section below |
| Scenario 2 restart awareness (T026) | Cold restart / recall path familiarity | **measured:** [evidence/scenario-2/](./evidence/scenario-2/) |

**Desktop prerequisites:** buildable Desktop (`apps/desktop`, `apps/desktop-host`) with **≥2** teammate bots; Agent Team Bot memory surface (`data-team-bot-memories`) + write (`data-team-write-memory` / `data-team-memory-kind-select` / `data-team-memory-layer-select`) + browse (`data-team-browse-memories`); Host Memory catalog on Desktop Host; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`). Rebuild Client UI bundle when tip advances past T028 (`pnpm --filter @deepseek-ai/dsh-experimental-client-ui-agent-team run bundle`) and Host agent-team when tip advances past T027 before claiming SC-005 / SC-010.

---

## Orthogonality check (T029 / FR-017 / SC-010)

**Rule:** `kind: profile|log|note` and `layer: agent|user` are independently chosen. Pass MUST NOT require a kind→layer lock table (for example “profile only on user”).

| Kind × layer | Host `writeMemory` | Host list / inject eligibility |
|--------------|--------------------|--------------------------------|
| profile × agent | Allowed | Agent-scoped by `botId` |
| profile × user | Allowed | Account-wide |
| log × agent | Allowed | Agent-scoped by `botId` |
| log × user | Allowed | Account-wide |
| note × agent | Allowed | Agent-scoped by `botId` |
| note × user | Allowed | Account-wide |

**Host confirmation (T029 Host half):** Agent Teams `writeMemory` validates kind and layer independently (`requiredMemoryKind` / `requiredMemoryLayer`); journal fold rejects only empty content and illegal layer/`botId` pairing — never “kind X requires layer Y”. Focused vitest `US5 T027: listMemories isolates agent by botId and shares user across bots` writes all three kinds on agent **and** all three kinds on user in one Team.

**Client confirmation (T029 Client half):** Desktop Web `WriteMemoryDraft` requires independent `kind` and `layer` fields (`TeamAction.tsx` — FR-017 orthogonal); Save is disabled only when either is empty or content is blank — never when a kind/layer pair is “disallowed.” Browse filter is `all|agent|user` only. No Client kind→layer lock table exists as a Pass requirement. Verifier SC-010 Pass does **not** require exercising all six combinations on Desktop — ≥1 agent-scoped + ≥1 user-scoped fact with kinds distinguishable across the phase is enough (contract / SC-010).

**Fail conditions:** Requiring profile-only-on-user (or any fixed kind→layer map) for Pass; collapsing layers into one undifferentiated store.

---

## Fixtures (deterministic strings)

| Role | Kind | Layer | Content |
|------|------|-------|---------|
| Agent exclusive (bot A) | `note` | `agent` | `SC-005 agent-scoped note exclusive to bot A — must not appear as B agent memory` |
| User shared | `profile` | `user` | `SC-005 user-scoped profile shared across bots after save and restart` |
| Orthogonality (SC-010) | `note` | `user` | `SC-010 orthogonality: kind=note on layer=user (not kind-locked)` |

---

## Step 1 — Agent-scoped fact on bot A (isolation)

**User / Verifier path (desktop):**

1. Launch the real Desktop app: `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open **Agent Team**; ensure **≥2** teammate bots (create via **New bot** with distinct provider/model if needed).
3. On bot A, **Write memory** → kind=`note`, layer=`agent`, fixture content → Save.
4. Confirm bot A lists the agent-layer note; open bot B memory → A’s agent fact is **not** listed.

| Observation | Pass | Fail |
|-------------|------|------|
| Isolation | Agent fact on A only | A’s agent content listed on B |
| SoT | Host catalog projection (`data-team-memory-layer=agent`) | Client-only invent; transcript dump |

**Claim tags:** desktop UI → **measured**.

---

## Step 2 — User-scoped fact shared across bots

**User / Verifier path (desktop):**

1. On bot A (or either bot), **Write memory** → kind=`profile`, layer=`user`, fixture content → Save.
2. **Browse / recall** on A and B as needed.
3. Confirm the same user-layer profile appears in **both** bot A and bot B contexts.

| Observation | Pass | Fail |
|-------------|------|------|
| Sharing | User fact on A and B | Missing on one bot; agent-only leakage presented as user |
| Path | Host `listMemories` / `view.memories` | Electron Main IPC catalog |

**Claim tags:** desktop UI → **measured**.

---

## Step 3 — Orthogonality sample (SC-010)

**User / Verifier path (desktop):**

1. Write kind=`note` on layer=`user` (fixture) while agent-layer note already exists — proves note is not agent-locked.
2. Confirm kind and layer selects remain independently choosable (selecting kind does not remove agent/user layer options).

| Observation | Pass | Fail |
|-------------|------|------|
| Orthogonality | note×agent + note×user + profile×user coexist; no lock table | Pass requires fixed kind→layer map |

**Claim tags:** desktop UI → **measured** (with T029 Host/Client check).

---

## Step 4 — Cold restart Desktop

**User / Verifier path (desktop):**

1. Fully quit the Desktop Electron app (Main + Host child).
2. Relaunch with the same user-data / Host home (`pnpm run start:desktop`).
3. Wait until `dsh-app://app/` is interactive again; reopen **Agent Team**.

| Observation | Pass | Fail |
|-------------|------|------|
| Restart | Cold relaunch completed | Leave/return only presented as restart |
| Evidence | Process quit + relaunch recorded in CDP/driver log | Soft reload only |

**Claim tags:** desktop restart → **measured**.

---

## Step 5 — Post-restart isolation + sharing (SC-005 Done half)

**User / Verifier path (desktop):**

1. **Browse / recall** on bots A and B.
2. Confirm agent isolation still holds (A’s agent note on A only).
3. Confirm user sharing still holds (user profile + user note on both).
4. Capture FR-011/012 evidence (see Evidence section).

| Observation | Pass | Fail |
|-------------|------|------|
| Post-restart SC-005 | Isolation + sharing after cold restart | Leakage; missing user rows; empty catalog |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-005 / SC-010 Done).

---

## Evidence (FR-011 / FR-012 / SO 11+12)

Directory: [`evidence/scenario-3/`](./evidence/scenario-3/)

| Artifact | Content |
|----------|---------|
| `01-agent-on-a.png` | Bot A after agent-scoped note save |
| `02-agent-absent-on-b.png` | Bot B — A’s agent fact absent |
| `03-user-shared-both.png` | User-scoped profile on A and B |
| `04-orthogonality-kinds-layers.png` | note×agent + note×user + profile×user |
| `05-post-restart-agent-team.png` | Agent Team after cold restart |
| `06-post-restart-isolation-and-share.png` | Isolation + sharing after restart |
| `07-post-restart-layer-filter.png` | Layer filter after restart |
| Optional `00-agent-team-open.png` | Agent Team open |
| Optional `scenario-3-layers-walkthrough.mp4` | Short recording of the scripted path |
| `panel-state.json` · `p5-t030-scenario3-cdp.log` | CDP hard-assert state + driver log |
| `p5-t030-host-t027-vitest.log` | Host T027 supporting vitest |
| `VERDICT.txt` | Pass stamp |

**Standing order 12 (FR-012):** Artifacts MUST be **committed** under `specs/005-memory-productization/verifier/evidence/scenario-3/` **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths.

### VERDICT template (filled — see evidence file)

```
T030 Scenario 3 layers (SC-005 + SC-010) — DH Verifier
=======================================================
Verdict: Pass (SC-005 agent isolation + user sharing after save + cold restart;
         SC-010 kinds×layers orthogonal — no kind→layer lock)
Stamp: 2026-09-28 · tip origin/master @ d3229a120c (#192 Client T028 on tip;
  #193 Host T027 on tip)
  · Desktop DISPLAY=:1 CDP 9222 · DSH Local Build (Electron)
  · launch: DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
Branch: cursor/p5-t030-scenario3-layers-fe1d
Linear: MOH-268 (T030) · Epic MOH-228 — left In Progress (PO closes after merge)
```

---

## Explicit non-goals (this recipe)

- Rewriting the ADR
- Grok chrome for layer UX
- Requiring all six kind×layer combinations on Desktop for Pass
- Scenario 5 full replay (T033)
- Scoring LLM reply wording
- Marking Linear Done / merging (PO)

---

## Rerun (idempotent)

```sh
# Host (T027 / T029 Host half) — supporting
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/persistence.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/memory-bind.spec.ts -t 'isolates agent-layer'

# Desktop (required for SC-005 / SC-010 Done — T030)
pnpm --filter @deepseek-ai/dsh-experimental-client-ui-agent-team run bundle
# agent-team: pnpm exec tsdown (in packages/experimental/agent-team)
DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
# then CDP driver: ≥2 bots → agent on A → check B → user shared → ortho sample → quit → relaunch → browse
```
