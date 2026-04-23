---
name: onboard-me
description: Use when the user explicitly says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (counterparty stack, existing template library, voice) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:
- "onboard me" / "set me up" / "let's get started"
- The user opens the pre-seeded "Onboard me" activity card (from the
  Needs-you column) and sends any short message to kick it off
  (including "go", "ok", "start", "yes", or even an empty-seeming
  prompt) — when `config/profile.json` is missing, treat any such
  short opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics AND
  the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.**
- **One question at a time after the preamble.**
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Your counterparty stack** — where legal email lands, where
   >    you store executed contracts, and what you use for signatures.
   >    *Best: connect your inbox + document-storage + signing-platform
   >    via Composio (Integrations tab). Or tell me which categories
   >    you've already linked.*
   > 2. **Your existing template library** — where your NDAs /
   >    consulting agreements / offer letters live today. *Best:
   >    connect the storage (Google Drive folder) via Composio. Or
   >    paste a URL. Or paste the templates directly.*
   > 3. **Your voice on professional emails** — so chaser reminders
   >    sound like you, not like AI. *Best: connect your inbox via
   >    Composio and I'll read your sent folder. Or paste 2-3 sample
   >    emails.*
   >
   > Let's start with #1 — which of inbox, document-storage, signing-
   > platform have you connected (or want to connect now)?"

1. **Capture topic 1 (counterparty stack).** For each mentioned
   category, run `composio search <category>` to confirm the tool
   slug and write `config/counterparty-stack.json` with
   `{ inboxConnectedViaComposio, inboxCategory?, docStorageConnectedViaComposio,
   docStorageCategory?, signingPlatformConnectedViaComposio,
   signingPlatformCategory?, notes?, capturedAt }`. Anything not
   connected yet → note TBD. Acknowledge and roll into Q2: "Got it —
   now your template library. Connected drive folder, a URL, or paste?"
2. **Capture topic 2 (template library).** If connected drive: record
   `{ location: "connected-drive", locationPointer: <folder id> }` and
   list the templates you can see. If URL: `{ location: "url",
   locationPointer: <URL> }`. If paste: `{ location: "paste",
   locationPointer: "" }` and accept the paste. Write initial
   `config/template-library.json` with `{ location, locationPointer,
   templates: [], capturedAt }` — `maintain-template-library` fills in
   `templates[]` on first run. Roll into Q3: "Last one — your voice.
   Want me to read your sent folder, or paste 2-3 sample emails?"
3. **Capture topic 3 (voice).** If inbox connected, note "read sent
   folder on first chaser-draft" in `config/voice.md`. If pasted,
   write the 2-3 samples into `config/voice.md` under headings
   **Tone**, **Sign-off**, **Samples**.
4. **Write `config/profile.json`** with `{ userName, company,
   onboardedAt, status: "onboarded" | "partial" }`. Use `"partial"`
   if any topic was skipped.
5. **Hand-off:** "Ready. Try: `Triage my legal inbox — what needs me?`
   — but heads-up, I'll need General Counsel's `legal-context.md`
   before any substantive draft. If you haven't run General Counsel's
   `maintain-legal-context` yet, start there."

## Outputs

- `config/profile.json`
- `config/counterparty-stack.json`
- `config/template-library.json`
- `config/voice.md`
