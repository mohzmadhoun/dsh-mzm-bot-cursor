# Contract: computerUse-class subagent path

**Owners:** DH Runtime / Desktop Host · DH Client · DH Verifier · DH Architect (provider/subagent stamp)
**Acceptance:** Spec FR-003, FR-015 · US2 · SC-002
**Evidence:** `verifier/evidence/computer-use/` (SO 11+12)

## Intent

Prove one **computerUse-class** subagent path that produces ≥1 user-visible screenshot (or equivalent GUI observation artifact) **and** a parent-visible handoff/result indicator. Capability class = box desktop/browser GUI observation. Product runtime name need not equal Grok `computerUse`.

## Host obligations

| Obligation | Pass bar |
|------------|----------|
| Ready backend | Box/computer backend ready for observation path |
| Subagent path | One computerUse-class child/path started from a parent bot |
| Observation | ≥1 user-visible screenshot or equivalent GUI artifact |
| Parent handoff | Visible progress/result indicator in parent chat/session |
| Interactive browser | **Not** required for Pass |
| Logging | Model-visible observation/handoff reconstructable from session log |
| Provider | One `ctx.computerUse` registration — prefer Cua Driver when Verifier-reachable; else Host Pass fixture that still `register()`s |

**Architect Path A:** research R3 — `dsh-computer-use` + one provider + `dsh-subagent` + spawn-in-process + tool-subagent.

## Client / Electron obligations

| Obligation | Pass bar |
|------------|----------|
| Projection | Show observation artifact + handoff via Host HTTP/WS |
| Electron Main | No computer-use / subagent-computer product bus |

## Verifier rules

| Check | Pass bar |
|-------|----------|
| SC-002 | Screenshot (or equiv.) + parent handoff visible |
| Interactive browser | Absence does **not** fail Pass |
| Docs-only subagent list | Fail — must run a real path |
| Parent text without GUI artifact | Fail |
| Evidence | Committed under `verifier/evidence/computer-use/` + PR embeds |
| Unit/jsdom alone | Fail |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Settings chrome only | Fail SC-002 |
| Require interactive browser for Pass | Over-strict — Fail the gate |
| Electron Main as SoT | Seam violation — Fail |
| Full executor/video/CloudAgent required | Out — Fail the over-strict gate |
