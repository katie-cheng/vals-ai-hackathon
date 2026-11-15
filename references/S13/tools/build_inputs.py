"""Build references/S13/inputs/{brief.md,critiques/CRITIQUES.md,critiques/critiques.json} from the SlopLabel export."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
EXPORT = ROOT / "data/sloplabel/sloplabel-2026-11-15T0713Z.json"
OUT = ROOT / "references/S13/inputs"
SHOTS = "../../../../data/sloplabel/shots"

# S14 labels whose pattern also exists in S13 -> the S13 critique group they merge into.
S14_MATCHES = {
    310: "pulsing dot (same as #40)", 347: "pulsing dot (same as #40)",
    307: "uppercase eyebrow (same as #67)", 317: "uppercase eyebrow (same as #67)",
    334: "uppercase eyebrow with left-hand mark (same as #67)", 350: "uppercase eyebrow with left-hand mark (same as #67)",
    318: "em dash usage in copy (S13 uses em dashes in service eyebrows and the town confirmation line)",
    322: "dot on the left of elements (same as #67 / #107)",
    327: "before/after photos are not the same surface (same as #157 #170 #174 #190)",
    332: "headline words animate up out of a clip line (S13 SplitWords/HeroWords use the same clip-mask reveal)",
    342: "caption repeats the info below it (same as #131)",
    338: "carousel arrows must work (relevant to #136 if a carousel is introduced)",
    340: "no scroll hijacking (relevant to #136 if a carousel is introduced)",
    346: "step numbers look like notification badges (same as #239)",
    351: "gradient on hover (same as #262)",
    363: "repetitive labelling in custom-estimates card (same as #264)",
    369: "random, uncentered label in custom-estimates card (same as #264)",
    371: "negative space in custom-estimates card (same as #264)",
    374: "logo must not wrap in a narrow header (same as #51 #58)",
    378: "nav must not wrap; collapse instead (same as #51)",
    381: "phone button must not wrap (same as #58)",
    382: "header CTA text must not wrap (same as #121)",
}
S14_NOT_APPLICABLE = {
    304: "S13's scroll cue is a separate round button that does not wrap or get cut off",
    306: "S13's hero is not covered by the next section on scroll (it fades its own content)",
    308: "S13's scroll cue fades out before the next section arrives",
    344: "no comment text",
    345: "S13 service rows are not covered by the following section",
    349: "no comment text",
    352: "'overuse of icons' has no specific S13 element; flagged as ambiguous, not applied globally",
    356: "S13 already draws a Connecticut outline map",
}

def main():
    d = json.loads(EXPORT.read_text())
    site = next(s for s in d["sites"] if s["site_id"] == "S13")
    (OUT / "brief.md").write_text(f"# S13 brief (verbatim from `sites[].prompt`)\n\n```text\n{site['prompt']}\n```\n")
    labels = sorted([l for l in d["labels"] if l["site_id"] in ("S13", "S14")], key=lambda l: (l["site_id"], l["id"]))
    keep = ["id", "site_id", "annotator", "comment", "viewport_w", "viewport_h", "scroll_y", "loc", "component_chain",
            "selector", "tag", "text", "rect", "styles", "html"]
    rows = [{k: l.get(k) for k in keep} for l in labels]
    for r in rows:
        r["crop"] = f"data/sloplabel/shots/{r['id']}.png"; r["context"] = f"data/sloplabel/shots/{r['id']}_ctx.png"
        if r["site_id"] == "S14":
            r["s13_match"] = S14_MATCHES.get(r["id"]); r["not_applicable"] = S14_NOT_APPLICABLE.get(r["id"])
    (OUT / "critiques/critiques.json").write_text(json.dumps(rows, indent=1))
    md = ["# S13 critiques", "",
          "Every SlopLabel label means \"slop\" (see `data/sloplabel/README.md`). S13 labels are listed in full; S14 (`gpt-6-luna`, same brief)",
          "labels are listed only to record which ones match a pattern S13 also has. Crops and context shots are the labeller's own captures",
          "of the live S13/S14 apps. Full records (selector, computed styles, outer HTML) are in `critiques.json`.", "",
          "## S13 (muse-spark-1.3-max), all by katie", ""]
    for r in rows:
        if r["site_id"] != "S13": continue
        text = (r["text"] or "").replace("\n", " ")[:90]
        md += [f"### #{r['id']}  `{r['loc']}`  ({r['tag']}, viewport {r['viewport_w']}px, scrollY {r['scroll_y']:.0f})", "",
               f"- Element text: {text!r}" if text else "- Element text: (none)",
               f"- Comment: {r['comment'].strip()}".replace("\n\n", " ").replace("\n", " "),
               f"- Crop: [{r['id']}.png]({SHOTS}/{r['id']}.png) · context: [{r['id']}_ctx.png]({SHOTS}/{r['id']}_ctx.png)", ""]
    md += ["## S14 (gpt-6-luna) labels that match an S13 pattern", "", "| S14 # | Comment | S13 pattern |", "| --- | --- | --- |"]
    for r in rows:
        if r["site_id"] == "S14" and r.get("s13_match"):
            md.append(f"| [#{r['id']}]({SHOTS}/{r['id']}_ctx.png) | {r['comment'].strip().replace(chr(10), ' ')} | {r['s13_match']} |")
    md += ["", "## S14 labels with no matching S13 pattern", "", "| S14 # | Comment | Why not applied |", "| --- | --- | --- |"]
    for r in rows:
        if r["site_id"] == "S14" and not r.get("s13_match"):
            md.append(f"| [#{r['id']}]({SHOTS}/{r['id']}_ctx.png) | {r['comment'].strip().replace(chr(10), ' ') or '(empty)'} | {r.get('not_applicable') or ''} |")
    (OUT / "critiques/CRITIQUES.md").write_text("\n".join(md) + "\n")
    missing = [r["id"] for r in rows if r["site_id"] == "S14" and r["id"] not in S14_MATCHES and r["id"] not in S14_NOT_APPLICABLE]
    print("S14 unclassified:", missing)

if __name__ == "__main__":
    main()
