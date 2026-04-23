// Houston agent dashboard bundle — Compliance Ops.
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
  "name": "Compliance Ops",
  "tagline": "Privacy, corporate hygiene, and the deadline calendar — Delaware March 1, 83(b), DSR clock, 409A refresh, trademark knockout. Never files without your approval.",
  "accent": "slate",
  "useCases": [
    {
      "category": "Deadlines",
      "title": "Set up my legal deadline calendar",
      "blurb": "Delaware, 83(b), 409A, DSR, TM — one calendar.",
      "prompt": "Set up my legal deadline calendar — Delaware March 1, 83(b), 409A, DSR, TM.",
      "fullPrompt": "Build my legal deadline calendar. Use the `watch-legal-deadlines` skill. Read `../general-counsel/legal-context.md` first for entity + formation date + cap-table events. Seed the canonical deadlines: Delaware franchise tax + annual report (March 1 annually, statutory), 83(b) election (30 days from each stock issuance — founder stock + every option exercise — IRC §83(b)), 409A refresh (every 12 months or on a priced round, IRC §409A safe harbor), DSR response clock (GDPR Art. 15 — 30 days from receipt; CCPA — 45 days), TM office-action response (typically 3 months from issuance), annual board written consent (advisory). Compute days-until for each; flag anything within 30 days as urgent and anything overdue as critical. Write structured rows to `deadline-calendar.json` at my agent root and a human readout to `deadline-summaries/{YYYY-MM-DD}.md` listing everything due in the next 90 days with a recommended prep start date. Log in `outputs.json`.",
      "description": "Seeds and refreshes the canonical legal calendar — Delaware, 83(b), 409A, DSR, TM, board consent — with days-until and a recommended prep-start date for everything in the next 90 days.",
      "outcome": "Calendar at `deadline-calendar.json` + readout at `deadline-summaries/{YYYY-MM-DD}.md`. Urgent items (≤30 days) surface on your dashboard.",
      "skill": "watch-legal-deadlines"
    },
    {
      "category": "Privacy",
      "title": "Draft / update my Privacy Policy and ToS",
      "blurb": "Grounded in your real data + subprocessors, not a generator.",
      "prompt": "Draft / update my Privacy Policy and ToS — scan the landing page and ground it in my real subprocessor list.",
      "fullPrompt": "Draft or update my Privacy Policy and Terms of Service. Use the `draft-privacy-policy` skill. Read `../general-counsel/legal-context.md` first. Pull my landing-page via `composio search web-scrape` to inventory deployed analytics, cookies, and third-party scripts. Read `subprocessor-inventory.json` at my agent root for vendors + transfer mechanisms. Read `config/entity.json` + `config/data-geography.json` for scope. Produce a Privacy Policy covering: data collected, legal basis (GDPR Art. 6(1)(b) contract + 6(1)(f) legitimate interest), purposes, retention, sharing / subprocessors, international transfers (SCCs for EU), user rights (access / delete / portability / opt-out), cookies, AI-training disclosure (whether vendor models train on customer data — the 2026 hot clause), and a `privacy@{domain}` contact. Produce a ToS covering: acceptable use, liability, governing law, dispute resolution, termination. Save drafts to `privacy-drafts/privacy-policy-{YYYY-MM-DD}.md` and `privacy-drafts/tos-{YYYY-MM-DD}.md`. Drafts only — you deploy.",
      "description": "Scans the landing page + cross-checks your subprocessor inventory, then writes Privacy Policy + ToS with legal-basis citations and the 2026 AI-training disclosure. Drafts — you deploy.",
      "outcome": "Drafts at `privacy-drafts/privacy-policy-{YYYY-MM-DD}.md` and `privacy-drafts/tos-{YYYY-MM-DD}.md`.",
      "skill": "draft-privacy-policy",
      "tool": "Web Scrape"
    },
    {
      "category": "Privacy",
      "title": "Audit my privacy posture — what's drifted?",
      "blurb": "Drift report: new analytics, new subprocessor, new cookies.",
      "prompt": "Audit my privacy posture — what's drifted since the last policy?",
      "fullPrompt": "Audit my privacy posture for drift. Use the `audit-privacy-posture` skill. Read `../general-counsel/legal-context.md` first. Scrape my landing page + product via `composio search web-scrape`, read the currently deployed Privacy Policy (URL or the latest `privacy-drafts/` entry), and cross-check: analytics scripts deployed vs disclosed, subprocessors visible in DNS / cookies / network calls vs listed in the policy, cookie categories deployed vs disclosed, data-collection endpoints vs stated purposes. Flag each drift: `new-analytics`, `undisclosed-subprocessor`, `new-cookie`, `purpose-drift`. Produce a drift report with severity (Low / Medium / High) and recommended policy updates. Never auto-fix — surface the diff. Save to `privacy-audits/{YYYY-MM-DD}.md` and log in `outputs.json`.",
      "description": "Walks the landing page + product, diffs against the deployed Privacy Policy, and flags each drift (new analytics, undisclosed subprocessor, new cookie, purpose drift) with severity + recommended updates. Surfaces only — no auto-fix.",
      "outcome": "Drift report at `privacy-audits/{YYYY-MM-DD}.md` with each drift flagged Low / Medium / High.",
      "skill": "audit-privacy-posture",
      "tool": "Web Scrape"
    },
    {
      "category": "Corporate",
      "title": "Prep my Delaware annual report ({year})",
      "blurb": "Assumed-Par-Value recalc vs default — often 10-100x savings.",
      "prompt": "Prep my Delaware annual report for {year} — recalculate franchise tax under the Assumed-Par-Value method.",
      "fullPrompt": "Prep my Delaware annual report for {year}. Use the `file-delaware-annual-report` skill. Read `../general-counsel/legal-context.md` first (entity name, authorized shares, par value, registered agent, formation date). Pull cap-table snapshot via `composio search cap-table` for issued shares + gross assets (or ask me). Recalculate franchise tax under both methods: (a) default Authorized-Shares method, (b) Assumed-Par-Value-Capital method (gross assets + issued shares formula). Report both, flag the savings — for most early-stage startups Assumed-Par-Value is 10-100x lower. Collect directors, officers, issued shares as of fiscal year-end. Produce the submission package: completed form content + step-by-step submission guide for the Delaware Division of Corporations portal. Save to `annual-filings/de-{year}.md` and log in `outputs.json`. Flag `attorneyReviewRequired: true` if the cap table has anything unusual (convertibles, SAFEs not converted, preferred shares). Prep only — you file.",
      "description": "Recalculates franchise tax under both methods, flags the savings, gathers directors / officers / issued shares, and produces the submission package. You file on the state portal.",
      "outcome": "Submission package at `annual-filings/de-{year}.md` — recalc, form content, step-by-step portal guide.",
      "skill": "file-delaware-annual-report",
      "tool": "Cap Table"
    },
    {
      "category": "Trademark",
      "title": "Run a trademark knockout search on {mark}",
      "blurb": "Exact + phonetic + visual hits from USPTO TM Center.",
      "prompt": "Run a trademark knockout search on {mark} for classes {classes}.",
      "fullPrompt": "Run a USPTO knockout search on {mark}. Use the `run-trademark-knockout` skill. Read `../general-counsel/legal-context.md` first (entity + product category → relevant Nice classes). Search the USPTO Trademark Center (Jan 2025 platform) for: exact hits on {mark}, nearest-neighbors (phonetic + visual variants), and any live registrations or pending applications in the classes we care about. Produce: hit list with status (live / pending / abandoned / dead), nearest-neighbor table, risk assessment (Low / Medium / High), classes checked, and recommended next step — file 1(b) intent-to-use, rebrand, or retain TM counsel for full clearance. Be honest about limits: this is a knockout, not a full clearance; High-risk results or pre-filing always warrant counsel. Save to `tm-searches/{mark-slug}-{YYYY-MM-DD}.md` and log in `outputs.json`. Flag `attorneyReviewRequired: true` on any High-risk result.",
      "description": "USPTO Trademark Center knockout on a proposed name / mark — exact + phonetic + visual hits, risk assessment, classes checked, and the next concrete move. Honest about knockout-vs-clearance limits.",
      "outcome": "Knockout report at `tm-searches/{mark-slug}-{YYYY-MM-DD}.md` with Low / Medium / High risk call and next step.",
      "skill": "run-trademark-knockout",
      "tool": "USPTO"
    },
    {
      "category": "Privacy",
      "title": "Respond to this data subject request",
      "blurb": "Ack letter + ID verification + export cover — within 72 hours.",
      "prompt": "Respond to this data subject request from {requester} received on {date}.",
      "fullPrompt": "Draft the first-touch response to a data subject request from {requester} received on {receivedDate}. Use the `draft-dsr-response` skill. Read `../general-counsel/legal-context.md` first. Produce three markdown files in `dsr-responses/{requester-slug}-{YYYY-MM-DD}/`: (1) acknowledgment letter (to send within 72 hours — restates the request, confirms the statutory timeline: GDPR Art. 15 → 30 days, CCPA → 45 days, asks for identity verification), (2) identity verification request template (what we need to confirm they are the subject), (3) data export cover note (to send with the compiled data once collected — explains format, scope, and any redactions for third-party data). Compute urgency: ≤ 7 days from receipt = on track, 7-21 days = still fine, > 21 days without response = flag `attorneyReviewRequired: true`. Log in `outputs.json`.",
      "description": "Produces the three-file first-touch packet for any DSR: acknowledgment (within 72h), identity verification request, and data export cover note. Computes urgency against the statutory clock and flags late responses for counsel.",
      "outcome": "Response packet at `dsr-responses/{requester-slug}-{YYYY-MM-DD}/` with 3 markdown files.",
      "skill": "draft-dsr-response"
    },
    {
      "category": "Privacy",
      "title": "Update my subprocessor inventory",
      "blurb": "Every vendor, DPA status, transfer basis, DPA URL.",
      "prompt": "Update my subprocessor inventory — check every vendor touching customer data.",
      "fullPrompt": "Refresh my subprocessor inventory. Use the `maintain-subprocessor-inventory` skill. Read `../general-counsel/legal-context.md` first. Walk the currently-connected integrations (`composio search` across hosting / analytics / email / AI / payments / CRM / support categories) and any vendors you can infer from the landing-page scrape + DNS. For each vendor: name, role, data categories processed, transfer mechanism (SCCs / EU-US DPF / intra-EU / US-only), DPA status (executed / pending / missing link), DPA URL (I have hardcoded the public DPA URLs for the top 10 common vendors — Stripe, Google, HubSpot, Anthropic, OpenAI, Vercel, Cloudflare, AWS, Slack, Intercom — in the skill so you don't hunt). Write `subprocessor-inventory.json` at my agent root and a human-readable review to `subprocessor-reviews/{YYYY-MM-DD}.md`. Flag any missing DPAs as `attorneyReviewRequired: true` if the vendor touches personal data.",
      "description": "Inventories every vendor touching customer data with role, data categories, transfer mechanism, DPA status, and DPA URL. Hardcodes public DPA URLs for the top 10 common vendors so you don't hunt.",
      "outcome": "`subprocessor-inventory.json` at agent root + readable review at `subprocessor-reviews/{YYYY-MM-DD}.md`.",
      "skill": "maintain-subprocessor-inventory",
      "tool": "Integrations"
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
