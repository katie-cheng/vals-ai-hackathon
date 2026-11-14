"""Deploy the hub as a single always-on Modal web endpoint.

    modal secret create tbi-hub TBI_ADMIN_KEY=<random>
    modal deploy deploy/modal_hub.py          # prints the public URL

State lives in one container (max_containers=1); event logs persist on the `tbi-runs` volume.
"""

from __future__ import annotations

import os
from pathlib import Path

import modal

ROOT = Path(__file__).resolve().parent.parent

image = (
    modal.Image.debian_slim(python_version="3.12")
    .pip_install("fastapi>=0.115", "uvicorn>=0.30", "pyyaml>=6", "httpx>=0.27", "litellm>=1.109")
    .add_local_python_source("tbi")
)
app = modal.App("tbi-hub")
runs = modal.Volume.from_name("tbi-runs", create_if_missing=True)


@app.function(
    image=image,
    volumes={"/runs": runs},
    secrets=[modal.Secret.from_name("tbi-hub")],
    timeout=24 * 3600,
    min_containers=1,
    max_containers=1,
    scaledown_window=3600,
)
@modal.concurrent(max_inputs=200)
@modal.asgi_app()
def web():
    from tbi.hub import Hub, create_app

    return create_app(Hub(admin_key=os.environ.get("TBI_ADMIN_KEY"), log_dir="/runs"))
