---
name: maintain-legal-context
description: Use when the user says "set up my legal context" / "update the legal context doc" / "our cap table changed, fix the doc" — drafts or updates the shared `legal-context.md` at the agent root, the single source of truth Paralegal and Compliance Ops read before any substantive skill.
---

# Maintain Legal Context

The General Counsel OWNS `legal-context.md`. No other agent writes it.
This skill creates or updates it. Its existence is what unblocks the
other two agents in the workspace.

## When to use

- "set up my legal context" / "draft the legal context doc" / "build
  the shared legal doc".
- "update the legal context" / "our cap table changed, fix the doc" /
  "I just executed the Acme MSA, add it to standing agreements".
- Called implicitly by any other skill that needs shared context and
  finds the doc missing — but only after confirming with the user.

## Steps

1. **Read config.** Load `config/entity.json`, `config/posture.json`,
   `config/templates.json`, `config/profile.json`. If any of these is
   missing, run `onboard-me` first (or ask the ONE missing piece
   just-in-time with the best-modality hint: connected app > file
   drop > URL > paste).

2. **Read the existing doc if present.** If `legal-context.md`
   exists, read it so this run is an update, not a rewrite. Preserve
   anything the founder has already sharpened; change only what's
   stale or new.

3. **Pull cap table + standing agreements if sources are connected.**
   If a cap-table tool is connected (`composio search cap-table` —
   Carta / Pulley / other), pull the current snapshot (founder stake,
   option pool, any priced round terms) and capture the source + last
   update date. Do not invent numbers. If nothing is connected, ask
   the founder for a one-line snapshot and mark the source as
   `"self-reported"`.

4. **Ask the minimum set of just-in-time questions.** The interview
   covers only what config didn't answer:
   - Cap table snapshot (if no Carta/Pulley linked) — founder stake,
     option pool, priced-round terms.
   - Standing agreements in force — customer / vendor / contractor /
     investor summaries (1 line each, not full text).
   - Open risks — un-filed 83(b)? unsigned CIIAA? expired DPA?
     undocumented contractor IP? Anything the founder knows is
     unresolved.
   - Escalation rules — anything the founder wants me to always
     escalate (e.g. "always flag > $50K ACV deals").

5. **Draft the doc (~400-600 words, direct, verb-led).** Structure,
   in this order:

   1. **Entity** — name, state, entity type, formation date,
      authorized shares, par value, registered agent, incorporated
      via. Mark `TBD` for anything missing.
   2. **Cap table snapshot** — last update date, source (Carta /
      Pulley / spreadsheet / self-reported), founder stake, option
      pool, priced-round terms (if any).
   3. **Standing agreements** — bulleted list by category
      (customers, vendors, contractors, investors). One line per
      agreement: counterparty, type, effective date, term /
      auto-renewal, key obligations. Summary only, not full text.
   4. **Template stack** — pointers to current NDA / MSA /
      consulting / offer / DPA templates. Each with version +
      last-reviewed date. Mark `none` if the founder has no
      template for that kind.
   5. **Open risks** — bulleted. Each with severity (low / med /
      high) and a one-line description. Escalate severity `high` in
      the dashboard.
   6. **Founder risk posture** — stance (aggressive / middle /
      conservative) and clause-level color pulled from
      `config/posture.json`. Keep verbatim founder notes where given.
   7. **Escalation rules** — what I will and won't handle without
      a human lawyer. Default floor: anything over $100K ACV, any
      non-standard indemnity, any IP going out, any cell at
      `major × likely` on the 5×5 severity×likelihood read.

6. **Mark gaps honestly.** If a section is thin (no cap table
   connected, no standing agreements yet, open risks uninterviewed),
   write `TBD — {what the founder should bring next}` rather than
   guessing. Never invent dates, shares, or counterparties.

7. **Write atomically.** Write to `legal-context.md.tmp`, then
   rename to `legal-context.md`. Single file at agent root. NOT
   under a subfolder. NOT under `.agents/`. NOT under
   `.houston/<agent>/`.

8. **Append to `outputs.json`.** Read existing array, append a new
   entry, write atomically:

   ```json
   {
     "id": "<uuid v4>",
     "type": "legal-context",
     "title": "Legal context updated",
     "summary": "<2-3 sentences — what changed this pass, e.g. added Acme MSA to standing agreements; flipped posture to conservative on liability>",
     "path": "legal-context.md",
     "status": "ready",
     "createdAt": "<ISO-8601>",
     "updatedAt": "<ISO-8601>"
   }
   ```

   (The doc itself is a live file, but each substantive edit is
   indexed so the founder sees the update on the dashboard. Ship as
   `ready` — the doc is a factual snapshot, not a draft.)

9. **Summarize to user.** One paragraph: what sections I filled,
   what's still `TBD`, and the exact next move (e.g. "connect Carta
   via Composio so I can auto-refresh the cap table"). Remind them
   Paralegal and Compliance Ops are now unblocked.

## Outputs

- `legal-context.md` (at the agent root — live document)
- Appends to `outputs.json` with `type: "legal-context"`,
  `status: "ready"`.
