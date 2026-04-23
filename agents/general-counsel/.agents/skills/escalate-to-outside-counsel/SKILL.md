---
name: escalate-to-outside-counsel
description: Use when a matter exceeds the agent's judgment and needs a real lawyer — packages a structured brief with a 2-3 sentence summary, specific questions for the lawyer, quoted excerpts, deadline, and recommended firm type (commercial lit / corporate / privacy / IP / employment). Never names specific firms.
---

# Escalate to Outside Counsel

The "my judgment runs out here" skill. When something is flagged
`attorneyReviewRequired: true`, or the founder explicitly asks for an
outside-counsel hand-off, this skill produces the exact brief the
founder sends to a real lawyer.

## When to use

- Any output with `attorneyReviewRequired: true` — custom indemnity,
  uncapped liability, IP assignment running out, non-compete on us,
  deal > $100K ACV, anything marked `UNKNOWN` in a review, any cell
  at `major × likely` or higher on the 5×5 severity × likelihood read.
- "Package this for a lawyer" / "escalate the {matter}" / "write the
  brief I send to outside counsel".
- Any question touching HIPAA, PCI-DSS, COPPA, biometrics, export
  controls, international data transfers with non-standard mechanisms,
  tax treatment decisions, securities offerings beyond standard SAFE /
  priced round, criminal / regulatory enforcement, or litigation-
  adjacent matters.

## Steps

1. **Read shared context.** Load `legal-context.md` for entity,
   founder risk posture, escalation rules. The rules block tells the
   lawyer what we already agreed I would and wouldn't handle.

2. **Identify the upstream artifact.** Find the triggering output —
   a `contract-reviews/{slug}.md`, `advice-memos/{slug}.md`,
   `redline-plans/{slug}.md`, or a sister-agent output. Read it in
   full. If the founder is escalating an inbound that hasn't been
   reviewed yet, run the appropriate upstream skill first (or tell
   them to) — don't escalate raw noise.

3. **Ask the founder two things if not already known.** One message,
   not two turns:
   - **Deadline** — when does this need a lawyer's answer? "Today",
     "end of week", "before {specific contract deadline}".
   - **Budget / firm preference** — flat-fee for a narrow question,
     hourly for ongoing, existing firm relationship or need a
     referral? (I don't name firms, but the founder's answer shapes
     the recommendation.)

4. **Draft the escalation brief (markdown, ~400-700 words).**
   Structure:

   1. **Summary** — 2-3 sentences. What the matter is, why I'm
      escalating, the business context a lawyer needs to understand
      in 30 seconds. No legalese.
   2. **Entity + standing context** — pull verbatim from
      `legal-context.md`: entity (name, state, formation date,
      authorized shares, par value), stage (pre-revenue /
      one-customer / etc.), relevant standing agreement with this
      counterparty (if any), founder risk posture.
   3. **Specific questions for the lawyer** — numbered list. Real
      questions, not "is this OK?". Examples:
      - "Is the liability carve-out in Section 8.3 enforceable
        against us under Delaware law, or is it void as against
        public policy given the unbounded indemnity downstream?"
      - "Does GDPR Art. 3(2)(b) apply given that our landing page
        shows USD-only pricing and all marketing copy is in English?"
      - "For a {stage} Delaware C-corp, is the QSBS impact of
        issuing {N} shares to a new hire material enough to change
        the offer's strike price?"
      Each question is self-contained — the lawyer should be able to
      answer without re-reading the whole contract.
   4. **Relevant excerpts** — quoted, not paraphrased. Pull the
      exact clause text from the contract / exact question from the
      founder / exact regulatory text at issue. Label each excerpt
      with its source (contract + section, regulation + article).
   5. **Deadline + why** — when an answer is needed and what
      happens if it's missed (contract expires, counterparty walks,
      83(b) window closes, etc.).
   6. **Recommended firm type** — ONE of: `corporate` (entity /
      cap table / securities / QSBS / 409A), `commercial litigation`
      (contract disputes, indemnity enforcement), `privacy` (GDPR /
      CCPA / DPA / data transfer), `IP` (trademark / patent / IP
      assignment / trade secret), `employment` (offer letter / PIIAA
      / at-will / contractor classification), or `tax` (R&D credit /
      QSBS mechanics / election strategy). Never name a specific
      firm — the founder gets referrals their own way (Clerky
      referral network, YC Legal Talks, founder-friend intro). I
      name the TYPE only.
   7. **What I already concluded + confidence** — one paragraph:
      my working answer, the specific reason I don't trust it
      enough to ship, and what evidence would flip me one way or
      the other.
   8. **Draft cover note** — 2-3 sentence email / intake-form
      paragraph the founder can paste when reaching out. Includes
      the firm-type recommendation + deadline.

5. **Preserve privilege markers.** If the upstream artifact is
   privileged (attorney-client work product, prior counsel
   correspondence), flag at the top: "PRIVILEGED & CONFIDENTIAL —
   ATTORNEY-CLIENT COMMUNICATION". Don't leak privileged content
   into summaries destined for non-lawyer third parties.

6. **Write atomically** to
   `escalations/{slug}-{YYYY-MM-DD}.md` — `{path}.tmp` then rename.
   Slug is a short kebab-case derived from the matter (e.g.
   `acme-liability-cap`, `gdpr-eu-customer-onboarding`,
   `qsbs-first-hire-strike-price`).

7. **Append to `outputs.json`.** Read-merge-write atomically:

   ```json
   {
     "id": "<uuid v4>",
     "type": "escalation",
     "title": "Escalation — <matter short form>",
     "summary": "<2-3 sentences — the matter, the deadline, the firm type>",
     "path": "escalations/<slug>-<YYYY-MM-DD>.md",
     "status": "ready",
     "attorneyReviewRequired": true,
     "createdAt": "<ISO-8601>",
     "updatedAt": "<ISO-8601>"
   }
   ```

   (Escalations ship as `ready` — the brief itself is the final
   artifact. The founder's next action is sending it, not editing
   it.)

8. **Also update the upstream output.** Find the triggering
   `contract-review` / `advice-memo` / `redline-plan` entry in
   `outputs.json` and refresh its `updatedAt` with a summary note
   that an escalation was filed. Don't overwrite other fields.

9. **Summarize to user.** One paragraph: "Escalation packed for
   {firm type}. Deadline {date, days out}. {N} specific questions.
   Paste the cover note from the brief into {Clerky referral
   network / YC Legal / your founder-friend intro}. File:
   {path}."

## Outputs

- `escalations/{slug}-{YYYY-MM-DD}.md`
- Appends to `outputs.json` with `type: "escalation"`,
  `attorneyReviewRequired: true`, `status: "ready"`.
- Touches the upstream output entry's `updatedAt` with an
  escalation note.
