"""Sample real local businesses with websites from OpenStreetMap city extracts (BBBike .osm.pbf in ~/osm).

Output: data/web/osm_businesses.json  [{source, slug, url, type, osm_tag, city, name}]
Usage: python3 scripts/osm_businesses.py [--per 12]   (per type per city)
"""
import argparse, collections, json, pathlib, random, re, urllib.parse

import osmium

ROOT = pathlib.Path(__file__).resolve().parent.parent
TYPES = {
    "restaurant": [("amenity", {"restaurant", "cafe", "bar", "pub"})],
    "local_service": [("shop", {"hairdresser", "beauty", "car_repair", "florist"}), ("amenity", {"dentist", "doctors", "clinic", "veterinary"}),
                      ("office", {"lawyer", "estate_agent", "accountant", "architect"}), ("craft", {"plumber", "electrician", "carpenter", "photographer"})],
    "hospitality": [("tourism", {"hotel", "guest_house", "hostel"})],
    "ecommerce": [("shop", {"clothes", "books", "gift", "furniture", "bakery", "jewelry", "shoes", "bicycle", "toys", "art"})],
}
CHAINS = re.compile(r"starbucks|mcdonald|subway|marriott|hilton|hyatt|ihg|holiday ?inn|best ?western|wendys|tacobell|burgerking|dominos|pizzahut|chipotle|"
                    r"kfc|dunkin|7-eleven|walgreens|cvs|safeway|wholefoods|target|walmart|tesco|sainsbury|costa|pret|greggs|nandos|timhortons|"
                    r"facebook|instagram|yelp|google|tripadvisor|linktr|wix|squareup|toasttab|opentable|booking\.com|expedia", re.I)


class H(osmium.SimpleHandler):
    def __init__(self, city):
        super().__init__()
        self.city, self.rows = city, collections.defaultdict(list)

    def _f(self, o):
        t = o.tags
        url = t.get("website") or t.get("contact:website")
        if not url or not t.get("name"):
            return
        for typ, rules in TYPES.items():
            for k, vals in rules:
                if t.get(k) in vals:
                    self.rows[typ].append({"url": url.strip(), "name": t.get("name"), "osm_tag": f"{k}={t.get(k)}"})
                    return

    node = way = _f


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--per", type=int, default=12)
    a = ap.parse_args()
    rng, out, seen = random.Random(0), [], set()
    for pbf in sorted((pathlib.Path.home() / "osm").glob("*.osm.pbf")):
        h = H(pbf.name.split(".")[0])
        h.apply_file(str(pbf))
        for typ, rows in sorted(h.rows.items()):
            rng.shuffle(rows)
            n = 0
            for r in rows:
                u = r["url"] if r["url"].startswith("http") else "https://" + r["url"]
                host = urllib.parse.urlparse(u).netloc.lower().removeprefix("www.")
                if not host or host in seen or CHAINS.search(host.replace("-", "")):
                    continue
                seen.add(host)
                out.append({"source": "osm-local", "slug": re.sub(r"[^a-z0-9]+", "-", host).strip("-"), "url": u, "type": typ,
                            "osm_tag": r["osm_tag"], "city": h.city, "name": r["name"]})
                n += 1
                if n >= a.per:
                    break
        print(h.city, {t: len(v) for t, v in h.rows.items()}, flush=True)
    (ROOT / "data/web").mkdir(parents=True, exist_ok=True)
    json.dump(out, open(ROOT / "data/web/osm_businesses.json", "w"), indent=0)
    print(len(out), collections.Counter(r["type"] for r in out))


if __name__ == "__main__":
    main()
