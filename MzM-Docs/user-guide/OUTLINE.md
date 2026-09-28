# MzM Bot Desktop — User Guide Outline

**Product:** MzM Bot on DeepSeek Harness (Electron Desktop)
**Audience:** Operators / builders using the shipped Desktop app
**Scope:** Features delivered in plan phases **P1–P7** (all Done on master)
**Artifact:** `MzM-Docs/user-guide/MzM-Bot-Desktop-User-Guide.pdf`
**Screenshots:** Real Desktop captures under `MzM-Docs/user-guide/screenshots/` (+ `/opt/cursor/artifacts/user-guide/`)

---

## Document shape

1. **Cover** — product name, short tagline, version/date
2. **What this app is** — multi-bot Desktop agent workspace (Host + thin Electron shell)
3. **Getting started** — launch, first window, create a session
4. **Bots & chat (P1–P2)** — create bots, models, personas, messaging
5. **Skills (P3)** — attach / run skills
6. **Routines (P4)** — cron create / pause / resume
7. **Memory (P5)** — profile / log / note + recall
8. **Connectors & trust (P6)** — install connector, auth, event routines, deny path
9. **Computer & Shell (P7)** — Settings → Computer, Shell/box readiness, computer use
10. **Settings tour** — where chrome lives; what is Host SoT vs Client
11. **What is not in this build** — Out inventory (voice, group channels, …)
12. **Troubleshooting** — common readiness states, where evidence lives

Target length: **~12–18 pages**, screenshot-heavy, short captions.

---

## Screenshot plan (minimum set)

| # | File slug | Feature | Source preference |
|---|-----------|---------|-------------------|
| 01 | `home-new-session` | Home / New Session | Fresh Desktop |
| 02 | `session-composer` | Chat composer / session | Fresh Desktop |
| 03 | `bots-sidebar` | Bot list / identity chrome | Fresh Desktop |
| 04 | `settings-overview` | Settings shell | Fresh Desktop |
| 05 | `settings-computer` | Settings → Computer (Shell + Computer use) | Fresh Desktop |
| 06 | `shell-ready` | Shell readiness Ready | Fresh or P7 evidence |
| 07 | `shell-tool-success` | Shell/box tool success | P7 evidence OK |
| 08 | `computer-use-observation` | computerUse observation | P7 evidence OK |
| 09 | `computer-use-handoff` | Parent handoff | P7 evidence OK |
| 10 | `skills-or-routines` | Skills and/or Routines pane | Fresh if visible; else note + prior evidence |
| 11 | `connectors-or-memory` | Connectors / Memory surface | Fresh if visible; else prior evidence |
| 12 | `trust-or-credentials` | Trust / credential UX if reachable | Best-effort |

If a surface needs API keys or long setup, use committed Verifier evidence screenshots and label them as product UI from Verifier Pass (not mockups).

---

## Writing rules (PO recommendations)

- Plain operator language; no Spec Kit jargon in body (P1/P7 only as light footnotes)
- One job per section; short “How to” steps
- Every major feature page has ≥1 screenshot
- Call out Host SoT: Shell readiness and Computer settings come from Host, not Electron Main
- Explicit **Out of scope** page so readers don’t hunt for voice/group/user-machines
- PDF generated from Markdown + screenshots via `fpdf2` (reproducible script)

---

## Delivery

1. This outline (`OUTLINE.md`)
2. Screenshots committed under `screenshots/`
3. Source Markdown `MzM-Bot-Desktop-User-Guide.md`
4. Build script `build-pdf.py`
5. Output PDF `MzM-Bot-Desktop-User-Guide.pdf`
6. PR on branch `cursor/mzm-user-guide-pdf-15d6`
