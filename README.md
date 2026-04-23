# Founder Legal Workspace

A Houston workspace for **solo founders at week 0** — a three-agent
legal function you can chat with instead of retaining a firm for
routine work. Delaware C-corp hygiene, contract review + drafting,
privacy / ToS, trademark knockout, deadline calendar.

---

## The three agents

| Agent | What it owns | Use it when you want to… |
|-------|--------------|--------------------------|
| **General Counsel** | Substantive review, strategic judgment, the shared `legal-context.md` doc, the "do I need a real lawyer?" call | Review an inbound MSA/NDA, draft the redline plan, ask a targeted legal question, escalate to outside counsel, Monday legal review |
| **Paralegal** | Paperwork, templates, intake, drafts, signature tracking, counterparty logging | Triage your legal inbox, draft an NDA / consulting agreement / offer letter / MSA from template, extract clauses from a contract, prep the first-hire offer packet |
| **Compliance Ops** | Privacy policy + ToS, corporate hygiene, deadline calendar, subprocessor inventory, trademark knockout, DSR response | Draft your privacy policy, prep the Delaware annual report (March 1), respond to a DSR, run a trademark knockout, watch every legal deadline on your calendar |

The **General Counsel** owns `legal-context.md` — a living document
capturing your entity, cap-table snapshot, standing agreements, template
stack, open risks, and risk posture. The other two agents read it
before any substantive task. Write it once; every agent stays
consistent.

---

## Who this is for

- **Solo founder, week 0.** Delaware C-corp. Stripe, Google Workspace,
  maybe HubSpot Free. Pre-revenue or one-customer. No retained lawyer.
- You've been forwarded a one-page MSA from your first customer and
  don't know if the indemnity clause is reasonable.
- You know "Delaware franchise tax is a thing" but aren't 100% on the
  deadline.
- You need a privacy policy for your landing page but a generator
  won't cover AI-training disclosure or your actual subprocessor list.
- You need a first-hire offer packet but don't want to pay outside
  counsel for an at-will offer letter + CIIAA + option grant notice.

**Not for:** in-house counsel at a 50–300 person company (use a real
CLM), or solo GCs running matter management at scale. This workspace
is intentionally scoped to the first 6–12 months of a Delaware C-corp.

---

## Hard constraints (built in)

- **Never sends, files, or signs anything** without explicit founder
  approval. Every outbound is a draft.
- **Never renders final legal advice.** Non-routine matters
  auto-flag `attorneyReviewRequired: true` and route to
  `escalate-to-outside-counsel`.
- **Privilege-aware.** Skills preserve privilege markers and don't
  leak summaries of privileged work to third-party channels.
- **Composio-only transport.** No hardcoded DocuSign / Carta /
  HubSpot / Gmail. Connect whatever stack you already use in Houston's
  Integrations tab; the agents discover tool slugs at runtime.
- **Markdown-out.** Every deliverable lands as a markdown file in
  your filesystem. No vendor lock-in.

---

## Install

**Via Houston:** Settings → Add workspace from GitHub → paste this
repo's URL. Houston installs all three agents into a single
workspace.

All agents ship with seeded `outputs.json` and an "Onboard me" activity
card so dashboards render cleanly on first launch.

---

## First week

Day 1 — **General Counsel → `maintain-legal-context`**. The shared
doc exists. Everything else unblocks.

Day 2 — **Compliance Ops → `watch-legal-deadlines`**. The deadline
calendar exists. You learn Delaware's March 1 deadline and your 83(b)
window status in the same breath.

Day 3 — **Paralegal → `triage-inbound-legal-email`**. Your inbox gets
swept. NDAs and contracts are now visible instead of buried.

Day 4 — **Compliance Ops → `draft-privacy-policy`**. Your landing
page gets a real privacy policy with your actual subprocessor list and
AI-training disclosure.

Week 2 — first customer MSA arrives. **General Counsel →
`review-inbound-contract`**, then **`draft-redline-strategy`**.
Paralegal can also `extract-contract-clauses` if the doc is thick.

Month 2 — first hire. **Paralegal → `prepare-offer-packet`** produces
the offer letter + CIIAA + option grant notice + exercise agreement.
Compliance Ops reminds you the 83(b) 30-day clock starts on grant.

Month 3 — Monday review. **General Counsel → `weekly-legal-review`**
synthesizes everything. You spend 2 minutes on legal instead of 2
hours.

---

## How the agents work together

Each agent is read-only in its dashboard and chat-first in its
workflow. When you want output, you **chat** with the agent — it
produces a markdown artifact and indexes it in `outputs.json`. The
dashboard is purely reactive.

Cross-agent reads:

- **Paralegal** and **Compliance Ops** both read
  `../general-counsel/legal-context.md` before any substantive task.
- **General Counsel's `weekly-legal-review`** reads
  `../paralegal/outputs.json` and `../compliance-ops/outputs.json` to
  synthesize the weekly rollup.
- **General Counsel's `review-inbound-contract`** can call
  **Paralegal's `extract-contract-clauses`** as a dependency for heavy
  contracts.

You can freely reference one agent's outputs while chatting with
another — same workspace root, relative paths work.

---

## Structure

```
legal-workspace/
├── workspace.json
├── README.md               (this file)
├── TEAM-GUIDE.md           (agent roster defense + skill lists)
├── BUILD-CONVENTIONS.md    (build-time rules for contributors)
├── LICENSE                 (MIT)
├── .gitignore
├── research/
│   └── 2026-04-23-gumloop-and-web.md
├── scripts/
│   ├── bundle_template.js
│   └── generate_bundles.py
└── agents/
    ├── general-counsel/
    ├── paralegal/
    └── compliance-ops/
```

Each agent folder:
- `houston.json` — manifest (tabs, icon, `agentSeeds`, `useCases`)
- `CLAUDE.md` — agent identity + skill index
- `data-schema.md` — what the agent reads / writes
- `bundle.js` — custom read-only dashboard (generated)
- `icon.png` — 256×256 placeholder
- `README.md` — agent-specific first prompts
- `.agents/skills/*/SKILL.md` — one per skill

---

## Try these first

**General Counsel:**
- "Set up my legal context doc"
- "Review this MSA from {customer} — what should I redline?"
- "Do I need an NDA before the investor meeting?"
- "Package the XYZ matter for a real lawyer — here's the deadline"

**Paralegal:**
- "Triage my legal inbox"
- "Draft a mutual NDA for {counterparty}"
- "Extract the key clauses from this contract"
- "Prepare the offer packet for {candidate}"

**Compliance Ops:**
- "Set up my legal deadline calendar"
- "Draft my privacy policy and ToS"
- "When is Delaware franchise tax due, and how much?"
- "Run a trademark knockout on {mark}"
- "A DSR just arrived — help me respond in time"

---

## Prior art

An earlier iteration at
[`houston-skills/legal-workspace/`](https://github.com/CamiloCaceres)
(not this repo) targeted in-house counsel at a 50–300 person company.
This workspace rebuilds it for the solo-founder-at-week-0 persona —
drops LEDES invoice parsing, matter management at scale, diligence
rooms; keeps the NDA traffic-light rubric and the contract review
discipline.

See `research/2026-04-23-gumloop-and-web.md` for the full delta and
the Gumloop scrape results (the legal solutions page 404s as of this
scan — Gumloop has deprecated dedicated legal templates).

---

## License

MIT.
