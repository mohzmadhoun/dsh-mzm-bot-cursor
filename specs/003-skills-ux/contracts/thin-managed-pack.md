# Contract: Thin managed pack

**Owners:** DH Runtime (Host) · DH Client/Web under Electron (UI)
**Acceptance:** Spec FR-008 · SC-004 · US4

## User-visible operations

| Operation | Input (minimum) | Observable result |
|-----------|-----------------|-------------------|
| Open discovery on clean/shipped Desktop | Shipped thin pack | Exactly **one** managed skill listed for Pass |
| Evaluate catalog completeness | Inventory §6 / site playbooks absent | Absence does **not** fail Pass |

## Host obligations

- Ship exactly one managed skill on the Desktop profile skill mount for P3 Pass (R1).
- Do not require full managed catalog parity for acceptance.

## Verifier rules

| Check | Pass bar |
|-------|----------|
| Thin pack present | ≥1 managed skill discoverable (= the one thin-pack skill) |
| Non-goals | SC-004 — missing full catalog / learn-from-demo / plugin skills does not fail Pass |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Zero managed skills shipped | Fail FR-008 / SC-001 |

## Non-goals

Full inventory §6; learn-from-demonstration; plugin skills; expanding pack for chrome parity.
