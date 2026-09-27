# Contract: Shell↔Host topology handshake

**Owners (scripts):** DH Electron + DH Verifier
**Criteria owner:** DH Architect ([architecture.md](../architecture.md))
**Acceptance text:** Spec FR-013, SC-007
**Gate:** Must Pass before product SC-001…SC-006 may mark phase Done

## Preconditions

- Desktop app build under test uses Desktop Host profile (`$DSH_HOME/profiles/desktop`).
- No parallel Electron messaging bus handlers for bot/mailbox traffic.

## Pass criteria (all required)

1. **Spawn:** Electron Main starts exactly one Desktop Host child with `ELECTRON_RUN_AS_NODE` (or documented equivalent).
2. **IPC lifecycle-only:** Child emits valid `ready` with `url: string` (optional `injections`) over Node IPC; no application chat/mailbox payloads on IPC.
3. **Document origin:** Primary window main frame loads `dsh-app://app` (or `/` under that scheme); remote/shell frames cannot exercise privileged preload APIs.
4. **Authenticated data plane:** After ready, renderer reaches Host HTTP and ≥1 authenticated WebSocket/stream against the reported URL; shell forwards HTTP without putting provider API keys in renderer storage.
5. **Shutdown:** Ordered stop yields Host `shutdown-complete` (or clean exit) without a second messaging bus.
6. **Negative:** Fake “mailbox” / “bot message” over Electron IPC is rejected or impossible (no such Main handler).

## Evidence

- Scripted log of spawn → `ready` → authenticated Host round-trip → shutdown.
- One screenshot or trace capturing `ready` + successful authenticated round-trip.

## Notes on “framed pipes”

Program freeze text mentions framed pipes. Plan + Architect adopt **shipped** IPC lifecycle + HTTP/WS data plane for Verifier scripts (research R1). Failures that demand a reintroduced framed-pipe stack are out of scope for this contract unless PO/Lead reopens topology.

## Non-goals

- Product bot create, mailbox, or chat acceptance (separate contracts).
- Implementing FramePipe transport.
