"""Pairwise slop probe on frozen SigLIP embeddings.

score(site) = w . f(site);  P(A sloppier than B) = sigmoid(score(A) - score(B)).
Ties ("both"/"neither"/legacy "same") are included as soft targets of 0.5.
Evaluation: 5-fold CV grouped by site group (a test vote needs both sites unseen) plus the frozen held-out
Design Arena sites; baselines: chance, source-only (one score per source), human agreement.
Usage: python3 scripts/slop_model/train_probe.py
"""
import collections, json, pathlib

import numpy as np

ROOT = pathlib.Path(__file__).resolve().parents[2] / "data/models"
TIE = {"both", "neither", "same"}


def test_sites():
    """Frozen stratified test set (data/testset.json); its sites are never trained on."""
    f = ROOT.parent / "testset.json"
    return set(json.load(open(f))["sites"]) if f.exists() else set()


def source(s):
    return "arena" if s["kind"] == "arena" else s["split"]


def load():
    d = json.load(open(ROOT / "dataset.json"))
    z = np.load(ROOT / "emb.npz")
    by = collections.defaultdict(dict)
    for o, sl, e in zip(z["owner"], z["slot"], z["emb"]):
        by[str(o)][int(sl)] = e
    feats = {}
    for k, v in by.items():
        desk = [v[i] for i in (0, 1, 2) if i in v]
        mob = v.get(3, desk[0])
        feats[k] = np.concatenate([desk[0], np.mean(desk, 0), mob])
    return d["sites"], d["votes"], feats


def pairs(votes, keep):
    X, y = [], []
    for v in votes:
        a, b = v["left_id"], v["right_id"]
        if not keep(a, b):
            continue
        t = 1.0 if v["choice"] == "left" else 0.0 if v["choice"] == "right" else 0.5
        X.append((a, b)); y.append(t)
    return X, np.array(y)


def fit(P, y, F, lam, iters=300):
    if not P:
        return None
    D = np.stack([F[a] - F[b] for a, b in P])
    D = np.concatenate([D, -D]); t = np.concatenate([y, 1 - y])  # symmetric augmentation
    w = np.zeros(D.shape[1])
    lr = 0.5
    for _ in range(iters):
        p = 1 / (1 + np.exp(-D @ w))
        g = D.T @ (p - t) / len(t) + lam * w
        w -= lr * g
    return w


def acc(P, y, score):
    """Accuracy on decisive votes only; ties are reported separately."""
    hit = [(score(a) > score(b)) == (t == 1.0) for (a, b), t in zip(P, y) if t != 0.5]
    return (np.mean(hit) if hit else float("nan")), len(hit)


def main():
    sites, votes, F = load()
    votes = [v for v in votes if v["left_id"] in F and v["right_id"] in F]
    groups = sorted({sites[k]["group"] or k for k in F})
    rng = np.random.default_rng(0)
    rng.shuffle(groups)
    fold = {g: i % 5 for i, g in enumerate(groups)}
    heldout = {k for k, s in sites.items() if s["split"] == "heldout"} | test_sites()
    print(f"{len(F)} sites, {len(votes)} votes ({sum(v['choice'] in TIE for v in votes)} ties)")

    best = (-1, None)
    for lam in (1e-3, 1e-2, 1e-1):
        res = collections.defaultdict(list)
        for f in range(5):
            tr = lambda a, b: fold[sites[a]["group"] or a] != f and fold[sites[b]["group"] or b] != f and a not in heldout and b not in heldout
            te = lambda a, b: fold[sites[a]["group"] or a] == f and fold[sites[b]["group"] or b] == f and a not in heldout and b not in heldout
            Ptr, ytr = pairs(votes, tr); Pte, yte = pairs(votes, te)
            w = fit(Ptr, ytr, F, lam)
            src = collections.defaultdict(list)  # source-only baseline: mean BT-ish win rate per source
            for (a, b), t in zip(Ptr, ytr):
                src[source(sites[a])].append(t); src[source(sites[b])].append(1 - t)
            sb = {k: np.mean(v) for k, v in src.items()}
            for (a, b), t in zip(Pte, yte):
                if t == 0.5:
                    continue
                same = source(sites[a]) == source(sites[b])
                res["model"].append((F[a] @ w > F[b] @ w) == (t == 1.0))
                res["model_same_src" if same else "model_cross_src"].append((F[a] @ w > F[b] @ w) == (t == 1.0))
                sa, sb_ = sb.get(source(sites[a]), .5), sb.get(source(sites[b]), .5)
                res["source_only"].append(((sa > sb_) == (t == 1.0)) if sa != sb_ else 0.5)
        print(f"lam={lam:g}  " + "  ".join(f"{k}={np.mean(v):.3f} (n={len(v)})" for k, v in sorted(res.items())))
        best = max(best, (np.mean(res["model"]), lam))

    lam = best[1]
    print(f"using lam={lam:g}")
    Ptr, ytr = pairs(votes, lambda a, b: a not in heldout and b not in heldout)
    w = fit(Ptr, ytr, F, lam)
    Pho, yho = pairs(votes, lambda a, b: a in heldout and b in heldout)
    a_, n_ = acc(Pho, yho, lambda k: F[k] @ w)
    print(f"held-out Design Arena pairs (frozen, trained on everything else): acc={a_:.3f} n={n_}")
    np.save(ROOT / "probe_w.npy", w)
    sc = {k: float(F[k] @ w) for k in F}
    by = collections.defaultdict(list)
    for k, s in sc.items():
        by[sites[k]["model"]].append(s)
    print("mean predicted slop score by model/source:")
    for m, v in sorted(by.items(), key=lambda x: -np.mean(x[1])):
        print(f"  {m:28s} {np.mean(v):+.3f}  (n={len(v)})")


if __name__ == "__main__":
    main()
