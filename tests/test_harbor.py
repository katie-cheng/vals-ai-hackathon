import tomllib

from tbi.agent import read_instruction
from tbi.harbor import write_dataset

from conftest import make_cfg


def test_write_dataset_one_task_per_player(tmp_path):
    cfg = make_cfg(6, merge_at=4)
    paths = write_dataset(cfg, tmp_path / "tasks", "https://hub.example", agent_timeout_sec=1234)
    assert len(paths) == 6 and (tmp_path / "tasks" / "metric.py").exists()
    d = paths[0]
    assert (d / "tests" / "test.sh").stat().st_mode & 0o111
    toml = tomllib.loads((d / "task.toml").read_text())
    assert toml["agent"]["timeout_sec"] == 1234
    assert toml["verifier"]["env"]["TBI_PLAYER"] == d.name and toml["verifier"]["env"]["TBI_HUB_URL"] == "https://hub.example"
    assert toml["environment"]["network_mode"] == "public"
    coords = read_instruction(d / "instruction.md")
    assert coords == {"hub": "https://hub.example", "season": cfg.season_id, "player": d.name, "model": cfg.players[0].model}
