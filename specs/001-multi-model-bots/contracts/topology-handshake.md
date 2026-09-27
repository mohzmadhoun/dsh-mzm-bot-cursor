# Contract: Shell↔Host topology handshake

**Owners (scripts):** DH Electron + DH Verifier
**Criteria owner:** DH Architect ([architecture.md](../architecture.md))
**Acceptance text:** Spec FR-013, SC-007
**Gate:** Must Pass before product SC-001…SC-006 may mark phase Done
**PO lock:** Electron shell + RunAsNode Desktop Host; IPC lifecycle-only; data plane = shipped HTTP/WS + `dsh-app://` — **not framed pipes as product**

## Preconditions

- Desktop app build under test uses Desktop Host profile (`$DSH_HOME/profiles/desktop`).
- No parallel Electron messaging bus handlers for bot/mailbox traffic.
- No framed-pipe app I/O requirement for Pass.

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

## Non-goals

- Product bot create, mailbox, or chat acceptance (separate contracts).
- Reintroducing FramePipe / framed-pipe transport as product.
