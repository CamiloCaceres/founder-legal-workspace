---
name: weekly-legal-review
description: Use when the user says "Monday legal review" / "weekly legal readout" / "how's legal doing" — aggregates across the workspace by reading each other legal agent's `outputs.json`, summarizes what came in, what's pending signature, the next deadline, and what's flagged for attorney review.
---

# Weekly Legal Review

The weekly cross-agent rollup. The one skill in the workspace that
reads other agents' output indexes (read-only) and gives the founder
a single narrative readout.

## When to use

- "Monday legal review" / "weekly legal readout" / "how's legal
  doing" / "what's the legal status this week".
- Weekly routine (optional — the user wires it via the Routines tab
  for e.g. Monday 8:00).

## Steps

1. **Read shared context.** Load `legal-context.md` — the review
   frames everything against current entity, standing agreements,
   open risks, and founder risk posture. Not generic "legal KPIs".

2. **Read every peer agent's `outputs.json`** (read-only, handle
   missing gracefully):
   - `../paralegal/outputs.json`
   - `../compliance-ops/outputs.json`
   - `outputs.json` (my own — General Counsel activity)

   If an agent isn't installed or the file is missing, note it as
   "no activity (not installed / no outputs yet)" and continue.

3. **Read the deadline calendar.** If
   `../compliance-ops/deadline-calendar.json` exists, load it and
   find the next 3 deadlines by date. If missing, note "no deadline
   calendar — run Compliance Ops' `watch-legal-deadlines`" and
   continue.

4. **Filter to the review window.** Default window: last 7 days by
   `createdAt` or `updatedAt`. If the user asks for a different
   window ("last 2 weeks", "since the Acme deal started"), use that.

5. **Per agent, compute:**
   - Count of outputs this window, by `type`.
   - Notable shipped items (top 3 by recency). Include title + path
     + status.
   - Drafts still open (status = `draft`) stale > 7 days.
   - Every output flagged `attorneyReviewRequired: true` — surfaced
     separately from the shipped count.
   - Gaps — what this agent hasn't produced that the solo-founder
     stack expects. Examples:
     - `paralegal` — no template drafts this week despite inbound
       traffic in `triage-inbound-legal-email`.
     - `paralegal` — pending signatures stale > 14 days in
       `track-signatures`.
     - `compliance-ops` — no `watch-legal-deadlines` refresh in 30
       days.
     - `compliance-ops` — subprocessor inventory stale against
       newly connected vendors.

6. **Cross-cutting patterns.** Look for:
   - **Inbound pressure** — contract volume up, `contract-reviews/`
     backlog growing.
   - **Pending-signature drift** — a `track-signatures` entry from
     Paralegal with no executed copy after 14+ days.
   - **Deadline pressure** — the next deadline is < 14 days out and
     the owing agent hasn't produced a prep artifact.
   - **Attorney-review backlog** — any output flagged
     `attorneyReviewRequired: true` with no `escalations/` entry
     yet.
   - **Posture drift** — advice memos or contract reviews that
     contradict the stance in `legal-context.md` (founder said
     conservative, but we keep letting Yellow slide).

7. **Draft the review (markdown, ~500-800 words).**

   1. **Window + TL;DR** — 3-5 bullets covering the week.
   2. **What shipped, per agent** — short section per agent (GC,
      Paralegal, Compliance Ops). Include counts by type, top
      items, status. Mark missing agents explicitly.
   3. **Pending signature** — items from Paralegal's
      `track-signatures` that are out for signature, with age.
   4. **Next deadline** — pulled from
      `../compliance-ops/deadline-calendar.json`. Days out,
      consequence of missing, owing agent, what's needed this week
      to hit it.
   5. **Attorney-review flags** — list every output with
      `attorneyReviewRequired: true` in the window, grouped by
      whether there's already an `escalations/` entry for it.
   6. **Gaps + cross-cutting issues** — severity-ranked.
   7. **Recommended next moves** — 3 concrete actions for the week,
      each tagged with the owner agent + a one-line handoff prompt
      the founder can paste into that agent's chat.
   8. **What to flip to ready** — list of `draft` outputs across
      agents that the founder should review and sign off on.

8. **Never invent metrics.** If an agent has no tracking data,
   don't make one up. The review reports what the agents actually
   produced — it's a production review, not an invented dashboard.

9. **Write atomically** to `weekly-reviews/{YYYY-MM-DD}.md` —
   `{path}.tmp` then rename. Date is today's ISO date.

10. **Append to `outputs.json`** (my own index). Read-merge-write
    atomically:

    ```json
    {
      "id": "<uuid v4>",
      "type": "weekly-review",
      "title": "Legal review — <YYYY-MM-DD>",
      "summary": "<2-3 sentences — what shipped, next deadline, top flag>",
      "path": "weekly-reviews/<YYYY-MM-DD>.md",
      "status": "ready",
      "createdAt": "<ISO-8601>",
      "updatedAt": "<ISO-8601>"
    }
    ```

    (Reviews ship as `ready` — they're factual rollups, not drafts.)

11. **Summarize to user.** One paragraph: "This week {N} outputs
    across {agents shipping}. Next deadline: {deadline, days out}.
    {Attorney-review count} items flagged for outside counsel.
    Biggest next move: {move}. Full review: {path}."

## Outputs

- `weekly-reviews/{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "weekly-review"`.
