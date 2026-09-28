# Scenario 3 — Settings → Computer rows (Shell + Computer use)

**Status:** Recipe delivered (T027). Product SC-003 **not** stamped — desktop FR-013/014 evidence placeholders only until Client/Runtime US3 product lands.
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Client (Global Settings → Computer chrome) · DH Runtime (Host Computer settings projection / Remotes)
**Linear:** [MOH-383](https://linear.app/momadhoun/issue/MOH-383/t027-us3-verifier-scenario-3-settings-recipe) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · project `P-MOH-2` only
**Acceptance slice:** T027 — Verifier Scenario 3 recipe covering SC-003 (both **Shell** and **Computer use** rows under Global Settings → **Computer**; Shell readiness visible) **and** SC-004 / FR-005 (chrome alone MUST NOT grant SC-001 or SC-002) with mandatory FR-013/014 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/settings/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/settings.md](../contracts/settings.md)
**Architect locks:** Path A Client `settings.section` **Computer** over Host settings document / Remotes (R4); locale-owned English labels **Shell** + **Computer use** (FR-004 / FR-016); Shell row may be read-only Host readiness (PO); per-agent gear alone fails FR-016; chrome alone ≠ Phase Pass / ≠ SC-001 / ≠ SC-002 (FR-005 / SC-004); no Electron Main Computer-settings SoT (R1/R6); Update/Reset/box-doctor/full catalog not required (FR-010)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-003 both rows under **Computer** · Shell readiness visible · FR-016 Global Settings · FR-010 out-of-Pass chrome not required · SC-004 / FR-005 chrome alone ≠ SC-001/SC-002 |
| FR-013 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/settings/` — unit/jsdom alone **fails** |
| FR-014 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/settings/VERDICT.txt` only after Desktop FR-013/014 media lands |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T015) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `ce02df7a09` (includes #243/#244/#245) |
| Computer settings SoT (T011) | Shell readiness + Computer use projection fields | **measured:** `apps/desktop-host/src/computer-settings.ts` · foundational [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243) |
| Host HTTP/WS Remotes (T012) | Client projection path | **measured:** same foundational stamp |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) |
| US1 SC-001 Done | SC-004 coupling (Stories 1–2 still required) | **measured:** Desktop evidence + VERDICT under [evidence/shell-box/](./evidence/shell-box/) · master [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) |
| US2 SC-002 Done | SC-004 coupling | **measured:** Desktop evidence + VERDICT under [evidence/computer-use/](./evidence/computer-use/) · master [#255](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/255) |
| US3 Client Computer section (T024) | SC-003 chrome home | **inferred:** may still be in flight — recipe must be satisfied when landed |
| US3 Client Shell + Computer use rows (T025) | SC-003 rows + Shell readiness | **inferred:** may still be in flight |
| US3 Host projection for Client (T026) | Host fields over Remotes | **inferred:** may still be in flight |

**Desktop prerequisites** (full Scenario 3 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with Global Settings shell; Client `settings.section` **Computer** registered with locale-owned **Shell** and **Computer use** rows; Host Computer settings projection (Shell readiness visible on Shell row — read-only OK); Client reads Host HTTP/WS only; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-003 Done): Host vitest / settings projection specs — proves Computer settings fields before Client chrome.

---

## Fixtures (deterministic expectations)

| Field | Value |
|-------|-------|
| Pass topology | Global Settings → **Computer** (not per-agent gear alone) |
| Section label | **Computer** (locale-owned English dictionary string) |
| Row 1 | **Shell** (or clearly labeled control group) with **visible Host readiness** (read-only sufficient — PO) |
| Row 2 | **Computer use** (or clearly labeled control group) |
| Readiness enum | `not_ready` \| `starting` \| `ready` \| `failed` (exact marketing string not scored — FR-002) |
| Out of Pass chrome | Update / Reset / box-doctor / full catalog / billing / voice / user machines **not** required (FR-010) |
| Coupling | SC-003 Pass **MUST NOT** grant SC-001 or SC-002 (FR-005 / SC-004) |

Do **not** require full Grok Computer catalog chrome. Do **not** score Plugins Bash card or per-agent gear alone as SC-003 (FR-016). Do **not** claim SC-001 or SC-002 from Settings presence alone (SC-004).

---

## Step A — Open Global Settings → Computer; both rows present (SC-003 · FR-004 · FR-016)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. Open **Global Settings** (settings shell — not per-agent gear alone).
3. Navigate to section **Computer**.
4. Confirm rows (or clearly labeled control groups) labeled **Shell** and **Computer use** are both visible under that section.
5. Confirm the home is Global Settings → Computer — per-agent gear alone → **Fail** FR-016 / SC-003.
6. Capture FR-013/014 evidence of both rows (see Evidence section).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run apps/desktop-host/tests/computer.spec.ts
```

Assert Host Computer settings projection exposes Shell readiness + Computer-use fields reconstructable for Client Remotes. Host field presence alone is supporting (**inferred** for user-visible Desktop SC-003).

| Observation | Pass | Fail |
|-------------|------|------|
| Section | Global Settings → **Computer** visible | Missing section; only per-agent gear |
| Rows | Both **Shell** and **Computer use** visible | One missing; wrong labels; Plugins Bash card alone |
| Scope | Global Settings home | Per-agent gear scored as SC-003 (FR-016 Fail) |
| Evidence | Desktop screenshot/recording of both rows | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-003 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-003).

---

## Step B — Shell readiness visible on Shell row (SC-003 · FR-002 · FR-004)

**User / Verifier path (desktop):**

1. On Settings → Computer **Shell** row, confirm a **user-visible readiness** projection from Host (`not_ready` / `starting` / `ready` / `failed` or equivalent clear state).
2. Read-only readiness is **Pass-sufficient** (PO) — mutate controls optional beyond Pass.
3. Exact marketing string is **not scored** (FR-002) — state must be distinguishable from ready vs not-ready/starting/failed.
4. Capture FR-013/014 evidence of Shell readiness on the Shell row.

**Host observation:**

Assert `BoxBackend.readiness` (or Computer settings Shell readiness field) projects over authenticated Remotes. Host enum alone does **not** close SC-003 without Desktop Settings chrome.

| Observation | Pass | Fail |
|-------------|------|------|
| Readiness visible | Shell row shows clear Host readiness state | Blank Shell row; readiness only in Host logs |
| Read-only OK | Read-only projection accepted | Requiring mutate UI for SC-003 Pass |
| Evidence | Desktop screenshot of Shell row + readiness | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-003 Done).

---

## Step C — Chrome alone MUST NOT grant SC-001 / SC-002 (FR-005 · SC-004)

**User / Verifier path (desktop / docs):**

1. With Steps A–B complete (both rows + Shell readiness visible), record **SC-003** eligibility only — do **not** stamp SC-001 or SC-002 from this chrome.
2. Confirm Phase 7 / Stories 1–2 still require [Scenario 1](./scenario-1-shell-box.md) (SC-001) and [Scenario 2](./scenario-2-computer-use.md) (SC-002) Desktop Pass stamps with their own FR-013/014 evidence slices.
3. Settings → Computer rows present **without** SC-001 + SC-002 → **Fail** Phase (SC-004) even if SC-003 chrome Passes.
4. Claiming SC-001 from Shell row alone, or SC-002 from Computer use row alone → **Fail** (FR-005 / SC-004).
5. Product traffic claimed via Electron Main Computer-settings bus → **Fail** (T013/T014 / Path A).

| Observation | Pass | Fail / out of scope |
|-------------|---------------------|---------------------|
| SC-003 alone | Rows + Shell readiness → SC-003 only | Claiming SC-001 or SC-002 from chrome |
| Phase coupling | SC-001 + SC-002 still required for Phase | Settings-only Phase Done (SC-004 Fail) |
| Main IPC SoT | Absent (seam holds) | Electron Main as Computer-settings SoT |
| Out of Pass chrome | Absence of Update/Reset/catalog OK | Requiring full Grok catalog for Pass (FR-010) |

**Claim tags:** coupling rule → **measured** from this recipe + contracts; product SC-001/SC-002 → separate evidence homes (do not re-stamp here).

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Rows only under per-agent gear | **Fail** FR-016 / SC-003 |
| Missing **Shell** or **Computer use** row | **Fail** SC-003 |
| Shell row without visible readiness | **Fail** SC-003 (readiness required; read-only OK) |
| Unit/jsdom-only evidence | Scenario 3 GUI **Fail** (FR-013 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-014 / SO 12) |
| Pass claimed via Electron Main Computer-settings bus | **Fail** (T013/T014 / R6) |
| SC-003 alone claimed as SC-001 or SC-002 | **Fail** (FR-005 / SC-004) |
| Settings-only claimed as Phase 7 Done | **Fail** (SC-004) |
| Full Grok catalog required for Pass | **Fail** the over-strict gate (FR-010) |

---

## FR-013 / FR-014 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-013):** Scenario 3 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-014):** Those artifacts MUST be **committed** under `specs/007-box-subagent-settings/verifier/evidence/settings/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/007-box-subagent-settings/verifier/evidence/settings/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-settings-computer-section.png` (or `.webp`) | Global Settings → **Computer** showing both **Shell** and **Computer use** rows |
| `02-settings-shell-readiness.png` (or recording segment) | Shell row with visible Host readiness state (ready or clear not-ready/starting/failed) |
| Optional `scenario-3-settings-walkthrough.mp4` / `.webm` | Short recording covering Steps A–B |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder dir: [evidence/settings/](./evidence/settings/) (`.gitkeep` until media lands; T029 may add filename README).

**PR body embed pattern (PO / ManagePullRequest — SO 12):**

```html
<img src="/opt/cursor/artifacts/01-settings-computer-section.png" alt="Settings Computer Shell and Computer use rows" />
<img src="/opt/cursor/artifacts/02-settings-shell-readiness.png" alt="Shell row Host readiness visible" />
<video src="/opt/cursor/artifacts/scenario-3-settings-walkthrough.mp4" controls></video>
```

---

## Pass stamp template (fill only with desktop media — product SC-003)

```text
Verdict: <Pass|Fail|Blocked>
Stamp: <YYYY-MM-DD> · tip <sha> · desktop <build note>
Linear: MOH-383 · Epic MOH-350 · P-MOH-2
SC-003: <Pass|Fail> — evidence: evidence/settings/{01-settings-computer-section,02-settings-shell-readiness}.*
SC-004 / FR-005: SC-003 alone does NOT grant SC-001 or SC-002; Phase still requires Scenarios 1–2
FR-004 / FR-016: Global Settings → Computer; Shell + Computer use rows
FR-002: Shell readiness visible; exact marketing string not scored
FR-010: Update/Reset/catalog not required
FR-013: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-014: media committed under verifier/evidence/settings/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
Blockers: <none | list>
```

**Rule:** Do **not** claim product SC-003 Pass without FR-013/014 desktop media committed under `evidence/settings/` + PR embeds. Host vitest alone does **not** close US3 / Scenario 3. Leave `VERDICT.txt` uncreated or clearly **not** Pass until media lands. SC-003 Pass **MUST NOT** be treated as SC-001 or SC-002 Pass (FR-005 / SC-004). PO merges GUI evidence PR with SO12 embeds; Verifier does **not** ManagePullRequest.

---

## Explicit non-goals

- US3 Client Computer section / rows product code (T024–T025) — out of this Verifier recipe PR
- US3 Host projection wiring for Client (T026) — out of this PR
- Local Shell/box tool success (Scenario 1 / US1) — separate evidence under `evidence/shell-box/`
- computerUse screenshot + handoff (Scenario 2 / US2) — separate evidence under `evidence/computer-use/`
- Non-goals absence (Scenario 4 / T028)
- Full Phase 7 replay (Scenario 5 / T030)
- Evidence filename packaging README polish (T029) beyond keeping `evidence/settings/` present
- Electron Main Computer-settings bus (forbidden; T013/T014)
- Full Grok Computer catalog chrome (FR-010)
- Product SC-001…SC-006 Done stamps on this recipe-only delivery (SC-001/SC-002 already Done on master via their own evidence; SC-003 **not** claimed here)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 3 | User-facing outline |
| [../contracts/settings.md](../contracts/settings.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-002/004/005/010/013/014/016 · SC-003 · SC-004 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-013/014 mandate |
| [settings-computer-inventory.md](./settings-computer-inventory.md) | Setup inventory (T004) |
| [box-computer-seam-locks.md](./box-computer-seam-locks.md) | Architect Path A locks |
| This file | T027 rerunnable Scenario 3 Settings → Computer recipe |
| T024–T026 | Client Computer section/rows + Host projection |
| [evidence/settings/](./evidence/settings/) | FR-013/014 evidence home (placeholders until product PR) |

## Evidence for PO / DH Lead

**Recipe Pass only** — product SC-003 remains open until Desktop FR-013/014 media lands under [evidence/settings/](./evidence/settings/). Foundations + US1 SC-001 + US2 SC-002 on `origin/master` @ `ce02df7a09`. US3 Client/Runtime (T024–T026) must satisfy this recipe. **SC-003 alone MUST NOT grant SC-001/SC-002** (FR-005 / SC-004). Embed SO12 paths in the GUI PR body when media arrives (Verifier cannot ManagePullRequest).

**Rerun (idempotent — recipe present; media pending):**

```sh
test -f specs/007-box-subagent-settings/verifier/scenario-3-settings-computer.md
test -d specs/007-box-subagent-settings/verifier/evidence/settings
test -f specs/007-box-subagent-settings/verifier/evidence/settings/.gitkeep
rg -n 'SC-003|SC-004|FR-005|Shell readiness|FR-013|FR-014|SO 11' specs/007-box-subagent-settings/verifier/scenario-3-settings-computer.md
# Product Pass gate (must FAIL until media + VERDICT land):
test ! -f specs/007-box-subagent-settings/verifier/evidence/settings/VERDICT.txt \
  || ! rg -q 'Verdict: Pass' specs/007-box-subagent-settings/verifier/evidence/settings/VERDICT.txt
```
