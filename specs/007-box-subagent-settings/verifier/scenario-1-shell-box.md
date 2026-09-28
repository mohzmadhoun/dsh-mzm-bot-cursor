# Scenario 1 — Local Shell / box tool success

**Status:** Recipe delivered (T019). Product SC-001 **not** stamped — desktop FR-013/014 evidence placeholders only until Runtime/Client US1 product lands.
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host sandboxed Shell + box readiness SoT) · DH Client (tool success / not-ready projection over Host HTTP/WS)
**Linear:** [MOH-375](https://linear.app/momadhoun/issue/MOH-375/t019-us1-verifier-scenario-1-shellbox-recipe) · Epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350/p7-computer-box-subagent-parity-settings-chrome) · project `P-MOH-2` only
**Acceptance slice:** T019 — Verifier Scenario 1 recipe covering SC-001 (one local Shell/box tool success; FR-011 local only; not-ready ≠ Pass) with mandatory FR-013/014 (standing orders **11** + **12**) desktop evidence under `verifier/evidence/shell-box/`
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 1
**Contract:** [../contracts/shell-box.md](../contracts/shell-box.md)
**Architect locks:** Path A Host sandboxed Shell world (R2); readiness clear ≠ ready (R0 / FR-002); one Verifier-reachable **local** path enough — PTC/remote not Pass (FR-011); Host SoT + Client HTTP/WS projection; no Electron Main shell-exec / box-ready bus (R1/R6)

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-001 one local Shell/box tool success · FR-011 local only · FR-002 not-ready ≠ Pass · FR-015 LLM wording not scored |
| FR-013 (SO 11) | Desktop screenshot(s) and/or short screen recording of the **real Desktop app** under `verifier/evidence/shell-box/` — unit/jsdom alone **fails** |
| FR-014 (SO 12) | Evidence **committed** on the PR branch under that path **and** embedded in the GUI PR body via absolute `/opt/cursor/artifacts/…` `<img>` / `<video controls>` — artifact page links alone **fail** |
| Product SC stamp | **Deferred** — fill `evidence/shell-box/VERDICT.txt` only after Desktop FR-013/014 media lands |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T015) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) · tip `origin/master` @ `fbe2ec21d8` (#245) |
| BoxBackend readiness SoT (T007) | SC-001 gating / not-ready | **measured:** `apps/desktop-host/src/box-readiness.ts` · foundational [#243](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/243)/[#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) |
| Sandboxed Shell mount (T008) | SC-001 Host half | **measured:** Desktop Host `ctx.shell` + sandbox-local composition · same foundational stamp |
| Electron no-bus (T013/T014) | Seam honesty | **measured:** [#244](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/244) |
| US1 Host success path (T016) | SC-001 Host half | **inferred:** may still be in flight — recipe must be satisfied when landed |
| US1 Host not-ready path (T017) | FR-002 / not-ready ≠ Pass | **inferred:** may still be in flight |
| US1 Client projection (T018) | SC-001 desktop success / not-ready UI | **inferred:** may still be in flight |

**Desktop prerequisites** (full Scenario 1 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with ≥1 bot from prior phases; Host sandboxed Shell mounted with `BoxBackend.readiness` projection; Client tool/card surface projecting Host HTTP/WS outcomes; `DISPLAY` when Cloud Agent (`DISPLAY=:1`, `DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`).

**Host-only rehearsal** (does **not** alone mark SC-001 Done): Host vitest below — proves readiness enum + sandboxed Shell before Client UI.

---

## Fixtures (deterministic expectations)

| Field | Value |
|-------|-------|
| Pass topology | **Local** Host sandboxed Shell (`bash` and/or `pwsh` via sandbox-local) — FR-011 |
| Readiness enum | `not_ready` \| `starting` \| `ready` \| `failed` (exact marketing string not scored — FR-002) |
| Success outcome | `ShellBoxToolCall.outcome=success` (or equivalent user-visible success indicator) |
| Not-ready outcome | `outcome=not_ready` (or equivalent projection) — **must not** be stamped as SC-001 Pass |
| LLM wording | **Not scored** (FR-015) |

Do **not** require PTC, brokered remote box, or a fixed live remote agent for Pass. Do **not** score Settings → Computer chrome alone as SC-001 (SC-004 / chrome ≠ substitute).

---

## Step A — Observe readiness; not-ready ≠ Pass (FR-002 · SC-001 gate)

**User / Verifier path (desktop):**

1. Launch the real Desktop app (not jsdom): `DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop`.
2. With ≥1 bot available, observe box/Shell backend readiness on the product surface (tool path, Settings → Computer **Shell** row readiness, or Host-projected status).
3. If readiness is `not_ready`, `starting`, or `failed`, attempt the Pass Shell/box tool path once and confirm a **clear distinguishable** not-ready / starting / failure state (exact marketing string not scored).
4. Record that attempt as **not** SC-001 Pass — evidence may include a not-ready frame under `evidence/shell-box/`.
5. Wait until readiness is `ready` before Step B, **or** document Host/product Fail with not-ready evidence (never silent skip).

**Host observation (when Client UI is not yet available):**

```sh
pnpm exec vitest run apps/desktop-host/tests/box-readiness.spec.ts
```

Assert Host readiness SoT exposes `not_ready` / `starting` / `ready` / `failed` and that sandboxed Shell + sandbox presence gates `ready`. Assert unconfined / missing shell does **not** report Pass-ready.

| Observation | Pass | Fail |
|-------------|------|------|
| Not-ready visible | Clear ≠ ready state on Desktop (or Host projection for Host-only rehearsal) | Silent success; marketing-string-only scoring; not-ready counted as SC-001 |
| Gate | SC-001 stamp withheld until ready + tool success | Claiming Pass on starting / failed / not_ready |
| Evidence | Optional not-ready frame filed under `evidence/shell-box/` | Unit/jsdom-only claim that not-ready was proven on Desktop |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done); Host vitest-only → **measured** (Host half) + **inferred** (does not complete SC-001).

---

## Step B — One local Shell/box tool success (SC-001 · FR-001 · FR-011 · FR-015)

**User / Verifier path (desktop):**

1. With `BoxBackend.readiness=ready` (Step A), invoke **one** local sandboxed Shell tool (`bash` or `pwsh`) against the Host backend.
2. Observe a **user-visible success** indicator / outcome (`outcome=success` or equivalent tool card / conversation surface).
3. Confirm the path is **local** Host sandboxed Shell — do **not** require PTC or brokered remote for Pass (FR-011).
4. Do **not** score LLM wording (FR-015).
5. Capture FR-013/014 evidence of the success indicator (see Evidence section).

**Host observation:**

```sh
pnpm exec vitest run apps/desktop-host/tests/box-readiness.spec.ts apps/desktop-host/tests/computer.spec.ts
```

Assert when readiness is `ready`, a sandboxed Shell exec can complete with a success-class result reconstructable for session logging. Host tool registration alone is supporting (**inferred** for user-visible Desktop success).

| Observation | Pass | Fail |
|-------------|------|------|
| Success | User-visible local Shell/box tool success on Desktop | Tool registered only in Host logs / DevTools; success claimed without UI |
| Local only | Pass via Host local sandboxed Shell | Pass gated on PTC / remote-only topology (FR-011 Fail) |
| LLM | Wording not scored | Pass requires particular assistant prose |
| Chrome alone | Settings row present without tool success → Fail SC-001 | Claiming SC-001 from Settings chrome (SC-004) |
| Evidence | Desktop screenshot/recording of success | Unit/jsdom-only claim |

**Claim tags:** desktop UI → **measured** (required for SC-001 Done).

---

## Step C — Failed / seam paths must not count as Pass

**User / Verifier path (desktop / docs):**

1. Attempt Shell/box while not `ready` → clear not-ready; **no** SC-001 Pass (Step A).
2. Settings → Computer **Shell** row visible without Step B success → **Fail** SC-001 (chrome ≠ substitute).
3. Product traffic claimed via Electron Main `shell-exec` / `box-ready` bus → **Fail** (T013/T014 / Path A).

| Observation | Pass | Fail / out of scope |
|-------------|---------------------|---------------------|
| Not-ready attempt | Documented; not stamped SC-001 | Claiming Pass without ready + local success |
| Chrome-only | Not SC-001 | Settings presence scored as Story 1 Done |
| Main IPC SoT | Absent (seam holds) | Electron Main as Shell/box SoT |

---

## Fail path (record; does not block recipe delivery)

| Condition | Required behavior |
|-----------|-------------------|
| Backend still starting / unavailable | Clear user-visible not-ready; **no** silent empty “success”; **no** SC-001 Pass |
| Unit/jsdom-only evidence | Scenario 1 GUI **Fail** (FR-013 / SO 11) |
| Evidence not committed / not PR-embedded | GUI **Fail** (FR-014 / SO 12) |
| Pass claimed via Electron Main box/Shell bus | **Fail** (T013/T014 / R6) |
| Pass requires PTC or brokered remote only | **Fail** (FR-011) |
| Settings chrome alone claimed as SC-001 | **Fail** (FR-005 / SC-004) |

---

## FR-013 / FR-014 desktop visual evidence (mandatory — SO 11 + 12)

**Standing order 11 (FR-013):** Scenario 1 GUI Pass **requires** desktop screenshot(s) and/or a short screen recording of the **real Desktop app**. Vitest/jsdom alone **fails**.

**Standing order 12 (FR-014):** Those artifacts MUST be **committed** under `specs/007-box-subagent-settings/verifier/evidence/shell-box/` on the PR branch **and** embedded in the GUI PR body via HTML `<img>` / `<video controls>` using absolute `/opt/cursor/artifacts/…` paths. Cursor agent artifact page links alone MUST NOT satisfy Pass.

**Directory:**

```text
specs/007-box-subagent-settings/verifier/evidence/shell-box/
```

**Required artifacts (minimum):**

| Artifact | Content |
|----------|---------|
| `01-shell-box-ready.png` (or `.webp`) | Desktop showing backend **ready** (or Settings → Computer Shell readiness = ready) before / at tool invoke |
| `02-shell-box-success.png` (or recording segment) | User-visible successful local Shell/box tool outcome |
| Optional `00-shell-box-not-ready.png` | Clear not-ready / starting / failed state (FR-002 proof that ≠ Pass) |
| Optional `scenario-1-shell-box-walkthrough.mp4` / `.webm` | Short recording covering Steps A–B |
| `VERDICT.txt` | Filled stamp (template below) when product SC is claimed |

Also copy/publish walkthrough copies under `/opt/cursor/artifacts/` when running as Cloud Agent Verifier (SO 11). Placeholder dir: [evidence/shell-box/](./evidence/shell-box/) (`.gitkeep` until media lands; T029 may add filename README).

**PR body embed pattern (PO / ManagePullRequest — SO 12):**

```html
<img src="/opt/cursor/artifacts/01-shell-box-ready.png" alt="Shell/box backend ready" />
<img src="/opt/cursor/artifacts/02-shell-box-success.png" alt="Local Shell/box tool success" />
<video src="/opt/cursor/artifacts/scenario-1-shell-box-walkthrough.mp4" controls></video>
```

---

## Pass stamp template (fill when evidence lands — do not claim now)

```text
Verdict: Pass
Stamp: YYYY-MM-DD · tip <sha> · desktop <build> (DISPLAY=:1)
Linear: MOH-375 · Epic MOH-350 · P-MOH-2
SC-001: Pass — evidence: evidence/shell-box/{01-shell-box-ready,02-shell-box-success}.*
FR-002: not-ready / starting observed ≠ Pass (optional 00-shell-box-not-ready.*)
FR-011: Pass — local Host sandboxed Shell only (not PTC/remote-only)
FR-013: desktop screenshots/recording present; not unit/jsdom-only (SO 11)
FR-014: media committed under verifier/evidence/shell-box/ + PR embeds via /opt/cursor/artifacts/… (SO 12)
FR-015: LLM wording not scored
Blockers: none
```

**Rule:** Do not mark SC-001 Done in Linear / Spec without a filled stamp that includes FR-013/014 desktop evidence once Runtime/Client US1 Desktop path exists. Host vitest alone may advance readiness/Shell confidence but does **not** close US1 / Scenario 1. Leave [MOH-375](https://linear.app/momadhoun/issue/MOH-375/t019-us1-verifier-scenario-1-shellbox-recipe) **In Progress** for product SC until PO merges GUI evidence + SO12 embeds — Verifier does **not** mark product SC Done on recipe-only delivery.

---

## Explicit non-goals

- US1 Host success / not-ready product code (T016–T017) — out of this Verifier recipe PR
- US1 Client tool/not-ready projection (T018) — out of this PR
- computerUse screenshot + handoff (Scenario 2 / US2 / T023)
- Settings → Computer rows (Scenario 3 / US3 / T027)
- Non-goals absence (Scenario 4 / T028)
- Full Phase 7 replay (Scenario 5 / T030)
- Evidence filename packaging README polish (T029) beyond keeping `evidence/shell-box/` present
- Electron Main box/Shell/computerUse bus (forbidden; T013/T014)
- Product SC-001…SC-006 Done stamps on this recipe-only delivery

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 1 | User-facing outline |
| [../contracts/shell-box.md](../contracts/shell-box.md) | Contract Pass bars |
| [../spec.md](../spec.md) FR-001/002/011/013/014/015 · SC-001 | Normative requirements |
| [README.md](./README.md) | Scenario owners map + foundational Pass + FR-013/014 mandate |
| [host-shell-box-inventory.md](./host-shell-box-inventory.md) | Setup inventory (T002) |
| [box-computer-seam-locks.md](./box-computer-seam-locks.md) | Architect Path A locks |
| This file | T019 rerunnable Scenario 1 Shell/box recipe |
| T016–T018 | Host success/not-ready + Client projection |
| [evidence/shell-box/](./evidence/shell-box/) | FR-013/014 evidence home (placeholders until product PR) |

## Evidence for PO / DH Lead

**Recipe delivered (T019).** Product SC-001 Pass **not** stamped. Foundations hold on master via [#245](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/245) / T015. Full Scenario 1 Done waits on US1 Host/Client Desktop path (T016–T018) plus Verifier FR-013/014 desktop evidence using Steps A–B above. Placeholders under [evidence/shell-box/](./evidence/shell-box/) require SO 11+12 media before GUI Pass.

**Rerun (idempotent — recipe presence):**

```sh
test -f specs/007-box-subagent-settings/verifier/scenario-1-shell-box.md
test -d specs/007-box-subagent-settings/verifier/evidence/shell-box
rg -n 'FR-013|FR-014|SC-001|not-ready|SO 11' specs/007-box-subagent-settings/verifier/scenario-1-shell-box.md
```
