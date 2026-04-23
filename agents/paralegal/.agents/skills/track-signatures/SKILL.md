---
name: track-signatures
description: Use when the user says "where are my signatures" / "who hasn't signed" / "chase signatures" — watches the connected signing platform for outstanding documents, drafts polite reminders for laggards (never sends), files executed copies to the founder's document storage, and writes a status board to `signature-status/`.
---

# Track Signatures

## When to use

- Explicit: "where are my outstanding signatures", "who hasn't
  signed", "chase signatures", "signature status", "status of {doc}
  in DocuSign / PandaDoc / HelloSign".
- Implicit: General Counsel's `weekly-legal-review` reads this
  agent's `signature-status/` output as part of the Monday readout.
- Safe to run daily or weekly. Idempotent — re-running just refreshes
  the status board.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop.
2. **Read config**: `config/counterparty-stack.json`. If
   `signingPlatformConnectedViaComposio` is false or missing, ask ONE
   question ("Which signing platform do you use — connect it via
   Composio from the Integrations tab"). Stop until connected.
3. **Discover signing-platform tool via Composio.** Run
   `composio search signing-platform` to get the tool slug. Confirm
   it matches `counterparty-stack.signingPlatformCategory`.
4. **Pull the envelope / document list** by executing the discovered
   slug. Segment into three buckets:
   - **Outstanding** — sent, awaiting at least one signature, not
     yet overdue (default: ≤ 7 days since send).
   - **Overdue** — sent > 7 days ago, no signature from at least one
     party. Override the threshold if the user set a specific
     deadline on the envelope.
   - **Signed** — fully executed since the last run (or within a
     user-specified window).
5. **For each overdue item, draft a polite reminder.** Read
   `config/voice.md` for tone. Address the specific non-signer.
   Reference the doc by name and original send date. One-sentence
   nudge. Do NOT assume urgency the founder didn't state. Never
   send — the draft sits in the status board for the founder to
   copy-paste or kick to the signing platform's built-in reminder.
6. **File executed copies.** For each item in the **Signed** bucket
   since the last run, run `composio search document-storage` to get
   the storage tool slug, fetch the executed PDF from the signing
   platform, and file it to the founder's storage at
   `{storage-root}/contracts/{counterparty-slug}-{YYYY-MM-DD}.pdf`
   (path is configurable). Record the path.
7. **Write** the status board to
   `signature-status/{YYYY-MM-DD}.md` atomically (`*.tmp` → rename).
   Structure:
   - Top counts ("3 outstanding, 2 overdue, 1 signed this week").
   - **Outstanding** section: one row per envelope (doc name,
     counterparty, sent date, waiting on whom).
   - **Overdue** section: same columns + the drafted reminder
     (inline, not in a separate file).
   - **Signed** section: filed paths, ready for
     `log-counterparty-agreement`.
8. **Append to `outputs.json`** — read existing array, add
   `{ id, type: "signature-status", title, summary, path,
   status: "draft", createdAt, updatedAt }`. No
   `attorneyReviewRequired` — this is pure ops.
9. **Summarize to user** — one paragraph: "3 outstanding, 2 overdue
   (drafted reminders ready at bottom of the status board), 1 signed
   and filed to storage at {path}. Want me to
   `log-counterparty-agreement` for the freshly-signed {doc}?"

## Never send, never auto-file outside the user's storage

- I never hit "remind" in the signing platform.
- I never send email on the founder's behalf.
- I only file executed copies to the connected document-storage
  category — nothing leaves to any other destination.

## Outputs

- `signature-status/{YYYY-MM-DD}.md`
- Executed copies filed to `{storage-root}/contracts/...` in the
  connected document-storage tool.
- Appends to `outputs.json` with type `signature-status`.
