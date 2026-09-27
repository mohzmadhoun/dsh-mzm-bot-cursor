# Contract: Sidebar sections

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-006 · SC-004 · US3

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Create named section | Non-empty section name | Section appears in sidebar |
| Assign bot to section | Bot + named section | Bot listed under that section |
| Move / unassign | Bot + target section or Unassigned | Sidebar reflects new membership |
| View unassigned bots | Bots never assigned to a named section | Appear under Unassigned/default |

## Host obligations

- Persist section names and membership across restart/reload.
- Support Unassigned/default for bots without a named section (named sections are optional overlays).
- A bot belongs to at most one named section (or Unassigned).
- Electron Main MUST NOT own section membership as a parallel store.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Named section path | SC-004 — create/use named section, assign bot, membership survives restart/reload |
| Unassigned | Bots without named assignment appear under Unassigned/default |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Empty section name | Reject create/rename of section |
| Last bot removed from section | Section may remain empty; cleanup not required for Pass |

## Non-goals

Collapse/expand chrome as Pass gate; skills grouping; folder trees beyond flat named sections + Unassigned.
