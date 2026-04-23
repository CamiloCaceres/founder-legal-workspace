---
name: triage-inbound-legal-email
description: Use when the user says "triage my legal inbox" / "what legal email needs me" / "sweep inbound for contracts" — sweeps the connected inbox for legal-flavored inbound over the last N days, classifies each item (NDA green/yellow/red, MSA, DPA, DSR, subpoena, TM, contractor, other), recommends a route, writes a dated summary to `intake-summaries/`, and appends to `outputs.json`.
---

# Triage Inbound Legal Email

## When to use

- Explicit: "triage my legal inbox", "sweep inbound for contracts",
  "what legal email needs me", "run intake".
- Implicit: first skill called on a fresh install after `onboard-me`
  when the user sees the "Needs you" card and asks "what's waiting on
  me?"
- Safe to run on-demand — typically daily or a few times a week for
  a solo founder. Default window: last 7 days if the user doesn't
  specify.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user: "I need the shared legal context first — please run
   General Counsel's `maintain-legal-context` skill, then come back."
   Stop.
2. **Read config**: `config/counterparty-stack.json`. If
   `inboxConnectedViaComposio` is false or missing, ask ONE question
   naming the best modality ("I need an inbox connection to sweep —
   open Integrations and link your inbox (Gmail / Outlook / etc) via
   Composio"). Stop until connected.
3. **Discover inbox tool via Composio.** Run `composio search inbox`
   to get the tool slug. Confirm the slug matches
   `counterparty-stack.inboxCategory`.
4. **Pull inbound.** Default window: last 7 days (or user-specified
   N). Query the inbox slug for messages likely to be legal in
   nature — contract attachments (.pdf, .docx), sender domains that
   look like law firms, subject-line keywords ("NDA", "MSA", "DPA",
   "DSR", "subpoena", "office action", "terms", "agreement"), and
   any message threading replies to prior legal inbound.
5. **Classify each item.** Apply this rubric and pick exactly one
   bucket:
   - **NDA** — run the traffic-light: **Green** = mutual, ≤3-year
     term, reasonable scope, standard non-solicit (or none), no
     unusual residuals, no non-compete, US governing law. **Yellow** =
     exactly one deviation (one-way where we're the sole discloser,
     3-5 year term, broad residuals, adjacent jurisdiction like
     Canada/UK). **Red** = two+ deviations, or any of: non-compete,
     IP assignment language, unlimited liability, publicity /
     press-release obligations, term >5 years or perpetual,
     non-standard governing law. Default to Red if the text can't be
     confidently parsed.
   - **MSA / order form** — any umbrella or commercial-terms doc
     from a customer or vendor.
   - **DPA** — data-processing addendum or stand-alone data terms.
   - **DSR** — data-subject request (GDPR Art. 15, CCPA).
   - **subpoena / legal process** — subpoena, preservation demand,
     cease-and-desist, litigation hold.
   - **TM office action** — USPTO office action or TM-related
     correspondence.
   - **contractor paper** — inbound consulting / contractor /
     work-for-hire from a counterparty.
   - **other** — anything else legal-flavored (insurance-cert
     request, privacy inquiry, vendor security questionnaire).
6. **Route each item.** Recommend exactly one of:
   - **self-handle via `draft-from-template`** — only if the item
     maps cleanly to an existing template (e.g. Green NDA with a
     known counterparty).
   - **send to `review-inbound-contract`** — General Counsel's
     skill; most MSA / DPA / order-form / Yellow NDAs go here.
   - **flag `attorneyReviewRequired`** — Red NDAs, subpoenas,
     litigation-adjacent, anything ambiguous.
   - **ignore** — spam, newsletters, resolved threads.
7. **Write** the summary to `intake-summaries/{YYYY-MM-DD}.md`
   atomically (`*.tmp` → rename). Structure: counts at top
   ("7 items: 3 NDA, 1 MSA, 1 DSR, 2 other"), then one section per
   item with `From`, `Subject`, `Received`, `Classification`,
   `One-line summary`, `Recommended route`.
8. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "intake-summary", title, summary, path, status: "draft",
   createdAt, updatedAt, attorneyReviewRequired }`. Set
   `attorneyReviewRequired: true` if any item in the batch was
   flagged for attorney review.
9. **Summarize to user** — one paragraph: "I pulled N items,
   classified X as NDA (traffic-light breakdown), Y as MSA/other,
   flagged Z for attorney review. Full triage at
   `intake-summaries/{YYYY-MM-DD}.md`. Want me to
   `draft-from-template` the Green NDAs or hand the MSA to General
   Counsel?"

## Never invent

Every classification ties to an observed message. If the inbox tool
errored or returned no data, mark UNKNOWN in the summary — don't
guess. If an attachment couldn't be parsed, say so and ask the user
to paste.

## Outputs

- `intake-summaries/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with type `intake-summary`.
