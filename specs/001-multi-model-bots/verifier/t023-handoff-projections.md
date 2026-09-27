# T023 Host projections for handoff observability — Verifier proof recipe

**Status:** Host session/RPC handoff projection proof (not Scenario 3 / SC-003 Pass — Desktop chat surfaces are T024; full Scenario 3 recipe is T025; Electron bus guard is T026).
**Owners:** DH Runtime (implementation) · DH Verifier (rerun + Pass/Fail)
**Acceptance slice:** Spec FR-005 — Expose handoff observability to Client via Host session/RPC projections (not Main-synthesized IPC) in `packages/experimental/agent-team/src/projection.ts` and `packages/experimental/client-ui-agent-team/` ([contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)).
**API:** `projectMailboxHandoffs` / `TeamView.handoffs` / `agentTeams/view` under `@deepseek-ai/dsh-experimental-agent-team`; Client panel under `@deepseek-ai/dsh-experimental-client-ui-agent-team`
**Branch:** `cursor/p1-t023-handoff-proj-92fa` (base `master` @ T022)

## What this proves

1. After Bot A→B Host mailbox send, `agentTeams/view` returns `handoffs: HostMailboxMessage[]` reconstructed from Lead + target Session logs (same product fields as T022).
2. `projectMailboxHandoffs` folds `deliveryState` (`queued` | `delivered` | `visible-pending` | `acted`) and always sets `source: { kind: 'host-mailbox' }` — never Electron IPC provenance.
3. Client Agent Team panel consumes `TeamView.handoffs` and renders delivery state + Host-only source markers (`data-team-handoff`, `data-delivery-state`, `data-handoff-source`).
4. Observability path is Host session/RPC only — no Main-synthesized mailbox IPC payloads.

Does **not** prove SC-003 Desktop chat-surface handoff polish (T024). Does **not** add the T025 Scenario 3 recipe or T026 Electron bus regression guard.

## Preconditions

- [ ] Checkout on `cursor/p1-t023-handoff-proj-92fa` (or merge-base including T023)
- [ ] `pnpm install` complete
- [ ] Node `^22.19 || >=24`
- [ ] No provider API secrets required (mock LLM in unit tests)
- [ ] T021 send path + T022 durable product fields present on base

## Commands (rerunnable)

```sh
./node_modules/.bin/vitest run \
  packages/experimental/agent-team/tests/mailbox-handoff-projection.spec.ts \
  packages/experimental/client-ui-agent-team/tests/team-action.client.spec.tsx \
  -t 'T023|handoff|empty handoffs'
```

Optional Remote view + topology negative (no Electron mailbox bus):

```sh
./node_modules/.bin/vitest run packages/experimental/agent-team/tests/team.spec.ts \
  -t 'Team Remote API'

./node_modules/.bin/vitest run apps/desktop/tests/topology-handshake.spec.ts \
  -t 'rejects fake mailbox'
```

## Pass criteria

- Focused Host handoff-projection + Client handoff render suites green.
- Assertions cover `TeamView.handoffs` product fields, Host-only `source`, `visible-pending` / `acted` folds, and Client `data-team-handoff` markers.
- Optional topology negative remains green (no Main mailbox channel).

## Evidence home

Record stdout + SHA under [evidence/t023-handoff-projections/](./evidence/t023-handoff-projections/) when Verifier runs Pass/Fail.

## Related

- Contract: [../contracts/host-mailbox-1to1.md](../contracts/host-mailbox-1to1.md)
- Data model: [../data-model.md](../data-model.md) (Host mailbox message)
- T021 send path: [t021-mailbox-send.md](./t021-mailbox-send.md)
- T022 durable fields: [t022-mailbox-persist.md](./t022-mailbox-persist.md)
- Scenario 3 (T025): `scenario-3-mailbox.md` (when present)
