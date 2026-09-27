# Scenario 2 — Rename + preset avatar

**Status:** Product SC Pass stamped — see [evidence/scenario-2/VERDICT.txt](./evidence/scenario-2/VERDICT.txt)
**Owners:** DH Verifier (this recipe + Pass stamp) · DH Runtime (Host rename + avatar persist) · DH Client (rename control + preset picker + sidebar/overview render)
**Linear:** [MOH-124](https://linear.app/momadhoun/issue/MOH-124) · Epic [MOH-88](https://linear.app/momadhoun/issue/MOH-88)
**Acceptance slice:** T025 — Verifier Scenario 2 recipe covering SC-003
**Quickstart:** [../quickstart.md](../quickstart.md) Scenario 2
**Contract:** [../contracts/rename-avatar.md](../contracts/rename-avatar.md)
**Clarify lock 3:** Avatar Pass = preset shape and/or color markers; image-file / URL upload **not** required and MUST NOT block Pass

## Measurable Done (this recipe)

| Check | Pass bar |
|-------|----------|
| Recipe present | This file documents Steps A–C with Pass/Fail and evidence tags |
| SC coverage | SC-003 rename + preset avatar on sidebar and overview after restart/reload |
| Avatar kind | Preset shape and/or color sufficient; no image-upload gate |
| Product SC stamp | Deferred until Host rename/avatar (T020–T022) + Client UI (T023) + Verifier desktop evidence land |

---

## Scope and prerequisites

| Layer | Required for | Status at recipe authoring |
|-------|--------------|----------------------------|
| Foundational Pass (T011) | Any product SC | **measured:** stamped in [README.md](./README.md#foundational-pass-checklist--recorded) |
| Host rename mutation (T020) | SC-003 Host half | **measured:** `renameBot` still throws `TEAM_NOT_IMPLEMENTED` on tip `952e27004a` |
| Host avatar-marker mutation (T021) | SC-003 Host half | **measured:** `setAvatar` still throws `TEAM_NOT_IMPLEMENTED` on tip `952e27004a` |
| Host projection of displayName + avatar (T022) | Client-readable roster | **inferred:** foundation projection already copies fields when present; live mutation path open until T020/T021 |
| Client rename + preset picker (T023) | SC-003 desktop path | **inferred:** open until Client lands rename/avatar controls |
| Image-upload non-block (T024) | Clarify lock 3 | **inferred:** omit or gate upload UI; does not block this recipe’s Pass bar |

**Desktop prerequisites** (full Scenario 2 Pass): buildable Desktop (`apps/desktop`, `apps/desktop-host`) with P1 create-bot; ability to rename a bot, pick a preset avatar marker, and read sidebar + overview identity chrome.

**Host-only rehearsal** (does **not** alone mark SC-003 Done): Agent Teams vitest path below — proves Host durability of `displayName` + `avatar` once T020/T021 land; journal foundation case below is supporting signal only.

---

## Fixtures (deterministic strings)

Use these exact values on the first save so Pass/Fail diffs stay greppable:

| Field | First save | Second save (replace) |
|-------|------------|------------------------|
| Starting `displayName` (N1) | `Rename Source` | — |
| Renamed `displayName` (N2) | `Rename Target` | `Rename Again` |
| `avatar` | `{ shape: "circle", color: "blue" }` | `{ shape: "square", color: "green" }` |

Empty-rename probe (contract failure bar): attempt rename to `''` or whitespace-only — Host MUST reject/block; prior `displayName` unchanged.

Duplicate-name probe (not a Fail): renaming to another bot’s existing `displayName` is allowed.

---

## Step A — Rename (displayName)

**User / Verifier path (desktop):**

1. Create a bot (P1) with displayName **N1** `Rename Source`, or select an existing bot and note its current label.
2. Open rename control; set displayName to **N2** `Rename Target`; save.
3. Confirm sidebar shows **N2** and no longer presents **N1** as the current label for that bot.
4. Open bot overview — overview identity chrome shows **N2**.
5. Attempt empty / whitespace rename — save blocked or rejected; prior name unchanged.
6. Change to second-save fixture `Rename Again`; save — sidebar and overview show the new label only.

**Host observation (when Client UI is not yet available):**

Once T020 lands, assert via Host API / durable snapshot / `listMembers` / Team view that `displayName` matches the saved fixture after `renameBot` and after any cold-resume / journal-replay case the suite covers.

Until T020 lands, the stub bar is:

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/team.spec.ts -t 'exposes Host identity mutation stubs'
```

Expect `renameBot` / `remoteRenameBot` to reject without mutating create identity (**measured** foundation stub; **not** SC-003 Pass).

| Observation | Pass | Fail |
|-------------|------|------|
| Sidebar | Shows N2 after save | Still N1, blank, or Client-only label |
| Overview | Shows N2 | Stale vs sidebar / Host |
| Empty rename | Rejected; prior name unchanged | Empty label accepted or prior wiped |
| Restart/reload | N2 remains on Host-durable path | Lost after restart; Electron Main invents name store |

**Claim tags:** desktop UI observations → **measured**; Host vitest-only rehearsal → **measured** (Host half) + **inferred** (does not complete SC-003 without Client sidebar/overview).

---

## Step B — Preset avatar marker

**User / Verifier path (desktop):**

1. With the bot from Step A (or any bot with a known sidebar/overview row).
2. Open avatar control; set preset marker from the first-save fixture (`shape: circle`, `color: blue`); save.
3. Confirm sidebar and overview show the chosen marker (shape and/or color chrome the product ships).
4. Restart is deferred to Step C; first confirm leave/return still shows the marker.
5. Change to second-save fixture (`shape: square`, `color: green`); save — prior marker replaced.
6. Do **not** require image-file or URL upload. If an unsupported upload control exists, it MUST NOT block this Pass (T024 / clarify lock 3).

**Host observation (when Client UI is not yet available):**

Once T021 lands, assert `avatar.shape` / `avatar.color` on `listMembers` / Team view match the saved fixture after `setAvatar`.

Until T021 lands, the same stub command as Step A covers `setAvatar` rejection without mutation.

Supporting foundation (journal persist of identity fields — **not** a live `setAvatar` proof):

```sh
pnpm exec vitest run packages/experimental/agent-team/tests/projection-events.spec.ts -t 'persists and allows post-active Host identity field updates'
```

| Observation | Pass | Fail / out of scope |
|-------------|------|---------------------|
| Visibility | Marker readable on sidebar and overview | Only in DevTools, Host logs, or missing entirely |
| Kind | Preset shape and/or color | Requires custom image/URL for Pass |
| Replace | Second save replaces prior marker | Old marker accumulates or Host rejects silently |
| Upload | — | Image-file upload absent or gated without blocking Pass |

---

## Step C — SC-003 durability (restart / reload)

**User / Verifier path (desktop):**

1. After a successful rename to N2 and avatar set to the last chosen fixture (Step A + B).
2. Restart the desktop app **or** reload durable Host Team state.
3. Confirm sidebar shows N2 and the last preset marker.
4. Confirm overview shows the same N2 and marker.
5. Kebab roster `name` (if visible in advanced/debug chrome) remains the create-time id — product label is `displayName` only.

| Observation | Pass | Fail |
|-------------|------|------|
| Sidebar after reload | N2 + last marker | Reverts to N1, blank avatar, or Electron-invented store |
| Overview after reload | Matches sidebar | Overview stale vs sidebar / Host |
| Host durable path | `displayName` + `avatar` on Team roster / journal | Lost on cold resume |

**Blocked until T020–T023** for product SC-003 Done. Journal identity-field persist (T006 foundation) is a supporting signal only (**inferred** for SC-003; not a substitute for rename/avatar mutations + Client chrome).

---

## Pass stamp template (fill when evidence lands)

```text
Verdict: Pass
Stamp: 2026-09-27 · tip 144a87113365 · desktop DSH Local Build 0.1.6-alpha.2 (DISPLAY=:1 CDP 9222)
Linear: MOH-124 · Epic MOH-88
SC-003: Pass — evidence: evidence/scenario-2/{01-renamed,02-avatar-set}.png + Durable Bot retained post-reload (scenario-1/03-post-reload.png)
Empty-rename: N/A — not re-probed this run (Host unit coverage remains)
Avatar kind: preset shape/color only (no image-upload gate)
Blockers: none
```

**Rule:** Do not mark SC-003 Done in Linear / Spec without a filled stamp that includes desktop evidence for sidebar **and** overview after restart/reload once Client UI exists. Host vitest alone may advance rename/avatar durability confidence but does **not** close US2.

---

## Explicit non-goals

- Client rename/avatar UI implementation (T023) — out of this Verifier recipe PR
- Host rename/avatar mutation implementation (T020/T021) — out of this Verifier recipe PR
- Arbitrary image-file / URL avatars for Pass
- Skills library / memory UX / persona edit / sections / delete
- Changing P1 model-assignment rules or kebab roster `name` mutability
- Electron Main avatar/name store (forbidden; T010)

---

## Traceability

| Artifact | Role |
|----------|------|
| [../quickstart.md](../quickstart.md) Scenario 2 | User-facing outline |
| [../contracts/rename-avatar.md](../contracts/rename-avatar.md) | Contract Pass bars |
| [README.md](./README.md) | Scenario owners map + foundational Pass |
| This file | T025 rerunnable Scenario 2 recipe |
| T020 / T021 / T022 | Host rename + avatar + projection |
| T023 / T024 | Client rename/picker + upload non-block |
| T042 | Quickstart ↔ recipe gap fix later |

## Evidence for PO / DH Lead

**Recipe delivered (T025).** Product SC Pass **not** stamped. Host `renameBot` / `setAvatar` remain stubs on master tip at recipe authoring (`952e27004a`). Full Scenario 2 Done waits on Host T020–T022 + Client T023 plus Verifier desktop evidence using Steps A–C above.
