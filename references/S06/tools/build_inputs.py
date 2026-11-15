"""Build references/S06/inputs/{brief.md,critiques/CRITIQUES.md,critiques/critiques.json} from the SlopLabel export."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
EXPORT = ROOT / "data/sloplabel/sloplabel-2026-11-15T0713Z.json"
OUT = ROOT / "references/S06/inputs"
SHOTS = "../../../../data/sloplabel/shots"

# S05 (gpt-6-astra-max, same brief) labels -> the S06 element with the same pattern.
S05_MATCHES = {
    289: "header 'Order now' button disappears below 768px and only the bag (cart) icon is left (Layout.tsx Header)",
    294: "top announcement strip: 9 to 10px uppercase, letter-spaced (Layout.tsx Header)",
    296: "hero eyebrow above the headline (same as #389)",
    452: "section eyebrow (same as #397 #406 #407)",
    453: "hero trust strip: initials avatars, '4.9 Local favourite', 'Made fresh / Every single order' (Home.tsx hero)",
    454: "badges on the meal photo: S06 has 'Featured' / 'Sold out' pills on MenuCard and uppercase micro-labels with leading marks elsewhere",
    455: "'Why Rocksteady' cards (same as #405)",
    456: "section eyebrow (same as #406)",
    457: "icon tile in every 'Why Rocksteady' card and loose card spacing (same as #405)",
    458: "ghost 01 / 02 / 03 numerals in the 'Why Rocksteady' cards (same as #405)",
    459: "section eyebrow (same as #397)",
    460: "section eyebrow above the reviews (same as #407)",
}

def clean(s):
    return (s or "").strip().replace("\n\n", " ").replace("\n", " ")

def main():
    d = json.loads(EXPORT.read_text())
    site = next(s for s in d["sites"] if s["site_id"] == "S06")
    (OUT / "brief.md").write_text(f"# S06 brief (verbatim from `sites[].prompt`)\n\n```text\n{site['prompt']}\n```\n")
    want = ("S06", "S05", "S13", "S14", "S13-ref")
    labels = sorted([l for l in d["labels"] if l["site_id"] in want], key=lambda l: (want.index(l["site_id"]), l["id"]))
    keep = ["id", "site_id", "annotator", "comment", "page_path", "viewport_w", "viewport_h", "scroll_y", "loc", "component_chain",
            "selector", "tag", "text", "rect", "styles", "html"]
    rows = [{k: l.get(k) for k in keep} for l in labels]
    for r in rows:
        r["crop"] = f"data/sloplabel/shots/{r['id']}.png"; r["context"] = f"data/sloplabel/shots/{r['id']}_ctx.png"
        if r["site_id"] == "S05":
            r["s06_match"] = S05_MATCHES.get(r["id"])
    (OUT / "critiques").mkdir(parents=True, exist_ok=True)
    (OUT / "critiques/critiques.json").write_text(json.dumps(rows, indent=1))
    md = ["# S06 critiques", "",
          "Every SlopLabel label means \"slop\" (see `data/sloplabel/README.md`). S06 labels are listed in full. S05 (`gpt-6-astra-max`, same brief)",
          "labels are listed with the S06 element that shows the same pattern. The S13, S14 and S13-ref labels are applied as patterns; they are",
          "listed by id at the end and mapped to S06 in `../../solution/PLAN.md`. Crops and context shots are the labeller's own captures of the",
          "live apps. Full records (selector, computed styles, outer HTML) are in `critiques.json`.", "",
          "## S06 (kimi-k3.1-pro), all by katie", ""]
    for r in rows:
        if r["site_id"] != "S06": continue
        text = clean(r["text"])[:110]
        md += [f"### #{r['id']}  `{r['loc']}`  ({r['tag']}, page `{r['page_path']}`, viewport {r['viewport_w']}px, scrollY {r['scroll_y']:.0f})", "",
               f"- Element text: {text!r}" if text else "- Element text: (none)",
               f"- Comment: {clean(r['comment']) or '(no comment)'}",
               f"- Crop: [{r['id']}.png]({SHOTS}/{r['id']}.png), context: [{r['id']}_ctx.png]({SHOTS}/{r['id']}_ctx.png)", ""]
    md += ["## S05 (gpt-6-astra-max) labels and the matching S06 pattern", "", "| S05 # | By | Element text | Comment | Same pattern in S06 |", "| --- | --- | --- | --- | --- |"]
    for r in rows:
        if r["site_id"] == "S05":
            md.append(f"| [#{r['id']}]({SHOTS}/{r['id']}_ctx.png) | {r['annotator']} | {clean(r['text'])[:60]} | {clean(r['comment']) or '(no comment)'} | {r.get('s06_match') or ''} |")
    for sid, title in (("S13", "S13 (muse-spark-1.3-max, Suds Squad)"), ("S14", "S14 (gpt-6-luna, Suds Squad)"), ("S13-ref", "S13-ref (Katie's chat review of the S13 rebuild)")):
        md += ["", f"## {title}: applied as patterns", "", "| # | Comment |", "| --- | --- |"]
        for r in rows:
            if r["site_id"] == sid:
                md.append(f"| #{r['id']} | {clean(r['comment']) or '(no comment)'} |")
    (OUT / "critiques/CRITIQUES.md").write_text("\n".join(md) + "\n")
    missing = [r["id"] for r in rows if r["site_id"] == "S05" and r["id"] not in S05_MATCHES]
    print("labels:", {s: sum(r["site_id"] == s for r in rows) for s in want}, "S05 unclassified:", missing)

if __name__ == "__main__":
    main()
