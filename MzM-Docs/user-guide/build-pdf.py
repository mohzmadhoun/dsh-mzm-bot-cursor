#!/usr/bin/env python3
"""Build MzM-Bot-Desktop-User-Guide.pdf from screenshots + structured sections."""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF
from PIL import Image

ROOT = Path(__file__).resolve().parent
SHOTS = ROOT / "screenshots"
OUT = ROOT / "MzM-Bot-Desktop-User-Guide.pdf"
ART_OUT = Path("/opt/cursor/artifacts/user-guide/MzM-Bot-Desktop-User-Guide.pdf")


class GuidePDF(FPDF):
    def header(self) -> None:
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 6, "MzM Bot Desktop - User Guide (P1-P7)", align="L")
        self.ln(8)

    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"{self.page_no()}", align="C")


def _reset_x(pdf: GuidePDF) -> None:
    pdf.set_x(pdf.l_margin)


def h1(pdf: GuidePDF, text: str) -> None:
    _reset_x(pdf)
    pdf.ln(2)
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(20, 24, 32)
    pdf.multi_cell(0, 8, text)
    _reset_x(pdf)
    pdf.ln(2)


def h2(pdf: GuidePDF, text: str) -> None:
    _reset_x(pdf)
    pdf.ln(3)
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(30, 40, 55)
    pdf.multi_cell(0, 7, text)
    _reset_x(pdf)
    pdf.ln(1)


def body(pdf: GuidePDF, text: str) -> None:
    _reset_x(pdf)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(35, 35, 35)
    pdf.multi_cell(0, 5, text)
    _reset_x(pdf)
    pdf.ln(1)


def bullets(pdf: GuidePDF, items: list[str]) -> None:
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(35, 35, 35)
    for item in items:
        _reset_x(pdf)
        if pdf.get_y() > pdf.h - pdf.b_margin - 10:
            pdf.add_page()
            _reset_x(pdf)
        pdf.multi_cell(0, 5, f"- {item}")
    _reset_x(pdf)
    pdf.ln(1)


def caption(pdf: GuidePDF, text: str) -> None:
    _reset_x(pdf)
    pdf.set_font("Helvetica", "I", 8)
    pdf.set_text_color(90, 90, 90)
    pdf.multi_cell(0, 4, text)
    _reset_x(pdf)
    pdf.ln(2)


def add_image(pdf: GuidePDF, name: str, caption_text: str, max_h: float = 95) -> None:
    path = SHOTS / name
    if not path.exists():
        body(pdf, f"[Missing screenshot: {name}]")
        return
    with Image.open(path) as im:
        w_px, h_px = im.size
    page_w = pdf.w - pdf.l_margin - pdf.r_margin
    aspect = h_px / max(w_px, 1)
    disp_w = page_w
    disp_h = disp_w * aspect
    if disp_h > max_h:
        disp_h = max_h
        disp_w = disp_h / aspect
    need = disp_h + 14
    if pdf.get_y() + need > pdf.h - pdf.b_margin:
        pdf.add_page()
    _reset_x(pdf)
    x = pdf.l_margin + (page_w - disp_w) / 2
    y = pdf.get_y()
    pdf.image(str(path), x=x, y=y, w=disp_w, h=disp_h)
    pdf.set_y(y + disp_h + 1)
    _reset_x(pdf)
    caption(pdf, caption_text)


def section_break(pdf: GuidePDF) -> None:
    if pdf.get_y() > pdf.h - 40:
        pdf.add_page()


def build() -> Path:
    pdf = GuidePDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(16, 16, 16)

    # Cover
    pdf.add_page()
    pdf.ln(40)
    pdf.set_font("Helvetica", "B", 28)
    pdf.set_text_color(15, 20, 30)
    pdf.multi_cell(0, 12, "MzM Bot Desktop", align="C")
    pdf.ln(4)
    pdf.set_font("Helvetica", "", 14)
    pdf.set_text_color(60, 70, 85)
    pdf.multi_cell(0, 8, "User Guide - Features from P1 to P7", align="C")
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 10)
    pdf.multi_cell(
        0,
        5,
        "How to use bots, chat, skills, routines, memory,\n"
        "connectors, trust, Shell/box, and computer use.",
        align="C",
    )
    pdf.ln(16)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(100, 100, 100)
    pdf.multi_cell(0, 5, "DeepSeek Harness · 2026-09-28 · Screenshots from real Desktop UI", align="C")
    add_image(pdf, "01-home-new-session.png", "Figure - Home / New Session", max_h=80)

    # What / Getting started
    pdf.add_page()
    h1(pdf, "1. What this app is")
    body(
        pdf,
        "MzM Bot is a Desktop agent workspace. You create bots, chat with them, "
        "attach skills, schedule routines, store memory, connect external tools, "
        "and run sandboxed Shell plus computer-use helpers when readiness allows.",
    )
    body(
        pdf,
        "Day-to-day tip: the Electron window is thin chrome. Bot state, tools, "
        "Shell readiness, and Computer settings live on the local Desktop Host.",
    )

    h1(pdf, "2. Getting started")
    bullets(
        pdf,
        [
            "Launch Desktop (pnpm run start:desktop from a built checkout, or your packaged app).",
            "On the home screen, pick a workspace and click New Session.",
            "Type a task in the composer and send. Progress and the final answer stay in-session.",
        ],
    )
    add_image(pdf, "01-home-new-session.png", "Home - choose workspace and start a New Session")
    add_image(pdf, "02-session-composer.png", "Session - composer ready for a task")

    # Bots
    section_break(pdf)
    h1(pdf, "3. Bots & chat (P1-P2)")
    h2(pdf, "What you get")
    bullets(
        pdf,
        [
            "Create bots from Agent Team / bots UI",
            "Different models per bot",
            "Persona: name, job, voice, anti-jobs, avatar, sidebar section",
            "Delete with confirmation",
            "Chat with progress updates and a final result",
        ],
    )
    h2(pdf, "How")
    bullets(
        pdf,
        [
            "Open Agent Team / bots from the sidebar or Plugins.",
            "Create a bot, set model + persona, save.",
            "Start a session and message the bot (or a small team).",
        ],
    )
    add_image(pdf, "03-bots-sidebar.png", "Agent Team / bots surface")
    add_image(pdf, "03b-persona-saved.png", "Persona fields saved on a bot")
    add_image(pdf, "03c-bot-created.png", "New bot created in the team")

    # Skills
    pdf.add_page()
    h1(pdf, "4. Skills (P3)")
    bullets(
        pdf,
        [
            "Discover a thin managed skill pack",
            "Attach a skill to one bot (does not auto-attach to others)",
            "Author a simple skill (name + body) and run it",
        ],
    )
    h2(pdf, "How")
    bullets(
        pdf,
        [
            "Open skills discovery for a bot.",
            "Attach a managed skill - it stays on that bot.",
            "Or author -> save -> run from the bot.",
        ],
    )
    add_image(pdf, "10-skills-discovery.png", "Skills discovery - managed pack")
    add_image(pdf, "10b-skills-attach.png", "Attach a skill to Bot A")
    add_image(pdf, "10c-skills-run.png", "Skill run active on the bot")

    # Routines
    pdf.add_page()
    h1(pdf, "5. Routines - cron (P4)")
    bullets(
        pdf,
        [
            "Create cron routines listed in a pane",
            "Pause / resume without losing the definition",
            "See fire / last-run status in the UI",
        ],
    )
    h2(pdf, "How")
    bullets(
        pdf,
        [
            "Open the Routines pane from Agent Team.",
            "Create a cron routine with a clear schedule.",
            "Pause for silence; resume when you want fires again.",
        ],
    )
    add_image(pdf, "11-routines-pane.png", "Routines pane")
    add_image(pdf, "11b-routines-create.png", "Routine created and listed active")
    add_image(pdf, "11c-routines-pause.png", "Pause / resume controls")

    # Memory
    pdf.add_page()
    h1(pdf, "6. Memory (P5)")
    bullets(
        pdf,
        [
            "Write profile, log, and note facts",
            "Recall after leave/return or restart",
            "Agent-layer vs user-layer memory (project ADR)",
        ],
    )
    h2(pdf, "How")
    bullets(
        pdf,
        [
            "Open the Memory surface for a bot / team.",
            "Add a profile fact, log line, or note.",
            "Leave and return - recall should still show them.",
        ],
    )
    add_image(pdf, "12-memory-surface.png", "Memory surface")
    add_image(pdf, "12b-memory-profile.png", "Profile facts listed")
    add_image(pdf, "12c-memory-log.png", "Log entries listed")

    # Connectors
    pdf.add_page()
    h1(pdf, "7. Connectors, event routines & trust (P6)")
    h2(pdf, "Connectors")
    bullets(
        pdf,
        [
            "Open Connectors catalog -> Install -> Auth until Ready.",
            "Run a tool call and confirm success in the UI.",
            "Secrets stay out of session dumps.",
        ],
    )
    add_image(pdf, "13-connectors-catalog.png", "Connector catalog")
    add_image(pdf, "13b-connector-installed.png", "Connector installed")
    add_image(pdf, "13c-connector-auth.png", "Auth Ready")

    h2(pdf, "Trust deny")
    bullets(
        pdf,
        [
            "When a permission gate appears, Deny blocks the tool.",
            "Denied is a real blocked state - not a silent allow.",
        ],
    )
    add_image(pdf, "14-trust-permission-gate.png", "Permission gate")
    add_image(pdf, "14b-trust-denied.png", "Denied / blocked")

    h2(pdf, "Event routines")
    bullets(
        pdf,
        [
            "Create an event-triggered routine (beyond cron).",
            "Confirm it lists; pause still suppresses fires.",
        ],
    )
    add_image(pdf, "15-event-routine.png", "Event routine created")

    # Computer / Shell
    pdf.add_page()
    h1(pdf, "8. Computer, Shell & computer use (P7)")
    body(
        pdf,
        "Global Settings -> Computer exposes Shell readiness and Computer use. "
        "Chrome alone is not proof the tool paths work - check Ready and a real tool result.",
    )
    h2(pdf, "Settings -> Computer")
    bullets(
        pdf,
        [
            "Open Settings (gear) -> Computer.",
            "Read Shell readiness (not-ready / starting / Ready).",
            "Toggle Computer use when you want that path available.",
        ],
    )
    add_image(pdf, "04-settings-overview.png", "Settings - General overview")
    add_image(pdf, "05-settings-computer.png", "Settings -> Computer (Shell + Computer use)")

    h2(pdf, "Shell / box")
    bullets(
        pdf,
        [
            "Wait until Shell shows Ready (local sandbox).",
            "Ask a bot for a local shell task.",
            "Success appears in the tool card - not while status is not-ready/starting.",
        ],
    )
    add_image(pdf, "06-shell-ready.jpg", "Shell Ready - local sandbox path")
    add_image(pdf, "07-shell-tool-success.jpg", "Shell/box tool success")

    h2(pdf, "Computer use")
    bullets(
        pdf,
        [
            "Enable Computer use in Settings -> Computer.",
            "Ask for a computerUse-class observation (screenshot).",
            "Expect a parent handoff; interactive browser is not required for this path.",
        ],
    )
    add_image(pdf, "08-computer-use-observation.png", "computerUse observation")
    add_image(pdf, "09-computer-use-handoff.png", "Parent handoff")

    # Plugins / Out / Troubleshoot
    pdf.add_page()
    h1(pdf, "9. Plugins")
    body(
        pdf,
        "The Plugins page lists Host-backed capabilities (Agent Teams, Shell, "
        "Subagent, Web search, and more). Enabling a plugin wires Host behavior; "
        "it does not replace Settings -> Computer readiness.",
    )
    add_image(pdf, "12-any-extra-useful.png", "Plugins list")

    h1(pdf, "10. What is not in this build")
    bullets(
        pdf,
        [
            "Voice",
            "Draft-first send-on-behalf",
            "Group channels",
            "User machines",
            "Learn-from-demo",
            "Billing chrome",
            "Full skill pack / pixel Grok catalog",
        ],
    )
    body(
        pdf,
        "These stay out until a later named phase amends the plan.",
    )

    h1(pdf, "11. Troubleshooting")
    bullets(
        pdf,
        [
            "Shell tools fail immediately -> Settings -> Computer -> Shell != Ready.",
            "No computerUse observation -> Computer use On; Host provider registered.",
            "Connector stuck -> Auth Ready; do not paste secrets into chat.",
            "Routine never fires -> not paused; cron vs event matches how you created it.",
            "Memory missing after restart -> confirm profile/log/note was written on Memory surface.",
        ],
    )

    h1(pdf, "12. Screenshot sources")
    body(
        pdf,
        "Fresh Desktop captures (2026-09-28): home, session, bots sidebar, Settings, "
        "Computer, Plugins. Phase Verifier Pass evidence (committed product UI): "
        "persona, skills, routines, memory, connectors/trust, Shell, computerUse.",
    )
    pdf.ln(6)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(90, 90, 90)
    pdf.multi_cell(0, 5, "MzM Bot · DeepSeek Harness · P1-P7 complete", align="C")

    pdf.output(str(OUT))
    ART_OUT.parent.mkdir(parents=True, exist_ok=True)
    ART_OUT.write_bytes(OUT.read_bytes())
    return OUT


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path} ({path.stat().st_size} bytes)")
    print(f"Also {ART_OUT}")
