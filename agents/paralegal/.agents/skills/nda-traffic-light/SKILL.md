---
name: nda-traffic-light
description: Use when the user pastes or forwards an inbound NDA and asks "is this standard?" / "can I sign this?" / "traffic-light this NDA" — runs a green/yellow/red rubric on term, mutuality, confidential-info definition, carve-outs, jurisdiction, non-solicit smuggling, and return/destruction; writes a summary with specific redline suggestions on Red items to `ndas/{counterparty-slug}-{YYYY-MM-DD}.md`. Drafts only — never sends, never signs, not legal advice.
---

# NDA Traffic Light

## When to use

- Explicit: "traffic-light this NDA", "is this NDA standard", "can I
  sign this NDA", "review this NDA", "what's wrong with this NDA".
- Implicit: `triage-inbound-legal-email` classified an item as an NDA
  and the founder wants it evaluated in depth before deciding route.
  Also runs when the founder pastes/forwards an NDA mid-conversation
  without an explicit verb.
- Runs on one NDA per invocation. For multiple, call once per NDA.

## What this is (and isn't)

This is a **triage** pass — fast classification + specific redline
suggestions the founder can use or hand to General Counsel. It is
**not** final legal advice and it is **not** a redline. Every output
closes with "this is a summary, not legal advice; escalate to outside
counsel for anything with commercial impact."

## The rubric

Evaluated over these seven dimensions. Each maps to GREEN / YELLOW /
RED with a specific reason:

1. **Mutuality** — does the obligation flow both ways?
2. **Term length** — how long are obligations enforceable?
3. **Definition of confidential info** — narrow (marked + reasonably
   identifiable as confidential) vs broad (everything ever exchanged
   including oral + residuals claw-back).
4. **Carve-outs** — are the standard carve-outs present (publicly
   known, independently developed, lawfully obtained from third party,
   required by law / court order)?
5. **Jurisdiction / governing law** — US state in the founder's
   pre-approved set, adjacent jurisdiction (Canada, UK), or somewhere
   unusual.
6. **Non-solicit smuggling** — is there a non-solicit of employees,
   non-compete, or no-hire clause buried in the NDA? (These don't
   belong in an NDA.)
7. **Return / destruction** — on termination, is there a reasonable
   return-or-destroy-and-certify clause, or something punitive
   (immediate return, destruction at any time on demand, audit
   rights)?

### Color calls

- **GREEN** — standard, accept. Every dimension above is either
  industry-standard or a negligible deviation.
- **YELLOW** — unusual but tolerable. One or two dimensions deviate
  from standard in a way that's survivable; the rationale explains
  why you might accept.
- **RED** — push back. Any of the following forces RED regardless of
  the rest: non-compete / non-solicit / no-hire; unlimited liability
  or uncapped indemnity; IP assignment; publicity or press-release
  obligations; perpetual or >5 year term; governing law outside the
  founder's pre-approved jurisdictions; audit rights; claw-back on
  residuals. Two or more YELLOW-level deviations also force RED.
- **Default to RED** if any dimension can't be confidently parsed
  from the text.

**Thresholds come from config, not hardcoded numbers.** Read
`config/nda-rubric.json` for the founder's overrides (term cutoff,
pre-approved jurisdictions, risk posture). If missing, use
documented defaults: term ≤ 3 years = GREEN, 3–5 = YELLOW, > 5 or
perpetual = RED; pre-approved jurisdictions = Delaware + the founder's
entity state + California + New York. The founder changes these via
`maintain-legal-context` or by editing the rubric file directly.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user: "I need the shared legal context first — please run
   General Counsel's `maintain-legal-context` skill, then come back."
   Stop. Extract entity name, state of incorporation, and founder
   risk posture (aggressive / middle / conservative — anchors how
   hard to push back on YELLOW items).
2. **Read rubric overrides**: `config/nda-rubric.json`. If missing,
   use the documented defaults above and note in the output which
   thresholds were applied. Offer to write the founder's preferences
   on first run — ask ONE question: "I'll use the default rubric
   (3-year term cutoff, DE/CA/NY/{entity-state} jurisdictions). Want
   to set custom thresholds now, or keep the defaults?" If they
   answer, write to `config/nda-rubric.json`.
3. **Locate the NDA.** Accept: (a) pasted text, (b) a file path, (c)
   a URL or pointer into connected document storage. If document
   storage is connected, discover the tool via any Composio-connected
   document-storage category and fetch. If none of the three is
   provided, ask ONE question: "Paste the NDA text, give me a URL, or
   point me to it in your document storage."
4. **Parse.** Extract the plain text. If parsing fails (scanned PDF
   without OCR, image-only, corrupted), tell the user and ask for a
   text-extractable version. Do not guess.
5. **Walk the seven-dimension rubric.** For each dimension:
   - Quote the operative language (≤ 2 sentences) and note the
     section reference.
   - Assign GREEN / YELLOW / RED with a one-sentence reason.
   - If the dimension is MISSING from the NDA entirely, mark MISSING
     and call the color it implies (missing carve-outs = RED, missing
     return/destruction = YELLOW, etc. — document why).
6. **Compute the overall call.** RED dominates YELLOW dominates
   GREEN. Any single RED-forcing clause (see rubric) → overall RED.
   Two or more YELLOW dimensions → overall RED. Zero deviations →
   GREEN. Otherwise YELLOW.
7. **Draft redlines for every RED item.** For each RED, write a
   specific, paste-able redline suggestion — not "consider revising"
   but actual replacement language anchored to the founder's risk
   posture. For YELLOW items, write a one-line rationale ("accept
   because…" or "push back because…"). GREEN items get a one-line
   "standard — accept" note.
8. **Write** the summary to `ndas/{counterparty-slug}-{YYYY-MM-DD}.md`
   atomically (`*.tmp` → rename). Structure:
   - Header: counterparty, one-way/mutual, overall color call.
   - **GREEN items** — bulleted list, one line each.
   - **YELLOW items** — one section per item: quoted language +
     rationale for accept or push-back.
   - **RED items** — one section per item: quoted language +
     specific redline suggestion the founder can paste.
   - Footer: "This is a summary, not legal advice. Escalate to
     outside counsel for anything with commercial impact — General
     Counsel's `escalate-to-outside-counsel` packages the brief."
9. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "nda-review", title, summary, path, status: "draft",
   createdAt, updatedAt, attorneyReviewRequired }`. Set
   `attorneyReviewRequired: true` on any RED overall or if any RED
   dimension triggered from a clause outside the standard list.
10. **Summarize to user** — one paragraph: "{Counterparty} NDA: call
    is {GREEN/YELLOW/RED}. {N} GREEN, {N} YELLOW, {N} RED. Top
    concerns: {one-line summary of each RED}. Full review at
    `ndas/{counterparty-slug}-{YYYY-MM-DD}.md`. Next: {if GREEN →
    'sign when ready'; if YELLOW → 'decide on the deviations, then
    sign or send a short redline'; if RED → 'send the suggested
    redlines; route via General Counsel's `draft-redline-strategy`
    if you want a prioritization'}."

## Never invent

- Every color call ties to quoted language in the NDA. No clause
  standards, case law, or jurisdictional precedent invented. If the
  language is ambiguous, mark it UNCLEAR and default to the stricter
  color.
- Every suggested redline uses language the founder can actually
  paste — no placeholder "[legal counsel to draft]" hand-waves.
  Anchor to standard market language the founder has seen before
  (mutual, 2-year term, narrow confidential-info definition, standard
  four carve-outs, US state governing law, clean return/destruction).
- Never claim the NDA is "safe to sign." The call is traffic-light;
  the signature is the founder's.

## Hard nos

- Never signs, sends, or returns the NDA to the counterparty. Every
  redline is a draft the founder reviews.
- Never provides legal advice that isn't clearly marked as summary.
  The footer line is non-negotiable.
- Never hardcodes tool names. Document storage fetches flow through
  any Composio-connected document-storage category.
- Never hardcodes term thresholds or jurisdictions. All numeric /
  list cutoffs come from `config/nda-rubric.json` or documented
  overridable defaults.

## Outputs

- `ndas/{counterparty-slug}-{YYYY-MM-DD}.md` — the review.
- Appends to `outputs.json` with type `nda-review`.
- First-run only: writes `config/nda-rubric.json` with the founder's
  thresholds.
