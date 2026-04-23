---
name: watch-legal-deadlines
description: Use when the user says "set up my deadline calendar" / "what's due soon" / "what's overdue" / on scheduled cadence — seeds and refreshes the canonical legal calendar (Delaware March 1, 83(b) 30-day, 409A 12-month, DSR 30/45-day, TM office action, annual board consent), computes days-until, flags anything ≤30 days urgent and overdue as critical, and produces a 90-day readout.
---

# Watch Legal Deadlines

The core compliance skill. Maintains `deadline-calendar.json` at the
agent root and produces a human readout for the next 90 days. These
are legal realities, not user preferences — I seed them automatically
from `legal-context.md` + `config/entity.json`.

## When to use

- "Set up my legal deadline calendar."
- "What's due soon?" / "What's overdue?" / "What deadlines are
  coming up?"
- Whenever a cap-table event lands that triggers a 30-day 83(b)
  window (founder stock issuance, option-grant exercise).
- Whenever a 409A is completed (resets the 12-month clock).
- Whenever a DSR arrives (sets a 30-day GDPR or 45-day CCPA clock —
  `draft-dsr-response` triggers this).
- Whenever a TM office action is received (sets a 3-month clock).
- Scheduled cadence (at minimum weekly; daily preferred).

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read config** — `config/entity.json` (state of incorporation,
   formation date), `config/data-geography.json` (does GDPR / CCPA
   apply). If `config/entity.json` is missing, run `onboard-me`
   first and stop.

3. **Read `deadline-calendar.json`** atomically. Default to `[]` if
   missing.

4. **Seed canonical deadlines (upsert if absent for the relevant
   cycle):**

   - **Delaware franchise tax + annual report** — due **March 1**
     every year. Authority: **8 Del. C. §503**. Late fee $200 + 1.5%
     monthly interest. Seed one row per year, rolling forward on
     January 1 of the new year.
     `type: "delaware-franchise-tax"`.
     `description: "Delaware franchise tax & annual report"`.
     `recommendedPrepStart: January 15` (6 weeks out).
     Skip if `stateOfIncorporation !== "DE"`.

   - **83(b) election** — 30 days from any stock issuance. Authority:
     **IRC §83(b)**. Catastrophic to miss — no extensions, no
     exceptions, mailed + certified. Seed one row per issuance event
     found in `legal-context.md` (founder stock, every option
     exercise). If formation date is recent (<60 days old) and no
     83(b) is logged yet, seed a founder-stock row dated
     `formationDate + 30 days` and flag the founder to confirm
     filing. `type: "83b-election"`.
     `recommendedPrepStart: `day of issuance (no buffer; mail same
     week).

   - **409A refresh** — every 12 months OR on a priced round.
     Authority: **IRC §409A safe harbor**. Seed one row dated
     `last409ADate + 12 months`; if no prior 409A and the company
     has issued options, flag that a first 409A is needed before any
     option grant. `type: "409a-refresh"`.
     `recommendedPrepStart: ` 30 days before due.

   - **DSR response clock** — seeded per-DSR by `draft-dsr-response`.
     Authority: **GDPR Art. 15 (30 days from receipt, extensible +2
     months with justification)**; **CCPA Cal. Civ. Code §1798.130
     (45 days from receipt)**. `type: "dsr-response"`.
     One row per open DSR; marked `done` when the export is sent.

   - **TM office action** — 3 months from issuance date (USPTO
     standard). Seeded when `run-trademark-knockout` or the
     paralegal's `triage-inbound-legal-email` flags an office action.
     `type: "tm-office-action"`.
     `recommendedPrepStart: ` 30 days before due.

   - **Annual board written consent** — advisory, not statutory.
     Typically around fiscal-year-end or anniversary of
     incorporation. `type: "annual-board-consent"`.
     `recommendedPrepStart: ` 30 days before due.

5. **For every row compute `alertState`** from days-until-`dueAt`:
   - ≤ 0 days: `alertState = "overdue"`, severity critical.
   - ≤ 1 day: `alertState = "t-1"`.
   - ≤ 7 days: `alertState = "t-7"`.
   - ≤ 30 days: `alertState = "t-30"` (urgent).
   - ≤ 90 days: `alertState = "t-90"`.
   - > 90 days: `alertState = "none"`.

6. **Atomically upsert `deadline-calendar.json`** — one row per
   `(type, dueAt)` pair. Preserve `status: "done"` on completed
   rows; do not revive them. Rollover annual deadlines on the first
   run of a new year.

7. **Produce the 90-day readout.** Filter rows with `alertState` in
   `["t-90", "t-30", "t-7", "t-1", "overdue"]`. Sort ascending by
   `dueAt`. For each, render: type, description, authority, dueAt,
   days-until, `recommendedPrepStart`, urgency badge. Call out in
   plain English: e.g. "Delaware franchise tax is March 1 — that's
   37 days away, start prepping now via
   `file-delaware-annual-report`."

8. **Write** atomically to `deadline-summaries/{YYYY-MM-DD}.md`
   (`*.tmp` → rename).

9. **Append to `outputs.json`** — `{ id, type: "deadline-summary",
   title, summary, path, status: "ready", createdAt, updatedAt,
   attorneyReviewRequired: false }`. Flip `attorneyReviewRequired:
   true` if any row is overdue (overdue 83(b) is a real lawyer
   conversation).

10. **Summarize to user** — the single most urgent deadline, its
    authority, days-until, and the concrete next skill to run (e.g.
    "run `file-delaware-annual-report` now"). Path to the readout.

## Outputs

- `deadline-calendar.json` (upsert at agent root)
- `deadline-summaries/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "deadline-summary"`.
