"""Embed screenshot crops with SigLIP on a Modal GPU.

Usage: modal run scripts/slop_model/embed_modal.py
Reads data/models/crops.pkl, writes data/models/emb.npz (site_ids, per-crop embeddings averaged per view slot).
"""
import pathlib, pickle

import modal

MODEL = "google/siglip-so400m-patch14-384"
app = modal.App("slopbench-embed")
image = (modal.Image.debian_slim(python_version="3.11")
         .pip_install("torch==2.4.1", "transformers==4.46.3", "pillow", "sentencepiece", "protobuf")
         .run_commands(f"python -c \"from transformers import AutoModel, AutoProcessor; AutoModel.from_pretrained('{MODEL}'); AutoProcessor.from_pretrained('{MODEL}')\""))


# CPU containers: the Modal account has no payment method, which GPU functions require.
@app.function(image=image, cpu=8, memory=8192, timeout=3600)
def embed(jpegs: list[bytes]) -> list[list[float]]:
    import io, torch
    from PIL import Image
    from transformers import AutoModel, AutoProcessor
    torch.set_num_threads(8)
    model = AutoModel.from_pretrained(MODEL).eval()
    proc = AutoProcessor.from_pretrained(MODEL)
    out = []
    for i in range(0, len(jpegs), 16):
        ims = [Image.open(io.BytesIO(b)).convert("RGB") for b in jpegs[i:i + 16]]
        x = proc(images=ims, return_tensors="pt")["pixel_values"]
        with torch.no_grad():
            e = model.get_image_features(pixel_values=x)
        out += torch.nn.functional.normalize(e.float(), dim=-1).cpu().tolist()
    return out


@app.local_entrypoint()
def main():
    import numpy as np
    root = pathlib.Path(__file__).resolve().parents[2] / "data/models"
    crops = pickle.load(open(root / "crops.pkl", "rb"))
    keys = sorted(crops)
    flat, owner, slot = [], [], []
    for k in keys:
        for j, b in enumerate(crops[k]):
            flat.append(b); owner.append(k); slot.append(j)
    chunks = [flat[i:i + 60] for i in range(0, len(flat), 60)]
    embs = [e for part in embed.map(chunks) for e in part]
    np.savez(root / "emb.npz", owner=np.array(owner), slot=np.array(slot), emb=np.array(embs, dtype=np.float32))
    print(f"embedded {len(embs)} crops for {len(keys)} sites")
