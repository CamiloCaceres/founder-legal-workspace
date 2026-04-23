# Legal Vertical Research — Solo Founder at Week 0

**Scrape date:** 2026-04-23
**Scoped for:** solo founder, week 0, Delaware C-corp, Stripe, Google
Workspace, maybe HubSpot Free, pre-revenue or one-customer. **NOT** for
in-house counsel at a 50–300 person startup (that was the old
`houston-skills/legal-workspace/` persona; rebuilt because the persona
was wrong for this store).

---

## Thread 1 — Gumloop (legal-adjacent templates)

The dedicated `gumloop.com/templates/solutions/legal` page **404s** (as
do `.../hr` and `.../finance` — the Gumloop playbook's URL list is
stale). Current live solution pages: Marketing, Sales, Operations,
Engineering, Support. What remains for legal is a handful of general
templates that are legal-adjacent in shape but not legal in framing.

### Legal-adjacent templates

| # | Template | Workflow shape | Feeds skill |
|---|----------|----------------|-------------|
| 1 | **Contract Clause Extractor** | Contract file → document parse → LLM locates user-specified clauses → structured extraction | `extract-contract-clauses` (direct mine) |
| 2 | **Extract content from PDF email attachments** | Inbox attachment → PDF parse → structured note | `triage-inbound-legal-email` (shape mine) |
| 3 | **School Email Key Dates & Action Items Extractor** | Inbox monitor → LLM extracts dates + actions | `watch-legal-deadlines` (shape mine) |
| 4 | **Resume Screening Agent** | Applicant doc → LLM screen → notification | `prepare-offer-packet` (shape mine) |
| 5 | **Invoice Processor** | Inbox/Drive → parse → tracker + notify | `log-counterparty-agreement` (shape mine) |
| 6 | **AI Research Agent + Report Generation** | Query → research → structured report | `advise-on-legal-question` (shape mine) |

Net: **1 directly-mined template** (Contract Clause Extractor) plus 5
workflow shapes repurposed from adjacent verticals. Everything else in
this vertical is invented from domain research — which is normal for
function-verticals Gumloop doesn't curate (see `BUILDING-A-VERTICAL.md`
note: ~50%+ of every shipped vertical is invented-from-role-knowledge).

---

## Thread 2 — What a solo founder actually needs (first 6–12 months)

Compiled from Andrew S. Bosin's 2026 checklist, Promise Legal, Capbase,
YC Sales Agreement, Common Paper, USPTO, Delaware Division of
Corporations, and GDPR/EDPB guidance.

### 2.1 NDA traffic

- **Inbound** (customer/investor sends theirs): review-only. Flag
  problem clauses (unilateral, overlong term, non-solicit, assignment,
  residuals).
- **Outbound** (to contractors, pilot customers, friends-of-company):
  draft standard mutual + one-way templates.
- **Pitch-stage NDAs** — most investors refuse them. Agent should
  *advise* against sending one.

### 2.2 Formation hygiene (already incorporated via Clerky/Atlas, but…)

- **Founder IP assignment (CIIAA).** Without it, company may not own
  its own product. Confirm executed.
- **83(b) election.** 30-day IRS window from stock issuance. Hard
  deadline, catastrophic to miss. Deadline-track + verify mailed +
  certified copy retained.
- **Initial stock issuance + board consent.** Ledger must match cap
  table.

### 2.3 Contractor / consulting agreements

Every contractor (dev shop, designer, fractional person) needs:
**work-for-hire + IP assignment + confidentiality**. Without it, the
contractor retains IP and investor diligence will surface it. Draft +
review both directions.

### 2.4 First customer MSA / SaaS agreement / order form

Standard structure: MSA (umbrella) + Order Form (commercial terms) +
optional SOW / SLA / DPA. YC + Common Paper publish free starter
templates.

**2026 hot clauses:**
- AI training carve-out (does vendor train on your data?)
- Data residency
- Breach notification SLA
- Exit / data retrieval

Founder scenarios:
- (a) I send my own paper to first customer → **draft**
- (b) Enterprise sends their paper-of-paper → **review + redline**

### 2.5 Privacy Policy + Terms of Service

Landing page with Analytics + email capture triggers GDPR scope the
moment an EU visitor lands.

Must cover: data categories, legal basis, purposes, retention, sharing,
rights, contact, cookies. Add CCPA/CPRA "Do Not Sell/Share" disclosures
for CA visitors.

Generators (Termly, TermsFeed) get you 80% there; the last 20% —
AI-training disclosure, subprocessor list, international transfer
basis — needs per-product judgment.

### 2.6 First-hire paperwork (when it happens)

Offer letter + at-will language + CIIAA + option grant notice +
exercise agreement. Strike price anchored to most-recent 409A.

### 2.7 Trademark + domain

USPTO Trademark Center (Jan 2025) for name clearance. Knockout search
is DIY; full clearance benefits from counsel. Secure `.com` + social
handles. File 1(b) intent-to-use once name is locked.

### 2.8 Corporate hygiene

- **Delaware franchise tax + annual report** due **March 1** every
  year, online only. Late fee $200 + 1.5% monthly interest. Min tax
  $175. Assumed-Par-Value-Capital method usually ≪ default
  Authorized-Shares method for early-stage — agent must flag the
  recalculation.
- Annual board written consent.
- Registered agent renewal.

### 2.9 409A valuation

Triggered by: first option grant, priced round, or ~12 months since
last 409A. Required for IRC §409A safe harbor on strike price.

### 2.10 Cap table hygiene

Single source of truth — Carta or Pulley (both Composio-accessible).
Reconcile against stock ledger + board consents + option grants.

### 2.11 DSR readiness

GDPR Art. 15 — one-month response clock (+2 extensible). Triggered
first EU signup. Minimum viable: `privacy@` inbox, documented
intake+verify flow, export/delete capability. CCPA = 45 days.

### 2.12 Basic compliance awareness (pre-SOC2)

Subprocessor inventory, vendor DPAs (Stripe/Google/HubSpot/Anthropic
all publish them), breach response outline, internal security
baseline (SSO, password manager, laptop encryption). Not SOC2 — that's
Series A. This is "don't paint yourself into a corner."

---

## Thread 3 — What we drop from the old workspace

The old `houston-skills/legal-workspace/` targeted in-house counsel at
a 50–300 person startup. Dropped because persona-mismatch:

- LEDES invoice parsing, outside-counsel spend tracking — no outside
  counsel beyond flat-fee formation.
- Matter management at scale — there are no "matters," just a pile of
  docs.
- Diligence room prep — Series A work, not week 0.
- Billing guidelines enforcement — no billing relationship.
- Conflicts checking — one person, no conflicts.
- CLM/iManage/NetDocuments integrations — none of that stack exists.
- Litigation hold / e-discovery — not a week-0 concern.
- In-house triage queue — no legal team to route to.
- Board book production at scale — one board, maybe three people,
  twice a year.

**What survives in spirit** (not code — we rebuild around the solo
founder): template library, contract review, deadline tracking,
privacy/policy maintenance, NDA traffic-light rubric (Green / Yellow /
Red), 5×5 risk matrix (severity × likelihood). These domain primitives
are sound; they just get re-housed inside skills scoped to a founder.

---

## Thread 4 — Proposed roster (3 agents, tightened)

After trimming from the initial proposal to respect the "5–10 skills
per agent" ceiling:

### `general-counsel` — coordinator, substantive judgment (6 skills + onboard-me)

| # | Skill | Use when | Derived from |
|---|-------|----------|--------------|
| 1 | `review-inbound-contract` | Counterparty sends MSA/NDA/DPA/order form; founder needs to know if it's signable | Contract Clause Extractor (direct) + MSA/NDA research |
| 2 | `advise-on-legal-question` | Founder asks "do I need X?" (NDA with investors, DPA with this vendor, whether GDPR applies) | AI Research Agent shape + legal checklist corpus |
| 3 | `draft-redline-strategy` | Reviewed contract needs response; prioritize must-have vs nice-to-have vs punt | NDA + MSA research |
| 4 | `maintain-legal-context` | Keep `legal-context.md` current (entity, cap table snapshot, standing agreements, open risks) | Coordinator pattern — net new |
| 5 | `weekly-legal-review` | Monday readout: what came in, what's pending signature, what deadline is next, what needs a real lawyer | Coordinator pattern — net new |
| 6 | `escalate-to-outside-counsel` | Question exceeds agent judgment; package context + specific questions + deadline for a human lawyer | Persona-specific |

### `paralegal` — paperwork, templates, intake, drafts (7 skills + onboard-me)

| # | Skill | Use when | Derived from |
|---|-------|----------|--------------|
| 1 | `triage-inbound-legal-email` | Inbox needs a sweep for contracts/DSRs/subpoenas/TM office actions | Extract-PDF-attachment + School-Email-Dates shapes |
| 2 | `draft-from-template` | Need an NDA / consulting agreement / offer letter / MSA / order form / board consent | Template-library + NDA/MSA/consulting research |
| 3 | `extract-contract-clauses` | Counterparty contract in hand; need structured clause extraction for review | Contract Clause Extractor (direct mine) |
| 4 | `track-signatures` | Contracts out for signature; who's outstanding, who's signed, where's the executed copy | Derived — no direct template |
| 5 | `maintain-template-library` | Version control the founder's standard paper; update template when law changes | Template-resources research |
| 6 | `prepare-offer-packet` | First hire; need offer letter + CIIAA + option grant notice + exercise agreement anchored to current 409A | First-hire research + Resume Screening shape |
| 7 | `log-counterparty-agreement` | Contract executed; capture parties/dates/term/auto-renewal/governing-law/key-obligations to tracker | Invoice Processor shape |

### `compliance-ops` — privacy, corporate hygiene, deadlines, policy (7 skills + onboard-me)

| # | Skill | Use when | Derived from |
|---|-------|----------|--------------|
| 1 | `watch-legal-deadlines` | Maintain calendar: Delaware March 1, 83(b) 30-day, DSR 30-day, 409A 12-month, TM office actions | Corporate + 83(b) + DSR research; School-Email-Dates shape |
| 2 | `draft-privacy-policy` | Need/update Privacy Policy + ToS covering data, AI training, subprocessors, transfer basis, CA/EU rights | Privacy-generator research |
| 3 | `audit-privacy-posture` | Landing page + product drifted from posted policy (new analytics, new subprocessor, new cookie) | GDPR startup checklist |
| 4 | `maintain-subprocessor-inventory` | Track vendors touching customer data + their DPA status + transfer mechanism | Pre-SOC2 hygiene |
| 5 | `file-delaware-annual-report` | March 1 prep: recalculate franchise tax under Assumed-Par-Value method, gather directors/officers | Delaware research (direct) |
| 6 | `run-trademark-knockout` | Proposed name/mark; return hit/miss + nearest-neighbor risks from USPTO Trademark Center | USPTO research |
| 7 | `draft-dsr-response` | Data subject request arrived; produce acknowledgment + identity verification + export cover note | GDPR Art. 15 research |

**Total:** 20 substantive skills + 3 onboard-me = 23 skills. Within
the 5–10/agent ceiling (GC: 6, paralegal: 7, compliance-ops: 7).

---

## Thread 5 — Coverage gap audit (invented vs mined)

- **Directly mined from Gumloop:** 1 skill (`extract-contract-clauses`).
- **Shape-mined from adjacent Gumloop templates:** 4 skills
  (`triage-inbound-legal-email`, `watch-legal-deadlines`,
  `prepare-offer-packet`, `log-counterparty-agreement`).
- **Mined from web research (no Gumloop analog, but published in
  domain checklists):** 10 skills (`review-inbound-contract`,
  `draft-from-template`, `draft-privacy-policy`,
  `file-delaware-annual-report`, `run-trademark-knockout`,
  `draft-dsr-response`, `audit-privacy-posture`,
  `maintain-subprocessor-inventory`, `draft-redline-strategy`,
  `advise-on-legal-question`).
- **Invented from role + multi-agent topology:** 5 skills
  (`maintain-legal-context`, `weekly-legal-review`,
  `escalate-to-outside-counsel`, `maintain-template-library`,
  `track-signatures`).

**Ratio:** 24% Gumloop · 50% web research · 26% topology-invented.
Gumloop signal is thin for legal — expected given they killed the
solutions page. The domain is well-documented in the public startup-
legal corpus, which fills the gap cleanly.

---

## Hand-off

The build phase consumes this MD as spec. Build `general-counsel` first
(coordinator + shared context doc), then `paralegal` + `compliance-ops`
in parallel (both depend on `legal-context.md`, no cross-deps between
them).
