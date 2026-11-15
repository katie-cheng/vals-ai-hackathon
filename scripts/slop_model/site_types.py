"""Zero-shot site-type labels from SigLIP (image embedding of the first desktop screen vs text prompts).

Used to stratify the test set by kind of website, not to score slop.
Usage: modal run scripts/slop_model/site_types.py   -> data/models/site_types.json {site_id: {type, scores}}
"""
import json, pathlib

import modal

from embed_modal import MODEL, image

image = image.add_local_python_source("embed_modal")

app = modal.App("slopbench-site-types")
TYPES = {
    "saas": "a B2B software product landing page",
    "consumer_app": "a landing page for a consumer mobile app",
    "app_ui": "a web app interface with a dashboard, forms and controls",
    "ecommerce": "an online store selling products",
    "restaurant": "a restaurant or food delivery website",
    "local_service": "a local business website for a salon, cleaning or construction company",
    "hospitality": "a hotel, travel or guesthouse website",
    "portfolio": "a personal portfolio website",
    "content": "a blog, news or magazine website",
    "game": "a video game or browser game screen",
    "education": "an online course or school website",
    "health": "a healthcare or medical company website",
    "finance": "a fintech or banking website",
    "industrial": "an industrial, hardware or manufacturing company website",
}


@app.function(image=image, cpu=4, memory=8192, timeout=900)
def embed_text(texts: list[str]) -> list[list[float]]:
    import torch
    from transformers import AutoModel, AutoProcessor
    model = AutoModel.from_pretrained(MODEL).eval()
    proc = AutoProcessor.from_pretrained(MODEL)
    x = proc(text=texts, padding="max_length", return_tensors="pt")
    with torch.no_grad():
        e = model.get_text_features(**x)
    return torch.nn.functional.normalize(e.float(), dim=-1).tolist()


@app.local_entrypoint()
def main():
    import numpy as np
    root = pathlib.Path(__file__).resolve().parents[2] / "data/models"
    names = list(TYPES)
    T = np.array(embed_text.remote([f"a screenshot of {TYPES[n]}" for n in names]))
    z = np.load(root / "emb.npz")
    out = {}
    for o, sl, e in zip(z["owner"], z["slot"], z["emb"]):
        if int(sl) == 0:
            s = T @ e
            out[str(o)] = {"type": names[int(np.argmax(s))], "scores": dict(zip(names, map(float, s)))}
    json.dump(out, open(root / "site_types.json", "w"))
    print(f"typed {len(out)} sites")
