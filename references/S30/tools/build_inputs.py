"""Build references/S30/inputs/{brief.md,critiques/CRITIQUES.md,critiques/critiques.json} from the SlopLabel export."""
import json, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
EXPORT = ROOT / "data/sloplabel/sloplabel-2026-11-15T0713Z.json"
OUT = ROOT / "references/S30/inputs"
SHOTS = "../../../../data/sloplabel/shots"


def main():
    d = json.loads(EXPORT.read_text())
    site = next(s for s in d["sites"] if s["site_id"] == "S30")
    (OUT / "brief.md").write_text(f"# S30 brief (verbatim from `sites[].prompt`)\n\n```text\n{site['prompt']}\n```\n")
    labels = sorted([l for l in d["labels"] if l["site_id"] == "S30"], key=lambda l: l["id"])
    keep = ["id", "site_id", "annotator", "comment", "viewport_w", "viewport_h", "scroll_y", "loc", "component_chain",
            "selector", "tag", "text", "rect", "styles", "html"]
    rows = [{k: l.get(k) for k in keep} for l in labels]
    for r in rows:
        r["crop"] = f"data/sloplabel/shots/{r['id']}.png"; r["context"] = f"data/sloplabel/shots/{r['id']}_ctx.png"
    (OUT / "critiques").mkdir(exist_ok=True)
    (OUT / "critiques/critiques.json").write_text(json.dumps(rows, indent=1))
    md = ["# S30 critiques", "",
          "Every SlopLabel label means \"slop\" (see `data/sloplabel/README.md`). Crops and context shots are the labeller's own captures",
          "of the live S30 app. Full records (selector, computed styles, outer HTML) are in `critiques.json`. S29 has no labels.", "",
          f"## S30 ({site.get('model', 'unknown model')}), all by Aidan", ""]
    for r in rows:
        text = (r["text"] or "").replace("\n", " ")[:90]
        md += [f"### #{r['id']}  `{r['loc']}`  ({r['tag']}, viewport {r['viewport_w']}px, scrollY {r['scroll_y']:.0f})", "",
               f"- Element text: {text!r}" if text else "- Element text: (none)",
               f"- Comment: {(r['comment'] or '').strip()}".replace("\n\n", " ").replace("\n", " "),
               f"- Crop: [{r['id']}.png]({SHOTS}/{r['id']}.png), context: [{r['id']}_ctx.png]({SHOTS}/{r['id']}_ctx.png)", ""]
    (OUT / "critiques/CRITIQUES.md").write_text("\n".join(md) + "\n")
    print(len(rows), "S30 labels")


if __name__ == "__main__":
    main()
