---
name: draft-redline-strategy
description: Use when a reviewed contract needs a negotiation response and the founder needs must-have / nice-to-have / punt prioritization — reads the existing contract-review + founder goals + counterparty leverage, produces a prioritized plan with exact redline language for every must-have.
---

# Draft Redline Strategy

## When to use

- "Draft the redline strategy for the {counterparty} contract" /
  "what should I push back on?" / "prioritize the redlines — I have
  limited leverage on this one".
- After `review-inbound-contract` surfaces Yellow + Red clauses and
  the founder needs a negotiation sequence.

Runs once per contract version after review. If the counterparty
counters, run again against the new version.

## Steps

1. **Read shared context.** Load `legal-context.md` for founder risk
   posture + escalation rules. Load `config/posture.json` for clause-
   level walk-away positions.

2. **Read the upstream review.** Find the matching
   `contract-reviews/{counterparty-slug}-{YYYY-MM-DD}.md`. If it
   doesn't exist, stop and tell the founder to run
   `review-inbound-contract` first. Pull the full clause table
   (Green / Yellow / Red + current text + market standard).

3. **Ask the founder two things if I don't already know.** Take both
   in one message, not two separate turns:
   - **Goal for this deal** — close fast / protect IP / limit
     liability / walk-away leverage / keep optionality for later
     rounds?
   - **Counterparty leverage** — who's the whale? Are they the
     customer I need to close this quarter, or do I have 3 other
     pipeline deals at similar ACV? Honest read.

4. **Sort every Yellow + Red clause into three tiers:**

   - **Must-have redlines** — things I won't sign without. For a
     week-0 founder, the defaults are: uncapped liability cap
     replaced with a cap anchored to fees; IP assignment of our
     core product struck; one-way indemnity against us made mutual;
     AI-training carve-out that trains on our data struck;
     non-compete on us struck. Adjust based on founder posture +
     leverage.
   - **Nice-to-have redlines** — things I'd push on if I have
     leverage, punt if I don't. Examples: termination for
     convenience with 30-day notice instead of 60, wider breach-
     notification SLA, broader exit / data-retrieval rights.
   - **Can-punt** — Yellows I'm marking "keep as-is, livable".
     Include a one-line reason per item so the founder knows why
     I'm not pushing.

5. **Write exact redline language for every must-have.** Not "ask
   for a liability cap" — the actual replacement text. Example:

   > **Clause 8.2 (Liability Cap).** Replace
   > "EACH PARTY'S LIABILITY SHALL BE UNLIMITED" with
   > "EACH PARTY'S AGGREGATE LIABILITY SHALL NOT EXCEED FEES PAID OR
   > PAYABLE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM." Market
   > standard for SaaS deals at our ACV band; uncapped liability is
   > a walk-away.

   Include a one-line rationale per must-have that the founder can
   paste verbatim into the counter-email.

6. **For each must-have, include a fallback ladder.** If they won't
   accept the must-have position, what's the next acceptable step
   down? Order from best-for-us to last-acceptable. Example for
   liability cap: `1x annual fees` → `12mo fees` → `2x annual fees`
   → `2x annual fees but only for IP / breach carve-outs`.

7. **Write the ask / offer framing.** Concrete sentences the founder
   can paste into a response email:
   - "We can sign this week if we can land the three items below;
     everything else is acceptable."
   - List the 3 must-haves inline (redline + rationale).
   - "The remaining {N} points we flagged in our review are
     acceptable as written."

8. **Flag `attorneyReviewRequired: true`** if:
   - Any must-have requires IP, securities, or privacy language I
     can't cite a market standard for.
   - The counterparty has already refused the must-have in a prior
     round (and the founder is considering accepting it).
   - The deal is > $100K ACV.
   - Any clause in the review was marked `UNKNOWN`.

9. **Draft the plan (markdown, ~500-800 words).** Structure:

   1. **Header** — counterparty, contract type, review date, goal,
      leverage read.
   2. **Must-have redlines** — numbered list. Each item has:
      current text (quoted), replacement text (verbatim), rationale
      (one sentence), fallback ladder.
   3. **Nice-to-have redlines** — numbered list. Each item: current
      text, target, one-line rationale, whether to push or punt
      given our leverage read.
   4. **Can-punt** — bulleted. One-line reason per item.
   5. **Ask / offer framing** — the paste-ready paragraph.
   6. **Attorney review flag** — yes / no + reason if yes.
   7. **Next move** — "send this to the counterparty", "escalate",
      or "hold pending {specific info needed}".

10. **Write atomically** to
    `redline-plans/{counterparty-slug}-{YYYY-MM-DD}.md` —
    `{path}.tmp` then rename.

11. **Append to `outputs.json`.** Read-merge-write atomically:

    ```json
    {
      "id": "<uuid v4>",
      "type": "redline-plan",
      "title": "Redline plan — <counterparty>",
      "summary": "<2-3 sentences — must-have count + the top one + framing>",
      "path": "redline-plans/<slug>-<YYYY-MM-DD>.md",
      "status": "draft",
      "attorneyReviewRequired": <true | false>,
      "createdAt": "<ISO-8601>",
      "updatedAt": "<ISO-8601>"
    }
    ```

12. **Summarize to user.** One paragraph: count of must-haves + top
    one + the ask/offer framing in one line + next move. Drop the
    path.

## Outputs

- `redline-plans/{counterparty-slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "redline-plan"`.
