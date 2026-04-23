# Compliance Ops — Data Schema

All paths are relative to the agent root. Nothing lives under
`.houston/<agent>/` — Houston's file watcher skips that prefix. Every
JSON write is atomic: write `{file}.tmp` then rename.

## Base record

```ts
interface BaseRecord {
  id: string;          // uuid v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

---

## Config — what the agent has learned about the founder

Nothing in `config/` ships in the repo. Every file appears at runtime,
written by `onboard-me` or progressively the first time a skill needs
the value.

### `config/profile.json` — written by `onboard-me`

```ts
interface Profile {
  userName?: string;
  company?: string;
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/entity.json` — written by `onboard-me`

```ts
interface Entity {
  entityName: string;
  entityType: "C-corp" | "LLC" | "S-corp" | "other";
  stateOfIncorporation: string;   // "DE" expected for most
  formationDate: string;          // ISO-8601 date — anchors 83(b)
  source: "composio" | "paste" | "file";
  capturedAt: string;
}
```

### `config/landing-page.json` — written by `onboard-me`

```ts
interface LandingPage {
  url: string;
  deployedPolicies: {
    privacyPolicyUrl?: string;
    tosUrl?: string;
    cookiePolicyUrl?: string;
  };
  source: "paste" | "file" | "url";
  capturedAt: string;
}
```

### `config/data-geography.json` — written by `onboard-me`

```ts
interface DataGeography {
  userRegions: ("US" | "EU" | "UK" | "CA" | "other")[];
  caResidents: boolean;    // triggers CCPA applicability
  euResidents: boolean;    // triggers GDPR applicability
  source: "paste" | "inferred";
  capturedAt: string;
}
```

### Other config files (just-in-time)

| File | Written by | When |
|------|------------|------|
| `config/trademark-prefs.json` | `run-trademark-knockout` | First TM search — captures Nice classes of interest |

---

## Top-level files at agent root

### `outputs.json` — index of every artifact

```ts
interface Output extends BaseRecord {
  type: "deadline-summary" | "privacy-draft" | "privacy-audit"
      | "subprocessor-review" | "annual-filing" | "tm-search"
      | "dsr-response";
  title: string;
  summary: string;           // 2-3 sentences
  path: string;              // relative to agent root
  status: "draft" | "ready";
  attorneyReviewRequired?: boolean;
}
```

Seeded to `[]` via `agentSeeds`.

### `deadline-calendar.json` — written / refreshed by `watch-legal-deadlines`

```ts
interface DeadlineRow extends BaseRecord {
  type: "delaware-franchise-tax" | "83b-election" | "409a-refresh"
      | "dsr-response" | "tm-office-action" | "annual-board-consent";
  description: string;            // e.g. "Delaware franchise tax & annual report"
  authority: string;              // e.g. "8 Del. C. §503", "IRC §83(b)", "GDPR Art. 15"
  dueAt: string;                  // ISO-8601
  recommendedPrepStart: string;   // ISO-8601
  alertState: "none" | "t-90" | "t-30" | "t-7" | "t-1" | "overdue";
  status: "pending" | "done";
  owner: "founder";
  notes?: string;
}
```

One row per `(type, dueAt)` pair. Annual deadlines roll over on the
first run of a new year. Completed rows carry `status: "done"` and
are not revived.

### `subprocessor-inventory.json` — written / refreshed by `maintain-subprocessor-inventory`

```ts
interface Subprocessor extends BaseRecord {
  vendorName: string;
  role: "hosting" | "analytics" | "email" | "ai" | "payments"
      | "crm" | "support" | "storage" | "other";
  dataCategories: string[];       // e.g. ["account", "usage", "billing"]
  transferMechanism: "SCCs" | "EU-US-DPF" | "intra-EU" | "US-only"
                   | "UK-IDTA" | "unknown";
  dpaStatus: "executed" | "pending" | "missing" | "not-applicable";
  dpaUrl?: string;                // public DPA page if known
  region: string;                 // e.g. "US", "EU", "Global"
  notes?: string;
}
```

---

## Subfolders (markdown artifacts)

Each output's full document is a markdown file under a topic
subfolder at the agent root. Created on first use. Filenames are
kebab-case.

| Subfolder | Written by | Contents |
|-----------|------------|----------|
| `deadline-summaries/` | `watch-legal-deadlines` | Human readout of the calendar — next 90 days with days-until + recommended prep-start. Filename: `{YYYY-MM-DD}.md`. |
| `privacy-drafts/` | `draft-privacy-policy` | Privacy Policy + ToS drafts. Filenames: `privacy-policy-{YYYY-MM-DD}.md`, `tos-{YYYY-MM-DD}.md`. |
| `privacy-audits/` | `audit-privacy-posture` | Drift report — each drift with severity + recommended update. Filename: `{YYYY-MM-DD}.md`. |
| `subprocessor-reviews/` | `maintain-subprocessor-inventory` | Human-readable rollup of the JSON inventory. Filename: `{YYYY-MM-DD}.md`. |
| `annual-filings/` | `file-delaware-annual-report` | Delaware submission package — recalc (both methods), officers, directors, step-by-step portal guide. Filename: `de-{YYYY}.md`. |
| `tm-searches/` | `run-trademark-knockout` | USPTO knockout results — exact / phonetic / visual hits, risk, next step. Filename: `{mark-slug}-{YYYY-MM-DD}.md`. |
| `dsr-responses/` | `draft-dsr-response` | Three-file packet per DSR — acknowledgment, ID verification, export cover. Folder: `{requester-slug}-{YYYY-MM-DD}/`. |

---

## Cross-agent reads

- **`../general-counsel/legal-context.md`** — shared context. Read
  by every substantive skill BEFORE doing any work. If missing or
  empty, the skill stops and tells the founder to run General
  Counsel's `maintain-legal-context` first.
- **`../paralegal/counterparty-tracker.json`** (optional) — read by
  `watch-legal-deadlines` when computing contract-driven deadlines
  (e.g. TM opposition windows tied to a counterparty filing).

Compliance Ops does **not** write to other agents' directories. The
General Counsel's `weekly-legal-review` reads back this agent's
`outputs.json` + `deadline-calendar.json` on Monday.

---

## Write discipline

- Atomic writes: `{file}.tmp` → rename. Never leave partial JSON.
- Every record has `id` (uuid v4), `createdAt`, `updatedAt`.
- Updates refresh `updatedAt` only; `createdAt` is immutable.
- `outputs.json` + `deadline-calendar.json` + `subprocessor-inventory.json`
  are merged in place — read existing array, upsert, write
  atomically. Never overwrite wholesale.
- Never write under `.houston/<agent>/` — Houston's watcher skips it
  and dashboards won't react. The seeded `.houston/activity.json`
  onboarding card is the one exception (install-seeded, not
  runtime-written).
