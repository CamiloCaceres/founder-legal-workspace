# Legal Team — Build Guide

Workspace: `legal-workspace/`
Framing: A solo founder downloads Houston and "hires" a three-person
legal function — a fractional general counsel, a paralegal, and a
compliance operator. No human team. The three agents below cover
everything a week-0 Delaware C-corp founder actually needs from legal:
reviewing what they're about to sign, drafting routine paper, keeping
the privacy and corporate-hygiene calendar from biting them.

---

## Who we're building for

**Solo founder, week 0.** Precise profile:

- Delaware C-corp, incorporated via Clerky / Atlas / Firstbase.
- Stripe, Google Workspace, maybe HubSpot Free. No CLM. No retained
  law firm.
- Pre-revenue or one-customer. No board book yet beyond the initial
  consent. No employees, maybe a contractor or two.
- Has a landing page that probably doesn't have a real privacy policy.
- Already got forwarded a one-page MSA from their first customer and
  doesn't know if the indemnity clause is reasonable.
- Knows "Delaware franchise tax is a thing" but not the deadline.

**What they do NOT need:** an in-house counsel stack (CLM, LEDES,
matter routing, diligence rooms). **What they DO need:** a team they
can chat with that produces drafts, flags risks in plain English, and
keeps deadlines from ambushing them.

**The "done" line:** the founder can triage inbound legal email,
draft outbound paper, review incoming contracts, and stay current on
privacy + corporate hygiene without retaining a lawyer for anything
that isn't a real judgment call.

---

## The three agents

### 1. General Counsel — `general-counsel` (coordinator)

**Job:** fractional GC. Substantive review, strategic judgment, and
the "do I need a real lawyer for this?" decision. Owns
`legal-context.md` — the shared doc every other agent reads before
any substantive output.

**Won't:** render final legal advice, file anything, sign anything,
commit the founder to any position.

**Skills (6 + onboard-me):**

- `onboard-me` — 3 questions (entity + primary jurisdiction, current
  stack of legal templates / files / URLs, founder's risk posture).
- `review-inbound-contract` — MSA / NDA / DPA / order form: extract
  the clauses that matter, compare to market standard, recommend
  accept / redline / reject.
- `advise-on-legal-question` — short memo for "do I need X?" style
  questions (NDA with investors? DPA with this vendor? does GDPR
  apply if…).
- `draft-redline-strategy` — given a reviewed contract + founder's
  goals, produce a prioritized redline plan: must-have / nice-to-
  have / punt.
- `maintain-legal-context` — keep `legal-context.md` current:
  entity, cap table snapshot, standing agreements, outstanding
  risks.
- `weekly-legal-review` — Monday readout: what came in, what's
  pending signature, next deadline, what needs a real lawyer.
- `escalate-to-outside-counsel` — packages context + specific
  questions + deadline for a human lawyer when the agent's judgment
  isn't enough.

### 2. Paralegal — `paralegal`

**Job:** paperwork. Intake triage, routine drafts, template
library, signature tracking, counterparty logging. The volume
worker.

**Won't:** substantive legal judgment on non-routine matters, send
anything without founder approval, draft anything a template library
wouldn't cover.

**Skills (7 + onboard-me):**

- `onboard-me` — 3 questions (counterparty stack via Composio,
  existing template library location, signing platform).
- `triage-inbound-legal-email` — sweep connected inbox for legal-
  flavored inbound (contracts, DSRs, subpoenas, TM office actions);
  classify + summarize + route.
- `draft-from-template` — NDA (mutual / one-way), consulting
  agreement, offer letter, MSA, order form, board consent — driven
  by template library + founder-supplied variables.
- `extract-contract-clauses` — structured extraction from a supplied
  contract (term, termination, auto-renewal, liability cap, IP,
  indemnity, governing law, DPA, AI training); feeds General
  Counsel's `review-inbound-contract`.
- `track-signatures` — state tracking across whichever signing
  platform is connected; chase laggards; file executed copies.
- `maintain-template-library` — version control the founder's
  standard paper; update when law changes.
- `prepare-offer-packet` — first hire: offer letter + CIIAA +
  option grant notice + exercise agreement, anchored to current
  409A.
- `log-counterparty-agreement` — on execution, write structured
  metadata (parties, dates, term, auto-renewal, governing law, key
  obligations) to the counterparty tracker.

### 3. Compliance Ops — `compliance-ops`

**Job:** corporate hygiene + privacy + deadline-watch. Delaware
franchise tax, annual report, 83(b) window, privacy policy / ToS,
subprocessor inventory, trademark, DSR response, 409A refresh clock.

**Won't:** file anything without explicit founder approval, render
regulatory legal advice, decide whether the founder qualifies for a
tax treatment.

**Skills (7 + onboard-me):**

- `onboard-me` — 3 questions (entity + state of incorporation +
  formation date, landing-page URL + existing policies, data
  geography of current users).
- `watch-legal-deadlines` — maintains the calendar: Delaware
  March 1, 83(b) 30-day window, DSR 30-day response, 409A 12-month
  refresh, TM office actions, annual board consent.
- `draft-privacy-policy` — generate / update Privacy Policy + ToS
  against current product surface (data, AI training, subprocessors,
  transfer basis, CA/EU rights).
- `audit-privacy-posture` — walk the landing page + product, check
  against posted policy, flag drift (new analytics, new
  subprocessor, new cookie).
- `maintain-subprocessor-inventory` — list vendors touching customer
  data + DPA status + transfer mechanism.
- `file-delaware-annual-report` — prep the filing: recalculate
  franchise tax under Assumed-Par-Value method, gather directors /
  officers, produce the submission package.
- `run-trademark-knockout` — USPTO Trademark Center search for
  proposed names/marks, return hit / miss / nearest-neighbor risks.
- `draft-dsr-response` — on DSR arrival: acknowledgment letter +
  identity verification request + data export cover note.

---

## Why this split (and why not the other splits)

### Why not 1 mega-agent?

Tried it in the old `houston-skills/legal-workspace/` — ended up as
a role-confused blob (counsel that also ran matter management that
also parsed LEDES invoices). Failed the granularity test: you would
hire two different humans for "review this MSA" vs "draft this
NDA from template" vs "when is the Delaware deadline." Three
different jobs, three agents.

### Why not 4+ agents?

Considered splitting Compliance Ops into `privacy` + `corp-hygiene`,
or Paralegal into `drafter` + `intake`. Rejected: not enough volume
at week 0 to justify separate rosters. Two specialists each
covering 7 skills is better than four specialists each covering 3–4
skills — the founder's chat-context stays coherent, and skills like
`track-signatures` or `maintain-template-library` don't belong in a
separate "ops-ops" agent.

### Why General Counsel as the coordinator, not a separate "Head of Legal"?

A solo founder doesn't hire a "Chief Legal Officer" — they get a
fractional GC. `general-counsel` is the name founders use for "the
lawyer I occasionally call." Making it the coordinator means the
agent that owns the shared context doc is the one founders already
expect to have strategic judgment.

### Why include `weekly-legal-review` on General Counsel?

Every vertical that's shipped well has a weekly review skill on the
coordinator (`review-marketing-health` on HoM, `brief-me` on Head of
Ops). Legal is no different — without a periodic readout, the
founder only talks to Legal reactively, which is exactly the failure
mode week-0 founders fall into.

### Why not put privacy/ToS drafting on `general-counsel`?

Privacy policy + ToS is high-volume, template-driven, and changes
with product surface. That's a paralegal/ops job shape, not a
counsel-level-judgment job. Counsel reviews the policy; Compliance
Ops maintains it.

---

## Coordinator pattern

**`general-counsel` owns `legal-context.md`** — the single markdown
doc the other two agents read before any substantive skill runs. Doc
structure:

1. **Entity** — name, state, formation date, authorized shares,
   par value, registered agent.
2. **Cap table snapshot** — last update, source (Carta / Pulley /
   spreadsheet), current founder stake, option pool, any priced
   round terms.
3. **Standing agreements** — what's currently executed with
   counterparties (customers, vendors, contractors, investors).
   Summary only, not full text.
4. **Template stack** — pointers to the founder's current NDA / MSA
   / consulting / offer / DPA templates, with version + last-
   reviewed date.
5. **Open risks** — things the founder knows are unresolved
   (un-filed 83(b)? unsigned CIIAA? expired DPA?).
6. **Founder risk posture** — aggressive / middle / conservative on
   standard clauses. Updated as the founder gives signals.
7. **Escalation rules** — what the agent will and won't try to
   handle without a human lawyer.

**Every non-coordinator skill opens with:**

> "Before any substantive output, read
> `../general-counsel/legal-context.md`. If it's empty or missing,
> tell the user to spend a few minutes with General Counsel's
> `maintain-legal-context` skill and stop."

---

## Build order

1. **`general-counsel`** — coordinator. Must exist first because
   every other agent reads its shared doc. Includes `onboard-me`
   (entity + jurisdiction + risk posture) and `maintain-legal-context`
   (so the doc exists before anyone else runs).
2. **`paralegal`** — builds on the shared context. Can be built
   before or after compliance-ops; no cross-deps.
3. **`compliance-ops`** — same deal. Can run in parallel with
   paralegal.

---

## Workspace conventions

- All three agents share one monochrome palette in `bundle.js`
  (matches every other verticals-store vertical — no per-agent
  accents). See `scripts/bundle_template.js`.
- Every skill is tool-agnostic. `composio search <category>` at
  runtime. No hardcoded DocuSign / Ironclad / Carta / etc. The same
  skill works whether the founder's signing platform is DocuSign or
  PandaDoc or HelloSign.
- Every skill writes a markdown artifact at agent root + appends an
  entry to `outputs.json`. No state in `.houston/<agent>/`.
- Every outbound is a draft the founder reviews. Nothing gets sent,
  filed, or committed without explicit approval.

---

## What lives where (output tree after all three are built)

```
legal-workspace/
├── workspace.json
├── README.md
├── TEAM-GUIDE.md          (this file)
├── BUILD-CONVENTIONS.md
├── LICENSE
├── .gitignore
├── research/
│   └── 2026-04-23-gumloop-and-web.md
├── scripts/
│   ├── bundle_template.js
│   └── generate_bundles.py
└── agents/
    ├── general-counsel/
    │   ├── houston.json
    │   ├── CLAUDE.md
    │   ├── data-schema.md
    │   ├── README.md
    │   ├── bundle.js           (generated)
    │   ├── icon.png
    │   ├── .gitignore
    │   └── .agents/skills/
    │       ├── onboard-me/SKILL.md
    │       ├── review-inbound-contract/SKILL.md
    │       ├── advise-on-legal-question/SKILL.md
    │       ├── draft-redline-strategy/SKILL.md
    │       ├── maintain-legal-context/SKILL.md
    │       ├── weekly-legal-review/SKILL.md
    │       └── escalate-to-outside-counsel/SKILL.md
    ├── paralegal/
    │   └── ... (7 skills + onboard-me)
    └── compliance-ops/
        └── ... (7 skills + onboard-me)
```

At runtime each agent also produces (never committed):

- `config/` — per-install learned context (profile.json, entity.json,
  voice.md, etc.).
- `outputs.json` — dashboard index.
- Topic subfolders per agent (`contract-reviews/`, `drafts/`,
  `deadlines/`, etc. — see each agent's `data-schema.md`).
- `legal-context.md` (General Counsel only) — the shared doc.

---

## Hand-off

This guide is the spec for the per-agent build phase. Each agent's
build session consumes this guide + `BUILD-CONVENTIONS.md` +
`research/2026-04-23-gumloop-and-web.md`. No new research happens in
the build phase.
