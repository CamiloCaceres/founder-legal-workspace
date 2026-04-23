---
name: draft-dsr-response
description: Use when the user says "respond to this data subject request" / "a user asked for their data" / "someone wants their account deleted" — produces the three-file first-touch packet (acknowledgment, identity verification, export cover note), computes urgency against the statutory clock (GDPR Art. 15 → 30 days, CCPA → 45 days), and flags late responses for counsel.
---

# Draft DSR Response

A data subject request (DSR) — access, deletion, portability — starts
a statutory clock the moment it lands in your inbox. GDPR Art. 15 is
30 days from receipt (extensible +2 months with justification). CCPA
is 45 days from receipt. Miss the clock and you have a regulator
problem. This skill produces the three-file first-touch packet; the
founder reviews and sends.

## When to use

- "Respond to this DSR from {requester}."
- "A user asked for their data."
- "Someone wants their account deleted."
- "Respond to this privacy request."
- A DSR lands in `privacy@{domain}` and `triage-inbound-legal-email`
  routes it to this skill.

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read config.** `config/entity.json` (legal entity for the
   signature block), `config/data-geography.json` (determines
   applicable law), `subprocessor-inventory.json` (list of
   vendors the export might need to reach).

3. **Capture the request facts.** Ask the founder (or parse from
   the inbound email if provided):
   - **Requester identity** — name + email as stated.
   - **Received date** — ISO-8601.
   - **Request type** — access (GDPR Art. 15 / CCPA "right to
     know"), deletion (GDPR Art. 17 / CCPA "right to delete"),
     portability (GDPR Art. 20 / CCPA), correction (GDPR Art. 16 /
     CCPA), opt-out of sale/sharing (CCPA only), restriction
     (GDPR Art. 18).
   - **Applicable law** — if the requester is in the EU/UK →
     GDPR/UK-GDPR, 30-day clock. If in California (or they cite
     CCPA) → CCPA, 45-day clock. If elsewhere in the US with no
     state privacy law → no statutory clock but respond anyway;
     use the GDPR timeline as a courtesy.

4. **Compute urgency.**
   - `daysSinceReceived = today - receivedDate`.
   - **On track** — `daysSinceReceived <= 7`.
   - **Fine** — `7 < daysSinceReceived <= 21`.
   - **Late** — `daysSinceReceived > 21`. Flag
     `attorneyReviewRequired: true`. The founder may be in
     regulator risk — suggest running
     General Counsel's `escalate-to-outside-counsel` in parallel.

5. **Build the acknowledgment letter.** (File 1 — send within 72
   hours of receipt.) Content:
   - Salutation using requester's stated name.
   - One sentence restating the request type + date received.
   - Statutory timeline, cited: "Under GDPR Art. 15 we will
     respond to access requests within 30 days of receipt" OR
     "Under CCPA (Cal. Civ. Code §1798.130) we will respond to
     this request within 45 days of receipt." State the expected
     response date.
   - One sentence: "Before we can process this request, we need
     to verify your identity — see the attached verification
     request."
   - Company contact: `privacy@{domain}`.
   - Signature block — entity name, signer (suggest the founder's
     name/title from `legal-context.md`).

6. **Build the identity verification request.** (File 2 — send with
   the acknowledgment.) Content:
   - Why verification is required (privacy protection + statutory
     basis — GDPR Recital 64, CCPA Cal. Civ. Code §1798.140(y)).
   - What to provide. For an account holder: confirm the request
     from the email on file (easy path); OR answer two account
     questions (last-four of payment method, account creation
     date, last login date — pick two). For a non-account-holder
     (rare): a government-ID photo with sensitive fields
     redacted, matched against any contact record you hold. Note
     that you only need enough evidence to be confident — not
     over-collect.
   - A note that identity-verification data collected here will
     be used solely for verification and deleted once the request
     is resolved.
   - The statutory clock is paused at the point verification is
     requested and resumes once verification is received. (This
     is standard practice; cite **GDPR Art. 12(6)** for the
     verification extension.)

7. **Build the data export cover note.** (File 3 — draft now, send
   later with the compiled data once it's ready.) Content:
   - One paragraph summarizing what's included — account data,
     usage events, support tickets, billing (redacted),
     AI-processed inputs (if applicable).
   - Format — JSON or CSV, state which.
   - Scope — time range, systems covered. List subprocessors whose
     data is included (pulled from
     `subprocessor-inventory.json`).
   - Redactions — any third-party personal data (e.g. another
     user referenced in a support ticket) is redacted per GDPR
     Art. 15(4) / CCPA §1798.130(a)(3).
   - Next steps — how to request corrections, how to file a
     complaint with the relevant authority (ICO, DPA, California
     AG / CPPA).
   - Signature block.

8. **Write atomically** to
   `dsr-responses/{requester-slug}-{YYYY-MM-DD}/`:
   - `01-acknowledgment.md`
   - `02-identity-verification-request.md`
   - `03-export-cover-note.md`
   (`*.tmp` → rename per file.)

9. **Seed a deadline row.** Call out to
   `watch-legal-deadlines` (or upsert directly to
   `deadline-calendar.json`): `type: "dsr-response"`, `dueAt =
   receivedDate + 30 days` (GDPR) OR `receivedDate + 45 days`
   (CCPA), authority cited, owner founder. Mark `done` when the
   founder confirms the export was sent.

10. **Append to `outputs.json`** — `{ id, type: "dsr-response",
    title, summary, path, status: "draft", createdAt, updatedAt,
    attorneyReviewRequired }`. Flip `attorneyReviewRequired: true`
    if urgency is **Late** OR if the request is a deletion with
    regulatory-retention conflict (e.g. user requests deletion
    but you must retain billing records 7 years for tax — that's
    a legit GDPR Art. 17(3)(b) carve-out but wording matters).

11. **Summarize to user** — urgency, statutory due date, path to
    the packet folder, and the concrete next actions: "(a) send
    #1 + #2 within 72 hours; (b) compile the export; (c) send #3
    with the export before {dueDate}."

## Outputs

- `dsr-responses/{requester-slug}-{YYYY-MM-DD}/01-acknowledgment.md`
- `dsr-responses/{requester-slug}-{YYYY-MM-DD}/02-identity-verification-request.md`
- `dsr-responses/{requester-slug}-{YYYY-MM-DD}/03-export-cover-note.md`
- Appends to `outputs.json` with `type: "dsr-response"`.
- Upserts a `type: "dsr-response"` row in `deadline-calendar.json`.
