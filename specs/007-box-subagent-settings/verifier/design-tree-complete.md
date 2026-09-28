# T001 — Design tree complete (Setup stamp)

**Status:** Confirmed 2026-09-28
**Owner:** DH Spec
**Feature:** `specs/007-box-subagent-settings`
**Linear:** [MOH-357](https://linear.app/momadhoun/issue/MOH-357) · Setup [MOH-356](https://linear.app/momadhoun/issue/MOH-356) · epic [MOH-350](https://linear.app/momadhoun/issue/MOH-350)
**Project:** DeepSeek Harness - Cursor (`P-MOH-2`) only — never GrokBot
**Analyze:** [MOH-355](https://linear.app/momadhoun/issue/MOH-355) Done · PR [#236](https://github.com/mohzmadhoun/dsh-mzm-bot-cursor/pull/236) Pass · implement unlock = Y

## Present (required)

| Artifact | Path |
|----------|------|
| Spec | [../spec.md](../spec.md) |
| Plan | [../plan.md](../plan.md) |
| Research | [../research.md](../research.md) |
| Data model | [../data-model.md](../data-model.md) |
| Quickstart | [../quickstart.md](../quickstart.md) |
| Tasks | [../tasks.md](../tasks.md) |
| Analyze | [../analyze-report.md](../analyze-report.md) |
| Requirements checklist | [../checklists/requirements.md](../checklists/requirements.md) |
| Contracts index | [../contracts/README.md](../contracts/README.md) |
| Shell/box contract | [../contracts/shell-box.md](../contracts/shell-box.md) |
| computerUse contract | [../contracts/computer-use.md](../contracts/computer-use.md) |
| Settings contract | [../contracts/settings.md](../contracts/settings.md) |
| Non-goals contract | [../contracts/non-goals.md](../contracts/non-goals.md) |
| Evidence dirs | `verifier/evidence/{shell-box,computer-use,settings}/` |

## Implementer start

1. [contracts/README.md](../contracts/README.md) — Path A + clarify + PO locks index
2. [research.md](../research.md) R0–R6 / [plan.md](../plan.md) Architect Path A
3. [box-computer-seam-locks.md](./box-computer-seam-locks.md) (T005) — binding seam locks
4. Verifier recipe home (`verifier/README.md`) = **T006** — **DH Verifier owns** (Spec does not draft)

## Out of this stamp

- No Foundational product code (T007+)
- No rewrite of `specs/001`–`006`
- No `MzM-Docs/` edits
