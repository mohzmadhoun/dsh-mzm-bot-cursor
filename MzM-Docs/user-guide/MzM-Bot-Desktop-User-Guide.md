# MzM Bot Desktop - User Guide

**How to use the features shipped in P1-P7**
Version: 2026-09-28 · DeepSeek Harness Desktop

---

## 1. What this app is

MzM Bot is a Desktop agent workspace: you create bots, chat with them, attach skills, schedule routines, store memory, connect tools, and (when ready) run sandboxed Shell and computer-use helpers.

Architecture you can ignore day-to-day: a thin Electron window talks to a local Desktop Host. Bot state, tools, Shell readiness, and Computer settings live on the Host - not in the window chrome alone.

---

## 2. Getting started

1. Launch Desktop (`pnpm run start:desktop` from a built checkout, or your usual packaged app entry).
2. On the home screen, choose a workspace and click **New Session**.
3. Type a task in the composer and send. Progress and the final answer appear in the same session.

![Home - New Session](screenshots/01-home-new-session.png)

![Session composer](screenshots/02-session-composer.png)

---

## 3. Bots & chat (P1-P2)

**What you get**

- Create bots from the Agent Team / bots UI
- Assign different models per bot
- Edit persona fields: name, job, voice, anti-jobs, avatar, sidebar section
- Delete with confirmation
- Chat with progress updates and a final result in-session

**How**

1. Open Agent Team / bots from the sidebar or plugins.
2. Create a bot, set its model and persona, save.
3. Start a session and message the bot (or a small team).

![Bots / Agent Team](screenshots/03-bots-sidebar.png)

![Persona saved](screenshots/03b-persona-saved.png)

![Bot created](screenshots/03c-bot-created.png)

---

## 4. Skills (P3)

**What you get**

- Discover a thin managed skill pack
- Attach a skill to a specific bot
- Author a simple skill (name + body) and run it

**How**

1. Open the skills discovery surface for a bot.
2. Attach a managed skill - it stays on that bot only.
3. Or author a skill, save, then run it from the bot.

![Skills discovery](screenshots/10-skills-discovery.png)

![Attach skill](screenshots/10b-skills-attach.png)

![Skill run active](screenshots/10c-skills-run.png)

---

## 5. Routines - cron (P4)

**What you get**

- Create cron routines listed in a pane
- Pause / resume without losing the definition
- See fire / last-run status in the UI

**How**

1. Open the Routines pane from Agent Team.
2. Create a cron routine with a clear schedule.
3. Pause when you want silence; resume when you want it to fire again.

![Routines pane](screenshots/11-routines-pane.png)

![Routine created & active](screenshots/11b-routines-create.png)

![Pause / resume](screenshots/11c-routines-pause.png)

---

## 6. Memory (P5)

**What you get**

- Write **profile**, **log**, and **note** facts
- Recall after restart
- Agent-layer vs user-layer memory (per the project ADR)

**How**

1. Open the Memory surface for a bot / team.
2. Add a profile fact, a log line, or a note.
3. Leave and return (or restart) - recall should still show them.

![Memory surface](screenshots/12-memory-surface.png)

![Profile listed](screenshots/12b-memory-profile.png)

![Log listed](screenshots/12c-memory-log.png)

---

## 7. Connectors, event routines & trust (P6)

**What you get**

- Connector catalog -> install -> auth -> tool success
- Event-triggered routines (beyond cron)
- Permission / deny path when a tool is not allowed
- Credentials stay off the session dump

**How - connector**

1. Open Connectors catalog.
2. Install a connector, complete auth until Ready.
3. Run a tool call and confirm success in the UI.

![Connectors catalog](screenshots/13-connectors-catalog.png)

![Connector installed](screenshots/13b-connector-installed.png)

![Auth ready](screenshots/13c-connector-auth.png)

**How - trust deny**

1. Trigger a permission gate.
2. Deny - the tool stays blocked (not a silent allow).

![Permission gate](screenshots/14-trust-permission-gate.png)

![Denied / blocked](screenshots/14b-trust-denied.png)

**How - event routine**

1. Create an event-triggered routine from the event form.
2. Confirm it appears listed; pause still suppresses fires.

![Event routine created](screenshots/15-event-routine.png)

---

## 8. Computer, Shell & computer use (P7)

**What you get**

- Global **Settings -> Computer** with **Shell** and **Computer use** rows
- Shell readiness: clear not-ready / starting vs **Ready** (local sandbox)
- One local sandboxed Shell/box tool path
- computerUse-class subagents: screenshot observation + handoff to the parent (interactive browser not required for Pass)

**How - settings**

1. Open Settings (gear).
2. Open **Computer**.
3. Read Shell readiness; toggle Computer use when you want that path available.

![Settings overview](screenshots/04-settings-overview.png)

![Settings -> Computer](screenshots/05-settings-computer.png)

![Computer rows](screenshots/05b-settings-computer-rows.png)

**How - Shell**

1. Wait until Shell shows **Ready** (local sandbox).
2. Ask a bot to run a local shell task; success should show in the tool card - not while status is not-ready/starting.

![Shell ready](screenshots/06-shell-ready.jpg)

![Shell tool success](screenshots/07-shell-tool-success.jpg)

**How - computer use**

1. Enable Computer use in Settings -> Computer.
2. Ask for a computerUse-class observation (screenshot).
3. Expect a parent handoff - not a claim that chrome alone finished the task.

![Computer use observation](screenshots/08-computer-use-observation.png)

![Parent handoff](screenshots/09-computer-use-handoff.png)

---

## 9. Plugins & more chrome

The Plugins page lists Host-backed capabilities (Agent Teams, Shell, Subagent, Web search, …). Turning a plugin on wires Host behavior; it is not a substitute for Settings -> Computer readiness.

![Plugins](screenshots/12-any-extra-useful.png)

---

## 10. What is not in this build

These stay out until a later named phase:

- Voice
- Draft-first send-on-behalf
- Group channels
- User machines
- Learn-from-demo
- Billing chrome
- Full skill pack / pixel Grok catalog

Settings chrome alone is also **not** proof that Shell or computer use works - check readiness and a real tool path.

---

## 11. Troubleshooting

| Symptom | What to check |
|---------|----------------|
| Shell tools fail immediately | Settings -> Computer -> Shell readiness ≠ Ready |
| No computerUse observation | Computer use toggle On; Host provider registered |
| Connector stuck | Auth Ready state; secrets not pasted into chat |
| Routine never fires | Not paused; cron vs event trigger matches how you created it |
| Memory missing after restart | Confirm you wrote profile/log/note on the Host memory surface |

---

## 12. Screenshot sources

- Fresh Desktop captures (2026-09-28): home, session, bots sidebar, Settings, Computer, Plugins
- Phase Verifier Pass evidence (committed product UI): bots/persona, skills, routines, memory, connectors/trust, Shell, computerUse

---

*MzM Bot · DeepSeek Harness · P1-P7 complete*
