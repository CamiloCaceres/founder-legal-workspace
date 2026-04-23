---
name: security-questionnaire-intake
description: Use when the user forwards or pastes an enterprise security questionnaire (SIG-lite, CAIQ, custom sheet from a prospect > 100 people) and asks "help me fill this out" / "what can you answer" — extracts the question set, pre-fills every question answerable from `config/security-answers.md`, groups the unanswered ones by topic so one founder sit-down resolves many, drafts the response doc, and appends any new answers captured back to the answers library. Drafts only — the founder reviews before anything goes back.
---

# Security Questionnaire Intake

## When to use

- Explicit: "help me with this security questionnaire", "fill out the
  vendor security assessment", "triage this SIG / CAIQ", "what can you
  answer on this questionnaire", "enterprise prospect sent me this
  security doc".
- Implicit: `triage-inbound-legal-email` classified an inbound item as
  "other → vendor security questionnaire" and the founder wants to
  action it.
- Runs on one questionnaire per invocation. For multiple, call once
  per questionnaire.

## What this is (and isn't)

This is **triage + draft** — fast extraction of the question set,
auto-fill from the founder's persisted answers library, and a grouped
"still-need-from-you" list so one sit-down resolves many questions.
It is **not** a full security program audit and it is **not** final
sign-off on answers. Every output closes with "this is a summary, not
legal advice; enterprise security questionnaires sometimes imply
contractual commitments — escalate anything with commercial impact to
outside counsel."

## The answers library

`config/security-answers.md` is the founder's persistent, growing
library of security-program answers. It accumulates over time — every
new questionnaire potentially adds answers. Structure is a flat
markdown doc with topic headers and Q/A pairs:

```markdown
## Access control
**Q: Do you enforce MFA on all admin accounts?**
A: Yes — MFA required on all production infrastructure (AWS,
   {password-manager}, {git-host}) via {provider}. Enforced since
   {YYYY-MM}.

## Data at rest
**Q: Is customer data encrypted at rest?**
A: Yes — AES-256 at rest via {provider}'s managed encryption on all
   customer data stores.

...
```

Topic buckets the skill uses (customized if the questionnaire deviates):
access control, authentication, data at rest, data in transit, data
residency, subprocessors, backups + DR, incident response, secure
SDLC, vulnerability management, logging + monitoring, employee
security (hiring / offboarding / training), physical security (usually
"N/A — remote, hosted on {cloud}"), compliance certifications (SOC 2,
ISO, HIPAA, GDPR), AI / model training, customer support data access,
data retention + deletion.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user: "I need the shared legal context first — please run
   General Counsel's `maintain-legal-context` skill, then come back."
   Stop. Extract entity name, data geography, and any standing
   enterprise customer agreements that might constrain answers.
2. **Read the answers library**: `config/security-answers.md`. If
   missing, this is the first questionnaire — that's fine, the library
   will seed from the answers captured here. Note in the output how
   many prior answers were on hand.
3. **Locate the questionnaire.** Accept: (a) pasted text, (b) a file
   path (PDF, DOCX, XLSX, CSV), (c) a URL or pointer into connected
   document storage, (d) a Google Sheets / Airtable link. If document
   storage or a sheet tool is connected, discover via any
   Composio-connected document-storage or spreadsheet category and
   fetch. If none of the three is provided, ask ONE question: "Paste
   the questionnaire, upload the file, or point me to it in your
   document storage."
4. **Parse.** Extract the question set into a structured array:
   `{ id, section, question, expectedFormat? }`. `id` is a stable
   hash of `section + question text` so re-runs don't renumber.
   `expectedFormat` captures the answer shape if evident from the
   questionnaire ("Yes/No", "Free text", "Yes/No + comment",
   "Document attachment"). If parsing fails (scanned PDF, locked
   PDF, image-only), tell the user and ask for a text-extractable
   version. Do not guess.
5. **Auto-fill from the answers library.** For each extracted
   question, attempt a match against `config/security-answers.md`:
   - **Exact match** — prior Q/A with ≥ 90% token overlap and same
     topic → pre-fill the answer, mark source `"library-exact"`.
   - **Near match** — prior Q/A on the same topic, semantically
     equivalent → pre-fill, mark `"library-near"`, flag for founder
     spot-check.
   - **No match** — leave blank, mark `"needs-founder"`.
6. **Group the unanswered questions by topic.** Use the topic bucket
   list above. The goal: one sit-down with the founder answers as
   many of the `needs-founder` questions as possible. Within a
   topic, order simpler Yes/No questions first so the founder gets
   quick wins.
7. **Draft the response doc.** Write to
   `security-questionnaires/{counterparty-slug}-{YYYY-MM-DD}.md`
   atomically (`*.tmp` → rename). Structure:
   - Header: counterparty, questionnaire type (SIG-lite / CAIQ /
     custom / etc.), total question count, pre-filled count,
     needs-founder count, any near-matches needing spot-check.
   - **Pre-filled answers** — grouped by topic, each showing Q, A,
     source tag (`library-exact` / `library-near`). Near-matches get
     a one-line "verify this still holds" prompt next to them.
   - **Still need from you** — grouped by topic, each question
     numbered for easy answering in chat. Include a suggested answer
     shape for each (Yes/No, short paragraph, attach policy doc).
   - Footer: "This is a summary, not legal advice. Some security
     questionnaire answers create contractual commitments — escalate
     anything with commercial impact to outside counsel via General
     Counsel's `escalate-to-outside-counsel`."
8. **Write the short list.** Also produce a short (≤ 10 item)
   "needs-you-now" list — the minimal set of questions that unblocks
   sending the draft back. Include it inline at the top of the
   response doc and in the user summary.
9. **Capture new answers as the founder responds.** After the founder
   answers in chat, append or update `config/security-answers.md`
   atomically:
   - New topic + Q/A pair → append under the topic header.
   - Existing Q/A that the founder updated → replace the A, note
     `(updated {YYYY-MM-DD})` inline.
   - Never drop prior answers without the founder's explicit OK.
   Refresh the response doc with the newly-captured answers and
   re-classify them as `library-exact` going forward.
10. **Append to `outputs.json`** — read existing array, add
    `{ id, type: "security-questionnaire", title, summary, path,
    status: "draft", createdAt, updatedAt, attorneyReviewRequired }`.
    Set `attorneyReviewRequired: true` if the questionnaire contains
    any question implying a contractual commitment (breach
    notification SLAs, uptime SLAs, data residency commitments, audit
    rights, indemnities, insurance minimums) — these shouldn't be
    answered without General Counsel review.
11. **Summarize to user** — one paragraph: "{Counterparty}
    {questionnaire-type}: {total} questions, {N} pre-filled from your
    library ({M} need spot-check), {K} need you. Top 3 to answer
    first to unblock a draft-back: {...}. Full doc at
    `security-questionnaires/{counterparty-slug}-{YYYY-MM-DD}.md`.
    Want to knock out the {topic} section now?"

## Never invent

- Never fabricate a security control the founder hasn't confirmed.
  A "No" or "Not yet" is the right answer until the founder implements
  the control — making up a "Yes" is how founders end up in breach of
  a contract they didn't realize they were signing.
- Never normalize sensitive answers. If the founder says "we use
  Postgres on RDS, encrypted," the answer doc says "Postgres on RDS,
  encrypted" — not "industry-standard managed database with
  encryption-at-rest." Specificity matters for enterprise buyers and
  for later audits.
- Never hedge with "probably" or "likely." State the answer or mark
  `needs-founder`.

## Hard nos

- Never sends, shares, or returns the questionnaire to the
  counterparty. Every draft is for the founder to review and send.
- Never provides legal advice that isn't clearly marked as summary.
  The footer line is non-negotiable.
- Never commits the founder to a timeline, SLA, uptime figure,
  insurance coverage, or certification status without the founder's
  explicit confirmation.
- Never hardcodes tool names. Questionnaire fetches flow through any
  Composio-connected document-storage or spreadsheet category.
- Never hardcodes the topic bucket list as exhaustive — if the
  questionnaire uses a novel topic, add it to the grouping and note
  it in the output so the library grows.

## Outputs

- `security-questionnaires/{counterparty-slug}-{YYYY-MM-DD}.md` — the
  draft response + needs-you list.
- Appends / updates `config/security-answers.md` — the persistent
  answers library.
- Appends to `outputs.json` with type `security-questionnaire`.
