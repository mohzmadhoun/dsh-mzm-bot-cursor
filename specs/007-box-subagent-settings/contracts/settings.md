# Contract: Settings → Computer (Shell + Computer use)

**Owners:** DH Client / Web · DH Runtime (settings projection) · DH Verifier · DH Architect (Remotes stamp)
**Acceptance:** Spec FR-004, FR-005, FR-010, FR-016 · US3 · SC-003, SC-004
**Evidence:** `verifier/evidence/settings/` (SO 11+12)

## Intent

Expose Global Settings → **Computer** with rows (or clearly labeled control groups) labeled **Shell** and **Computer use** for the daily paths in Stories 1–2. Chrome polish toward Grok-easy for those paths only — **not** a substitute for Shell/box or computerUse Verifier proofs.

## Host / Client obligations

| Obligation | Pass bar |
|------------|----------|
| Section | Global Settings → **Computer** (locale-owned English) |
| Shell row | Visible **Shell** row or clearly labeled control group |
| Computer use row | Visible **Computer use** row or clearly labeled control group |
| Scope | Global Settings required; per-agent gear alone fails FR-016 |
| Coupling | SC-003 Pass does **not** grant SC-001 or SC-002 (FR-005 / SC-004) |
| Out of Pass chrome | Update/Reset/box-doctor/full catalog / billing / voice / user machines not required (FR-010) |
| Shell row behavior | **PO:** read-only readiness sufficient (mutate optional beyond Pass) |

**Architect Path A:** research R4 — Client `settings.section` Computer over Host settings document / Remotes.

## Electron obligations

| Obligation | Pass bar |
|------------|----------|
| Main | No Computer-settings product SoT on Node IPC |
| Data plane | Settings mutate/list via Host HTTP/WS |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| SC-003 | Both **Shell** and **Computer use** visible under **Computer** |
| SC-004 | Phase Fail if only settings present without SC-001 and SC-002 |
| Evidence | Committed under `verifier/evidence/settings/` + PR embeds |
| Unit/jsdom alone | Fail |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Rows only under per-agent gear | Fail FR-016 |
| Wrong section labels | Fail SC-003 |
| Claiming settings-alone = Phase 7 Done | Fail SC-004 |
