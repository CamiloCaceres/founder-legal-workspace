---
name: draft-privacy-policy
description: Use when the user says "draft a privacy policy" / "update my ToS" / "write a cookie policy" — scans the landing page via Composio web-scrape, cross-references the subprocessor inventory + data geography, and produces Privacy Policy + ToS drafts with legal-basis citations, AI-training disclosure, and subprocessor list. Drafts only — the founder deploys.
---

# Draft Privacy Policy

Grounded in your real product surface — scraped analytics + cookies +
subprocessors — not a generator template. Every clause cites its
legal basis.

## When to use

- "Draft my Privacy Policy."
- "Update my ToS."
- "Write me a cookie policy."
- After adding a new analytics tool, payment processor, or AI
  vendor — the product surface changed, the policy needs to change.
- First-time publish before launch.

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read config.** `config/entity.json` (legal entity for the
   contact block), `config/landing-page.json` (URL + any deployed
   policies), `config/data-geography.json` (EU/CA applicability).
   If any is missing, ask ONE question (best modality: paste for URL,
   paste for data geography). Write the config atomically before
   proceeding.

3. **Read `subprocessor-inventory.json`** at agent root. If missing
   or empty, run `maintain-subprocessor-inventory` first and stop
   — the Privacy Policy needs an accurate subprocessor list.

4. **Scrape the landing page.** Run `composio search web-scrape` to
   discover the available scraper (Firecrawl / ScrapingBee /
   Browserless) and execute by slug to pull: rendered HTML, the full
   list of third-party scripts, cookies set, network calls to
   third-party domains, and any existing Privacy Policy / ToS URLs
   it links to. If no web-scrape tool is connected, tell the founder
   which category to link and stop.

5. **Build the Privacy Policy draft.** Required sections, in order:

   - **Who we are** — entity name, state of incorporation,
     `privacy@{domain}` contact.
   - **Data we collect** — enumerated categories: account (email,
     name), usage (analytics events, IP, device), billing (if
     applicable), support (ticket content), cookies (see cookie
     section). List each category with its source (the user, their
     browser, inferred).
   - **Legal basis (GDPR)** — if `euResidents: true`: cite
     **GDPR Art. 6(1)(b)** for contract-necessary processing
     (account, billing), **Art. 6(1)(f)** for legitimate-interest
     processing (analytics, security), **Art. 6(1)(a)** for
     consent-based processing (marketing cookies, optional
     features). Map each data category to its basis.
   - **Purposes** — provide the service, bill, support, secure,
     improve, comply. One purpose per category; no vague
     "business purposes" catch-all.
   - **Retention** — per category, stated in time (e.g. "account
     data while the account is active + 90 days", "billing records
     7 years per tax law", "analytics events 13 months").
   - **Sharing / subprocessors** — paste the full
     `subprocessor-inventory.json` list with vendor name, role, and
     public DPA URL. Sub-bullet: "we do not sell personal
     information" (if `caResidents: true`, CCPA requires the
     explicit statement).
   - **International transfers** — if `euResidents: true`: name the
     transfer mechanism (SCCs for non-DPF-certified US vendors,
     EU-US DPF for certified vendors). Cite the SCC module used
     (typically Module 2 controller-to-processor for hosting +
     analytics).
   - **User rights** — access, rectification, deletion,
     portability, objection, withdrawal of consent. If
     `euResidents: true`: cite **GDPR Art. 15-21**. If
     `caResidents: true`: cite **Cal. Civ. Code §1798.100-1798.130**
     + the "right to opt out of sale / sharing" toggle. State how
     to exercise (email `privacy@{domain}`; we respond within 30
     days per GDPR or 45 days per CCPA).
   - **Cookies** — enumerate by category (strictly necessary,
     functional, analytics, marketing), each with vendor + purpose
     + retention. Pulled from the scrape.
   - **AI-training disclosure** (the 2026 hot clause) — for each
     AI vendor in the subprocessor list (Anthropic, OpenAI, etc.),
     state whether customer data is used to train vendor models.
     Cite the vendor's DPA or AI terms. If unknown, mark UNKNOWN
     and flag to resolve.
   - **Changes** — how you notify users of material changes (email
     for account holders; updated "Last updated" date).
   - **Contact** — `privacy@{domain}` + mailing address (the
     registered-agent address from `legal-context.md` is fine for a
     week-0 company with no office).

6. **Build the ToS draft.** Required sections, in order:
   acceptable-use, account responsibilities, IP ownership (user
   retains UGC license to the company; company retains product IP),
   liability cap (for solo-founder week-0: mutual cap at fees paid
   in trailing 12 months; exclude indirect/consequential damages —
   note that enterprise counterparties will push on this), warranty
   disclaimer, governing law (Delaware, per entity), venue (Delaware
   or the founder's state), dispute resolution (informal → arbitration
   for US users, carve-out for IP / injunctive), termination, entire
   agreement.

7. **Flag UNKNOWNs.** Any section where the scrape or inventory
   couldn't supply the fact — mark UNKNOWN in the draft and list
   them at the top. Never invent.

8. **Write atomically** to
   `privacy-drafts/privacy-policy-{YYYY-MM-DD}.md` and
   `privacy-drafts/tos-{YYYY-MM-DD}.md` (`*.tmp` → rename). Include
   a "Last updated" date and a one-paragraph cover at the top noting
   this is a draft grounded in the scrape run on `{YYYY-MM-DD}`.

9. **Append to `outputs.json`** — two entries, one per file,
   `{ id, type: "privacy-draft", title, summary, path,
   status: "draft", createdAt, updatedAt, attorneyReviewRequired }`.
   Flip `attorneyReviewRequired: true` if: any UNKNOWN remains, any
   AI vendor's training policy is unclear, or the product touches
   children under 13 (COPPA), health data (HIPAA), or financial data
   beyond payment processing (GLBA).

10. **Summarize to user** — biggest UNKNOWN / biggest change from
    any existing policy, path to the drafts, and the reminder: "You
    deploy — paste into your site or route to legal review before
    publishing."

## Outputs

- `privacy-drafts/privacy-policy-{YYYY-MM-DD}.md`
- `privacy-drafts/tos-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "privacy-draft"` (two
  entries).
