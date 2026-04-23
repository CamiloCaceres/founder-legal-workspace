---
name: extract-contract-clauses
description: Use when the user says "extract the clauses from this contract" / "what's in this agreement" / when General Counsel's `review-inbound-contract` calls this as a dependency — reads a supplied contract (file, URL, or paste), extracts the structured clauses that matter (term, termination, renewal, liability cap, indemnity, IP, governing law, DPA, AI training, data residency, exit rights), writes a human-readable map to `clause-extracts/`, and updates `counterparty-tracker.json`.
---

# Extract Contract Clauses

## When to use

- Explicit: "extract the clauses", "what's in this contract", "map
  this agreement", "pull the clause table from this MSA/DPA/order
  form".
- Implicit: General Counsel's `review-inbound-contract` calls this
  skill first to get structured clauses before doing the substantive
  review. Also called by `triage-inbound-legal-email` when a Yellow
  NDA needs deeper parsing.
- Runs on a single contract at a time. For multiple, call the skill
  per contract.

## What gets extracted

Every extract covers these fields (any that aren't present: mark
MISSING, not TBD):

- **Parties** — legal names + entity types on each side.
- **Effective date** and **term** (fixed period, until terminated,
  perpetual, etc.).
- **Termination** — for convenience? for cause? notice required?
- **Auto-renewal** — yes/no, length, notice-to-prevent-renewal window.
- **Notice period** — general notice obligations.
- **Liability cap** — dollar amount or multiple-of-fees formula.
  Uncapped? Mutual? Carve-outs (indemnity, IP, confidentiality)?
- **Indemnity** — who indemnifies whom, for what. Is it mutual?
  Third-party IP claims covered?
- **IP ownership + license** — who owns what pre-existing / created
  IP; license scope; feedback clause.
- **Governing law + venue** — state, courts, arbitration clause.
- **DPA presence** — is there a data processing addendum attached or
  referenced? **SCCs** attached? Transfer mechanism named.
- **AI-training carve-out** — does the vendor / counterparty commit
  NOT to train on customer data? Is there an opt-in / opt-out?
- **Data residency** — where is data stored / processed?
- **Breach SLA** — breach-notification clock (e.g. 72 hours).
- **Exit / data-retrieval rights** — export format, retention after
  termination, deletion obligation.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop.
2. **Locate the contract.** Accept: (a) a file path or attachment,
   (b) a URL or document-storage pointer, (c) pasted text. If
   document-storage is connected, run `composio search
   document-storage` and fetch by path. If none of the three is
   provided, ask ONE question: "Paste the contract, give me a URL,
   or point me to it in your document storage."
3. **Parse.** Extract plain text from the document. If parsing
   fails (scanned PDF with no OCR, image-only, corrupted), tell the
   user and ask for a text-extractable version. Do not guess.
4. **Walk the clause checklist above.** For each field, locate the
   relevant clause, quote the exact operative language (≤ 2 sentences
   per field), and note the section reference. If a field is absent
   from the contract, mark **MISSING**. If the language is ambiguous,
   mark **UNCLEAR** and quote what's there.
5. **Derive a counterparty summary.** Pick `counterparty`,
   `agreementType`, `effectiveDate`, `executedDate` (if the contract
   is already signed), `term`, `autoRenewal`, `noticePeriod`,
   `governingLaw`, `keyObligations[]` (top 3-5 obligations on us —
   payment, SLAs, confidentiality, IP, etc.). Compute `renewalDate`
   if `autoRenewal` is true: `effectiveDate + term` (or
   end-of-current-period + term).
6. **Write** the extract to
   `clause-extracts/{counterparty-slug}-{YYYY-MM-DD}.md` atomically
   (`*.tmp` → rename). Structure: header with parties + type at
   top, then one section per field with the quoted language +
   section reference. Close with a "Needs a human judgment call"
   list naming anything UNCLEAR or unusual.
7. **Update `counterparty-tracker.json`.** Upsert a row keyed by
   `counterparty + agreementType`. If the contract isn't signed yet,
   leave `executedDate` empty; `log-counterparty-agreement` fills it
   in on execution.
8. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "clause-extract", title, summary, path,
   status: "draft", createdAt, updatedAt, attorneyReviewRequired }`.
   Set `attorneyReviewRequired: true` if: liability is uncapped on
   our side, IP assignment flows away from us, governing law is
   non-US, indemnity is one-way against us, DPA is missing on a
   data-processing contract, or there's any UNCLEAR field a GC
   review would need to reconcile.
9. **Summarize to user** — one paragraph: "Pulled clauses for
   {counterparty}: term {X}, cap {Y}, indemnity {Z}, governing law
   {W}. Flagged N items as UNCLEAR or needing attorney review. Full
   map at `clause-extracts/...`. Want me to hand to General
   Counsel's `review-inbound-contract`?"

## Never invent

Every extracted field ties to quoted language in the contract. No
clause standards, case law, or precedent invented. If you can't cite
it, mark MISSING or UNCLEAR.

## Outputs

- `clause-extracts/{counterparty-slug}-{YYYY-MM-DD}.md`
- Upserts a row in `counterparty-tracker.json`.
- Appends to `outputs.json` with type `clause-extract`.
