# Contract: Rename + preset avatar

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-004, FR-005 · SC-003 · US2

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Rename bot | Existing Bot + new displayName N2 | Sidebar and overview show N2; N1 is no longer current |
| Set / change avatar | Preset shape and/or color marker | Marker shown in sidebar and overview |
| Restart / reload | Previously saved name + avatar | Values remain |

## Host obligations

- Persist `displayName` and avatar marker on Bot identity.
- Duplicate display names allowed (not a Pass failure).
- Electron Main MUST NOT invent avatar/name stores.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Rename + avatar | SC-003 — sidebar and overview show new name and preset marker after restart/reload |
| Avatar kind | Preset shape and/or color sufficient; **image-file upload not required** |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Empty displayName on rename | Reject or block save; prior name unchanged |
| Unsupported custom image upload | Out of Pass scope; MUST NOT block preset-marker Pass |

## Non-goals

Arbitrary image-file / URL avatars for Pass; per-assistant notification settings; Grok-identical chrome.
