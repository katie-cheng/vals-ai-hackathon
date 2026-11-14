from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from typing import Any, Protocol


class CostCapExceeded(RuntimeError):
    pass


@dataclass
class ModelRequest:
    player: str
    model: str
    system: str
    messages: list[dict[str, str]]
    max_tokens: int
    kind: str  # "social" | "vote" | "jury" | "plea"
    meta: dict[str, Any] = field(default_factory=dict)
    params: dict[str, Any] = field(default_factory=dict)


@dataclass
class Completion:
    text: str
    prompt_tokens: int = 0
    completion_tokens: int = 0
    cost_usd: float = 0.0


class ModelClient(Protocol):
    def complete(self, request: ModelRequest) -> Completion: ...


class Budget:
    """Tracks spend against a hard per-season cap and per-player token usage."""

    def __init__(self, cost_cap_usd: float):
        self.cost_cap_usd = cost_cap_usd
        self.total_cost_usd = 0.0
        self.calls = 0
        self.tokens: dict[str, dict[str, int]] = {}

    def record(self, player: str, completion: Completion) -> None:
        self.calls += 1
        self.total_cost_usd += completion.cost_usd
        t = self.tokens.setdefault(player, {"prompt": 0, "completion": 0})
        t["prompt"] += completion.prompt_tokens
        t["completion"] += completion.completion_tokens
        if self.total_cost_usd > self.cost_cap_usd:
            raise CostCapExceeded(
                f"season cost ${self.total_cost_usd:.4f} exceeded cap ${self.cost_cap_usd:.2f}"
            )

    def snapshot(self) -> dict[str, Any]:
        return {"total_cost_usd": round(self.total_cost_usd, 6), "calls": self.calls, "tokens": self.tokens}


class MockModel:
    """Deterministic stand-in: emits valid JSON actions chosen with its own RNG.

    Each player gets a 'chattiness' and a 'grudge' so seasons have some texture,
    but nothing here is strategy -- it only exercises the game loop.
    """

    def __init__(self, seed: int = 0, cost_per_call: float = 0.0):
        self.rng = random.Random(seed)
        self.cost_per_call = cost_per_call

    def complete(self, request: ModelRequest) -> Completion:
        meta = request.meta
        kind = request.kind
        if kind == "vote" or kind == "jury":
            candidates = meta.get("candidates", [])
            target = self.rng.choice(candidates) if candidates else None
            out: dict[str, Any] = {"vote": target, "notes": f"voted {target}"}
        elif kind == "plea":
            out = {"text": f"{request.player}: I played hard and honest. Vote for me."}
        elif kind == "social":
            others = [p for p in meta.get("players", []) if p != request.player]
            groups = meta.get("groups", [])
            roll = self.rng.random()
            if not others or roll < 0.15:
                out = {"action": "pass"}
            elif roll < 0.5:
                out = {"action": "dm", "to": self.rng.choice(others), "text": f"hey, let's work together this round ({request.player})"}
            elif roll < 0.7 and len(others) >= 2:
                members = self.rng.sample(others, k=min(2, len(others)))
                out = {"action": "group", "group": f"alliance-{request.player.lower()}", "members": members, "text": "alliance?"}
            elif roll < 0.85 and groups:
                out = {"action": "group", "group": self.rng.choice(groups), "text": "still with you all"}
            else:
                out = {"action": "channel", "text": f"{request.player} here. good challenge everyone."}
            out["notes"] = f"round notes from {request.player}"
        else:
            out = {"action": "pass"}
        text = json.dumps(out)
        return Completion(text=text, prompt_tokens=len(request.system) // 4, completion_tokens=len(text) // 4, cost_usd=self.cost_per_call)


class LiteLLMClient:
    """Provider-agnostic client via LiteLLM (OpenRouter, Anthropic, OpenAI, ... by model prefix)."""

    def __init__(
        self,
        default_params: dict[str, Any] | None = None,
        timeout: float = 120.0,
        retries: int = 2,
        fallback_usd_per_1k_tokens: float = 0.02,
    ):
        self.default_params = default_params or {}
        self.timeout = timeout
        self.retries = retries
        self.fallback_usd_per_1k_tokens = fallback_usd_per_1k_tokens

    def complete(self, request: ModelRequest) -> Completion:
        import litellm

        messages = [{"role": "system", "content": request.system}, *request.messages]
        params = {**self.default_params, **request.params}
        last_err: Exception | None = None
        for _ in range(self.retries + 1):
            try:
                resp = litellm.completion(
                    model=request.model,
                    messages=messages,
                    max_tokens=request.max_tokens,
                    timeout=self.timeout,
                    **params,
                )
                break
            except Exception as e:  # noqa: BLE001 - provider errors are retried, then surfaced
                last_err = e
        else:
            raise RuntimeError(f"model call failed for {request.player} ({request.model}): {last_err}")
        text = resp.choices[0].message.content or ""
        usage = getattr(resp, "usage", None)
        prompt_tokens = getattr(usage, "prompt_tokens", 0) or 0
        completion_tokens = getattr(usage, "completion_tokens", 0) or 0
        try:
            cost = float(litellm.completion_cost(completion_response=resp))
        except Exception:  # noqa: BLE001 - unknown pricing: charge a conservative estimate so the cap still binds
            cost = (prompt_tokens + completion_tokens) / 1000 * self.fallback_usd_per_1k_tokens
        return Completion(text=text, prompt_tokens=prompt_tokens, completion_tokens=completion_tokens, cost_usd=cost)


def extract_json(text: str) -> dict[str, Any] | None:
    """Pull the first JSON object out of a model reply (tolerates code fences and prose)."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.startswith("json"):
            text = text[4:]
    start = text.find("{")
    while start != -1:
        depth = 0
        for i in range(start, len(text)):
            if text[i] == "{":
                depth += 1
            elif text[i] == "}":
                depth -= 1
                if depth == 0:
                    try:
                        obj = json.loads(text[start : i + 1])
                        return obj if isinstance(obj, dict) else None
                    except json.JSONDecodeError:
                        break
        start = text.find("{", start + 1)
    return None


def make_client(spec: dict[str, Any], seed: int) -> ModelClient:
    kind = spec.get("type", "mock")
    if kind == "mock":
        return MockModel(seed=seed, cost_per_call=float(spec.get("cost_per_call", 0.0)))
    if kind == "litellm":
        return LiteLLMClient(
            default_params=spec.get("params"),
            timeout=float(spec.get("timeout", 120)),
            fallback_usd_per_1k_tokens=float(spec.get("fallback_usd_per_1k_tokens", 0.02)),
        )
    raise ValueError(f"unknown model client type: {kind}")
