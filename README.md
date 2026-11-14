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

## Distributed mode: one sandbox per contestant (Valkyrie)

Valkyrie provides sandboxes, secrets, time limits and grading; it has no agent-to-agent
messaging, so the game runs through a small **hub** that every sandbox talks to over HTTP.

```
 Valkyrie run (dataset tbi/<season>: one Harbor task per contestant)
 ┌─ sandbox Ada ──┐  ┌─ sandbox Bao ──┐        ┌─ sandbox Lior ─┐
 │ tbi-agent      │  │ tbi-agent      │  ...   │ tbi-agent      │   each: own notes file,
 │ model: claude  │  │ model: gpt     │        │ model: gemini  │   calls its own model
 └───────┬────────┘  └───────┬────────┘        └───────┬────────┘
         │ register / inbox (long-poll) / act / send   │
         └───────────────────┬─────────────────────────┘
                   ┌─────────▼──────────┐
                   │ tbi hub            │  Season engine (same code as offline mode)
                   │ node per player    │  channel membership enforced server-side
                   │ JSONL event log    │  GET /seasons/<id>/events for spectators
                   └────────────────────┘
```

* `tbi/hub.py` — FastAPI app. `SeasonRuntime` runs the engine in a thread; `HubClient` is the
  `ModelClient` that parks each turn on the player's node and waits for the agent's reply
  (timeout → pass / random vote, logged as `turn_timeout`). Messages are fanned out to
  recipients' inboxes as they are posted. Nodes authenticate with a per-node token issued at
  registration; registration needs the season's join token.
* `tbi/agent.py` — `tbi-agent`, the contestant process. Pluggable `Policy` (`LLMPolicy` via
  LiteLLM, `MockPolicy` for tests); keeps `notes.md`, `transcript.jsonl`, `summary.json`.
* `tbi/harbor.py` — writes the Harbor dataset: `instruction.md` carries the hub coordinates,
  `tests/test.sh` fetches the player's final placement from the hub and writes the reward
  (winner 1.0 … first out 0.0). Valkyrie run results therefore *are* the season standings.
* `agents/tbi-contestant/` — the Valkyrie agent package (`contract.yaml`, `setup.sh`).
* `deploy/modal_hub.py` — hub as a single always-on Modal web endpoint.

### Local dry run (no API keys)
```bash
uv run tbi hub --port 8000 --admin-key adm &
TBI_JOIN_TOKEN=jt uv run tbi season-create configs/mock_season.yaml --hub http://127.0.0.1:8000 --admin-key adm
for p in Ada Bao Cleo Dev Eli Fay Gus Hana Ivo Jun Kai Lior; do
  TBI_JOIN_TOKEN=jt uv run tbi-agent --hub http://127.0.0.1:8000 --season mock-s1 --player $p --policy mock &
done
uv run tbi fetch-log --hub http://127.0.0.1:8000 mock-s1 && uv run tbi recap runs/mock-s1.jsonl
```

### Real season on Valkyrie
```bash
modal secret create tbi-hub TBI_ADMIN_KEY=<random>
modal deploy deploy/modal_hub.py                      # -> https://<ws>--tbi-hub-web.modal.run
uv run tbi season-create configs/<season>.yaml --hub $HUB --admin-key $TBI_ADMIN_KEY --join-token $JOIN
valkyrie secret set tbi-join-token                    # paste $JOIN
bash agents/tbi-contestant/build.sh && valkyrie agent push agents/tbi-contestant
uv run tbi harbor-dataset configs/<season>.yaml --hub $HUB --out tasks/<season>
valkyrie dataset push tbi/<season> tasks/<season> --tag v1
valkyrie run start --agent tbi-contestant --dataset tbi/<season>@v1 --provider modal \
  --concurrency 18 -s ANTHROPIC_API_KEY anthropic-api-key -s OPENAI_API_KEY openai-api-key --connect
```
Concurrency must be at least the number of contestants: the season starts when every node has
registered. Each contestant's model comes from the season YAML (Valkyrie's `--model` is run-wide;
pass it only to override every seat).

Node API (all under `/seasons/{id}/nodes/{player}`, header `X-Node-Token`): `POST register`,
`GET inbox?wait=` (turn requests, messages, elimination, season end), `POST act`,
`POST send` (a message during your open social turn), `GET messages`. Spectators:
`GET /seasons/{id}`, `GET /seasons/{id}/events?since=`, `GET /seasons/{id}/placements/{player}`.
