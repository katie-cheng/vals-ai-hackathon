"""Build the frozen, stratified test set: ~60 sites spread over 8 website types and all sources, plus a sparse pair plan.

Types come from the capture metadata (curated-top / osm-local / personal-sites) or SigLIP zero-shot labels
(data/models/site_types.json). Keeps the 10 held-out Design Arena sites; never uses dev arena sites.
Prefers sites with few existing votes so training loses little data. Seeded and written once; rerunning refuses to
overwrite unless --force.
Output: data/testset.json {"sites": {id: {type, source}}, "pairs": [[a, b], ...]}
Usage: python3 scripts/build_testset.py [--per-type 7] [--force]
"""
import argparse, collections, itertools, json, pathlib, random, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "arena"))
import app  # noqa: E402

BUCKET = {"saas": "landing", "finance": "landing", "health": "landing", "industrial": "landing",
          "consumer_app": "consumer_app", "app_ui": "app_ui", "game": "game", "portfolio": "portfolio",
          "content": "content", "education": "content", "local_service": "local", "restaurant": "local",
          "hospitality": "local", "ecommerce": "ecommerce"}
TRUSTED = {"curated-top", "osm-local", "personal-sites"}
SOURCE = lambda s: "arena" if s["kind"] == "arena" else ("lovable" if s["split"] in ("madewithlovable", "lovable-templates") else s["split"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-type", type=int, default=8)
    ap.add_argument("--same", type=int, default=4, help="planned comparisons per site within its type")
    ap.add_argument("--cross", type=int, default=2, help="planned comparisons per site across types")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    out = ROOT / "data/testset.json"
    if out.exists() and not a.force:
        sys.exit(f"{out} exists; the test set is frozen (use --force to rebuild)")
    rng = random.Random(0)
    zs = json.load(open(ROOT / "data/models/site_types.json"))
    app.warm_cache = lambda: None
    with app.app.app_context():
        S = app.live_sites()
        nvotes = collections.Counter()
        for r in app.db().execute("SELECT left_id, right_id FROM votes WHERE choice != 'skip'"):
            nvotes[r["left_id"]] += 1; nvotes[r["right_id"]] += 1

    ov = json.load(open(ROOT / "data/web/type_overrides.json"))  # manual corrections from eyeballing contact sheets

    def typ(k):
        if k in ov["exclude"]:
            return None
        if k in ov["type"]:
            return ov["type"][k]
        return BUCKET.get(S[k].get("site_type") or (zs.get(k) or {}).get("type"))

    chosen = {k: typ(k) for k in S if S[k]["split"] == "heldout"}
    pools = collections.defaultdict(lambda: collections.defaultdict(list))
    for k, s in S.items():
        if s["kind"] == "arena" or typ(k) is None:
            continue
        pools[typ(k)][SOURCE(s)].append(k)
    for t in sorted(pools):
        srcs = pools[t]
        for v in srcs.values():
            rng.shuffle(v)
            v.sort(key=lambda k: nvotes[k])  # fewest votes first; shuffle breaks ties
        have = sum(1 for x in chosen.values() if x == t)
        # Round-robin over sources so every type mixes human/AI/curated. Sources whose type comes from capture
        # metadata (not zero-shot) get two slots per round since their labels are reliable.
        order = sorted(srcs, key=lambda x: (x not in TRUSTED, rng.random()))
        order = [x for x in order for _ in range(2 if x in TRUSTED else 1)]
        took = collections.Counter()
        while have < a.per_type and any(srcs.values()):
            if not any(srcs[x] and took[x] < 2 for x in order):
                break
            for src in order:
                if srcs[src] and have < a.per_type and took[src] < 2:  # at most 2 per source per type
                    took[src] += 1
                    chosen[srcs[src].pop(0)] = t
                    have += 1
    by = collections.defaultdict(list)
    for k, t in chosen.items():
        by[t].append(k)
    pairs = set()
    for t, ks in by.items():  # random regular-ish graph within each type
        for _ in range(a.same // 2):
            rng.shuffle(ks)
            for x, y in zip(ks, ks[1:] + ks[:1]):
                if x != y:
                    pairs.add(tuple(sorted((x, y))))
    ids = sorted(chosen)
    for k in ids:
        others = [o for o in ids if chosen[o] != chosen[k]]
        for o in rng.sample(others, a.cross // 2 or 1):
            pairs.add(tuple(sorted((k, o))))
    held = sorted(k for k in chosen if S[k]["split"] == "heldout")
    for x, y in itertools.combinations(held, 2):  # keep same-prompt held-out pairs
        if S[x]["group"] == S[y]["group"]:
            pairs.add((x, y))
    data = {"sites": {k: {"type": chosen[k], "source": SOURCE(S[k])} for k in ids}, "pairs": sorted(map(list, pairs))}
    json.dump(data, open(out, "w"), indent=1)
    tab = collections.Counter((v["type"], v["source"]) for v in data["sites"].values())
    for t in sorted(by):
        print(f"{t:13s}", dict((s, n) for (tt, s), n in tab.items() if tt == t))
    print(f"{len(ids)} sites, {len(pairs)} pairs")


if __name__ == "__main__":
    main()
