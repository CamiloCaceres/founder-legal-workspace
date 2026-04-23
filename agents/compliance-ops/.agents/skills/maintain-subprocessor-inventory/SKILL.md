---
name: maintain-subprocessor-inventory
description: Use when the user says "update my subprocessor list" / "what vendors touch customer data" / on every new vendor touching customer data — walks connected integrations + inferred vendors from the landing-page scrape, captures role + data categories + transfer mechanism + DPA status + public DPA URL, and maintains `subprocessor-inventory.json` at the agent root.
---

# Maintain Subprocessor Inventory

One structured list of every vendor touching customer data. Feeds
`draft-privacy-policy` and `audit-privacy-posture`. Hardcodes the
public DPA URLs for the top 10 common vendors so the founder doesn't
hunt.

## When to use

- "Update my subprocessor inventory."
- "What vendors touch customer data?"
- "Do I have a DPA with {vendor}?"
- On every new integration link (the founder adds a new Composio
  connection → refresh).
- Before publishing / updating the Privacy Policy.
- Before sending a DPA to a customer (they'll ask for the list).

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read current inventory.** Read `subprocessor-inventory.json`.
   Default to `[]` if missing.

3. **Walk connected integrations.** Run `composio search` across the
   categories that carry customer data: `hosting`, `analytics`,
   `email`, `ai`, `payments`, `crm`, `support`, `storage`. For each
   connected slug, capture the vendor name.

4. **Infer additional vendors.** If `config/landing-page.json` has a
   URL, run `composio search web-scrape` and scrape it for
   third-party domains (Cloudflare, Vercel, Google Analytics, Meta
   Pixel, Stripe.js, Intercom widget, etc.). Add any not already
   connected.

5. **For each vendor, populate or refresh the row:**

   - `vendorName` — canonical name.
   - `role` — one of: `hosting`, `analytics`, `email`, `ai`,
     `payments`, `crm`, `support`, `storage`, `other`.
   - `dataCategories` — e.g. `["account", "usage"]`,
     `["billing", "payment-method"]`, `["support-content"]`,
     `["customer-inputs"]` (for AI vendors).
   - `transferMechanism` — `SCCs` (vendor is non-DPF US with SCCs
     in DPA), `EU-US-DPF` (DPF-certified), `intra-EU`,
     `UK-IDTA`, `US-only` (no EU users), `unknown`. If
     `config/data-geography.json.euResidents === false`, mark
     `US-only`.
   - `dpaStatus` — `executed` (you've clicked-through or
     signed), `pending`, `missing`, `not-applicable` (no
     personal data). Default `pending` on new rows with a note.
   - `dpaUrl` — use the hardcoded public URL table below; if not
     listed, ask the founder to paste the DPA URL.
   - `region` — vendor HQ / primary region.
   - `notes` — anything weird (e.g. "AI vendor; see training
     section below").

6. **Known public DPA URLs (hardcoded — public, stable):**

   | Vendor | DPA URL |
   |--------|---------|
   | Stripe | https://stripe.com/legal/dpa |
   | Google (Workspace / Cloud / Analytics) | https://cloud.google.com/terms/data-processing-addendum |
   | HubSpot | https://legal.hubspot.com/dpa |
   | Anthropic | https://www.anthropic.com/legal/dpa |
   | OpenAI | https://openai.com/policies/data-processing-addendum |
   | Vercel | https://vercel.com/legal/dpa |
   | Cloudflare | https://www.cloudflare.com/cloudflare-customer-dpa/ |
   | AWS | https://aws.amazon.com/service-terms/ (GDPR DPA embedded) |
   | Slack | https://slack.com/trust/compliance/data-processing-addendum |
   | Intercom | https://www.intercom.com/legal/data-processing-agreement |

   Use these verbatim. If a DPA URL has moved, mark the row
   `dpaStatus: "missing"` and flag for the founder to resolve — do
   not guess.

7. **AI-training disclosure.** For any `role: "ai"` vendor, add a
   `notes` field summarizing whether customer data is used to train
   vendor models (per the vendor's current DPA or AI terms).
   Anthropic + OpenAI API: by default, API inputs/outputs are not
   used for training. Mark UNKNOWN and flag for follow-up if you
   can't confirm from the DPA URL.

8. **Atomically upsert `subprocessor-inventory.json`.** Merge by
   `vendorName` — update existing rows, add new ones, preserve
   historical `createdAt`. `updatedAt` refreshes on change.

9. **Write the human review** atomically to
   `subprocessor-reviews/{YYYY-MM-DD}.md` with:
   - Total vendor count by role.
   - Table: vendor, role, data categories, transfer mechanism, DPA
     status, DPA URL.
   - Flags: every row where `dpaStatus` is `missing` or `pending`.
   - AI-training call-out: every AI vendor with its training
     disclosure status.
   - Recommended next moves (execute missing DPAs; confirm
     UNKNOWNs).

10. **Append to `outputs.json`** — `{ id, type:
    "subprocessor-review", title, summary, path, status: "ready",
    createdAt, updatedAt, attorneyReviewRequired }`. Flip
    `attorneyReviewRequired: true` if any vendor touching personal
    data has `dpaStatus: "missing"` OR if `config/data-
    geography.json.euResidents` is `true` and any non-DPF US vendor
    has no SCCs.

11. **Summarize to user** — vendor count, count of missing DPAs,
    path to the review, and the concrete next moves (e.g. "Execute
    the HubSpot DPA at {url}; confirm Anthropic training policy in
    your account settings").

## Outputs

- `subprocessor-inventory.json` (upsert at agent root)
- `subprocessor-reviews/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "subprocessor-review"`.
