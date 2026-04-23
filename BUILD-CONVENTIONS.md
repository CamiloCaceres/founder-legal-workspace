# Build Conventions — legal-workspace

Every build subagent reads this before writing files. Reference
implementations:

- `../founder-marketing-workspace/agents/head-of-marketing/` — the
  canonical coordinator-with-shared-doc agent shape (CLAUDE.md,
  houston.json, onboard-me SKILL.md, data-schema.md, README.md).
- `../founder-marketing-workspace/BUILD-CONVENTIONS.md` — the doc
  this is modelled on; non-conflicting rules there still apply.
- `TEAM-GUIDE.md` (this workspace) — agent roster, skill lists,
  coordinator pattern.
- `research/2026-04-23-gumloop-and-web.md` — the research spec each
  agent build phase consumes.

---

## File tree per agent

```
agents/{agent-id}/
├── houston.json            # manifest (required)
├── CLAUDE.md               # 50–100 lines, pointer-style identity + skill index
├── data-schema.md          # documents every file read/written
├── README.md               # who this agent is for + first prompts
├── bundle.js               # read-only dashboard (generated)
├── icon.png                # 256×256 placeholder PNG
├── .gitignore              # *.tmp + config/
└── .agents/skills/
    ├── onboard-me/SKILL.md
    ├── {skill-1}/SKILL.md
    ├── {skill-2}/SKILL.md
    └── ...
```

---

## `houston.json` — shape

```json
{
  "id": "{agent-id}",
  "name": "{Agent Display Name}",
  "description": "{one-paragraph describing the agent's job + the 'never' boundary}",
  "icon": "{LucideIconName}",
  "category": "business",
  "author": "Houston Legal",
  "tags": ["legal", "solo-founder", "..."],
  "tabs": [
    { "id": "overview", "label": "Overview", "customComponent": "Dashboard" },
    { "id": "activity", "label": "Activity", "builtIn": "board", "badge": "activity" },
    { "id": "job-description", "label": "Job Description", "builtIn": "job-description" },
    { "id": "files", "label": "Files", "builtIn": "files" },
    { "id": "integrations", "label": "Integrations", "builtIn": "integrations" }
  ],
  "defaultTab": "overview",
  "agentSeeds": {
    "outputs.json": "[]",
    ".houston/activity.json": "[{\"id\":\"{uuid}\",\"title\":\"Onboard me — 3 quick questions (~90s)\",\"description\":\"Click this card, then send any message. I'll ask three things: {T1}, {T2}, {T3}. Best modality per topic: connected app via Composio (Integrations tab) > file/URL > paste.\",\"status\":\"needs_you\"}]"
  },
  "useCases": [ /* 5–8 per agent, see rules below */ ]
}
```

**Rules:**

- First tab `id` MUST be `overview` — not `dashboard`/`connections`/
  `settings` (collides with app shell).
- `customComponent` is exactly `"Dashboard"` — matches the bundle
  export `window.__houston_bundle__ = { Dashboard: Dashboard }`.
- `agentSeeds` MUST include `outputs.json` seeded to `"[]"` and the
  `.houston/activity.json` onboarding card.
- Use distinct `icon` (Lucide name) per agent. Recommendations:
  General Counsel → `Scale`; Paralegal → `FileSignature`;
  Compliance Ops → `ShieldCheck`.
- `tags` should always include `legal` + `solo-founder` + 1–2 role-
  specific tags.

### `useCases` — the founder-facing prompt menu (5–8 per agent)

Each entry has four content fields + four meta fields:

| Field | Length | Where shown |
|---|---|---|
| `title` | short verb phrase | Overview tile, Job Description |
| `blurb` | 6–12 words | Overview tile only |
| `prompt` | 1–2 lines, `{placeholders}` | Job Description + clipboard fallback |
| `fullPrompt` | 3–8 lines, richer | Clipboard payload (hidden) |
| `description` | 1–2 sentences | Job Description only |
| `outcome` | concrete path/artifact | Job Description only |
| `category` | 1–2 word group label | Overview eyebrow |
| `skill` | skill-id this invokes | Job Description |
| `tool` (optional) | external app name | Overview eyebrow |

**Writing rules (copy verbatim from the marketing workspace):**

1. Concrete, not generic. ❌ "Analyze my legal risk." ✅ "Review this
   MSA clause-by-clause and tell me what to redline."
2. Lead `title` with a verb. ❌ "Contract review skill." ✅ "Review
   an inbound contract and recommend redlines."
3. `blurb` is a fragment answering "what do I get?" — e.g. "Green /
   yellow / red on every clause, with the redline plan."
4. `fullPrompt` names the skill in plain language where it helps
   routing ("Use the `review-inbound-contract` skill; paste the doc
   or point me at it in Drive").
5. `outcome` names the exact file path: "Review at
   `contract-reviews/{slug}-{YYYY-MM-DD}.md`."
6. Order matters. `useCases[0]` becomes the "Start here" first card.
7. 4–6 categories per agent max. Suggested per agent:
   - General Counsel: `Review · Advice · Coordination · Weekly`
   - Paralegal: `Intake · Drafts · Templates · Tracking · Hiring`
   - Compliance Ops: `Privacy · Deadlines · Corporate · Trademark`

---

## `CLAUDE.md` — shape (50–100 lines)

Required sections in order:

1. `# I'm your {role}` — 2–3 lines: mission + boundary.
2. `## To start` — onboard-me trigger rule: if first message is
   short / empty / "go" AND `config/profile.json` is missing, run
   `onboard-me` immediately.
3. `## My skills` — one line per skill: "`skill-name` — use when X".
4. **For `general-counsel` only:** `## I own legal-context.md` —
   one short paragraph: this is the shared doc; the other two
   agents read it before any substantive skill; I write it from
   `maintain-legal-context`.
5. **For `paralegal` and `compliance-ops`:** `## Before any
   substantive skill` — reads the shared doc at
   `../general-counsel/legal-context.md`. If empty / missing, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop.
6. `## Composio is my only transport` — categories this agent uses
   (e.g. inbox, document-storage, signing-platform, cap-table, TM
   registry). Discovered at runtime with `composio search`.
7. `## Data rules` — agent root, never under `.houston/<agent>/`,
   atomic writes, record id + ISO-8601 timestamps, list of top-
   level files this agent owns.
8. `## What I never do` — legal-specific hard nos (see below).

No manifesto. If longer than 100 lines, cut.

### Universal legal hard nos (include every agent's CLAUDE.md)

- Never renders final legal advice. Every non-routine matter flags
  `attorneyReviewRequired: true`.
- Never sends, files, posts, or signs anything without explicit
  founder approval. Every outbound is a draft.
- Never invents precedent, case law, statutes, or clause standards
  it can't cite.
- Never makes commitments on the founder's behalf — including
  promises in email triage ("we'll sign by Friday" is the
  founder's call, not the agent's).
- Privilege-aware. Skills preserve privilege markers on privileged
  work product; don't leak summaries of privileged matters into
  third-party channels.
- Never hardcodes tool names. Composio search at runtime.
- Never writes under `.houston/<agent>/`. Exception: seeded
  `.houston/activity.json` at install.
- Never skips atomic writes. `*.tmp` then rename.

---

## `SKILL.md` — shape

```markdown
---
name: {skill-id}
description: Use when {observable trigger phrase} — {one-sentence summary of what happens}.
---

# {Skill Title}

## When to use

- Explicit trigger phrases the user says.
- Implicit triggers (another skill depends on this).
- Only runs N times / per-entity / on-schedule (if relevant).

## Steps

1. **Read shared context** (non-coordinator agents):
   `../general-counsel/legal-context.md`. If missing, tell user to
   run `maintain-legal-context` first and stop.
2. **Read config** needed for this skill. If missing, ask ONE
   targeted question with the best modality hint (connected app >
   file > URL > paste). Write to `config/{file}.{json|md}`.
3. {actual work — concrete, numbered, imperative}
4. **Write** the markdown artifact to `{topic}/{slug}.md` (atomic:
   `*.tmp` → rename).
5. **Append to `outputs.json`** — see schema below.
6. **Summarize to user** — one paragraph + path to artifact + next
   action (e.g. "Want me to draft the redline?").

## Outputs

- `{topic}/{slug}.md` (concrete path)
- Appends to `outputs.json` with
  `{ id, type, title, summary, path, status, createdAt, updatedAt }`.
```

**Rules:**

- Description starts with "Use when…" and names an observable
  trigger.
- One skill = one purpose. If it does 3 things, it's 3 skills.
- Every skill that touches external docs reads via Composio
  (`composio search document-storage` / `inbox` / `signing-platform`
  / etc.) — never hardcoded.
- Every skill writes markdown + `outputs.json` entry (except
  `onboard-me` and `maintain-legal-context` which write their own
  structured files).
- Atomic writes: `*.tmp` → rename.

---

## `outputs.json` — schema (every agent)

```ts
interface Output {
  id: string;          // uuid v4
  type: string;        // agent-specific enum (see each agent's data-schema.md)
  title: string;
  summary: string;     // 2–3 sentences
  path: string;        // relative to agent root
  status: "draft" | "ready";
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;
  attorneyReviewRequired?: boolean;  // legal-specific: flags non-routine matters
}
```

- Start `status: "draft"`. Flip to `"ready"` when founder signs off
  in chat.
- On update, refresh `updatedAt`, never touch `createdAt`.
- Never overwrite the whole array — read, append/merge, write.
- `attorneyReviewRequired: true` on any output the skill deems
  non-routine; surfaces in the dashboard to remind the founder.

---

## `bundle.js` — generated, not hand-written

Every agent's `bundle.js` is generated from
`scripts/bundle_template.js` + that agent's `houston.json` by
`scripts/generate_bundles.py`. Don't edit `bundle.js` directly.

**Per-agent inputs** (in the generator):

1. Name — from `houston.json`.
2. Tagline — one-liner, in `TAGLINES` dict in `generate_bundles.py`.
3. `useCases` — from `houston.json`.

**To regenerate:**

```bash
python3 scripts/generate_bundles.py
```

Writes `agents/{agent-id}/bundle.js` for all three agents and
verifies via Node shim.

---

## `data-schema.md` — shape (~100–150 lines)

Document every file the agent reads or writes:

1. `config/` files — what learned context, written by which skill,
   TS interface.
2. Top-level files at agent root — `outputs.json`, any role-specific
   file (e.g. `legal-context.md` for GC, `counterparty-tracker.json`
   for paralegal, `deadline-calendar.json` for compliance-ops).
3. Subfolders with concrete examples (e.g.
   `contract-reviews/{slug}-{YYYY-MM-DD}.md`).
4. Cross-agent reads — every non-GC skill reads
   `../general-counsel/legal-context.md`. GC reads back the
   `outputs.json` of paralegal + compliance-ops during
   `weekly-legal-review`.
5. Atomic-write rule + `.houston/` prohibition.

---

## `README.md` per agent (~40 lines)

```markdown
# {Agent Name}

{2-sentence mission + the "never" boundary.}

## First prompts

- "{use case 1 prompt}"
- "{use case 2 prompt}"
- ...

## Skills

{Bulleted list matching CLAUDE.md: `skill-name` — one-liner.}

## Cross-agent reads

{For paralegal + compliance-ops: reads
`../general-counsel/legal-context.md` before any substantive output.
GC omits this section — it owns the doc.}

## Outputs

All outputs land as markdown at agent root under role-specific
subfolders, plus a record in `outputs.json` (shown in the Overview
dashboard).
```

---

## `.gitignore` per agent

```
*.tmp
config/
```

---

## Hard rules (break these = rebuild)

1. **Never write under `.houston/<agent>/`** at runtime — watcher
   skips it. Exception: seeded `.houston/activity.json` at install.
2. **Never use JSX or build tools** — hand-crafted IIFE via
   `React.createElement`, generated from the template.
3. **Never hardcode tool names** — Composio search only.
4. **Never skip atomic writes.**
5. **Never exceed 3 questions in `onboard-me`** — scope + modality
   preamble + 3 questions + hand-off.
6. **Every skill description starts with "Use when…"** and names an
   observable trigger.
7. **Non-coordinator agents read `legal-context.md` first** — if
   missing, stop and ask user to run General Counsel.
8. **First tab id MUST be `overview`.**
9. **Every output that isn't clearly routine flags
   `attorneyReviewRequired: true`** — founder sees it on the
   dashboard.
10. **No unauthorized legal advice.** If the agent isn't confident a
    question is routine, the answer is: "this is a judgment call —
    here's what a lawyer would need to see; escalate via
    `escalate-to-outside-counsel`."
