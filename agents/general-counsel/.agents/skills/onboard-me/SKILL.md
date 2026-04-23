---
name: onboard-me
description: Use when the user explicitly says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (entity basics, founder risk posture, existing template stack) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:

- "onboard me" / "set me up" / "let's get started".
- The user opens the pre-seeded "Onboard me" activity card and sends
  any short message (including "go", "ok", "start", "yes", or an
  empty-seeming prompt) — when `config/profile.json` is missing,
  treat any short opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics AND
  the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.** If you can do 2, do 2.
- **One question at a time after the preamble.** The preamble did the
  heavy lifting.
- **Rank modalities:** connected app via Composio > file drop > URL >
  paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Your entity** — name, state of incorporation, formation
   >    date, authorized shares, par value. *Best: drop your Clerky /
   >    Atlas / Firstbase formation packet, or paste the bylaws /
   >    incorporation cert. A URL works too.*
   > 2. **Your risk posture** — aggressive, middle, or conservative
   >    on standard contract clauses (liability cap, indemnity, IP,
   >    auto-renewal). *Best: paste one line. I'll ask follow-ups
   >    per clause as they come up.*
   > 3. **Your template stack** — NDA / MSA / consulting / offer /
   >    DPA templates you already have. *Best: connect a document
   >    store (Drive / Dropbox / Box) via Composio and I'll read the
   >    filenames. Or drop the files. Or paste URLs to where they
   >    live.*
   >
   > For any of these you can also drop files or share public URLs.
   > Let's start with #1 — what's your entity (name, state,
   > formation date, authorized shares, par value)?"

1. **Capture topic 1 (entity).** Based on modality chosen: parse
   paste, fetch URL via `composio search web-scrape` (execute by
   slug), or read a dropped file. Extract name, state, entity type
   (default C-corp if Delaware + "corp" signals), formation date,
   authorized shares, par value, registered agent, incorporated-via
   platform. Write `config/entity.json` with `{ name, state,
   entityType, formationDate, authorizedShares?, parValue?,
   registeredAgent?, incorporatedVia?, source, capturedAt }`.
   Acknowledge and roll into Q2: "Got it — now your risk posture.
   Aggressive, middle, or conservative on standard clauses?"

2. **Capture topic 2 (risk posture).** Accept a one-word answer
   (aggressive / middle / conservative) plus any verbatim color the
   founder offers. If they hand-wave, ask ONE clause-level follow-up:
   "Walk-away position on liability cap — 1x fees, 12mo fees, or
   uncapped OK for a whale?" Write `config/posture.json` with
   `{ stance, notes?, clausePreferences?, capturedAt }`. Roll into
   Q3: "Last one — what templates do you already have? Connected
   document store is easiest; file drops or URLs work too."

3. **Capture topic 3 (template stack).** If connected-store route:
   run `composio search document-storage` to discover the slug, list
   files matching legal patterns (NDA / MSA / CIIAA / DPA / offer),
   record pointers + version cues from filenames. If file drops,
   record each with `kind` inferred from content. If URLs or paste,
   record verbatim. Write `config/templates.json` with
   `{ items: [...], capturedAt }`. If the founder has nothing, record
   `items: []` — the paralegal will draft from scratch.

4. **Write `config/profile.json`** with `{ userName, company, role?,
   onboardedAt, status: "onboarded" | "partial" }`. Use `"partial"`
   if any topic was skipped.

5. **Atomic writes.** Every file written as `{path}.tmp` then
   renamed to the target. Never partial JSON.

6. **Hand off:** "Ready. Try: `Set up my legal context doc` — I'll
   turn what you just told me into the shared `legal-context.md` the
   other two agents read."

## Outputs

- `config/profile.json`
- `config/entity.json`
- `config/posture.json`
- `config/templates.json`

(No entry appended to `outputs.json` — onboarding is setup, not a
deliverable.)
