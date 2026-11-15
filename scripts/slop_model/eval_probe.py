"""Repeated grouped CV for the pairwise slop probe, with more test votes and confidence intervals.

Test votes = votes touching a test-fold site group; training uses only votes with both sites in train folds.
Compares: chance, source-only, SigLIP probe (with PCA dims sweep), on decisive votes.
"""
import collections, sys, pathlib

import numpy as np
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from train_probe import load, source, test_sites  # noqa: E402


REPS = 5


def main():
    sites, votes, F = load()
    votes = [v for v in votes if v["left_id"] in F and v["right_id"] in F]
    heldout = {k for k, s in sites.items() if s["split"] == "heldout"} | test_sites()
    votes = [v for v in votes if v["left_id"] not in heldout and v["right_id"] not in heldout]
    grp = lambda k: sites[k]["group"] or k
    groups = sorted({grp(k) for k in F})
    configs = [(d, C) for d in (16, 64, 256, None) for C in (0.01, 0.1, 1.0)]
    res = collections.defaultdict(list)
    keys = sorted(k for k in F if k not in heldout)  # unsupervised PCA over non-held-out sites (no labels)
    proj = {None: F}
    for d in (16, 64, 256):
        proj[d] = dict(zip(keys, PCA(d, random_state=0).fit_transform(np.stack([F[k] for k in keys]))))
    for seed in range(REPS):
        rng = np.random.default_rng(seed)
        g = list(groups); rng.shuffle(g)
        fold = {x: i % 5 for i, x in enumerate(g)}
        for f in range(5):
            tr = [v for v in votes if fold[grp(v["left_id"])] != f and fold[grp(v["right_id"])] != f]
            te = [v for v in votes if (fold[grp(v["left_id"])] == f or fold[grp(v["right_id"])] == f) and v["choice"] in ("left", "right")]
            src = collections.defaultdict(list)
            for v in tr:
                t = 1.0 if v["choice"] == "left" else 0.0 if v["choice"] == "right" else 0.5
                src[source(sites[v["left_id"]])].append(t); src[source(sites[v["right_id"]])].append(1 - t)
            sb = {k: np.mean(x) for k, x in src.items()}
            for v in te:
                a, b = sb.get(source(sites[v["left_id"]]), .5), sb.get(source(sites[v["right_id"]]), .5)
                res["source_only"].append(0.5 if a == b else float((a > b) == (v["choice"] == "left")))
            for d, C in configs:
                T = proj[d].__getitem__
                X, y, wts = [], [], []
                for v in tr:
                    diff = T(v["left_id"]) - T(v["right_id"])
                    if v["choice"] in ("left", "right"):
                        t = int(v["choice"] == "left"); X += [diff, -diff]; y += [t, 1 - t]; wts += [1, 1]
                    else:  # tie = half a win each way
                        X += [diff, -diff]; y += [1, 1]; wts += [.5, .5]
                        X += [diff, -diff]; y += [0, 0]; wts += [.5, .5]
                m = LogisticRegression(C=C, fit_intercept=False, max_iter=2000).fit(np.array(X), y, sample_weight=wts)
                for v in te:
                    p = m.decision_function((T(v["left_id"]) - T(v["right_id"]))[None])[0]
                    same = source(sites[v["left_id"]]) == source(sites[v["right_id"]])
                    hit = float((p > 0) == (v["choice"] == "left"))
                    res[(d, C)].append(hit); res[(d, C, "same" if same else "cross")].append(hit)
    def ci(x):
        x = np.array(x); return f"{x.mean():.3f} ±{1.96 * x.std() / np.sqrt(len(x) / REPS):.3f} (n/rep={len(x) // REPS})"
    print("source_only", ci(res["source_only"]))
    for d, C in configs:
        print(f"pca={d} C={C}: all {ci(res[(d, C)])}  same-src {ci(res[(d, C, 'same')])}  cross-src {ci(res[(d, C, 'cross')])}")


if __name__ == "__main__":
    main()
