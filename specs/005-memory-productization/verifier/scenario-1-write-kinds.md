# Scenario 1 — Write profile / log / note (write-kinds)

**Status:** Recipe + SC-001 profile Pass + SC-002 log Pass + SC-003 note Pass stamped — see [evidence/scenario-1/VERDICT.txt](./evidence/scenario-1/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host writeMemory) · DH Client (memory write / list surface)
**Linear:** [MOH-259](https://linear.app/momadhoun/issue/MOH-259) (T022 / SC-003) · [MOH-256](https://linear.app/momadhoun/issue/MOH-256) (T019 / SC-002) · [MOH-253](https://linear.app/momadhoun/issue/MOH-253) (T016 / SC-001) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T022 — complete Scenario 1 for SC-003 (note write + empty reject + leave/return + kinds distinguishable) with mandatory FR-011/012 (standing orders **11** + **12**) desktop evidence; T016 SC-001 + T019 SC-002 remain stamped
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1 (profile + log + note steps)
**Contract:** [../contracts/write-kinds.md](../contracts/write-kinds.md)
**Architect locks:** Host Memory catalog SoT; Write Pass = user-visible UI; bot-tool write optional (SC-009); kinds × layers orthogonal; no Electron Main memory bus

## Measurable Done (this recipe — T022 / SC-003 + prior T016 / SC-001 + T019 / SC-002)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C (profile) + Steps D–F (log) + Steps G–I (note) + SC-009 note with Pass/Fail and evidence tags |
| SC coverage | SC-001 profile · SC-002 log · SC-003 note write + empty reject + leave/return + kinds distinguishable · SC-009 bot-tool absence must **not** fail Pass |
| FR-011 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/scenario-1/` — unit/jsdom alone **fails** |
| FR-012 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **measured:** `evidence/scenario-1/VERDICT.txt` Pass for SC-001 + SC-002 + SC-003 |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T013) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host writeMemory profile (T014) | SC-001 Host half | **measured:** [#180](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/180) |
| Client profile write surface (T015) | SC-001 desktop path | **measured:** [#181](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/181) |
| Host writeMemory log (T017) | SC-002 Host half | **measured:** [#184](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/184) |
| Client log kind (T018) | SC-002 desktop path | **measured:** [#183](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/183) |
| Host writeMemory note (T020) | SC-003 Host half | **measured:** [#186](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/186) |
| Client note kind (T021) | SC-003 desktop path | **measured:** [#187](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/187) |
| `KNOWN_SESSION_EVENT_TYPES` includes `team/memory` | Desktop observe of sessions that already hold Memory rows | **measured:** regenerated via `pnpm run gen-persistence-catalog` on T019 stamp branch |

**Desktop prerequisites:** buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 teammate bot; Agent Team panel with `data-team-bot-memories` + `data-team-write-memory` + `data-team-memory-kind-select` exposing profile/log/**note**; Host Memory catalog on Desktop Host; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`). Rebuild Client UI bundle when tip advances past T021 (`pnpm --filter @deepseek-ai/dsh-experimental-client-ui-agent-team run bundle`) before claiming SC-003.

**Host-only rehearsal** (does **not** alone mark SC-003 Done): Agent Teams vitest for `writeMemory` kind=note / empty reject — proves Host half before Client UI.

---

## Fixtures (deterministic strings)

### Profile (T016 / SC-001)

| Field | Value |
|-------|-------|
| Bot | First teammate with Write memory control |
| `kind` | `profile` |
| `layer` | `agent` (this bot) |
| `content` (valid) | `User prefers Asia/Shanghai timezone for scheduling` |
| `content` (reject) | empty / whitespace-only |
| Expected after write | Listed row `data-team-memory-kind="profile"` with fixture content |

### Log (T019 / SC-002)

| Field | Value |
|-------|-------|
| Bot | Same Write memory surface (`data-team-write-memory`) |
| `kind` | `log` (via `data-team-memory-kind-select`) |
| `layer` | `agent` (this bot) |
| `content` (valid) | `Logged standup: shipped Host writeMemory kind=log validation` |
| `content` (reject) | empty / whitespace-only with kind=log selected |
| Expected after write | Listed row `data-team-memory-kind="log"` with fixture content (distinguishable from profile) |

### Note (T022 / SC-003)

| Field | Value |
|-------|-------|
| Bot | Same Write memory surface (`data-team-write-memory`) |
| `kind` | `note` (via `data-team-memory-kind-select`) |
| `layer` | `agent` (this bot) |
| `content` (valid) | `Remember to stamp SC-003 after note write` |
| `content` (reject) | empty / whitespace-only with kind=note selected |
| Expected after write | Listed row `data-team-memory-kind="note"` with fixture content; profile + log + note kinds all distinguishable on the list |

---

## Step A — Write non-empty profile (SC-001 write)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open **Agent Team**; select a teammate bot; open the **Bot memory** surface (`data-team-bot-memories`) — not chat-only.
3. Click **Write memory** (`data-team-write-memory`).
4. Choose kind **Profile**; enter fixture content; choose Agent (or User) layer; Save.
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

1. Open Write memory with **empty** content (layer unset or set).
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

## Step D — Write non-empty log (SC-002 write)

**User / Verifier path (desktop):**

1. On the same Bot memory surface, click **Write memory**.
2. Select kind **Log** (`data-team-memory-kind-select` → `log`; editor shows `data-team-write-memory-kind="log"`).
3. Enter log fixture content; choose Agent (or User) layer; Save.
4. Confirm a listed Host-projected row with kind **Log** and the fixture content (profile row may still be present — kinds distinguishable).
5. Capture FR-011/012 evidence (`04-log-listed.png`).

| Observation | Pass | Fail |
|-------------|------|------|
| Write | Log fact visible on bot memory pane | Missing; only chat transcript / Electron Main / DevTools |
| Kind | `data-team-memory-kind="log"` (or kind label Log) | Wrong kind, unlabeled, or only profile |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-002 Done).

---

## Step E — Reject empty log write (SC-002 reject)

**User / Verifier path (desktop):**

1. Open Write memory; select kind **Log**; leave **content empty** (layer unset or set).
2. Confirm clear user-visible reject (`data-team-write-memory-reject`) and Save disabled; no new listed log row.
3. Capture FR-011/012 evidence (`05-log-reject-empty.png`).

| Observation | Pass | Fail |
|-------------|------|------|
| Empty content | Clear reason; no saved log row | Silent accept or opaque failure |
| Evidence | Desktop frame of rejection (GUI Pass) | Host log only presented as GUI Pass |

---

## Step F — Leave / return without restart (SC-002 durability)

**User / Verifier path (desktop):**

1. With Step D log fact still listed, **close** Agent Team (leave surface).
2. Re-open Agent Team (no Desktop restart).
3. Confirm the same log fact remains listed (same `memoryId` / content / `kind=log`).
4. Capture FR-011/012 evidence (`06-log-after-leave-return.png`).

| Observation | Pass | Fail |
|-------------|------|------|
| Leave/return | Same Host-projected log fact visible | Fact gone without restart; Client-only ephemeral invent |
| Evidence | Desktop frame after return | Claim without visual |

---

## Step G — Write non-empty note (SC-003 write)

**User / Verifier path (desktop):**

1. On the same Bot memory surface, click **Write memory**.
2. Select kind **Note** (`data-team-memory-kind-select` → `note`; editor shows `data-team-write-memory-kind="note"`).
3. Enter note fixture content; choose Agent (or User) layer; Save.
4. Confirm a listed Host-projected row with kind **Note** and the fixture content; profile and/or log rows may still be present — **all three kinds distinguishable** on the list.
5. Capture FR-011/012 evidence (`07-note-listed.png`).

| Observation | Pass | Fail |
|-------------|------|------|
| Write | Note fact visible on bot memory pane | Missing; only chat transcript / Electron Main / DevTools |
| Kind | `data-team-memory-kind="note"` (or kind label Note) | Wrong kind, unlabeled, or only profile/log |
| Distinguishable | profile, log, and note kinds remain distinct on the surface | Kinds collapsed / unlabeled / overwritten |
| Evidence | Desktop screenshot/recording filed + committed + PR-embedded | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-003 Done).

---

## Step H — Reject empty note write (SC-003 reject)

**User / Verifier path (desktop):**

1. Open Write memory; select kind **Note**; leave **content empty** (layer unset or set).
2. Confirm clear user-visible reject (`data-team-write-memory-reject`) and Save disabled; no new listed note row.
3. Capture FR-011/012 evidence (`08-note-reject-empty.png`).

| Observation | Pass | Fail |
|-------------|------|------|
| Empty content | Clear reason; no saved note row | Silent accept or opaque failure |
| Evidence | Desktop frame of rejection (GUI Pass) | Host log only presented as GUI Pass |

---

## Step I — Leave / return without restart (SC-003 durability)

**User / Verifier path (desktop):**

1. With Step G note fact still listed, **close** Agent Team (leave surface).
2. Re-open Agent Team (no Desktop restart).
3. Confirm the same note fact remains listed (same `memoryId` / content / `kind=note`); kinds remain distinguishable.
4. Capture FR-011/012 evidence (`09-note-after-leave-return.png`) with the note row scrolled into view.

| Observation | Pass | Fail |
|-------------|------|------|
| Leave/return | Same Host-projected note fact visible | Fact gone without restart; Client-only ephemeral invent |
| Evidence | Desktop frame after return | Claim without visual |

---

## SC-009 — Bot-tool write absence must not fail Pass

Write Pass is the **user-visible UI** path (Steps A–I). Absence of a bot-initiated tool write API or UI control MUST **not** Fail SC-001 / SC-002 / SC-003 / Scenario 1. Bot-tool write remains optional (FR-015 / SC-009).

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
| `panel-state.json` · `p5-t016-scenario1-cdp.log` | CDP hard-assert supporting logs (profile) |
| `VERDICT.txt` | Filled stamp when SC Pass is claimed |

**Required artifacts (minimum — T019 / SC-002):**

| Artifact | Content |
|----------|---------|
| `04-log-listed.png` | Bot memory pane after log write — kind Log + log fixture content |
| `05-log-reject-empty.png` | Clear rejection for empty log write (kind=log); Save disabled |
| `06-log-after-leave-return.png` | Same log fact after leave/return (no restart) |
| Optional `00-agent-team-open-log.png` | Agent Team open during log path |
| Optional `scenario-1-log-write-walkthrough.mp4` | Short recording covering Steps D–F |
| `panel-state-log.json` · `p5-t019-scenario1-log-cdp.log` | CDP hard-assert supporting logs (log) |

**Required artifacts (minimum — T022 / SC-003):**

| Artifact | Content |
|----------|---------|
| `07-note-listed.png` | Bot memory pane after note write — kind Note + note fixture; kinds distinguishable |
| `08-note-reject-empty.png` | Clear rejection for empty note write (kind=note); Save disabled |
| `09-note-after-leave-return.png` | Same note fact after leave/return (no restart) |
| Optional `00-agent-team-open-note.png` | Agent Team open during note path |
| Optional `scenario-1-note-write-walkthrough.mp4` | Short recording covering Steps G–I |
| `panel-state-note.json` · `p5-t022-scenario1-note-cdp.log` | CDP hard-assert supporting logs (note) |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Evidence home: [evidence/scenario-1/README.md](./evidence/scenario-1/README.md).

---

## Pass stamp template (filled for T022 / SC-003)

```text
Verdict: Pass
Stamp: 2026-09-28 · tip <sha> · desktop DSH Local Build (DISPLAY=:1 CDP 9222)
Linear: MOH-259 · Epic MOH-228 — left In Progress (PO closes after merge + SO12)
SC-001: Pass — prior T016 evidence retained
SC-002: Pass — prior T019 evidence retained
SC-003: Pass — evidence: evidence/scenario-1/{07-note-listed,08-note-reject-empty,09-note-after-leave-return}.*
SC-009: Pass — bot-tool absence did not fail Pass
FR-011: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-012: media committed under verifier/evidence/scenario-1/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: none
```

**Rule:** Do not mark SC-003 Done in Linear without a filled stamp that includes FR-011/012 desktop evidence. Leave [MOH-259](https://linear.app/momadhoun/issue/MOH-259) **In Progress** until PO merges + SO12 embeds; Verifier does **not** mark Linear Done.

---

## Explicit non-goals

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
| [../spec.md](../spec.md) FR-001/002/003/011/012/015 · SC-001/002/003/009 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-011/012 mandate |
| This file | T016+T019+T022 rerunnable Scenario 1 write-kinds recipe |
| T014–T015 | Host writeMemory profile + Client write UI |
| T017–T018 | Host writeMemory log + Client log kind |
| T020–T021 | Host writeMemory note + Client note kind |
| T022 | SC-003 note extension of this recipe (this stamp) |

## Evidence for PO / DH Lead

**T022 SC-003 note path Pass stamped** with Desktop FR-011/012 media `07–09` + walkthrough under [evidence/scenario-1/](./evidence/scenario-1/). Scenario 1 write path (profile + log + note) complete. Leave [MOH-259](https://linear.app/momadhoun/issue/MOH-259) **In Progress** until PO merges the stamp PR and completes SO12 PR embeds — Verifier does **not** mark Linear Done.
