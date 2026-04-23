---
name: review-inbound-contract
description: Use when a counterparty sends an MSA, NDA, DPA, or order form and the founder needs to know if it's signable — extracts the clauses that matter for a solo founder, classifies each Green (accept) / Yellow (pushback acceptable) / Red (redline required) against market standard, and writes a plain-English summary + clause table + accept / redline / walk recommendation.
---

# Review Inbound Contract

## When to use

- "Review this contract from {counterparty}" / "here's the MSA from
  {customer}, what needs to be redlined?" / "is this DPA signable?"
- Counterparty forwards paper via inbox and the founder asks me to
  triage before signing.
- Paralegal's `triage-inbound-legal-email` routes a contract to me
  with a request for review.

Runs once per contract version. If the counterparty sends a new draft
after redlines, run again — produce a new dated file, don't overwrite.

## Steps

1. **Read shared context.** Load `legal-context.md` first — founder
   risk posture, escalation rules, any prior agreement with this
   counterparty. Also load `config/posture.json` for clause-level
   preferences.

2. **Fetch the contract.** Take the document via whichever modality
   the founder used: (a) Composio document-storage (`composio search
   document-storage` — Drive / Dropbox / Box / whatever's linked),
   (b) inbox attachment via `composio search inbox`, (c) URL fetch
   via `composio search web-scrape`, (d) file drop, or (e) paste. If
   the doc is > 20 pages or has non-trivial formatting (tables,
   schedules), prefer fetching the native file over a paste.

3. **Extract clauses (delegate if Paralegal is installed).** If
   `../paralegal/.agents/skills/extract-contract-clauses/SKILL.md`
   exists, invoke it on Paralegal as a dependency — it writes
   structured extraction to its own path. Otherwise do the extraction
   inline. Either way, capture: contract type (MSA / NDA / DPA /
   order form / SOW), counterparty, effective date, term, termination
   (for cause / convenience / notice period), auto-renewal,
   liability cap, indemnity scope, IP assignment / ownership,
   confidentiality scope + term, governing law + venue, DPA presence
   / terms, AI-training carve-out, data-residency, breach-notification
   SLA, exit / data-retrieval rights. For any clause missing from the
   contract, record it as `absent` — some absences are Red (no
   liability cap = uncapped) and some are Green (no non-compete is
   fine).

4. **Classify each clause against market standard for a week-0
   Delaware C-corp.** Use the traffic-light rubric:

   - **Green** (accept as-is) — matches market standard or is more
     favorable to us. Example: liability cap at 1x annual fees,
     mutual indemnity limited to IP infringement + confidentiality,
     30-day termination for convenience.
   - **Yellow** (acceptable with pushback) — off-market but livable
     given leverage. Example: liability cap at 2x annual fees, wider
     indemnity, 60-day termination. Push on these if we have
     leverage; punt if we don't.
   - **Red** (redline required) — materially off-market or risk-
     creating. Example: uncapped liability, one-way indemnity
     against us, IP assignment of anything we create for them,
     auto-renewal with no opt-out window, AI-training carve-out that
     lets them train on our data.

   Each classification cites the market-standard reference (founder-
   legal checklist, Common Paper / YC SAFE / Ironclad public
   benchmarks, whatever was the source). Do NOT invent a "standard"
   I can't cite. If a clause is outside my knowledge, mark it
   `UNKNOWN` and flag for attorney review.

5. **Compute overall recommendation.**
   - **Accept** — all Green, ≤ 1 Yellow.
   - **Redline** — any Red, or ≥ 3 Yellows.
   - **Walk** — ≥ 2 Reds where counterparty has refused redlines on
     material terms before, or Red on IP assignment of our core
     product.

6. **Flag `attorneyReviewRequired: true`** if ANY of:
   - Any clause marked `UNKNOWN`.
   - Custom indemnity (not the standard IP + confidentiality + data
     breach triumvirate).
   - Liability cap above 1x annual fees or uncapped.
   - IP assignment running out of us (our core product IP to them).
   - Non-compete on us.
   - Most-favored-nation clause.
   - Deal size > $100K ACV.
   - Cell at `major × likely` or higher on the 5×5 severity ×
     likelihood read (financial exposure + plausible downside).

7. **Draft the review (markdown, ~500-900 words).**

   1. **Header** — counterparty, contract type, date received,
      reviewer (General Counsel agent), version.
   2. **TL;DR** — 2-3 sentences in plain English. Lead with the
      recommendation (accept / redline / walk) and the one reason.
   3. **Overall recommendation** — accept / redline / walk + one
      paragraph of rationale anchored to founder risk posture.
   4. **Clause-by-clause table** — columns: clause, current text
      (trimmed to ~1 sentence), classification (Green / Yellow /
      Red / UNKNOWN), market standard, rationale.
   5. **Attorney review flag** — yes / no + reason if yes. If yes,
      recommend `escalate-to-outside-counsel` as the next move.
   6. **Next move** — either "sign as-is", "run `draft-redline-
      strategy`", or "escalate — this is above my pay grade".

8. **Write atomically** to
   `contract-reviews/{counterparty-slug}-{YYYY-MM-DD}.md` —
   `{path}.tmp` then rename.

9. **Append to `outputs.json`.** Read-merge-write atomically:

   ```json
   {
     "id": "<uuid v4>",
     "type": "contract-review",
     "title": "Contract review — <counterparty> — <contract type>",
     "summary": "<2-3 sentences — recommendation + the one clause driving it>",
     "path": "contract-reviews/<slug>.md",
     "status": "draft",
     "attorneyReviewRequired": <true | false>,
     "createdAt": "<ISO-8601>",
     "updatedAt": "<ISO-8601>"
   }
   ```

10. **Summarize to user.** One paragraph: recommendation, the top 3
    flagged clauses, whether attorney review is required, and the
    next move ("Want me to draft the redline strategy?" or
    "Recommending escalation — run `escalate-to-outside-counsel`").

## Outputs

- `contract-reviews/{counterparty-slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "contract-review"`.
