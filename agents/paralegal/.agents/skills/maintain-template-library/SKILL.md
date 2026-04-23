---
name: maintain-template-library
description: Use when the user says "refresh my template library" / "what's stale" / "check my standard paper against current law" — reads `config/template-library.json`, flags templates > 12 months old, checks each against current law references (AI-training disclosure, SCC versions, 2026 DPA standards, CA/EU rights), and produces a refresh plan. Never auto-rewrites — founder approves each change.
---

# Maintain Template Library

## When to use

- Explicit: "refresh my template library", "what's stale", "review
  my standard paper", "check my NDA against current law".
- Implicit: on a ~12-month cadence, or when law-changing events
  surface (new SCC version, new AI-training default, CPRA update).
- Only refreshes the library — never auto-rewrites a template. The
  founder approves each change.

## What "current law" means here

The agent doesn't invent case law or clause standards. It checks
templates against a short list of public, well-documented inflection
points:

- **AI-training disclosure** — does the MSA / DPA have an opt-out or
  explicit no-train clause? (Market default drifted in 2024-2026.)
- **SCCs** — if data crosses EU↔US, are the SCCs the current EU
  Commission version (Module 1-4 as applicable)?
- **2026 DPA standards** — breach-notification SLA (72h), data
  residency, subprocessor approval, audit rights.
- **CA/EU rights** — CCPA/CPRA "Do Not Sell/Share" + GDPR Art. 15
  right-to-access plumbing referenced correctly.
- **At-will + CIIAA** — offer letter language matches CIIAA
  reference; no promises the startup can't honor.
- **YC / Common Paper drift** — if the founder's MSA is based on a
  named public template, is it the current published version?

If the agent can't verify against a cite, it marks **UNCLEAR — have
a lawyer look at this clause** rather than guessing.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop. Note entity jurisdiction, data geography of users, and
   any open risks (e.g. "DPA with vendor X is expired").
2. **Read `config/template-library.json`.** If missing or empty,
   ask ONE question: "I don't have your template library yet —
   connect the drive folder via Composio, paste a URL, or paste the
   templates directly." Write captured templates back to
   `config/template-library.json` with
   `{ key, label, path, lastReviewed, version?, notes? }` per entry.
3. **Flag age.** Any template with `lastReviewed` older than 12
   months → flag `stale`. List them.
4. **Walk each template against the current-law list above.** For
   each template, quote the relevant clause and note whether it's
   aligned, drifted, or missing. Be specific: "NDA template
   (`nda-mutual`) has no AI-training clause — 2026 customer MSAs
   commonly ask for one; consider adding." Do NOT write the clause
   yourself; describe the change.
5. **Produce a refresh plan.** Three buckets:
   - **Retire** — templates the founder no longer uses or that are
     superseded.
   - **Edit** — templates with one or two specific changes named
     (clause, rationale, suggested-direction-only).
   - **Fine** — templates that still check out; note
     `lastReviewed` should be stamped with today's date after the
     founder confirms.
6. **Write** the review to
   `template-reviews/{YYYY-MM-DD}.md` atomically (`*.tmp` → rename).
   Structure: summary counts → per-template section with current
   status, drift notes, and the suggested-direction-only edits →
   refresh plan (Retire / Edit / Fine) → open questions.
7. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "template-review", title, summary, path,
   status: "draft", createdAt, updatedAt, attorneyReviewRequired }`.
   Set `attorneyReviewRequired: true` if any UNCLEAR items surfaced
   or if a template edit would materially change the risk
   allocation.
8. **Summarize to user** — one paragraph: "Reviewed N templates. M
   stale (> 12 months). Flagged K edits and J retirements. Full plan
   at `template-reviews/...`. Nothing auto-rewritten — confirm each
   change and I'll update `config/template-library.json`. Want to
   walk through the Edit list?"

## Never auto-rewrite

- I never edit the template files themselves. The founder
  (optionally with a lawyer) makes each edit; I then re-scan on the
  next run.
- I never mark `lastReviewed` as updated without explicit founder
  confirmation that the template is current as-is.

## Outputs

- `template-reviews/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with type `template-review`.
