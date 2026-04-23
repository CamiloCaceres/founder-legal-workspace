---
name: onboard-me
description: Use when the user explicitly says "onboard me" / "set me up" / "let's get started", or on the first real task when no `config/profile.json` exists — open with a scope + modality preamble naming the three topics (entity + formation date, landing-page + deployed policies, data geography) AND the best way to share each, then run a tight 90-second 3-question interview and write results to `config/`.
---

# Onboard Me

## When to use

First-run setup. Triggered by:

- "onboard me" / "set me up" / "let's get started"
- The user clicks the pre-seeded "Onboard me" activity card and sends
  any short message (including "go", "ok", "start", "yes", or empty)
  — when `config/profile.json` is missing, treat any such short
  opener as a signal to run me.
- About-to-do-real-work and `config/profile.json` is missing.

Only run ONCE unless the user explicitly re-invokes.

## Principles

- **Lead with a scope + modality preamble.** Name the three topics
  AND the easiest way to share each BEFORE the first question.
- **3 questions is the ceiling, not the target.** If you can do 2,
  do 2.
- **One question at a time after the preamble.** Short follow-ups.
- **Rank modalities:** connected app via Composio > file/URL > paste.
- **Anything skipped** → note "TBD" and ask again just-in-time later.

## Steps

0. **Scope + modality preamble — the FIRST message, then roll into Q1:**

   > "Let's get you set up — 3 quick questions, about 90 seconds.
   > Here's what I need and the easiest way to share each:
   >
   > 1. **Your entity** — name, state of incorporation, formation
   >    date. Most Delaware C-corps know their formation date — this
   >    anchors the 83(b) 30-day window (IRC §83(b)) and the annual
   >    March 1 Delaware franchise-tax deadline (8 Del. C. §503).
   >    *Best: formation certificate file drop, Clerky / Atlas /
   >    Firstbase connection via Composio (Integrations tab), or
   >    paste.*
   > 2. **Your landing page + deployed policies** — the URL, plus
   >    which of Privacy Policy / ToS / Cookie Policy is already
   >    deployed and where. *Best: paste the URL; I'll scan via
   >    web-scrape at runtime.*
   > 3. **Your data geography** — where your current and planned
   >    users live (US only / US + EU / US + CA / other). Anchors
   >    GDPR and CCPA applicability. *Best: one line of paste.*
   >
   > Let's start with #1 — what's your entity name, state, and
   > formation date?"

1. **Capture topic 1 (entity).** Based on modality: parse the
   formation certificate if uploaded, or capture the paste. Write
   `config/entity.json` with
   `{ entityName, entityType, stateOfIncorporation, formationDate,
   source, capturedAt }`. Acknowledge and roll into Q2. If state is
   not "DE", flag that Delaware-specific skills
   (`file-delaware-annual-report`, Delaware deadlines) may not apply.

2. **Capture topic 2 (landing page + deployed policies).** Parse URL
   + any linked policy URLs. Do NOT scrape here — that's
   `draft-privacy-policy` / `audit-privacy-posture`. Write
   `config/landing-page.json` with
   `{ url, deployedPolicies: { privacyPolicyUrl?, tosUrl?,
   cookiePolicyUrl? }, source, capturedAt }`. If nothing is deployed
   yet, note that `draft-privacy-policy` will be the first priority.
   Roll into Q3.

3. **Capture topic 3 (data geography).** Short paste expected. Parse
   into regions + boolean flags. Write `config/data-geography.json`
   with
   `{ userRegions, caResidents, euResidents, source, capturedAt }`.
   Flag GDPR applicability if `euResidents: true`, CCPA if
   `caResidents: true`.

4. **Write `config/profile.json`** with
   `{ userName?, company?, onboardedAt, status }`. Use `"partial"`
   if any topic was skipped.

5. **Hand-off:** "Ready. First move: `Set up my legal deadline
   calendar`. I'll also need the shared legal context from General
   Counsel's `maintain-legal-context` before I draft anything
   substantive — run that next if you haven't."

## Outputs

- `config/profile.json`
- `config/entity.json`
- `config/landing-page.json`
- `config/data-geography.json`
