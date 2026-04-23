---
name: prepare-offer-packet
description: Use when the user says "prepare the offer packet for {candidate}" / "first-hire paperwork" — assembles offer letter + CIIAA + option grant notice + exercise agreement anchored to the current 409A, writes four markdown files + an index to `offer-packets/{candidate-slug}-{YYYY-MM-DD}/`, and flags `attorneyReviewRequired` if comp structure is non-standard.
---

# Prepare Offer Packet

## When to use

- Explicit: "prepare the offer packet for {candidate}", "first-hire
  paperwork", "draft the offer for {name}", "assemble offer + CIIAA +
  option grant".
- Implicit: `draft-from-template` called with `offer-letter` + the
  user says the role includes equity — loop this skill in instead of
  just drafting the letter standalone.
- One packet per candidate. Re-running against the same candidate
  creates a new dated folder (doesn't overwrite).

## Packet contents

1. **Offer letter** — at-will language + base comp + start date +
   reference to CIIAA + reference to the option grant.
2. **CIIAA** (Confidential Information + Invention Assignment
   Agreement) — IP assignment, confidentiality, non-solicit (if the
   template has one), prior inventions schedule.
3. **Option grant notice** — option count, strike price, vesting
   schedule (default 4-year with 1-year cliff), grant date, exercise
   deadline.
4. **Exercise agreement** — form the grantee uses to exercise.
5. **Index (`index.md`)** — one-page summary: candidate, role, comp,
   option count, strike, vesting, what's in the packet, next steps
   ("send these 4 docs via your signing platform; file 83(b) within
   30 days of share issuance if exercising early").

## Inputs required

From the user (ask one at a time if missing):
- `candidate` (full legal name)
- `role` (title)
- `baseComp` (annual salary)
- `startDate` (ISO-8601)
- `optionCount` (number of options in the grant)
- `vestingSchedule` (default: "4 years, 1-year cliff, monthly after
  cliff" — confirm)

From `config/cap-table.json` (pull; ask if missing):
- `strikePrice` (current 409A)
- `last409AAt` (if > 12 months ago, flag and ask whether to refresh
  before issuing)
- `optionPoolRemaining` (confirm there's enough pool for this grant)

From `../general-counsel/legal-context.md`:
- Entity name, state, authorized shares.

## Steps

1. **Read shared context**:
   `../general-counsel/legal-context.md`. If missing or empty, tell
   the user to run General Counsel's `maintain-legal-context` first
   and stop.
2. **Read `config/cap-table.json`.** If missing, ask ONE question:
   "I need your current 409A strike price and pool state — connect
   Carta / Pulley via Composio, or paste the strike + last-409A
   date + pool remaining." Write to `config/cap-table.json`.
3. **Check freshness.** If `last409AAt` is older than 12 months:
   set `attorneyReviewRequired: true` and tell the user "409A is
   stale — Compliance Ops's `watch-legal-deadlines` should have
   flagged this. Refresh before issuing, or issue with a caveat."
4. **Gather candidate variables.** Ask one at a time until all of
   `candidate`, `role`, `baseComp`, `startDate`, `optionCount`,
   `vestingSchedule` are captured. Do not invent any of these.
5. **Check for non-standard comp.** Flag `attorneyReviewRequired:
   true` if any of: base comp is above the founder's market range
   noted in shared context; option count is outside the plan's
   per-grant limits; vesting deviates from 4/1; grant includes
   acceleration (single-trigger or double-trigger); cash bonus or
   signing bonus present; grant is for advisor equity (different
   shape — FAST agreement or separate template).
6. **Render the four docs.** Pull `offer-letter` and `ciiaa`
   templates from `config/template-library.json`. Pull `option
   grant notice` and `exercise agreement` from the same library (add
   them to the library via `maintain-template-library` if missing
   — stop and ask if they aren't there). Substitute the variables.
   Every dollar, share count, and date must come from an input —
   never invented.
7. **Write the packet** atomically to
   `offer-packets/{candidate-slug}-{YYYY-MM-DD}/` with:
   - `offer-letter.md`
   - `ciiaa.md`
   - `option-grant-notice.md`
   - `exercise-agreement.md`
   - `index.md`
   Each with the header `> Draft — pending your review. I don't
   send, file, or request signatures.`
8. **Append to `outputs.json`** — one entry for the packet (path =
   the directory), `type: "offer-packet"`,
   `attorneyReviewRequired` set per step 5, `summary` naming the
   candidate + role + total grant value at strike.
9. **Summarize to user** — one paragraph: "Packet for {candidate}
   ({role}, ${baseComp}, {optionCount} options @ ${strike}) at
   `offer-packets/{slug}/`. Review, then send via your signing
   platform. After execution: (a) candidate has 30 days to file 83(b)
   if early-exercising; (b) run `log-counterparty-agreement` to
   capture the grant in the tracker. Flagged attorney review: {y/n,
   reason}."

## Never invent

Never invent a strike price, pool balance, or 409A date. If any of
those is missing or stale, stop and ask. Never auto-set vesting
acceleration — that's a judgment call.

## Outputs

- `offer-packets/{candidate-slug}-{YYYY-MM-DD}/` with 4 `.md` files
  + `index.md`.
- Appends to `outputs.json` with type `offer-packet`.
