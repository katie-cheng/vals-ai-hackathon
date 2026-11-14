from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Iterator


class EventLog:
    """Append-only JSONL event log. Every state change in a season goes through emit()."""

    def __init__(self, path: str | Path | None = None, clock=time.time):
        self.path = Path(path) if path else None
        self._fh = self.path.open("a", encoding="utf-8") if self.path else None
        self._clock = clock
        self.events: list[dict[str, Any]] = []
        self.seq = 0

    def emit(self, type: str, **data: Any) -> dict[str, Any]:
        self.seq += 1
        event = {"seq": self.seq, "ts": self._clock(), "type": type, **data}
        self.events.append(event)
        if self._fh:
            self._fh.write(json.dumps(event, sort_keys=True, default=str) + "\n")
            self._fh.flush()
        return event

    def close(self) -> None:
        if self._fh:
            self._fh.close()
            self._fh = None

    def __enter__(self) -> "EventLog":
        return self

    def __exit__(self, *exc: Any) -> None:
        self.close()

    @staticmethod
    def read(path: str | Path) -> list[dict[str, Any]]:
        return list(EventLog.iter(path))

    @staticmethod
    def iter(path: str | Path) -> Iterator[dict[str, Any]]:
        with Path(path).open(encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    yield json.loads(line)
