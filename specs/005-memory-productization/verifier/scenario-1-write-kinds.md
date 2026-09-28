# Scenario 1 — Write profile / log / note (write-kinds)

**Status:** Recipe + SC-001 profile path Pass stamped — see [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host writeMemory) · DH Client (memory write / list surface)
**Linear:** [MOH-253](https://linear.app/momadhoun/issue/MOH-253) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T016 — Verifier Scenario 1 recipe covering SC-001 (profile write + empty reject + leave/return) with mandatory FR-011/012 (standing orders **11** + **12**) desktop evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1 (profile steps)
**Contract:** [../contracts/write-kinds.md](../contracts/write-kinds.md)
**Architect locks:** Host Memory catalog SoT; Write Pass = user-visible UI; bot-tool write optional (SC-009); kinds × layers orthogonal; no Electron Main memory bus

## Measurable Done (this recipe — T016 / SC-001)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C + SC-009 note with Pass/Fail and evidence tags |
| SC coverage | SC-001 profile write + empty reject + leave/return · SC-009 bot-tool absence must **not** fail Pass |
| FR-011 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-012 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **measured:** `evidence/scenario-1/VERDICT.txt` Pass for SC-001 profile path |

**Later extensions (not this stamp):** T019 adds SC-002 log · T022 adds SC-003 note + kinds distinguishable (same evidence directory).

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T013) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host writeMemory profile (T014) | SC-001 Host half | **measured:** [#180](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/180) |
| Client profile write surface (T015) | SC-001 desktop path | **measured:** [#181](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/181) |

**Desktop prerequisites:** buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 teammate bot; Agent Team panel with `data-team-bot-memories` + `data-team-write-memory`; Host Memory catalog on Desktop Host; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-001 Done): Agent Teams vitest for `writeMemory` / empty reject — proves Host half before Client UI.

---

## Fixtures (deterministic strings)

| Field | Value |
|-------|-------|
| Bot | First teammate with Write profile memory control |
| `kind` | `profile` |
| `layer` | `agent` (this bot) |
| `content` (valid) | `User prefers Asia/Shanghai timezone for scheduling` |
| `content` (reject) | empty / whitespace-only |
| Expected after write | Listed row `data-team-memory-kind="profile"` with fixture content |

---

## Step A — Write non-empty profile (SC-001 write)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open **Agent Team**; select a teammate bot; open the **Bot memory** surface (`data-team-bot-memories`) — not chat-only.
3. Click **Write profile memory** (`data-team-write-memory`).
4. Enter fixture content; choose Agent (or User) layer; Save.
5. Confirm a listed Host-projected row with kind **Profile** and the fixture content.
6. Capture FR-011/012 evidence (see Evidence section).

| Observation | Pass | Fail |
|-------------|------|------|
| Write | Profile fact visible on bot memory pane | Missing; only chat transcript / Electron Main / DevTools |
| Kind | `data-team-memory-kind="profile"` (or kind label Profile) | Wrong kind or unlabeled |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done).

---

## Step B — Reject empty profile write (SC-001 reject)

**User / Verifier path (desktop):**

1. Open Write profile memory with **empty** content (layer unset or set).
2. Confirm clear user-visible reject (`data-team-write-memory-reject`) and Save disabled; no new listed row.
3. Capture FR-011/012 evidence of the rejection UI.

| Observation | Pass | Fail |
|-------------|------|------|
| Empty content | Clear reason; no saved row | Silent accept or opaque failure |
| Evidence | Desktop frame of rejection (GUI Pass) | Host log only presented as GUI Pass |

---

## Step C — Leave / return without restart (SC-001 durability)

**User / Verifier path (desktop):**

1. With Step A fact still listed, **close** Agent Team (leave surface).
2. Re-open Agent Team (no Desktop restart).
3. Confirm the same profile fact remains listed (same `memoryId` / content).
4. Capture FR-011/012 evidence.

| Observation | Pass | Fail |
|-------------|------|------|
| Leave/return | Same Host-projected profile fact visible | Fact gone without restart; Client-only ephemeral invent |
| Evidence | Desktop frame after return | Claim without visual |

---

## SC-009 — Bot-tool write absence must not fail Pass

Write Pass is the **user-visible UI** path (Steps A–C). Absence of a bot-initiated tool write API or UI control MUST **not** Fail SC-001 / Scenario 1 for T016. Bot-tool write remains optional (FR-015 / SC-009).

---

## FR-011 / FR-012 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-011):** Scenario 1 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-012):** Those artifacts MUST be **committed** under `specs/005-memory-productization/verifier/evidence/scenario-1/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/005-memory-productization/verifier/evidence/scenario-1/
```

**Required artifacts (minimum — T016 / SC-001):**

| Artifact | Content |
|----------|---------|
| `01-profile-listed.png` | Bot memory pane after profile write — kind Profile + fixture content |
| `02-reject-empty.png` | Clear rejection for empty profile write; Save disabled |
| `03-after-leave-return.png` | Same profile fact after leave/return (no restart) |
| Optional `00-agent-team-open.png` | Agent Team open showing Bot memory surface |
| Optional `scenario-1-profile-write-walkthrough.mp4` | Short recording covering Steps A–C |
| `panel-state.json` · `p5-t016-scenario1-cdp.log` | CDP hard-assert supporting logs |
| `VERDICT.txt` | Filled stamp when SC-001 Pass is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Evidence home: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

---

## Pass stamp template (filled for T016)

```text
Verdict: Pass
Stamp: 2026-09-28 · tip <sha> · desktop DSH Local Build (DISPLAY=:1 CDP 9222)
Linear: MOH-253 · Epic MOH-228 — left In Progress (PO closes after merge + SO12)
SC-001: Pass — evidence: evidence/scenario-1/{01-profile-listed,02-reject-empty,03-after-leave-return}.*
SC-009: Pass — bot-tool absence did not fail Pass
FR-011: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-012: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-001 Done in Linear without a filled stamp that includes FR-011/012 desktop evidence. Leave [MOH-253](https://linear.app/momadhoun/issue/MOH-253) **In Progress** until PO merges + SO12 embeds; Verifier does **not** mark Linear Done.

---

## Explicit non-goals

- Log / note kind writes (T017–T022) — later Scenario 1 extensions
- Recall after restart (Scenario 2 / US4)
- Agent vs user layer isolation proof (Scenario 3 / US5)
- Bot-tool write as Pass (SC-009 — absence OK)
- Electron Main memory bus (forbidden; T010/T011)
- Treating transcript dump as curated write success

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/write-kinds.md](../contracts/write-kinds.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-001/011/012/015 · SC-001/009 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-011/012 mandate |
| This file | T016 rerunnable Scenario 1 profile write-kinds recipe |
| T014–T015 | Host writeMemory profile + Client write UI |
| T019 / T022 | SC-002 / SC-003 extensions of this recipe |

## Evidence for PO / DH Lead

**T016 SC-001 profile path Pass stamped** with Desktop FR-011/012 media `01–03` + walkthrough under [evidence/scenario-1/](./evidence/scenario-1/). Leave [MOH-253](https://linear.app/momadhoun/issue/MOH-253) **In Progress** until PO merges the stamp PR and completes SO12 PR embeds — Verifier does **not** mark Linear Done.
