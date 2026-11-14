from __future__ import annotations

from typing import Any, Callable

from .base import Challenge
from .mock import MockChallenge

_REGISTRY: dict[str, Callable[[dict[str, Any], str], Challenge]] = {}


def register(kind: str):
    def deco(fn):
        _REGISTRY[kind] = fn
        return fn

    return deco


@register("mock")
def _mock(spec: dict[str, Any], salt: str) -> Challenge:
    return MockChallenge(name=spec["name"], stage=spec["stage"], num_items=int(spec.get("num_items", 100)), salt=salt)


def create(spec: dict[str, Any], salt: str) -> Challenge:
    kind = spec.get("type", "mock")
    if kind not in _REGISTRY:
        raise ValueError(f"unknown challenge type {kind!r}; known: {sorted(_REGISTRY)}")
    return _REGISTRY[kind](spec, salt)


def build_pool(specs: list[dict[str, Any]], stage: str, salt: str) -> list[Challenge]:
    return [create({**spec, "stage": stage}, salt) for spec in specs]
