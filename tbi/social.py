from __future__ import annotations

from dataclasses import dataclass, field
from typing import Iterable


@dataclass
class Channel:
    id: str
    kind: str  # public | tribe | group | dm
    members: set[str]
    creator: str | None = None


@dataclass
class Message:
    seq: int
    round: int
    channel: str
    sender: str
    text: str


@dataclass
class SocialState:
    channels: dict[str, Channel] = field(default_factory=dict)
    messages: list[Message] = field(default_factory=list)
    notes: dict[str, str] = field(default_factory=dict)

    def add_channel(self, id: str, kind: str, members: Iterable[str], creator: str | None = None) -> Channel:
        if id in self.channels:
            raise ValueError(f"channel {id} exists")
        ch = Channel(id=id, kind=kind, members=set(members), creator=creator)
        self.channels[id] = ch
        return ch

    def dm_id(self, a: str, b: str) -> str:
        return "dm:" + ":".join(sorted([a, b]))

    def ensure_dm(self, a: str, b: str) -> Channel:
        cid = self.dm_id(a, b)
        return self.channels.get(cid) or self.add_channel(cid, "dm", [a, b])

    def visible_channels(self, player: str) -> list[Channel]:
        return [c for c in self.channels.values() if player in c.members]

    def groups_for(self, player: str) -> list[Channel]:
        return [c for c in self.channels.values() if c.kind == "group" and player in c.members]

    def post(self, round: int, channel: str, sender: str, text: str) -> Message:
        ch = self.channels[channel]
        if sender not in ch.members:
            raise PermissionError(f"{sender} not in {channel}")
        m = Message(seq=len(self.messages) + 1, round=round, channel=channel, sender=sender, text=text)
        self.messages.append(m)
        return m

    def visible_messages(self, player: str) -> list[Message]:
        return [m for m in self.messages if player in self.channels[m.channel].members]

    def remove_player(self, player: str) -> None:
        """Eliminated players leave every channel; their messages stay logged."""
        for ch in self.channels.values():
            ch.members.discard(player)


def render_history(messages: list[Message], channels: dict[str, Channel], max_chars: int) -> str:
    """Newest-last transcript, truncated from the front to fit max_chars."""
    lines = []
    for m in messages:
        ch = channels[m.channel]
        label = m.channel if ch.kind != "dm" else "dm"
        lines.append(f"[r{m.round}][{label}] {m.sender}: {m.text}")
    text = "\n".join(lines)
    if len(text) > max_chars:
        text = "...(earlier messages truncated)...\n" + text[-max_chars:]
    return text or "(no messages yet)"
