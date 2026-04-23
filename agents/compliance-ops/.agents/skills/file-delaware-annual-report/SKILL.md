---
name: file-delaware-annual-report
description: Use when the user says "prep my Delaware annual report" / "Delaware franchise tax" / approaching March 1 — recalculates franchise tax under both the Authorized-Shares method and the Assumed-Par-Value-Capital method (often 10-100x cheaper for early-stage startups), collects directors / officers / issued shares, and produces the submission package. Prep only — the founder files.
---

# File Delaware Annual Report

Every Delaware C-corp owes a franchise-tax filing + annual report by
**March 1**. Default online calc uses Authorized-Shares and quotes a
scary number — often $75K+ for a standard 10M-authorized-share
startup. The **Assumed-Par-Value-Capital method** almost always
produces a much lower tax (often $400-$1,000 for a small startup).
I run both and flag the savings.

## When to use

- "Prep my Delaware annual report for {year}."
- "Delaware franchise tax is coming up."
- Triggered by `watch-legal-deadlines` when the March 1 deadline
  enters the 90-day window.
- The founder just got a scary invoice from Delaware and wants the
  recalc.

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read config.** `config/entity.json` — confirm
   `stateOfIncorporation === "DE"`. If not, respond: "This only
   applies to Delaware entities; your entity is registered in
   {state}." Stop.

3. **Gather filing inputs.** Read from `legal-context.md`:
   - Entity legal name
   - File number (Delaware state file number, 7 digits)
   - Authorized shares (per share class: common + any preferred)
   - Par value per share (typically $0.0001 or $0.00001 for
     startups)
   - Registered agent name + address
   - Formation date

   Additional inputs needed for the recalc (ask the founder if
   missing, one at a time):
   - **Issued shares as of fiscal year-end** (per class). Pull
     from `composio search cap-table` (Carta / Pulley); if not
     connected, ask.
   - **Gross assets as of fiscal year-end** (from the company's
     balance sheet — total assets line). If the company is
     pre-revenue with <$50K in the bank, this is usually just
     "cash on hand".
   - **Directors** — name + title for each board member.
   - **Officers** — name + title for each (President, Secretary,
     Treasurer at minimum; sole-founder typically holds all three).
   - **Principal place of business** — address (can be founder's
     home office or a registered-agent address).

4. **Run both franchise-tax calculations.**

   **Method A — Authorized-Shares (default, usually higher):**
   - ≤ 5,000 shares: $175 flat (minimum).
   - 5,001-10,000 shares: $250 flat.
   - > 10,000 shares: $250 + $85 per additional 10,000 shares (or
     fraction), capped at $200,000.
   - A 10M-authorized-share startup → ~$85,165 under this method.

   **Method B — Assumed-Par-Value-Capital:**
   1. `assumedParValueCapital = (grossAssets / totalIssuedShares)
      * totalAuthorizedShares`.
   2. Tax = `$400 per $1,000,000 of assumedParValueCapital`
      (minimum $400; maximum $200,000).
   3. A 10M-authorized, 8M-issued, $100K-gross-assets startup →
      `(100000 / 8000000) * 10000000 = $125,000` assumed par value
      → tax $400 (hits the floor).

   Pick the **lower** of A and B. Delaware statute explicitly
   allows the Assumed-Par-Value-Capital election. Cite **8 Del. C.
   §503**.

5. **Show both numbers + the savings.** Example call-out:
   > "Default Authorized-Shares method: $85,165.
   > Assumed-Par-Value-Capital method: $400.
   > Savings: $84,765. Elect Assumed-Par-Value-Capital on the
   > filing form — there's a radio button on the Delaware portal
   > for this."

6. **Assemble the submission package.** Write a single markdown
   file to `annual-filings/de-{year}.md` with:

   - **Summary** — entity, year, total due (lower of methods A/B),
     election being made, deadline (March 1, {year}).
   - **Calculation detail** — both methods, inputs, result.
   - **Annual report content** — entity name, file number,
     principal place of business, phone, directors (name + addr),
     officers (name + addr + title), issued shares.
   - **Step-by-step portal guide** — the URL
     (https://corp.delaware.gov/paytaxes/), log in with entity
     file number, select annual report + franchise tax, enter
     officers + directors, **select "Assumed Par Value" on the
     franchise-tax election radio**, enter gross assets + issued
     shares, pay.
   - **Late-fee warning** — $200 late fee + 1.5% monthly interest;
     failure for two consecutive years results in entity being
     declared void.
   - **Reminders** — registered-agent renewal (separate bill from
     the agent), annual board consent (separate process).

7. **Write atomically** (`*.tmp` → rename).

8. **Append to `outputs.json`** — `{ id, type: "annual-filing",
   title, summary, path, status: "draft", createdAt, updatedAt,
   attorneyReviewRequired }`. Flip `attorneyReviewRequired: true`
   if the cap table has anything unusual — unconverted SAFEs /
   convertibles, multiple preferred classes, shares issued at
   non-standard par, founder stock not yet issued on the ledger,
   or any discrepancy between cap table and board-consented
   issuances.

9. **Mark the calendar row done** once the founder confirms they
   filed. Update `deadline-calendar.json`
   `type: "delaware-franchise-tax"` row → `status: "done"`; next
   year's row will seed on January 1.

10. **Summarize to user** — the two numbers, the savings, the
    deadline, the portal URL, and the reminder: "You file on
    {portalUrl}. I've laid out every field you need to enter."

## Outputs

- `annual-filings/de-{YYYY}.md`
- Appends to `outputs.json` with `type: "annual-filing"`.
