#!/usr/bin/env python3
"""Generate bundle.js per agent from the template + houston.json useCases."""
import json
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = REPO / "agents"
TEMPLATE = (Path(__file__).resolve().parent / "bundle_template.js").read_text()

# Accent per agent (unused in the monochrome template but kept as metadata)
ACCENTS = {
    "general-counsel": "slate",
    "paralegal": "slate",
    "compliance-ops": "slate",
}

TAGLINES = {
    "general-counsel": "Fractional GC — review the things you're about to sign, draft the redline strategy, own the legal context doc, decide when you need a real lawyer.",
    "paralegal": "Paperwork and intake — triage your legal inbox, draft from the template library, track signatures, log counterparty agreements. Drafts only — I never send or file.",
    "compliance-ops": "Privacy, corporate hygiene, and the deadline calendar — Delaware March 1, 83(b), DSR clock, 409A refresh, trademark knockout. Never files without your approval.",
}


def build_for(agent_id: str) -> tuple[str, int]:
    agent_dir = BASE / agent_id
    houston_json = json.loads((agent_dir / "houston.json").read_text())

    agent_config = {
        "name": houston_json["name"],
        "tagline": TAGLINES[agent_id],
        "accent": ACCENTS[agent_id],
        "useCases": houston_json.get("useCases", []),
    }

    injected = json.dumps(agent_config, indent=2, ensure_ascii=False)
    injected_js = injected

    bundle_source = TEMPLATE.replace("{{AGENT_NAME}}", houston_json["name"])
    bundle_source = bundle_source.replace("{{AGENT_CONFIG}}", injected_js)

    target = agent_dir / "bundle.js"
    target.write_text(bundle_source)
    return str(target), len(bundle_source)


def verify(agent_id: str) -> bool:
    agent_dir = BASE / agent_id
    node_check = (
        "global.window={Houston:{React:{createElement:()=>null,"
        "useState:()=>[{idx:null,at:0},()=>{}],"
        "useEffect:()=>{},useCallback:f=>f}}};"
        "eval(require('fs').readFileSync('bundle.js','utf8'));"
        "console.log(Object.keys(window.__houston_bundle__));"
    )
    result = subprocess.run(
        ["node", "-e", node_check],
        cwd=agent_dir,
        capture_output=True,
        text=True,
    )
    ok = result.returncode == 0 and "Dashboard" in result.stdout
    status = "OK" if ok else "FAIL"
    print(f"  {status}  {result.stdout.strip() or result.stderr.strip()[:200]}")
    return ok


print("=== Generating bundle.js per agent ===")
all_ok = True
for agent_id in ACCENTS:
    path, size = build_for(agent_id)
    print(f"\n{agent_id}: wrote {size:,} bytes")
    if not verify(agent_id):
        all_ok = False

print("\n=== Summary ===")
print("All bundles verified." if all_ok else "SOME BUNDLES FAILED VERIFICATION.")
sys.exit(0 if all_ok else 1)
