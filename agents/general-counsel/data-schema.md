# General Counsel — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename
onto the target path. Never edit in-place. Never write anywhere under
`.houston/<agent>/` — the Houston file watcher skips those paths and
reactivity breaks. Exception: the seeded `.houston/activity.json`
onboarding card at install time is fine; the agent never writes there
at runtime.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` or by progressive capture.

### `config/profile.json` — written by `onboard-me`

```ts
interface Profile {
  userName: string;
  company: string;
  role?: string;               // e.g. "founder / CEO"
  onboardedAt: string;         // ISO-8601
  status: "onboarded" | "partial";
}
```

### `config/entity.json` — written by `onboard-me`

```ts
interface Entity {
  name: string;
  state: string;               // e.g. "Delaware"
  entityType: string;          // e.g. "C-corp"
  formationDate: string;       // ISO-8601
  authorizedShares?: number;
  parValue?: string;           // e.g. "$0.00001"
  registeredAgent?: string;
  incorporatedVia?: string;    // Clerky / Atlas / Firstbase / other
  source: "paste" | "url" | "file" | "connected-app";
  capturedAt: string;
}
```

### `config/posture.json` — written by `onboard-me`

```ts
interface RiskPosture {
  stance: "aggressive" | "middle" | "conservative";
  notes?: string;              // verbatim founder color
  clausePreferences?: {
    liabilityCap?: string;     // e.g. "1x fees", "12mo fees", "uncapped OK"
    indemnity?: string;
    ipAssignment?: string;
    autoRenewal?: string;
  };
  capturedAt: string;
}
```

### `config/templates.json` — written by `onboard-me`

```ts
interface TemplateStack {
  items: Array<{
    kind: string;              // e.g. "mutual-NDA", "MSA", "CIIAA", "DPA", "offer-letter"
    source: "url" | "file" | "paste" | "none";
    pointer?: string;          // URL or relative path
    version?: string;
    lastReviewed?: string;     // ISO-8601
  }>;
  capturedAt: string;
}
```

---

## The shared legal context doc

### `legal-context.md` — written by `maintain-legal-context`

**Special file.** Lives at the agent root (NOT in a subfolder, NOT
under `.agents/`). Single source of truth for entity, cap table,
standing agreements, templates, open risks, founder risk posture,
and escalation rules across the whole legal workspace.

- The General Counsel is the ONLY agent that writes it.
- Paralegal and Compliance Ops read it via
  `../general-counsel/legal-context.md` before any substantive output.
  If missing, they stop and tell the user to run me first.
- It is a live document. Explicit update events ARE indexed in
  `outputs.json` (so the founder sees "legal context updated") but
  the file itself is not a per-deliverable artifact — it's overwritten
  in place via atomic rename.

Sections (markdown):

1. **Entity** — name, state, formation date, authorized shares, par
   value, registered agent, incorporated via.
2. **Cap table snapshot** — last update, source (Carta / Pulley /
   spreadsheet), founder stake, option pool, any priced round terms.
3. **Standing agreements** — summaries of what's executed with
   customers, vendors, contractors, investors. Summary only, not
   full text.
4. **Template stack** — pointers to current NDA / MSA / consulting /
   offer / DPA templates, with version + last-reviewed date.
5. **Open risks** — things the founder knows are unresolved (un-filed
   83(b)? unsigned CIIAA? expired DPA?).
6. **Founder risk posture** — aggressive / middle / conservative on
   standard clauses, with clause-level color.
7. **Escalation rules** — what the agent will and won't try to handle
   without a human lawyer.

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

Single array at the agent root. Every substantive artifact appends an
entry. Read-merge-write atomically — never overwrite the whole array.

```ts
interface Output extends BaseRecord {
  type: "legal-context"        // maintain-legal-context (indexed per update)
       | "contract-review"     // review-inbound-contract
       | "advice-memo"         // advise-on-legal-question
       | "redline-plan"        // draft-redline-strategy
       | "weekly-review"       // weekly-legal-review
       | "escalation";         // escalate-to-outside-counsel
  title: string;
  summary: string;             // 2-3 sentences
  path: string;                // relative to agent root
  status: "draft" | "ready";
  attorneyReviewRequired?: boolean;  // true when non-routine
}
```

- Start `status: "draft"`. Flip to `"ready"` on founder sign-off.
- `weekly-review` ships as `"ready"` directly (factual rollup).
- `attorneyReviewRequired: true` on any non-routine matter — custom
  indemnity, liability cap above 1x annual fees, unusual IP terms,
  anything over $100K ACV, any cell at `major × likely` or higher on
  the 5×5 severity×likelihood read.
- On update: refresh `updatedAt`, never touch `createdAt`.

### Topic subfolders

All markdown artifacts. One file per deliverable.

| Subfolder | Written by | Filename pattern | Content |
|-----------|------------|------------------|---------|
| `contract-reviews/` | `review-inbound-contract` | `{counterparty-slug}-{YYYY-MM-DD}.md` | Plain-English summary + clause table (Green / Yellow / Red) + accept / redline / walk recommendation |
| `advice-memos/` | `advise-on-legal-question` | `{slug}-{YYYY-MM-DD}.md` | Question → short answer → context → sources cited → next move |
| `redline-plans/` | `draft-redline-strategy` | `{counterparty-slug}-{YYYY-MM-DD}.md` | Must-have / nice-to-have / can-punt with exact redline language for must-haves |
| `weekly-reviews/` | `weekly-legal-review` | `{YYYY-MM-DD}.md` | Cross-agent rollup: inbound paper, pending signatures, next deadline, attorney-review flags, next moves per agent |
| `escalations/` | `escalate-to-outside-counsel` | `{slug}-{YYYY-MM-DD}.md` | Summary, specific questions for lawyer, excerpts, deadline, recommended firm type |

`{slug}` is a short kebab-case identifier (e.g.
`contract-reviews/acme-corp-2026-04-23.md`,
`advice-memos/gdpr-applies-to-landing-page-2026-04-23.md`).

---

## Cross-agent reads

The General Counsel reads (never writes) these files to produce the
Monday review:

- `../paralegal/outputs.json`
- `../compliance-ops/outputs.json`
- `../compliance-ops/deadline-calendar.json` (if present — drives the
  "next deadline" in the weekly review).

The General Counsel may also call `extract-contract-clauses` on
Paralegal as a dependency from `review-inbound-contract`, reading the
resulting clause extract from Paralegal's output path. Never writes to
sister-agent paths.

Each read handles missing gracefully — if an agent isn't installed or
has no outputs yet, note it as "no activity" and continue.

---

## Write discipline

- **Atomic writes.** Always write to `{file}.tmp` first, then rename.
  Partial JSON crashes the dashboard.
- **IDs** are UUID v4.
- **Timestamps** are ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.** The watcher
  skips that path. The seeded install-time `.houston/activity.json`
  card is fine — that's written once at install, not by the agent.
- **`legal-context.md` is live.** It IS indexed in `outputs.json` per
  update event (type `"legal-context"`) so the founder sees when I
  touched it, but the file itself is overwritten in place via atomic
  rename.
