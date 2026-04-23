---
name: draft-from-template
description: Use when the user says "draft an NDA / consulting agreement / offer letter / MSA / order form / board consent" — picks the right template from the founder's library, gathers the variables (counterparty, dates, commercials), drafts the document, and writes it to `drafts/{type}/{counterparty}-{YYYY-MM-DD}.md`. Drafts only — never sends, never requests signature.
---

# Draft From Template

## When to use

- Explicit: "draft a mutual NDA for {counterparty}", "draft a
  consulting agreement for {name}", "write an offer letter for
  {candidate}", "draft an MSA / order form / board consent".
- Implicit: `triage-inbound-legal-email` flagged a Green NDA as
  "self-handle via `draft-from-template`".
- Drafts the document only. Never sends, never files, never requests
  signature. The founder reviews and moves the draft to the signing
  platform manually.

## Supported shapes

Each shape maps to a `templates[].key` in
`config/template-library.json`:

- **`nda-mutual`** — mutual NDA for contractors, pilot customers,
  friends-of-company.
- **`nda-one-way`** — one-way NDA (inbound: we disclose; or outbound:
  counterparty discloses).
- **`consulting`** — consulting / contractor agreement with
  work-for-hire + IP assignment + confidentiality.
- **`offer-letter`** — at-will offer letter with CIIAA reference.
- **`msa`** — SaaS-flavored MSA (YC / Common Paper aligned).
- **`order-form`** — commercial terms to attach under an MSA.
- **`board-consent`** — board written consent (routine approvals).

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop. Extract entity name, state of incorporation, founder
   risk posture, and any open risks relevant to this doc type.
2. **Read template library**: `config/template-library.json`. If the
   requested `templates[].key` is missing, ask ONE question with the
   best modality ("I don't have a `{type}` template yet — paste the
   template, give me a URL, or link your drive folder via Composio so
   I can read it"). Write the template back to
   `config/template-library.json`.
3. **Gather variables.** Ask the user ONLY for variables not already
   knowable from shared context or prior runs. Per shape:
   - All shapes: `counterparty` name, `effectiveDate`.
   - NDA: `mutual` (if mutual/one-way ambiguous),
     `discloseDirection` for one-way, `termYears`, `purpose`.
   - Consulting: `scope`, `rate`, `termWeeks`, `deliverables`,
     `ipAssignment: true` (default; confirm if founder says
     otherwise).
   - Offer letter: `candidate`, `role`, `baseComp`, `startDate`,
     `equityRef` (pointer to `prepare-offer-packet` output if this
     is part of a packet).
   - MSA: `serviceType`, `term`, `autoRenewal`, `liabilityCap`,
     `paymentTerms`.
   - Order form: parent MSA reference, `subscriptionType`,
     `seats`, `fees`, `startDate`, `endDate`.
   - Board consent: matter being approved, directors of record.
   Ask one question at a time. For any variable the user doesn't
   know, mark `TBD` in the draft — never invent.
4. **Render the draft.** Substitute variables into the template
   body. Preserve the founder's own clause language — do not rewrite
   the template to "improve" it; that's what `maintain-template-library`
   is for. Apply risk-posture cues from shared context (e.g. if
   posture is conservative, default to the more protective of two
   alternate clauses the template offers).
5. **Write** the draft to
   `drafts/{type}/{counterparty-slug}-{YYYY-MM-DD}.md` atomically
   (`*.tmp` → rename). Header: `> Draft — pending your review. I
   don't send, file, or request signatures. Move it to your signing
   platform when ready.`
6. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "draft", title, summary, path, status: "draft",
   createdAt, updatedAt, attorneyReviewRequired }`. Set
   `attorneyReviewRequired: true` on anything non-routine — e.g.
   offer letter with non-standard comp, MSA with custom liability
   cap, consulting agreement over $50k total, board consent
   approving a priced round.
7. **Summarize to user** — one paragraph naming the doc type,
   counterparty, key terms, the TBDs I still need, and the path to
   the draft. No "ready to send" framing — always "ready for your
   review."

## Never invent

- Never invent clause language the template doesn't have. If the
  user asks for a clause the template doesn't cover, mark TBD and
  recommend `maintain-template-library` (or a human lawyer for
  non-routine additions).
- Never commit to a position in the draft email (if drafting a cover
  note) that the founder hasn't confirmed.

## Outputs

- `drafts/{type}/{counterparty-slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with type `draft`.
