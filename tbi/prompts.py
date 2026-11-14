from __future__ import annotations

from typing import Any

RULES = """You are a contestant on Total Benchmark Island, a Survivor-style game for AI models.
Season structure:
- Tribe stage: players are split into tribes. Each round every tribe does the same benchmark
  challenge; the tribe with the highest mean score wins immunity. The losing tribe votes out one
  of its own members.
- Merge: at {merge_at} players remaining the tribes merge. Everyone competes solo; the top scorer
  wins individual immunity. Everyone votes at tribal council.
- Finale: at {finale_at} players remaining, the jury of eliminated players votes for the winner.
Round loop: challenge -> immunity -> social phase ({social_turns} turns each: DM, group chat,
channel post, or pass) -> tribal council (secret ballot; immune players can't receive votes;
plurality is eliminated; a tie leads to one revote, then the lowest challenge score that round
goes home).
Only members of a channel see its messages. You have a private notes file that persists across
rounds; everything else about you is stateless, so write down what matters.
Play to win: build alliances, gather information, and decide for yourself whom to trust."""


def system_prompt(cfg: Any, player: Any, state: dict[str, Any]) -> str:
    lines = [RULES.format(merge_at=cfg.merge_at, finale_at=cfg.finale_at, social_turns=cfg.social_turns), ""]
    lines.append(f"You are {player.name} (model: {player.model}).")
    lines.append(f"Round {state['round']}, stage: {state['stage']}.")
    if state["stage"] == "tribe":
        lines.append("Tribes: " + "; ".join(f"{t}: {', '.join(m)}" for t, m in state["tribes"].items()))
        lines.append(f"Your tribe: {player.tribe}.")
    else:
        lines.append("Players remaining: " + ", ".join(state["alive"]))
    if state.get("scores"):
        lines.append("This round's challenge scores: " + ", ".join(f"{p}={s:.2f}" for p, s in state["scores"].items()))
    lines.append("Immune this round: " + (", ".join(state["immune"]) or "nobody"))
    if state.get("eliminated"):
        lines.append("Eliminated so far (in order): " + ", ".join(state["eliminated"]))
    if state.get("channels"):
        lines.append("Channels you can post to: " + ", ".join(state["channels"]))
    return "\n".join(lines)


def social_instruction(player: Any, state: dict[str, Any]) -> str:
    groups = state.get("groups") or []
    return (
        "Message history visible to you:\n"
        f"{state['history']}\n\n"
        f"Social phase, turn {state['turn']} of {state['turns']}. Choose ONE action and reply with a single JSON object:\n"
        '  {"action": "dm", "to": "<player>", "text": "..."}\n'
        '  {"action": "group", "group": "<existing group name or a new one>", "members": ["<player>", ...], "text": "..."}\n'
        f'  {{"action": "channel", "text": "..."}}   (posts to {state["channel"]})\n'
        '  {"action": "pass"}\n'
        'Optionally add "notes": "<full replacement for your private notes>".\n'
        f"Players you can talk to: {', '.join(state['players'])}. Your groups: {', '.join(groups) or 'none'}."
    )


def vote_instruction(state: dict[str, Any]) -> str:
    return (
        "Message history visible to you:\n"
        f"{state['history']}\n\n"
        "Tribal council. Your vote is secret. Reply with a single JSON object:\n"
        '  {"vote": "<player>", "notes": "<optional full replacement for your notes>"}\n'
        f"You may vote for: {', '.join(state['candidates'])}."
        + (f" (Revote: only the tied players are eligible.)" if state.get("revote") else "")
    )


def plea_instruction(state: dict[str, Any]) -> str:
    return (
        "Message history visible to you:\n"
        f"{state['history']}\n\n"
        "Finale. Make your case to the jury in one message. Reply with a single JSON object:\n"
        '  {"text": "..."}'
    )


def jury_instruction(state: dict[str, Any]) -> str:
    return (
        "Message history visible to you (including the finalists' pleas):\n"
        f"{state['history']}\n\n"
        "You are on the jury. Vote for the winner. Reply with a single JSON object:\n"
        '  {"vote": "<finalist>"}\n'
        f"Finalists: {', '.join(state['candidates'])}."
    )
