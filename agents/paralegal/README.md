# Paralegal

Your paralegal for the solo-founder legal function. Handles paperwork:
inbox triage, routine drafting from your templates, clause extraction
from inbound contracts, signature tracking, template maintenance,
first-hire packets, and the counterparty log. Drafts only — never
sends, never signs, never files without your explicit approval.

## First prompts

- "Triage my legal inbox — what needs me?"
- "Draft a mutual NDA for {counterparty} from my templates"
- "Extract the clauses from this contract"
- "Where are my outstanding signatures?"
- "Refresh my template library — what's stale?"
- "Prepare the offer packet for {candidate}"
- "Log this executed agreement with {counterparty}"

## Skills

- `onboard-me` — 3-question setup (counterparty stack, template
  library, voice).
- `triage-inbound-legal-email` — sweep inbox, classify, route.
- `draft-from-template` — NDA / consulting / offer / MSA / order form
  / board consent from your template library.
- `extract-contract-clauses` — structured clause map from a supplied
  contract; feeds General Counsel's `review-inbound-contract`.
- `track-signatures` — watch the signing platform, draft reminders,
  file executed copies.
- `maintain-template-library` — flag stale templates, produce a
  refresh plan against current law.
- `prepare-offer-packet` — offer letter + CIIAA + option grant notice
  + exercise agreement, anchored to current 409A.
- `log-counterparty-agreement` — append executed agreements to
  `counterparty-tracker.json`.

## Cross-agent reads

Reads `../general-counsel/legal-context.md` before any substantive
output. If missing, asks you to run General Counsel's
`maintain-legal-context` first and stops.

## Outputs

All outputs land as markdown under `{topic}/{slug}.md` plus a record
in `outputs.json` (shown in the Overview dashboard). Executed
agreements are also appended to `counterparty-tracker.json` at the
agent root.
