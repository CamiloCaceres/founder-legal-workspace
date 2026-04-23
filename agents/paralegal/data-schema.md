# Paralegal — Data Schema

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
onboarding card, written once at install.

---

## Cross-agent read

Before any substantive output, this agent reads
`../general-counsel/legal-context.md` — the shared doc owned by
General Counsel (entity, cap table snapshot, standing agreements,
template stack, open risks, founder risk posture, escalation rules).
If missing or empty, skills tell the user to run General Counsel's
`maintain-legal-context` first and stop.

General Counsel's `review-inbound-contract` reads this agent's
`clause-extracts/` output as a dependency. General Counsel's
`weekly-legal-review` reads this agent's `outputs.json` and
`counterparty-tracker.json`. Compliance Ops's `watch-legal-deadlines`
reads `counterparty-tracker.json` for the renewal / notice clock.

---

## `config/` — what the agent learns about the user

Nothing under `config/` is shipped. Every file appears at runtime,
written by `onboard-me` or by progressive capture inside another
skill the first time it needs the value. `config/` is per-install
state and is gitignored.

### `config/profile.json` — written by `onboard-me`

```ts
interface Profile {
  userName: string;
  company: string;
  onboardedAt: string;        // ISO-8601
  status: "onboarded" | "partial";
}
```

### `config/counterparty-stack.json` — written by `onboard-me`

```ts
interface CounterpartyStack {
  inboxConnectedViaComposio: boolean;
  inboxCategory?: string;            // e.g. "gmail", "outlook"
  docStorageConnectedViaComposio: boolean;
  docStorageCategory?: string;       // e.g. "google-drive", "dropbox"
  signingPlatformConnectedViaComposio: boolean;
  signingPlatformCategory?: string;  // e.g. "docusign", "pandadoc"
  notes?: string;
  capturedAt: string;
}
```

### `config/template-library.json` — written by `onboard-me` and updated by `maintain-template-library`

```ts
interface TemplateLibrary {
  location: "connected-drive" | "url" | "paste";
  locationPointer?: string;           // Drive folder id, URL, or ""
  templates: TemplateRef[];
  capturedAt: string;
}

interface TemplateRef {
  key: "nda-mutual" | "nda-one-way" | "consulting" | "offer-letter"
     | "ciiaa" | "msa" | "order-form" | "board-consent" | string;
  label: string;
  path: string;                       // URL or storage path
  lastReviewed: string;               // ISO-8601
  version?: string;
  notes?: string;
}
```

### `config/voice.md` — written by `onboard-me`

Short markdown describing how the founder writes professional emails:
tone, sign-off, level of formality, sample paragraphs or links to
connected-inbox sent-folder. Used by `draft-from-template` and
`track-signatures` when drafting chaser emails.

### `config/cap-table.json` — written by `prepare-offer-packet` (first run)

```ts
interface CapTable {
  source: "carta" | "pulley" | "spreadsheet" | "paste";
  lastUpdated: string;                // ISO-8601
  strikePrice?: number;               // current 409A
  optionPoolRemaining?: number;
  last409AAt?: string;                // ISO-8601
  notes?: string;
}
```

---

## Top-level files at agent root

### `outputs.json`

Index of every deliverable this agent has produced. Read by the
dashboard; seeded to `[]` via `agentSeeds`.

```ts
interface Output {
  id: string;
  type: "intake-summary" | "draft" | "clause-extract"
      | "signature-status" | "template-review" | "offer-packet"
      | "counterparty-log";
  title: string;
  summary: string;                    // 2-3 sentences
  path: string;                       // relative to agent root
  status: "draft" | "ready";
  createdAt: string;
  updatedAt: string;
  attorneyReviewRequired?: boolean;   // true if non-routine
}
```

Rules:
- On update, refresh `updatedAt`, never touch `createdAt`.
- Never overwrite the array — read, merge, write atomically.
- Mark `draft` while iterating; flip to `ready` on founder sign-off.

### `counterparty-tracker.json` (root, structured)

The structured ledger of every executed agreement. Written by
`log-counterparty-agreement`, updated by `extract-contract-clauses`
when a new counterparty surfaces. Read by Compliance Ops's
`watch-legal-deadlines` and General Counsel's `weekly-legal-review`.

```ts
interface CounterpartyRow {
  id: string;
  counterparty: string;
  agreementType: "nda" | "msa" | "order-form" | "dpa" | "consulting"
               | "offer-letter" | "ciiaa" | "board-consent" | string;
  executedDate: string;               // ISO-8601
  effectiveDate: string;              // ISO-8601
  term: string;                       // free-text, e.g. "2 years" | "perpetual"
  autoRenewal: boolean;
  noticePeriod?: string;              // e.g. "30 days"
  governingLaw: string;               // e.g. "Delaware"
  keyObligations: string[];           // short strings
  renewalDate?: string;               // computed — next auto-renewal or end-of-term
  signedCopyPath: string;             // pointer into document-storage
  createdAt: string;
  updatedAt: string;
}
```

---

## Topic subfolders (markdown files)

Each output's full document is a markdown file under a topic
subfolder at the agent root. The subfolder is created on first use.

| Subfolder               | Written by                    | Contents                                                                                         | `type`              |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ | ------------------- |
| `intake-summaries/`     | `triage-inbound-legal-email`  | `{YYYY-MM-DD}.md` — per-item classification + recommended route.                                | `intake-summary`    |
| `drafts/{type}/`        | `draft-from-template`         | `{counterparty}-{YYYY-MM-DD}.md` under `drafts/nda/`, `drafts/consulting/`, `drafts/msa/`, etc. | `draft`             |
| `clause-extracts/`      | `extract-contract-clauses`    | `{counterparty}-{YYYY-MM-DD}.md` — structured clause map.                                       | `clause-extract`    |
| `signature-status/`     | `track-signatures`            | `{YYYY-MM-DD}.md` — outstanding / signed / overdue + drafted reminders.                         | `signature-status`  |
| `template-reviews/`     | `maintain-template-library`   | `{YYYY-MM-DD}.md` — stale templates + refresh plan.                                             | `template-review`   |
| `offer-packets/`        | `prepare-offer-packet`        | `{candidate-slug}-{YYYY-MM-DD}/` directory with 4 `.md` files + `index.md`.                     | `offer-packet`      |

Filenames are kebab-case; dates are ISO (`YYYY-MM-DD`).

---

## Write discipline

- Atomic writes: `{file}.tmp` → rename. Never leave partial JSON
  readable by the dashboard.
- IDs are uuid v4.
- Timestamps are ISO-8601.
- Updates mutate `updatedAt` only; `createdAt` is immutable.
- `outputs.json` and `counterparty-tracker.json` are merged in-place:
  read array, append or upsert in memory, write atomically.
- Drafts never leave the agent root. No sending, no filing to
  external systems without explicit founder approval.
- Never write under `.houston/<agent>/`.
