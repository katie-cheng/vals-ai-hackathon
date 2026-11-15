"""Build references/S02/inputs/{brief.md,critiques/CRITIQUES.md,critiques/critiques.json} from the SlopLabel export."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
EXPORT = ROOT / "data/sloplabel/sloplabel-2026-11-15T0713Z.json"
OUT = ROOT / "references/S02/inputs"
SHOTS = "../../../../data/sloplabel/shots"

# Most S02 labels have no comment. What each one flags is read from its crop and element; recorded here so PLAN.md can map it.
S02_READING = {
    41: "syllabus heading is a count, not a title ('the text itself is slop')",
    45: "gradient text on half the hero headline",
    53: "hero pill badge", 54: "hero pill badge copy (dot separator, 'Production-Grade')",
    74: "small uppercase eyebrow above the features heading",
    76: "six-card feature grid (icon tile + title + paragraph, repeated)",
    78: "feature card icon tile", 79: "feature card icon tile", 80: "feature card icon tile",
    81: "feature card icon tile", 82: "feature card icon tile", 83: "feature card icon tile",
    84: "small uppercase eyebrow above the syllabus heading",
    85: "emoji used as chapter icon", 86: "emoji used as chapter icon", 87: "emoji used as chapter icon",
    88: "emoji used as chapter icon", 89: "emoji used as chapter icon", 90: "emoji used as chapter icon",
    91: "chapter meta line with dot separators above the title", 92: "chapter meta line with dot separators above the title",
    93: "chapter meta line with dot separators above the title", 94: "chapter meta line with dot separators above the title",
    95: "chapter meta line with dot separators above the title",
    96: "'Key Concepts' row of tag pills plus a second CTA inside the accordion",
    97: "lesson rows in tiny mono text with arrow glyphs",
    99: "gradient CTA band", 100: "pill badge with emoji above the CTA heading",
    101: "CTA pair that goes to the same place (1 of 2)", 102: "CTA pair that goes to the same place (2 of 2)",
    103: "filler paragraph in the CTA band",
    104: "footer tech-stack line with a pinging dot", 105: "pinging dot", 106: "logo: gradient tile with glow",
    108: "footer chapter list with emoji and 'Ch n:' prefixes",
    109: "streak pill with a pulsing flame", 110: "header right cluster: streak pill, role switch, avatar all crammed and wrapping",
    111: "logo lockup: gradient tile, 'LMS' tag, tiny sub-label, wraps onto two lines",
    112: "header row overflows: logo and search squeezed",
    113: "nav link icon", 114: "nav link icon", 115: "nav link icon", 116: "nav link icon", 117: "nav link icon", 118: "nav link icon",
    447: None, 448: None, 450: None,
}
# S01 labels (same brief, gpt-6-astra) -> where the same pattern occurs in S02, or why it does not.
S01_MATCHES = {
    10: "decorative glyph next to a heading (S02: sparkle icon in the hero pill and the 'Developer Cheatsheets' card)",
    14: "small uppercase eyebrow (same as #74, #84)",
    15: "filler subtitle under a page title (S02: sub-lines under every page h1)",
    411: "uppercase mono tag; inconsistent tag sizes (S02: 'LMS' tag, 'Live Evaluation', admin table badges)",
    412: "small uppercase titles (same as #74, #84)",
    413: "dot on the left of a title (S02: status dot in the lesson player chip, pinging dot #105)",
    414: "mono uppercase eyebrow (same as #74; S02 dashboard 'STUDENT DASHBOARD')",
    415: "big highlighted numbers (same as #448; S02 hero stat row and dashboard stat tiles)",
    416: "overuse of icons (same as #78 to #83, #113 to #118)",
    418: "uppercase eyebrow + left-hand dot (same as #74, #105)",
    420: "eyebrow + repetitive subtitles in one card (S02: hero code card, dashboard 'Resume Your Lecture' card)",
    422: "overuse of icons (same as #78 to #83)",
    425: "useless uppercase caption (S02: 'AjinLab Platform' under the logo, hero card captions)",
    429: "state-less tag (S02: 'Active Learner', 'LMS', role badges)",
    431: "uppercase label + dot separator (same as #91 to #95)",
    432: "text too small for its container (same as #97; S02 uses 10 to 12px almost everywhere)",
    436: "useless AI-voice subtitle (same as #103)",
    437: "small uppercase eyebrow (same as #84)",
    440: "small uppercase 'CHAPTER 03' eyebrow (S02: 'Chapter n' meta line above chapter titles)",
    445: "button text too small for the button (S02: 12px bold labels in 40px buttons)",
}
S01_NOT_APPLICABLE = {
    11: "no comment; S02 has no equivalent heading ('Built for beginners, by design.')",
    13: "no comment; S02's quiz page has no equivalent reassurance line",
    427: "S02 cards change border colour on hover, not stroke width",
}

def main():
    d = json.loads(EXPORT.read_text())
    site = next(s for s in d["sites"] if s["site_id"] == "S02")
    (OUT / "brief.md").write_text(f"# S02 brief (verbatim from `sites[].prompt`)\n\n```text\n{site['prompt']}\n```\n")
    labels = sorted([l for l in d["labels"] if l["site_id"] in ("S02", "S01")], key=lambda l: (l["site_id"] != "S02", l["id"]))
    keep = ["id", "site_id", "annotator", "comment", "page_path", "viewport_w", "viewport_h", "scroll_y", "loc", "component_chain",
            "selector", "tag", "text", "rect", "styles", "html"]
    rows = [{k: l.get(k) for k in keep} for l in labels]
    for r in rows:
        r["crop"] = f"data/sloplabel/shots/{r['id']}.png"; r["context"] = f"data/sloplabel/shots/{r['id']}_ctx.png"
        if r["site_id"] == "S02": r["reading"] = S02_READING.get(r["id"])
        else: r["s02_match"] = S01_MATCHES.get(r["id"]); r["not_applicable"] = S01_NOT_APPLICABLE.get(r["id"])
    (OUT / "critiques/critiques.json").write_text(json.dumps(rows, indent=1))
    c = lambda r: (r["comment"] or "").strip().replace("\n\n", " ").replace("\n", " ")
    who = sorted({r["annotator"] for r in rows if r["site_id"] == "S02"})
    md = ["# S02 critiques", "",
          "Every SlopLabel label means \"slop\" (see `data/sloplabel/README.md`). S02 labels are listed in full; S01 (`gpt-6-astra`, same brief)",
          "labels are listed to record which ones match a pattern S02 also has. Crops and context shots are the labeller's own captures",
          "of the live apps. Full records (selector, computed styles, outer HTML) are in `critiques.json`.", "",
          "Most S02 labels carry no comment. For those, \"Reading\" states what the crop shows was flagged; it is an interpretation, not the labeller's words.", "",
          f"## S02 (gemini-3.8-flash), {len([r for r in rows if r['site_id']=='S02'])} labels by {', '.join(who)}", ""]
    for r in rows:
        if r["site_id"] != "S02": continue
        text = (r["text"] or "").replace("\n", " ")[:90]
        md += [f"### #{r['id']}  `{r['loc']}`  ({r['tag']}, {r['page_path']}, viewport {r['viewport_w']}px, scrollY {r['scroll_y']:.0f})", "",
               f"- Element text: {text!r}" if text else "- Element text: (none)",
               f"- Comment: {c(r)}" if c(r) else f"- Comment: (none). Reading: {r['reading']}",
               f"- Crop: [{r['id']}.png]({SHOTS}/{r['id']}.png) · context: [{r['id']}_ctx.png]({SHOTS}/{r['id']}_ctx.png)", ""]
    md += ["## S01 (gpt-6-astra) labels that match an S02 pattern", "", "| S01 # | Comment | S02 pattern |", "| --- | --- | --- |"]
    for r in rows:
        if r["site_id"] == "S01" and r.get("s02_match"):
            md.append(f"| [#{r['id']}]({SHOTS}/{r['id']}_ctx.png) | {c(r) or '(none) ' + repr((r['text'] or '')[:50])} | {r['s02_match']} |")
    md += ["", "## S01 labels with no matching S02 pattern", "", "| S01 # | Comment | Why not applied |", "| --- | --- | --- |"]
    for r in rows:
        if r["site_id"] == "S01" and not r.get("s02_match"):
            md.append(f"| [#{r['id']}]({SHOTS}/{r['id']}_ctx.png) | {c(r) or '(none) ' + repr((r['text'] or '')[:50])} | {r.get('not_applicable') or ''} |")
    (OUT / "critiques/CRITIQUES.md").write_text("\n".join(md) + "\n")
    print("S02 unread:", [r["id"] for r in rows if r["site_id"] == "S02" and not c(r) and not r.get("reading")])
    print("S01 unclassified:", [r["id"] for r in rows if r["site_id"] == "S01" and r["id"] not in S01_MATCHES and r["id"] not in S01_NOT_APPLICABLE])

if __name__ == "__main__":
    main()
