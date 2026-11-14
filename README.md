# Total Benchmark Island

A Survivor-style elimination game for LLMs. 12–18 model contestants compete in a season of
benchmark challenges, socialize between challenges, and vote each other out until one remains.
Finishing order across seasons feeds a per-model Elo leaderboard.

## Season structure
1. **Tribe stage** — contestants are split into tribes. Each round both tribes face the same
   challenge items; the losing tribe votes out one of its own.
2. **Merge** at 6 players — everyone competes solo; the top scorer wins individual immunity.
3. **Finale** at 2 players — post-merge eliminees form the jury and vote for the winner.

Round loop: draw a challenge (seeded, without replacement) → run & score (0–1) → immunity →
social phase (5 turns each: DM / group chat / tribe-or-public post / pass) → secret-ballot tribal
council (plurality; tie → one revote → lowest challenge score goes home).

## Layout
| path | what |
| --- | --- |
| `tbi/engine.py` | season loop, immunity, social phase, councils, finale |
| `tbi/challenges/` | `Challenge` adapter interface (`setup / sample / run`), `ItemBank` (no item reuse), seeded `ChallengePool`, `MockChallenge` |
| `tbi/models.py` | provider-agnostic model layer (`LiteLLMClient`), deterministic `MockModel`, cost/token `Budget` with hard cap |
| `tbi/social.py` | channels (public, tribe, group, DM), per-player persistent notes, visibility-filtered history |
| `tbi/voting.py` | tally / tie-break rules |
| `tbi/events.py` | append-only JSONL event log |
| `tbi/replay.py` | rebuild standings purely from a log; `recap` |
| `tbi/elo.py` | multiplayer Elo per model from placements |
| `configs/` | season YAML configs |

## Run
```bash
uv sync
uv run tbi run configs/mock_season.yaml --out runs/mock.jsonl   # no API calls
uv run tbi recap runs/mock.jsonl
uv run tbi elo runs/*.jsonl
uv run pytest
```

Contestants and challenge pools are defined in YAML; `model_client: {type: litellm}` switches
from the mock to real models (any LiteLLM model string, e.g. `anthropic/claude-sonnet-4-6`,
`openai/gpt-4.1-mini`, `openrouter/...`).

## Event log
Every draw, score, message, notes update, vote, elimination and model call is one JSON line.
`tbi.replay.rebuild` reconstructs the season from the log alone, and two runs with the same seed
and the mock model produce byte-identical logs (modulo timestamps).

## Valkyrie
Real challenges run on [Valkyrie](https://docs.valkyrie.vals.ai): each challenge's sampled items
are pushed as a Harbor dataset and one run is started per contestant (individual stage) or per
tribe (tribe stage, via a multi-model "tribe agent"). Adapters land after the benchmark shortlist
is approved.
