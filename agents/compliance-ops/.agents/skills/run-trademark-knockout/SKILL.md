---
name: run-trademark-knockout
description: Use when the user says "knockout search on {mark}" / "is {name} available" / "trademark clearance" — searches USPTO Trademark Center (Jan 2025 platform) for exact hits, phonetic variants, and visual variants in the relevant Nice classes, returns risk assessment (Low / Medium / High) and recommended next step. Honest about knockout-vs-clearance limits.
---

# Run Trademark Knockout

Not a clearance opinion — a knockout. A knockout answers "is there
an obvious blocker?" It does not answer "can I safely register?"
That second question needs TM counsel.

## When to use

- "Run a knockout on {mark}."
- "Is {name} available as a trademark?"
- Before spending any money on branding, domain purchase, or
  logomark design.
- Before filing a 1(b) intent-to-use application.

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Confirm the mark + classes.** The founder should give you:
   - The proposed **word mark** (and any design element / logo
     separately if relevant — design marks need separate search).
   - The **Nice classes** they care about. For most SaaS founders
     that's **Class 9** (software / downloadable apps) + **Class
     42** (SaaS / platform-as-a-service). For a branded consumer
     hardware play add **Class 35** (retail services) or the
     product class. If the founder doesn't know, propose 9 + 42
     and confirm.

   Write `config/trademark-prefs.json` with
   `{ classes, lastSearchedAt }` if first-time.

3. **Run the knockout against USPTO Trademark Center.** Run
   `composio search uspto` or `composio search trademark` for the
   right tool slug; USPTO Trademark Center (launched Jan 2025) is
   the canonical system. If no connected tool exists, run
   `composio search web-scrape` and query
   `https://tmsearch.uspto.gov/` directly.

   Search in four passes per class:

   - **Exact-word pass** — `mark` as a wordmark.
   - **Phonetic pass** — phonetic equivalents (Kandi vs Candy,
     Fone vs Phone, Noot vs Newt, etc.).
   - **Visual pass** — letter-swap / transliteration (Lyft vs
     Lift, Tumblr vs Tumbler).
   - **Root-word pass** — search the root if the mark is compound
     (e.g. for "BrightCloud" search both "Bright" and "Cloud").

4. **Classify each hit.** For each result capture: serial number,
   full mark, owner, goods/services description, class, filing
   date, status (`LIVE` / `PENDING` / `ABANDONED` / `DEAD`). A
   LIVE or PENDING hit in an overlapping class is a blocker. An
   ABANDONED or DEAD hit is informational (could still be a
   common-law mark issue, but not a registration blocker).

5. **Assess risk.**
   - **High** — exact or phonetic LIVE/PENDING hit in the same
     class. Or: LIVE/PENDING hit with near-identical goods
     description.
   - **Medium** — exact LIVE/PENDING hit in an adjacent class
     (e.g. you want Class 42 SaaS; there's a Class 9 software hit).
     Or: phonetic/visual LIVE/PENDING hit in the same class. Or:
     multiple ABANDONED hits suggesting a crowded field.
   - **Low** — no LIVE/PENDING hits in target or adjacent classes;
     a handful of ABANDONED/DEAD hits, or entirely different
     goods.

6. **Recommend the next step.**
   - Low → file a **1(b) intent-to-use** application once the mark
     is locked, or continue using and file 1(a) once in commerce.
     USPTO filing fee ~$350/class on TEAS Plus.
   - Medium → **retain TM counsel for full clearance** before
     filing; there may be coexistence strategies.
   - High → **rebrand**, or retain TM counsel to evaluate
     coexistence / consent agreements. Do not file.

7. **Write atomically** to
   `tm-searches/{mark-slug}-{YYYY-MM-DD}.md` with:
   - Mark + classes searched + search timestamp.
   - Risk assessment + one-line rationale.
   - Hit table (exact pass, phonetic pass, visual pass, root
     pass) with serial number, mark, owner, class, status.
   - Recommended next step.
   - **Limits disclosure** — verbatim: "This is a knockout search,
     not a full clearance. It covers USPTO federal registrations
     only. It does not cover state registrations, common-law
     marks, foreign marks, or domain/social-handle availability.
     For High-risk results or pre-filing, retain TM counsel."

8. **Append to `outputs.json`** — `{ id, type: "tm-search",
   title, summary, path, status: "ready", createdAt, updatedAt,
   attorneyReviewRequired }`. Flip `attorneyReviewRequired: true`
   on any **High** risk assessment (always) and any **Medium**
   risk assessment that the founder intends to proceed with.

9. **Summarize to user** — risk rating, the single highest-risk
   hit (serial + owner + class), recommended next step, path to
   the full report.

## Outputs

- `tm-searches/{mark-slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "tm-search"`.
