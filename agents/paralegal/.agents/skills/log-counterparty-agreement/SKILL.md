---
name: log-counterparty-agreement
description: Use when the user says "log this executed agreement" / "add {counterparty} to the tracker" / on any contract execution — appends a structured row to `counterparty-tracker.json` at agent root (id, counterparty, agreementType, executedDate, effectiveDate, term, autoRenewal, noticePeriod, governingLaw, keyObligations, renewalDate, signedCopyPath). Feeds Compliance Ops's renewal clock and General Counsel's weekly review.
---

# Log Counterparty Agreement

## When to use

- Explicit: "log the executed agreement with {counterparty}", "add
  {contract} to the tracker", "record the signed {MSA/NDA/consulting}".
- Implicit: `track-signatures` moves an item to the **Signed**
  bucket — recommend this skill to capture the metadata before the
  renewal clock becomes relevant. `extract-contract-clauses` has
  already upserted a row for an unsigned draft; on execution, this
  skill completes the `executedDate` + `signedCopyPath`.
- Runs per-agreement. For multiple, call once per agreement.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop.
2. **Locate the executed copy.** Accept: (a) path inside connected
   document-storage, (b) URL, (c) file attachment, (d) paste of the
   signed text. If document-storage is connected, run
   `composio search document-storage` and fetch by path.
3. **Check existing tracker.** Read `counterparty-tracker.json` and
   look for a row keyed by `counterparty + agreementType`. If
   `extract-contract-clauses` already wrote one, upsert; otherwise
   insert new.
4. **Extract or confirm the metadata.** If a `clause-extracts/`
   file exists for this counterparty, pull from there (don't
   re-parse). Otherwise parse the executed copy and extract:
   - `counterparty` (legal name)
   - `agreementType` (`nda` | `msa` | `order-form` | `dpa` |
     `consulting` | `offer-letter` | `ciiaa` | `board-consent` |
     custom string)
   - `executedDate` (date of last signature) — ISO-8601
   - `effectiveDate` — ISO-8601
   - `term` (free-text: "2 years", "perpetual", "until terminated")
   - `autoRenewal` (boolean)
   - `noticePeriod` (e.g. "30 days before renewal")
   - `governingLaw` (state or jurisdiction)
   - `keyObligations[]` — top 3-5 obligations on us (payment,
     confidentiality, SLA, IP, etc.)
   - `signedCopyPath` — pointer into document-storage where the
     executed copy lives
   If any field can't be determined from the document, mark it
   `UNKNOWN` rather than guessing. For critical fields
   (`executedDate`, `term`, `autoRenewal`, `governingLaw`), ask the
   user one at a time until resolved.
5. **Compute `renewalDate`.** If `autoRenewal` is true: compute
   `effectiveDate + term` (or end-of-current-period + term) and
   note the notice-to-cancel window. If false but `term` has an end
   date: set `renewalDate` to the end (so the renewal clock fires
   for a prompt re-negotiation). If `term` is "perpetual" or
   "until terminated": leave `renewalDate` empty.
6. **Upsert** to `counterparty-tracker.json` at agent root
   atomically (`*.tmp` → rename). Read existing array, upsert row
   keyed by `(counterparty, agreementType)`, write atomically.
   Set `createdAt` on insert; refresh `updatedAt` on upsert.
7. **Append to `outputs.json`** — one entry,
   `type: "counterparty-log"`, `path` pointing at
   `counterparty-tracker.json`, `summary` naming counterparty +
   agreement type + effective date + renewal date (if any). Set
   `attorneyReviewRequired: true` if any critical field was left
   UNKNOWN.
8. **Summarize to user** — one paragraph: "Logged {counterparty}
   {agreementType} — executed {date}, term {X}, auto-renews: {y/n},
   next renewal check: {date or n/a}. Compliance Ops's
   `watch-legal-deadlines` will surface the renewal clock. Signed
   copy filed at {signedCopyPath}."

## Never overwrite without reason

- Never clobber an existing row without confirming the counterparty
  + agreementType pair actually matches (e.g. if there are two MSAs
  with the same counterparty a year apart, insert a new row —
  differentiate by `effectiveDate` in the id).
- Never invent dates. `UNKNOWN` is a valid value.

## Outputs

- Upsert in `counterparty-tracker.json` at agent root.
- Appends to `outputs.json` with type `counterparty-log`.
