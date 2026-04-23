---
name: advise-on-legal-question
description: Use when the user asks "do I need X?" / "does {regulation} apply to me?" / "is this OK?" — writes a short advice memo with Question → Short answer → Context → Sources cited → Next move, and ends with a judgment-call disclaimer. Never renders final legal advice.
---

# Advise on Legal Question

## When to use

- "do I need an NDA with investors?" — typically no, pitch-stage
  investors refuse them.
- "do I need a DPA with {vendor}?" — depends on what data, what
  region.
- "does GDPR apply to me?" — depends on EU visitors / customers +
  what data.
- "can I use this customer logo on my landing page?" — depends on
  the MSA's marketing rights clause.
- "do I need to file an 83(b)?" — probably yes, within 30 days of
  stock issuance. Hard deadline.
- Any "do I need X?" or "does X apply?" question that fits in a
  short memo.

## Steps

1. **Read shared context.** Load `legal-context.md` for entity, data
   geography of current users, standing agreements, founder risk
   posture, escalation rules. Also read any relevant prior
   `advice-memos/` entries — don't re-answer what we already decided.

2. **Clarify the question (at most one follow-up).** If the question
   hinges on a fact not in context, ask ONE targeted question with
   the best-modality hint. Examples:
   - "Does GDPR apply?" → "Do you have analytics on the landing page
     + any EU visitors? A connected Plausible / GA / Fathom account
     via Composio answers this in 30s."
   - "Do I need a DPA with {vendor}?" → "What data does {vendor}
     touch — customer PII, payment data, employee data, or just my
     own company docs?"
   Don't ask more than one. If the question is broad, scope it
   ("let's narrow to {subquestion}").

3. **Research if needed.** For questions where I cite regulations,
   checklists, or market standards, use `composio search web-search`
   (or similar — discover at runtime) to pull authoritative sources:
   primary statute / regulation text, EDPB / IRS / SEC / USPTO
   guidance, reputable founder-legal checklists (Capbase, Andrew
   Bosin, Promise Legal, YC, Common Paper). Cite every source
   inline. No "probably" hedges — state it or mark UNKNOWN.

4. **Draft the memo (~200-400 words, direct, verb-led).** Structure:

   1. **Question** — the founder's question in one sentence,
      verbatim if possible.
   2. **Short answer** — one paragraph. First sentence is the
      bottom line ("Yes", "No", "It depends — here's the rule").
      No hedging. If it truly depends, state the two or three
      forks and what decides between them.
   3. **Context** — one paragraph: why this applies to this founder
      specifically. Reference their entity (Delaware C-corp),
      stage (week 0, pre-revenue / one customer), stack (Stripe,
      Google Workspace), and any relevant standing agreement or
      data geography.
   4. **Sources cited** — bulleted. Each with a one-line why-it-
      matters. Primary statute > regulator guidance > reputable
      checklist. 2-5 sources, no Wikipedia.
   5. **Next move** — one concrete action. Examples: "Draft the
      DPA via Paralegal's `draft-from-template`", "Add to
      `compliance-ops` subprocessor inventory", "File 83(b)
      within {N} days — Compliance Ops tracks this on the deadline
      calendar".
   6. **Judgment-call disclaimer** — "This is a judgment call; not
      final legal advice. Escalate via `escalate-to-outside-counsel`
      if {specific condition — e.g. the data is health-related, the
      EU customer is a regulated entity, the deal is over $100K}."

5. **Flag `attorneyReviewRequired: true`** if the question touches:
   - HIPAA, PCI-DSS, COPPA, biometrics, export controls.
   - International data transfers with a non-standard mechanism.
   - Tax treatment decisions (QSBS eligibility, 83(b) filing
     mechanics beyond the deadline itself, R&D credit).
   - Securities offerings beyond standard SAFE / priced round.
   - Employment law beyond the at-will / offer-letter / CIIAA trio.
   - Anything criminal, regulatory enforcement, or litigation-
     adjacent.

6. **Write atomically** to
   `advice-memos/{slug}-{YYYY-MM-DD}.md` — `{path}.tmp` then
   rename. Slug is a short kebab-case of the question (e.g.
   `gdpr-applies-to-landing-page`, `do-i-need-nda-with-investors`,
   `dpa-with-stripe`).

7. **Append to `outputs.json`.** Read-merge-write atomically:

   ```json
   {
     "id": "<uuid v4>",
     "type": "advice-memo",
     "title": "Advice — <question short form>",
     "summary": "<2-3 sentences — the bottom line + the next move>",
     "path": "advice-memos/<slug>-<YYYY-MM-DD>.md",
     "status": "ready",
     "attorneyReviewRequired": <true | false>,
     "createdAt": "<ISO-8601>",
     "updatedAt": "<ISO-8601>"
   }
   ```

   (Advice memos ship as `ready` — they're factual + cited; the
   founder decides whether to act, not whether to approve a draft.)

8. **Summarize to user.** One paragraph: the bottom line, the next
   move, and whether attorney review is required. Drop the path to
   the memo.

## Outputs

- `advice-memos/{slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "advice-memo"`.
