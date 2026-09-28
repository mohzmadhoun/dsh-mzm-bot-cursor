# Scenario 2 — computerUse-class path (screenshot + parent handoff)

**Status:** Recipe delivered (T023). Product SC-002 **not** stamped — desktop FR-013/014 evidence placeholders only until Runtime/Client US2 product lands.
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host `ctx.computerUse` provider + subagent spawn path) · DH Client (screenshot / handoff projection over Host HTTP/WS)
**Linear:** [MOH-379](https://linear.app/momadhoun/issue/MOH-379/t023-us2-verifier-scenario-2-computeruse-recipe) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · project `P-MOH-2` only
**Acceptance slice:** T023 — Verifier Scenario 2 recipe covering SC-002 (screenshot/GUI observation + parent handoff; interactive browser **not** required) with mandatory FR-013/014 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/computer-use/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/computer-use.md](../contracts/computer-use.md)
**Architect locks:** Path A `dsh-computer-use` + one provider (Cua or Host Pass fixture) + `dsh-subagent` spawn-in-process (R3); screenshot-only Pass — interactive browser click/type **not** required (FR-003 / R0); Host SoT + Client HTTP/WS projection; no Electron Main `computer-use-control` / `computer-screenshot` bus (R1/R6); Settings chrome alone ≠ SC-002 (FR-005 / SC-004)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-002 screenshot (or equiv. GUI observation) + parent handoff · FR-003 interactive browser not required · FR-015 LLM wording not scored |
| FR-013 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/computer-use/` — unit/jsdom alone **fails** |
| FR-014 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/computer-use/VERDICT.txt` only after Desktop FR-013/014 media lands |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T015) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `17d2b3efe3` (includes #245) |
| computerUse provider slot (T009) | SC-002 observation path | **measured:** [computer-use-pass-provider.md](./computer-use-pass-provider.md) · Host Pass fixture · foundational [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243)/[#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) |
| Subagent spawn (T010) | Parent → child handoff path | **measured:** Desktop Host `ctx.subagents` + spawn-in-process · same foundational stamp |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) |
| US1 SC-001 Done | Prior slice | **measured:** Desktop evidence + VERDICT under [evidence/shell-box/](./evidence/shell-box/) · master [#250](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/250) |
| US2 Host observation path (T020) | SC-002 Host half | **inferred:** may still be in flight — recipe must be satisfied when landed |
| US2 Host parent handoff (T021) | SC-002 handoff | **inferred:** may still be in flight |
| US2 Client projection (T022) | SC-002 desktop screenshot + handoff UI | **inferred:** may still be in flight |

**Desktop prerequisites** (full Scenario 2 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 parent bot from prior phases; Host `ctx.computerUse` provider registered (Cua or Pass fixture); subagent spawn-in-process available; Client surfaces projecting observation artifact + parent handoff over Host HTTP/WS; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-002 Done): Host vitest below — proves Pass-fixture registration + screenshot tool before Client UI.

---

## Fixtures (deterministic expectations)

| Field | Value |
|-------|-------|
| Pass topology | One computerUse-class subagent / observation path from a parent bot (capability class = box desktop/browser GUI observation) |
| Provider | One `ctx.computerUse.register` — prefer Cua when Verifier-reachable; else Host Pass fixture (`desktop-pass-fixture` / `computer_use_pass_screenshot`) |
| Observation | ≥1 user-visible screenshot **or** equivalent GUI observation artifact |
| Parent handoff | Visible progress / result indicator in parent chat / session |
| Interactive browser | **Not** required for Pass (FR-003) |
| LLM wording | **Not scored** (FR-015) |

Do **not** require live interactive browser click/type, full executor/video/CloudAgent inventory, or a fixed product string equal to Grok `computerUse`. Do **not** score Settings → Computer **Computer use** row alone as SC-002 (SC-004 / chrome ≠ substitute).

---

## Step A — Start computerUse-class path; observation visible (SC-002 · FR-003 · FR-015)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. With ≥1 parent bot and a ready box/computer backend (or documented Pass fixture), start **one** computerUse-class subagent / observation path for GUI/desktop/browser **observation**.
3. Confirm ≥1 **user-visible screenshot** (or equivalent GUI observation artifact) appears in the product UI — docs-only subagent catalog listing **fails**.
4. Do **not** require interactive browser click/type (FR-003).
5. Do **not** score LLM wording (FR-015).
6. Capture FR-013/014 evidence of the observation artifact (see Evidence section).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run apps/desktop-host/tests/computer-use-pass-fixture.spec.ts apps/desktop-host/tests/computer.spec.ts
```

Assert Host registers one `ctx.computerUse` provider and that the Pass observation tool can emit a durable screenshot-class result. Host tool registration alone is supporting (**inferred** for user-visible Desktop success).

| Observation | Pass | Fail |
|-------------|------|------|
| Observation | User-visible screenshot / GUI artifact on Desktop | Docs-only subagent list; Host log-only registration claimed as SC-002 |
| Interactive browser | Absence does **not** fail | Requiring click/type for Pass (over-strict) |
| LLM | Wording not scored | Pass requires particular assistant prose |
| Chrome alone | Settings **Computer use** row without observation → Fail SC-002 | Claiming SC-002 from Settings chrome (SC-004) |
| Evidence | Desktop screenshot/recording of observation | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-002 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-002).

---

## Step B — Parent-visible handoff / result (SC-002 · FR-003 · FR-015)

**User / Verifier path (desktop):**

1. After Step A observation path has run, view the **parent** bot chat / session.
2. Confirm a handoff or result indicator tied to that computerUse-class path is visible (progress or completed outcome).
3. Parent text claim **without** a GUI observation artifact → **Fail** (Step A still required).
4. Do **not** score specific LLM wording beyond handoff visibility (FR-015).
5. Capture FR-013/014 evidence of the parent handoff indicator.

**Host observation:**

Assert session / Host projection can reconstruct model-visible observation + handoff from the session log (Path A logging rule). Host session events alone do **not** close SC-002 without Desktop UI.

| Observation | Pass | Fail |
|-------------|------|------|
| Handoff | Parent-visible progress / result indicator on Desktop | No parent indicator; observation orphaned |
| Artifact + handoff | Both present | Parent text only / artifact only |
| Evidence | Desktop screenshot/recording of parent handoff | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-002 Done).

---

## Step C — Failed / seam paths must not count as Pass

**User / Verifier path (desktop / docs):**

1. Settings → Computer **Computer use** row visible without Steps A–B → **Fail** SC-002 (chrome ≠ substitute; FR-005 / SC-004).
2. Product traffic claimed via Electron Main `computer-use-control` / `computer-screenshot` bus → **Fail** (T013/T014 / Path A).
3. Pass gate that **requires** interactive browser click/type → **Fail** the gate (over-strict vs FR-003).
4. Full executor / video / CloudAgent inventory required for Pass → **Fail** the over-strict gate.

| Observation | Pass | Fail / out of scope |
|-------------|---------------------|---------------------|
| Chrome-only | Not SC-002 | Settings presence scored as Story 2 Done |
| Main IPC SoT | Absent (seam holds) | Electron Main as computerUse SoT |
| Interactive browser | Optional; not required | Required for Pass |
| Inventory breadth | One computerUse-class path enough | Every subagent type required |

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Parent text without GUI artifact | **Fail** SC-002 — observation required |
| Unit/jsdom-only evidence | Scenario 2 GUI **Fail** (FR-013 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-014 / SO 12) |
| Pass claimed via Electron Main computerUse bus | **Fail** (T013/T014 / R6) |
| Pass requires interactive browser click/type | **Fail** the over-strict gate (FR-003) |
| Settings chrome alone claimed as SC-002 | **Fail** (FR-005 / SC-004) |
| Docs-only subagent catalog | **Fail** — must run a real path |

---

## FR-013 / FR-014 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-013):** Scenario 2 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-014):** Those artifacts MUST be **committed** under `specs/007-box-subagent-settings/verifier/evidence/computer-use/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/007-box-subagent-settings/verifier/evidence/computer-use/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-computer-use-observation.png` (or `.webp`) | Desktop showing ≥1 user-visible screenshot / GUI observation artifact from the computerUse-class path |
| `02-computer-use-parent-handoff.png` (or recording segment) | Parent chat/session handoff or result indicator tied to that path |
| Optional `scenario-2-computer-use-walkthrough.mp4` / `.webm` | Short recording covering Steps A–B |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder dir: [evidence/computer-use/](./evidence/computer-use/) (`.gitkeep` until media lands; T029 may add filename README).

**PR body embed pattern (PO / ManagePullRequest — SO 12):**

```html
<img src="/opt/cursor/artifacts/01-computer-use-observation.png" alt="computerUse-class GUI observation" />
<img src="/opt/cursor/artifacts/02-computer-use-parent-handoff.png" alt="Parent handoff for computerUse path" />
<video src="/opt/cursor/artifacts/scenario-2-computer-use-walkthrough.mp4" controls></video>
```

---

## Pass stamp template (fill only with desktop media — product SC-002)

```text
Verdict: <Pass|Fail|Blocked>
Stamp: <YYYY-MM-DD> · tip <sha> · desktop <build note>
Linear: MOH-379 · Epic MOH-350 · P-MOH-2
SC-002: <Pass|Fail> — evidence: evidence/computer-use/{01-computer-use-observation,02-computer-use-parent-handoff}.*
FR-003: screenshot-only Pass; interactive browser not required
FR-013: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-014: media committed under verifier/evidence/computer-use/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
FR-015: LLM wording not scored
Blockers: <none | list>
```

**Rule:** Do **not** claim product SC-002 Pass without FR-013/014 desktop media committed under `evidence/computer-use/` + PR embeds. Host vitest alone does **not** close US2 / Scenario 2. Leave `VERDICT.txt` uncreated or clearly **not** Pass until media lands. PO merges GUI evidence PR with SO12 embeds; Verifier does **not** ManagePullRequest.

---

## Explicit non-goals

- US2 Host observation / handoff product code (T020–T021) — out of this Verifier recipe PR
- US2 Client screenshot / handoff projection (T022) — out of this PR
- Local Shell/box tool success (Scenario 1 / US1 / T019) — already stamped separately
- Settings → Computer rows (Scenario 3 / US3 / T027)
- Non-goals absence (Scenario 4 / T028)
- Full Phase 7 replay (Scenario 5 / T030)
- Evidence filename packaging README polish (T029) beyond keeping `evidence/computer-use/` present
- Electron Main computerUse bus (forbidden; T013/T014)
- Interactive browser click/type as a Pass requirement
- Product SC-001…SC-006 Done stamps on this recipe-only delivery (SC-001 already Done on master; SC-002 **not** claimed here)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 2 | User-facing outline |
| [../contracts/computer-use.md](../contracts/computer-use.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-003/005/013/014/015 · SC-002 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-013/014 mandate |
| [computer-use-inventory.md](./computer-use-inventory.md) | Setup inventory (T003) |
| [computer-use-pass-provider.md](./computer-use-pass-provider.md) | Chosen Pass provider (T009) |
| [box-computer-seam-locks.md](./box-computer-seam-locks.md) | Architect Path A locks |
| This file | T023 rerunnable Scenario 2 computerUse recipe |
| T020–T022 | Host observation/handoff + Client projection |
| [evidence/computer-use/](./evidence/computer-use/) | FR-013/014 evidence home (placeholders until product PR) |

## Evidence for PO / DH Lead

**Recipe Pass only** — product SC-002 remains open until Desktop FR-013/014 media lands under [evidence/computer-use/](./evidence/computer-use/). Foundations + US1 SC-001 on `origin/master` @ `17d2b3efe3`. US2 Host/Client (T020–T022) must satisfy this recipe. Embed SO12 paths in the GUI PR body when media arrives (Verifier cannot ManagePullRequest).

**Rerun (idempotent — recipe present; media pending):**

```sh
test -f specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md
test -d specs/007-box-subagent-settings/verifier/evidence/computer-use
test -f specs/007-box-subagent-settings/verifier/evidence/computer-use/.gitkeep
rg -n 'SC-002|FR-003|interactive browser|FR-013|FR-014|SO 11' specs/007-box-subagent-settings/verifier/scenario-2-computer-use.md
# Product Pass gate (must FAIL until media + VERDICT land):
test ! -f specs/007-box-subagent-settings/verifier/evidence/computer-use/VERDICT.txt \
  || ! rg -q 'Verdict: Pass' specs/007-box-subagent-settings/verifier/evidence/computer-use/VERDICT.txt
```
