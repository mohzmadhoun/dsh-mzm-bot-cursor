# Evidence — Scenario 1 (Discover / load)

**Recipe:** [../../scenario-1-discover-load.md](../../scenario-1-discover-load.md)
**Acceptance:** SC-001 · FR-012
**Linear:** T035 [MOH-182](https://linear.app/momadhoun/issue/MOH-182) · T019 [MOH-166](https://linear.app/momadhoun/issue/MOH-166)

## Required filenames (FR-012)

| Artifact | Content |
|----------|---------|
| `01-discovery-thin-pack.png` (or `.webp`) | Discovery/library showing `MzM thin pack` / `mzm-thin-pack` |
| `02-available-to-attach.png` (or recording segment) | Skill in available-to-attach / load-complete state |
| `03-post-reload.png` (or recording segment) | Same after leave/return **or** app restart/reload |
| Optional `scenario-1-walkthrough.mp4` / `.webm` | Short recording covering Steps A–C |
| `VERDICT.txt` | Filled stamp when product SC is claimed |

Unit/jsdom alone **fails**. Copy walkthrough copies under `/opt/cursor/artifacts/` when Cloud Agent Verifier runs (standing order 11).

## Placeholder policy

This directory is the FR-012 home for Scenario 1. Keep expected names stable so Scenario 5 full replay can point here without renaming.
