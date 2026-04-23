---
name: audit-privacy-posture
description: Use when the user says "audit my privacy" / "what's drifted" / "is my policy accurate" — scrapes the landing page + product via Composio web-scrape, cross-checks against the deployed Privacy Policy, and flags drift (new analytics, undisclosed subprocessor, new cookie, purpose drift) with severity and recommended updates. Surfaces diffs only — never auto-fixes.
---

# Audit Privacy Posture

Your policy and your product drift apart the moment you add a new
analytics tool. This audit catches that gap before a regulator,
investor, or customer does.

## When to use

- "Audit my privacy posture."
- "What's drifted since I last updated the policy?"
- After deploying a new analytics tool, marketing pixel, chat
  widget, or AI vendor.
- On scheduled cadence (monthly is a good default; `watch-legal-
  deadlines` can surface a reminder).
- Before any funding round or customer DPA request.

## Steps

1. **Read shared context.** Read `../general-counsel/legal-context.md`.
   If missing or empty, respond:
   > "I need the shared legal context first — please run General
   > Counsel's `maintain-legal-context` skill, then come back."
   Stop. Do not proceed.

2. **Read config.** `config/landing-page.json` for the URL +
   deployed policy URL. If `deployedPolicies.privacyPolicyUrl` is
   unknown, ask the founder ONE question: "What's your current
   public Privacy Policy URL?" If they say "nothing's deployed yet",
   redirect to `draft-privacy-policy` and stop.

3. **Read `subprocessor-inventory.json`** at agent root for the
   current documented vendor list.

4. **Scrape both surfaces.** Run `composio search web-scrape` to
   discover the scraper and execute by slug:
   - Scrape the landing page + linked signed-in / product pages if
     accessible.
   - Scrape the currently-deployed Privacy Policy URL.
   Capture from each: third-party scripts (domains loaded),
   cookies set (name, domain, category hint), network calls to
   third-party endpoints, meta tags, any visible vendor logos.

5. **Build the diff.** Compare deployed (scraped) vs disclosed
   (policy + inventory):

   - **`new-analytics`** — a scraped script domain matches a known
     analytics vendor (Google Analytics, Segment, Mixpanel,
     PostHog, Amplitude, Heap, Hotjar, FullStory, Pendo, etc.) but
     is not named in the policy OR inventory. Severity: **High** if
     it tracks identified users; **Medium** if only anonymous.

   - **`undisclosed-subprocessor`** — a scraped third-party endpoint
     matches a subprocessor (Stripe, HubSpot, Intercom, Zendesk,
     Mailchimp, Vercel, Cloudflare, Anthropic, OpenAI, etc.) not
     present in `subprocessor-inventory.json`. Severity: **High**
     if it processes personal data (AI vendors, email, CRM);
     **Medium** otherwise.

   - **`new-cookie`** — a cookie set on the deployed surface not
     covered by the policy's cookie section. Classify category.
     Severity: **Medium** for analytics/marketing; **Low** for
     strictly-necessary.

   - **`purpose-drift`** — data collection endpoints imply a
     purpose not stated in the policy (e.g. scraped forms collect
     fields the policy doesn't list; session replay loaded but
     not disclosed; user-level telemetry sent to an AI vendor
     without AI-training disclosure). Severity: **High**.

   - **`stale-policy`** — the policy's "Last updated" date is more
     than 12 months old OR more than 90 days older than the last
     material product change you can detect. Severity: **Medium**.

6. **Recommend updates.** For each drift, write a one-line
   recommended policy update or inventory addition. Never auto-fix
   — the founder routes to `draft-privacy-policy` or
   `maintain-subprocessor-inventory` next.

7. **Write atomically** to `privacy-audits/{YYYY-MM-DD}.md` with:
   - Header: URL scanned, policy URL scanned, scan timestamp.
   - Drift table: finding, category, severity, evidence (domain /
     cookie / endpoint), recommended update.
   - Summary: count by severity, overall posture (Clean / Minor
     drift / Material drift / Critical drift), next skill to run.

8. **Append to `outputs.json`** — `{ id, type: "privacy-audit",
   title, summary, path, status: "ready", createdAt, updatedAt,
   attorneyReviewRequired }`. Flip `attorneyReviewRequired: true`
   if any **High**-severity drift is found.

9. **Summarize to user** — posture rating, count of High-severity
   drifts, the single most material finding with evidence, path to
   the audit, and the concrete next skill (usually
   `draft-privacy-policy` or `maintain-subprocessor-inventory`).

## Outputs

- `privacy-audits/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "privacy-audit"`.
