# Contracts: Phase 7 — Computer / box + subagent parity + settings chrome

**Feature**: `specs/007-box-subagent-settings`
**Date**: 2026-09-28
**Audience**: DH Runtime, DH Electron, DH Client/Web, DH Verifier, DH Architect
**Non-goal**: Implementation code; these are interface/acceptance contracts for tasks.

## Implementer start here (Architect Path A locked)

1. Read this contracts index, then the four contract files below.
2. Honor **clarify locks** — do not reopen:
   - Global Settings → **Computer**; rows **Shell** + **Computer use**
   - computerUse Pass = screenshot-only (or equiv.) + parent handoff; interactive browser NOT required
   - Box readiness = clear not-ready/starting ≠ ready; exact string not scored
   - Evidence slices `shell-box/` · `computer-use/` · `settings/`
3. Honor **Architect Path A** in [research.md](../research.md) (sandboxed Host Shell; `ctx.computerUse` + subagent spawn; Client Computer section over Host settings; host-protocol exclusions) — do not invent a competing SoT.
4. Honor **PO simplest-path**: Host Pass fixture OK if Cua unreachable; Shell settings row may be read-only readiness.
5. Predecessors: [001](../../001-multi-model-bots/contracts/) … [006](../../006-connectors-mcp-events-trust/contracts/) — do not rewrite.

Cross-refs: [spec.md](../spec.md) · [plan.md](../plan.md) · [data-model.md](../data-model.md) · [research.md](../research.md) · Clarify PR #230 · Architect MOH-353 comment `292420d5-…`

| Contract file | Seam |
|---------------|------|
| [shell-box.md](./shell-box.md) | Local sandboxed Shell tool success + readiness (FR-001, FR-002, FR-011) |
| [computer-use.md](./computer-use.md) | computerUse-class screenshot + parent handoff (FR-003) |
| [settings.md](./settings.md) | Settings → Computer rows Shell + Computer use (FR-004, FR-005, FR-016) |
| [non-goals.md](./non-goals.md) | Explicit Out / SC-005 / no Main bus / no 001–006 rewrite |

**Cross-cutting:** FR-013 desktop screenshots/recordings + FR-014 committed `verifier/evidence/{shell-box|computer-use|settings}/` + PR embeds apply to every GUI scenario. Unit/jsdom alone fails GUI Pass. Chrome polish ≠ Verifier substitute (SC-004).

**Seam honesty (Architect Path A):** Host sandboxed Shell + computerUse + subagent + settings SoT; Client projects via HTTP/WS; Electron Main has no `shell-exec` / `box-ready` / `computer-use-control` / `computer-screenshot` / `computer-settings-mutate` bus.
