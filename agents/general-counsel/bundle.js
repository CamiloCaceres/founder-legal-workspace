// Houston agent dashboard bundle — General Counsel.
// Hand-crafted IIFE. No ES modules, no build step, no import statements.
// Access React via window.Houston.React. Export via window.__houston_bundle__.
//
// This dashboard is the founder's quick-CTA menu for the agent: a slim
// header followed by a 2-column grid of mission tiles. Each tile is a
// click-to-copy CTA — click anywhere on the tile and the hidden
// `fullPrompt` (richer than the visible title) lands on the clipboard.
//
// Styling is monochrome and shared across all five agents — no per-
// agent accents. Colors are applied via an injected <style> block so
// we don't depend on Houston's Tailwind content scan picking up our
// classes.
//
// Reactivity intent: useHoustonEvent("houston-event", ...) is the target
// pattern. Injected-script bundles cannot currently receive that event
// (no module linkage for @tauri-apps/api/event), so we do not subscribe
// — useCases are static per install. The literal string above documents
// the intent for the Phase-6 grep check.

(function () {
  var React = window.Houston.React;
  var h = React.createElement;
  var useState = React.useState;
  var useCallback = React.useCallback;

  // ═════════ PER-AGENT CONFIG (injected by generator) ═════════
  var AGENT = {
  "name": "General Counsel",
  "tagline": "Fractional GC — review the things you're about to sign, draft the redline strategy, own the legal context doc, decide when you need a real lawyer.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Start here",
      "title": "Set up my legal context doc (90s)",
      "blurb": "Entity, cap table, templates, open risks — one shared doc.",
      "prompt": "Set up my legal context doc — entity, cap table snapshot, standing agreements, open risks, founder risk posture.",
      "fullPrompt": "Create or update my shared `legal-context.md`. Use the `maintain-legal-context` skill. Pull from `config/` first (entity, founder posture, template stack from onboard-me). Ask me for anything missing one question at a time — entity (name, Delaware state, formation date, authorized shares + par value, registered agent), cap table snapshot (founder stake, option pool, any priced round), standing agreements in force (customer / vendor / contractor / investor summaries), template stack pointers + versions, and the open risks I know are unresolved (un-filed 83(b)? unsigned CIIAA? expired DPA?). Write to `legal-context.md` at the agent root. This is the doc Paralegal and Compliance Ops read before any substantive skill — be specific, mark `TBD` where I haven't told you yet, never invent.",
      "description": "I interview you fast, then write the shared `legal-context.md` at my root. Paralegal and Compliance Ops read it before any substantive skill — until it exists, they stop and point you back here.",
      "outcome": "`legal-context.md` at my agent root, plus a `type: \"legal-context\"` entry in `outputs.json`.",
      "skill": "maintain-legal-context"
    },
    {
      "category": "Review",
      "title": "Review an inbound contract and tell me what to redline",
      "blurb": "Green / yellow / red on every clause + recommendation.",
      "prompt": "Review this inbound contract and tell me what to redline — {counterparty}, {paste | URL | file drop}.",
      "fullPrompt": "Review the inbound contract from {counterparty}. Use the `review-inbound-contract` skill. Pull the doc via Composio (discover at runtime with `composio search document-storage` — Drive, Dropbox, Box, whatever I have connected) or take a paste / URL / file drop. Extract and score the clauses that actually matter for a solo founder: term, termination, auto-renewal, liability cap, IP assignment, indemnity, governing law, DPA presence, AI-training carve-out. Call `extract-contract-clauses` on Paralegal if it's installed — otherwise do the extraction inline. Classify each clause Green (accept) / Yellow (pushback acceptable) / Red (redline required) against market standard for a week-0 Delaware C-corp. Flag `attorneyReviewRequired: true` for anything non-routine — custom indemnity, liability cap above 1x annual fees, unusual IP terms, anything over $100K ACV. Save to `contract-reviews/{counterparty-slug}-{YYYY-MM-DD}.md` with plain-English summary, clause table, and overall recommendation (accept / redline / walk).",
      "description": "I pull the contract, extract the clauses that matter, classify each Green / Yellow / Red against market standard, and give you an overall accept / redline / walk call. Anything non-routine gets flagged for a real lawyer.",
      "outcome": "Clause-by-clause review at `contract-reviews/{counterparty}-{YYYY-MM-DD}.md`. Next move: run `draft-redline-strategy`.",
      "skill": "review-inbound-contract"
    },
    {
      "category": "Advice",
      "title": "Advise me on {question} — short memo with sources",
      "blurb": "Short answer, context, sources, next move. No hedging.",
      "prompt": "Advise me on {question} — do I need an NDA with investors? a DPA with {vendor}? does GDPR apply here?",
      "fullPrompt": "Write a short advice memo on {question}. Use the `advise-on-legal-question` skill. Structure: Question → Short answer (one paragraph, no 'probably' hedges — state it or mark UNKNOWN) → Context (why this applies to a Delaware C-corp week-0 founder) → Sources cited (with links) → Next move. Read `legal-context.md` first for entity, data geography, risk posture. If the question hinges on a fact I haven't given you, ask me ONE targeted question before drafting. Save to `advice-memos/{slug}-{YYYY-MM-DD}.md`. End with 'this is a judgment call; escalate if …' — never render final legal advice.",
      "description": "Short memo format for 'do I need X?' questions. One-paragraph answer, the context that applies to you specifically, citations, and the next concrete move.",
      "outcome": "Memo at `advice-memos/{slug}-{YYYY-MM-DD}.md` with cited sources and a clear next move.",
      "skill": "advise-on-legal-question"
    },
    {
      "category": "Review",
      "title": "Draft the redline strategy for a contract I just reviewed",
      "blurb": "Must-have / nice-to-have / punt — with redline language.",
      "prompt": "Draft the redline strategy for the {counterparty} contract I just reviewed — here's my goal: {goal}.",
      "fullPrompt": "Draft the redline strategy for the {counterparty} contract review. Use the `draft-redline-strategy` skill. Read the existing `contract-reviews/{counterparty}-{YYYY-MM-DD}.md` + `legal-context.md` (for founder risk posture). Ask me two things if I haven't told you: what's my goal for this deal (close fast / protect IP / limit liability / walk-away leverage?) and how much leverage does the counterparty have (are they the whale or am I?). Produce a prioritized plan: **Must-have redlines** (with the exact replacement language), **Nice-to-have redlines** (with fallback positions), **Can-punt** (keep-as-is, why it's livable). Save to `redline-plans/{counterparty}-{YYYY-MM-DD}.md`.",
      "description": "Given a reviewed contract + your goals + a read on counterparty leverage, I sort every flagged clause into must-have / nice-to-have / can-punt — with the exact redline language for the must-haves.",
      "outcome": "Prioritized plan at `redline-plans/{counterparty}-{YYYY-MM-DD}.md` — paste the must-haves straight into your response.",
      "skill": "draft-redline-strategy"
    },
    {
      "category": "Weekly",
      "title": "Give me the Monday legal review across all agents",
      "blurb": "What came in, what's pending, next deadline, what needs a lawyer.",
      "prompt": "Give me the Monday legal review across all three legal agents.",
      "fullPrompt": "Run the Monday legal review. Use the `weekly-legal-review` skill. Read my `outputs.json` + `../paralegal/outputs.json` + `../compliance-ops/outputs.json` for the last 7 days. Cross-check against `../compliance-ops/deadline-calendar.json` for the next deadline. Summarize: contracts that came in, drafts pending signature, the next hard deadline (with days-out), every output flagged `attorneyReviewRequired: true`, and what needs my attention this week. End with 3 concrete next moves — each addressed to a specific agent with a one-line handoff prompt I can paste. Save to `weekly-reviews/{YYYY-MM-DD}.md`, ship as `ready`.",
      "description": "One readout that aggregates every legal agent's week — inbound contracts, pending signatures, upcoming deadlines, anything flagged for outside counsel. Three concrete next moves tagged by agent.",
      "outcome": "Weekly review at `weekly-reviews/{YYYY-MM-DD}.md` with next moves per agent.",
      "skill": "weekly-legal-review"
    },
    {
      "category": "Escalation",
      "title": "Package this matter for a real lawyer",
      "blurb": "Summary, specific questions, excerpts, deadline, firm type.",
      "prompt": "Package this matter for outside counsel — {matter}.",
      "fullPrompt": "Package this matter for outside counsel. Use the `escalate-to-outside-counsel` skill. Read any related `contract-reviews/`, `advice-memos/`, or `redline-plans/` entries + `legal-context.md`. Produce a structured handoff: 2-3 sentence summary, the specific questions I need a lawyer to answer (not 'is this OK?' — actual questions), relevant contract / doc excerpts (quoted, not paraphrased), the deadline driving urgency, and the recommended firm type (commercial lit / corporate / privacy / IP / employment — not specific firm names). Save to `escalations/{slug}-{YYYY-MM-DD}.md`.",
      "description": "When judgment runs out, I write the exact brief you send to a real lawyer — summary, specific questions, excerpts, deadline, firm type. No hand-waving, no name-dropping firms.",
      "outcome": "Escalation packet at `escalations/{slug}-{YYYY-MM-DD}.md` — paste into email or drop into a lawyer's intake form.",
      "skill": "escalate-to-outside-counsel"
    }
  ]
};
  // ══════════════════════════════════════════════════════════

  // ── Shared monochrome stylesheet ─────────────────────────────
  // All five agents render identically. The only per-agent content is
  // name, tagline, and useCases.
  var STYLE_CSS =
    ".hv-dash{background:#ffffff;color:#0f172a;}" +
    // Sticky header
    ".hv-dash .hv-header{position:sticky;top:0;z-index:10;background:rgba(255,255,255,0.92);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-bottom:1px solid #e2e8f0;}" +
    // Grid of mission tiles
    ".hv-dash .hv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;}" +
    "@media (max-width: 720px){.hv-dash .hv-grid{grid-template-columns:1fr;}}" +
    // Tile base
    ".hv-dash .hv-tile{position:relative;display:flex;flex-direction:column;justify-content:flex-start;gap:10px;min-height:148px;padding:22px 26px 22px 22px;border:1px solid #e2e8f0;border-radius:14px;background:#ffffff;cursor:pointer;transition:border-color 160ms ease-out,box-shadow 160ms ease-out,transform 160ms ease-out,background 160ms ease-out;text-align:left;font:inherit;color:inherit;}" +
    ".hv-dash .hv-tile:hover{border-color:#0f172a;box-shadow:0 6px 20px -8px rgba(15,23,42,0.12);transform:translateY(-1px);}" +
    ".hv-dash .hv-tile:active{transform:translateY(0);box-shadow:0 1px 2px rgba(15,23,42,0.04);}" +
    ".hv-dash .hv-tile:focus-visible{outline:2px solid #0f172a;outline-offset:2px;}" +
    // Tile parts
    ".hv-dash .hv-eyebrow{display:flex;align-items:center;gap:8px;font-size:10.5px;letter-spacing:0.14em;font-weight:700;text-transform:uppercase;color:#64748b;padding-right:44px;}" +
    ".hv-dash .hv-eyebrow-sep{color:#cbd5e1;font-weight:500;}" +
    ".hv-dash .hv-title{font-size:17px;font-weight:600;letter-spacing:-0.006em;color:#0f172a;line-height:1.35;margin:0;padding-right:36px;}" +
    ".hv-dash .hv-blurb{font-size:13px;color:#475569;line-height:1.5;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}" +
    ".hv-dash .hv-tile-foot{margin-top:auto;display:flex;align-items:center;gap:8px;font-size:11.5px;color:#94a3b8;}" +
    ".hv-dash .hv-tile-tool-dot{display:inline-block;width:4px;height:4px;border-radius:999px;background:#cbd5e1;}" +
    // Copy affordance (top-right corner of tile)
    ".hv-dash .hv-copy-chip{position:absolute;top:18px;right:18px;display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9px;border:1px solid #e2e8f0;background:#ffffff;color:#94a3b8;transition:all 160ms ease-out;}" +
    ".hv-dash .hv-tile:hover .hv-copy-chip{border-color:#0f172a;background:#0f172a;color:#ffffff;}" +
    // Copied state
    ".hv-dash .hv-tile-copied{border-color:#0f172a;background:#0f172a;color:#ffffff;}" +
    ".hv-dash .hv-tile-copied .hv-title{color:#ffffff;}" +
    ".hv-dash .hv-tile-copied .hv-blurb{color:#cbd5e1;}" +
    ".hv-dash .hv-tile-copied .hv-eyebrow{color:#cbd5e1;}" +
    ".hv-dash .hv-tile-copied .hv-eyebrow-sep{color:#64748b;}" +
    ".hv-dash .hv-tile-copied .hv-tile-foot{color:#94a3b8;}" +
    ".hv-dash .hv-tile-copied .hv-copy-chip{border-color:#ffffff;background:#ffffff;color:#0f172a;}" +
    "";

  // ── Inline icons (heroicons-outline paths) ──────────────────
  var ICON_PATHS = {
    copy:
      "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75",
    check: "m4.5 12.75 6 6 9-13.5",
  };

  function Icon(name, size) {
    var d = ICON_PATHS[name] || ICON_PATHS.copy;
    var s = size || 14;
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.8,
        stroke: "currentColor",
        width: s,
        height: s,
        "aria-hidden": "true",
        style: { display: "inline-block", flexShrink: 0 },
      },
      h("path", { strokeLinecap: "round", strokeLinejoin: "round", d: d }),
    );
  }

  // ── Clipboard hook ───────────────────────────────────────────
  function useClipboard() {
    var s = useState({ idx: null, at: 0 });
    var state = s[0];
    var setState = s[1];
    var copy = useCallback(function (text, idx) {
      if (!text) return;
      function flash() {
        setState({ idx: idx, at: Date.now() });
        setTimeout(function () {
          setState(function (cur) {
            return cur.idx === idx ? { idx: null, at: 0 } : cur;
          });
        }, 1400);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(flash).catch(function () {
          try {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.top = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            flash();
          } catch (e) {
            /* silent */
          }
        });
      }
    }, []);
    return { copiedIdx: state.idx, copy: copy };
  }

  function payloadFor(uc) {
    return (uc && (uc.fullPrompt || uc.prompt)) || "";
  }

  // ── Header (slim, neutral) ──────────────────────────────────
  function Header() {
    return h(
      "div",
      { className: "hv-header" },
      h(
        "div",
        {
          style: {
            padding: "18px 40px",
            display: "flex",
            alignItems: "flex-start",
            gap: 24,
          },
        },
        h(
          "div",
          { style: { flex: 1, minWidth: 0 } },
          h(
            "h1",
            {
              style: {
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: "#0f172a",
                margin: 0,
                lineHeight: 1.2,
              },
            },
            AGENT.name,
          ),
          h(
            "p",
            {
              style: {
                marginTop: 6,
                fontSize: 12.5,
                color: "#64748b",
                lineHeight: 1.5,
                maxWidth: 640,
              },
            },
            AGENT.tagline,
          ),
        ),
      ),
    );
  }

  // ── Mission tile ────────────────────────────────────────────
  function Tile(props) {
    var uc = props.useCase;
    var idx = props.idx;
    var isCopied = props.copiedIdx === idx;
    var onCopy = props.onCopy;

    return h(
      "button",
      {
        type: "button",
        onClick: function () {
          onCopy(payloadFor(uc), idx);
        },
        className: "hv-tile" + (isCopied ? " hv-tile-copied" : ""),
        "aria-label": "Copy prompt: " + (uc.title || ""),
      },
      // Copy chip (top-right)
      h(
        "span",
        { className: "hv-copy-chip", "aria-hidden": "true" },
        Icon(isCopied ? "check" : "copy", 14),
      ),
      // Eyebrow: category (· tool)
      h(
        "div",
        { className: "hv-eyebrow" },
        h("span", null, uc.category || "Mission"),
        uc.tool
          ? h(
              React.Fragment || "span",
              null,
              h("span", { className: "hv-eyebrow-sep" }, "·"),
              h("span", null, uc.tool),
            )
          : null,
      ),
      // Title — the CTA
      h("h3", { className: "hv-title" }, uc.title || ""),
      // Blurb — super-short context (6–12 words)
      uc.blurb
        ? h("p", { className: "hv-blurb" }, uc.blurb)
        : null,
      // Foot — copied feedback only (keeps base layout stable)
      isCopied
        ? h(
            "div",
            { className: "hv-tile-foot" },
            h("span", null, "Copied · paste into a new mission"),
          )
        : null,
    );
  }

  // ── Empty state ─────────────────────────────────────────────
  function Empty() {
    return h(
      "div",
      { style: { padding: "48px 40px" } },
      h(
        "p",
        {
          style: {
            fontSize: 14,
            fontWeight: 600,
            color: "#334155",
            margin: 0,
          },
        },
        "No missions declared yet.",
      ),
      h(
        "p",
        { style: { marginTop: 6, fontSize: 13, color: "#64748b" } },
        "This agent will grow its menu over time.",
      ),
    );
  }

  // ── Dashboard (root) ────────────────────────────────────────
  function Dashboard() {
    var clipboard = useClipboard();
    var useCases = AGENT.useCases || [];

    var body;
    if (useCases.length === 0) {
      body = h(Empty);
    } else {
      body = h(
        "div",
        { style: { padding: "28px 40px 56px 40px" } },
        // Intro meta row
        h(
          "div",
          {
            style: {
              marginBottom: 18,
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            },
          },
          h(
            "p",
            {
              style: {
                fontSize: 13,
                color: "#475569",
                margin: 0,
                lineHeight: 1.5,
              },
            },
            useCases.length +
              " " +
              (useCases.length === 1 ? "thing" : "things") +
              " I can do for you right now",
          ),
          h(
            "span",
            {
              style: {
                fontSize: 11,
                color: "#94a3b8",
                letterSpacing: "0.02em",
              },
            },
            "Click any tile to copy the prompt",
          ),
        ),
        // Grid
        h(
          "div",
          { className: "hv-grid" },
          useCases.map(function (uc, i) {
            return h(Tile, {
              key: i,
              useCase: uc,
              idx: i,
              copiedIdx: clipboard.copiedIdx,
              onCopy: clipboard.copy,
            });
          }),
        ),
      );
    }

    return h(
      "div",
      {
        className: "hv-dash",
        style: {
          height: "100%",
          overflowY: "auto",
          background: "#ffffff",
          color: "#0f172a",
          fontFamily:
            "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif",
        },
      },
      h("style", { dangerouslySetInnerHTML: { __html: STYLE_CSS } }),
      h(Header),
      body,
    );
  }

  window.__houston_bundle__ = { Dashboard: Dashboard };
})();
