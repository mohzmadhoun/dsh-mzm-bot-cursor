# Contract: Event-triggered routine (webhook harness)

**Owners:** DH Runtime (Routine catalog + harness wake) · DH Electron / Client (pane) · DH Verifier (SC-002)
**Acceptance:** Spec FR-004, FR-005, FR-018 · US2 · SC-002, SC-008 · research R3

## Interface (logical)

| Operation | Caller | Provider | Result |
|-----------|--------|----------|--------|
| Create event routine | Client | Host Routine catalog | Row with `triggerKind=event`, non-empty intent, harness family |
| List / project | Client | Host | Pane shows event vs cron distinguishable |
| Deliver harness event | Verifier / external | Host webhook harness | Match → wake if active |
| Pause / resume | Client | Host (P4) | Paused suppresses event fire |
| Observe fire | Client | Host `lastRunAt` / fire indicator | Visible after ≥1 fire |

## Rules

1. Empty intent rejected with clear user-visible reason.
2. Pass event family = **webhook harness / Verifier fixture** only; live Slack/GitHub/Linear/email **not** required.
3. Fire = Host wake applying intent to the bot (P4 fire shape); LLM wording not scored.
4. Manual “Run now” alone is **insufficient** for Pass — harness delivery required.
5. Paused interval: matching events MUST NOT record fire.
6. Cron routines from P4 remain usable (SC-008); do not rewrite `specs/004`.

## Verifier

| Check | Pass bar |
|-------|----------|
| SC-002 | Create + harness fire + last-run; pause suppress |
| SC-008 | Cron still works; event additive |
| FR-014/015 | Desktop media committed + PR embeds |
| FR-018 | Pass path uses harness — not gated on live families |

## Failures

| Condition | Required behavior |
|-----------|-------------------|
| Requiring live family for Pass | Fail clarify lock |
| Fire only via manual run | Fail SC-002 |
| Replacing / breaking P4 cron | Fail SC-008 / FR-011 |
| Main process as event SoT | Fail seam honesty |
