# Scenario 3 — Agent vs user memory layers

**Status:** Host layer enforcement (T027) + orthogonality Host/Client check (T029) documented; full SC-005 / SC-010 Desktop Pass stamp is **T030**
**Owners:** DH Runtime (Host catalog isolation) · DH Client/Web (layer-distinguishable UI — T028 on tip) · DH Verifier (this recipe + SC stamp — T030)
**Linear:** [MOH-265](https://linear.app/momadhoun/issue/MOH-265) (T027) · Epic [MOH-228](https://linear.app/momadhoun/issue/MOH-228)
**Acceptance slice:** T027 Host `layer=agent` keyed by `botId` + `layer=user` account-wide · T029 orthogonality check (FR-017 / SC-010) · T030 completes Desktop SC-005 / SC-010 with FR-011/012 evidence
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 3
**Contract:** [../contracts/layers.md](../contracts/layers.md)
**ADR:** `MzM-Docs/adr/agent-vs-user-memory-layers.md`
**Architect locks:** Host Memory catalog SoT; agent isolation + user sharing; kinds × layers orthogonal; transcript ≠ either layer; no Electron Main memory bus

## Measurable Done

| Check | Owner task | Pass bar | Status |
|-------|------------|----------|--------|
| Host agent isolation | T027 | Bot B `listMemories(botId=B)` MUST NOT include A’s agent-layer rows as B’s | **measured:** Host vitest `US5 T027` (team + persistence) |
| Host user sharing | T027 | Same user-layer row available in A and B contexts after save **and** after Host restart | **measured:** same |
| Transcript ≠ layer | T027 | Pass path uses Host catalog `memory-*` ids — not chat transcript substitution | **measured:** same |
| Orthogonality (Host) | T029 | Host allows any kind on either layer; **no** kind→layer lock tables as Pass requirements | **measured:** see Orthogonality check below |
| Orthogonality (Client) | T029 / T028 | Client write/browse does not require kind→layer locks for Pass | **measured:** `TeamAction` write draft picks kind and layer independently (FR-017); browse filter is layer-only — no kind→layer lock table |
| SC-005 Desktop | T030 | Agent isolation + user sharing after save + restart/recall with FR-011/012 evidence | Open — T030 |
| SC-010 Desktop | T030 | No kind→layer lock required for Pass; evidence under `evidence/scenario-3/` | Open — T030 |

---

## Orthogonality check (T029 / FR-017 / SC-010)

**Rule:** `kind: profile|log|note` and `layer: agent|user` are independently chosen. Pass MUST NOT require a kind→layer lock table (for example “profile only on user”).

| Kind × layer | Host `writeMemory` | Host list / inject eligibility |
|--------------|--------------------|--------------------------------|
| profile × agent | Allowed | Agent-scoped by `botId` |
| profile × user | Allowed | Account-wide |
| log × agent | Allowed | Agent-scoped by `botId` |
| log × user | Allowed | Account-wide |
| note × agent | Allowed | Agent-scoped by `botId` |
| note × user | Allowed | Account-wide |

**Host confirmation (T029 Host half):** Agent Teams `writeMemory` validates kind and layer independently (`requiredMemoryKind` / `requiredMemoryLayer`); journal fold rejects only empty content and illegal layer/`botId` pairing — never “kind X requires layer Y”. Focused vitest `US5 T027: listMemories isolates agent by botId and shares user across bots` writes all three kinds on agent **and** all three kinds on user in one Team.

**Client confirmation (T029 Client half):** Desktop Web `WriteMemoryDraft` requires independent `kind` and `layer` fields (`TeamAction.tsx` — FR-017 orthogonal); Save is disabled only when either is empty or content is blank — never when a kind/layer pair is “disallowed.” Browse filter is `all|agent|user` only. No Client kind→layer lock table exists as a Pass requirement. Verifier SC-010 Pass does **not** require exercising all six combinations on Desktop — ≥1 agent-scoped + ≥1 user-scoped fact with kinds distinguishable across the phase is enough (contract / SC-010).

**Fail conditions:** Requiring profile-only-on-user (or any fixed kind→layer map) for Pass; collapsing layers into one undifferentiated store.

---

## Host-only rehearsal (T027 — supporting; not alone SC-005 Done)

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/persistence.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/projection-events.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/memory-bind.spec.ts -t 'isolates agent-layer'
```

Expect: agent isolation + user sharing + restart survival + `memoryEligibleForBot` unit + inject compose isolation. Does **not** stamp SC-005 / SC-010 Done without T030 Desktop evidence.

---

## Desktop steps (T030 — outline; FR-011/012 required)

**Prerequisites:** ≥2 bots; Host T027 on tip; Client layer-distinguishable UI (T028); Scenario 1/2 foundations as needed.

1. Save an **agent-scoped** fact on bot A → open bot B agent memory → A’s agent fact is **not** listed as B’s.
2. Save a **user-scoped** fact → available in both A and B contexts.
3. Restart/reload Desktop → isolation and sharing still hold.
4. Optionally write different kinds on either layer (SC-010).
5. Capture desktop visual evidence → `verifier/evidence/scenario-3/` (commit + PR embed).

**Expected:** SC-005, SC-010.

Evidence directory and Pass stamp: **T030**.

---

## Explicit non-goals (this recipe)

- Rewriting the ADR
- Grok chrome for layer UX
- Requiring all six kind×layer combinations on Desktop for Pass
- Scenario 5 full replay (T033)
- Marking SC-005 / SC-010 Done before T030 Desktop stamp

---

## Rerun (idempotent)

```sh
# Host (T027 / T029 Host half)
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'US5 T027'
pnpm exec vitest run packages/experimental/agent-team/tests/persistence.spec.ts -t 'US5 T027'

# Desktop (required for SC-005 / SC-010 Done — T030)
DISPLAY=:1 DSH_DESKTOP_OPEN_DEVTOOLS=0 pnpm run start:desktop
# then: agent save on A → check B → user save → both contexts → restart → evidence/scenario-3/
```
