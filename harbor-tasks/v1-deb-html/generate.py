#!/usr/bin/env python3
"""Generate Harbor tasks from the prompt set and verifier template."""

import re
import shutil
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PROMPTS_PATH = ROOT / "prompts.md"
INSTRUCTION_TEMPLATE_PATH = ROOT / "template" / "instruction.md.tmpl"
TESTS_TEMPLATE_PATH = ROOT / "template" / "tests"
TASKS_PATH = ROOT / "tasks"

SLUGS = {
    1: "wedding-photographer-portfolio",
    2: "dev-portfolio-3d",
    3: "printable-resume",
    4: "birthday-surprise",
    5: "cat-website",
    6: "law-firm",
    7: "indian-restaurant",
    8: "dental-clinic",
    9: "real-estate-listings",
    10: "logistics-homepage",
    11: "saas-invoicing-landing",
    12: "meditation-app-landing",
    13: "dev-conference",
    14: "nonprofit-donation",
    15: "wedding-invitation",
    16: "travel-homepage-rebuild",
    17: "news-magazine-rebuild",
    18: "sales-dashboard",
    19: "supplier-risk-panel",
    20: "bikeshare-d3-viz",
    21: "finance-tracker",
    22: "sneaker-configurator-3d",
    23: "kanban-board",
    24: "typing-test",
    25: "candle-store",
    26: "generic-small-business",
}

SMOKE_TEST_HTML = """#!/bin/sh
cat > /app/index.html <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pipeline smoke test</title>
</head>
<body>
  <main>
    <h1>Pipeline smoke test</h1>
    <p>This minimal page confirms that the Harbor task can run an agent, write its single HTML deliverable, and pass it to the render verifier. It intentionally contains no reference design or scenario-specific answer, and provides enough readable content for the current nonblank render gate.</p>
  </main>
</body>
</html>
HTML
"""


def extract_system_prompt(text: str) -> str:
    lines = text.splitlines()
    try:
        heading_index = lines.index("## System prompt")
    except ValueError as exc:
        raise ValueError("Could not find the '## System prompt' section.") from exc

    section_end = next(
        (
            index
            for index in range(heading_index + 1, len(lines))
            if lines[index].startswith("## ")
        ),
        len(lines),
    )
    opening_fence = next(
        (
            index
            for index in range(heading_index + 1, section_end)
            if lines[index].startswith("```")
        ),
        None,
    )
    if opening_fence is None:
        raise ValueError("Could not find a fenced system prompt.")

    closing_fence = next(
        (
            index
            for index in range(opening_fence + 1, section_end)
            if lines[index].startswith("```")
        ),
        None,
    )
    if closing_fence is None:
        raise ValueError("System prompt code fence is not closed.")

    system_prompt = "\n".join(lines[opening_fence + 1 : closing_fence]).strip()
    if not system_prompt:
        raise ValueError("System prompt is empty.")
    return system_prompt


def section_slug(heading: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", heading.lower()).strip("-")


def extract_scenarios(text: str) -> list[tuple[int, str, str]]:
    lines = text.splitlines()
    try:
        scenario_heading = lines.index("## Scenario prompts")
    except ValueError as exc:
        raise ValueError("Could not find the '## Scenario prompts' section.") from exc

    section_end = next(
        (
            index
            for index in range(scenario_heading + 1, len(lines))
            if lines[index] == "## Reusable template"
        ),
        len(lines),
    )
    current_section = ""
    scenarios = []
    index = scenario_heading + 1
    scenario_pattern = re.compile(r"^\*\*(\d+)\.\*\*\s*(.*)$")

    while index < section_end:
        line = lines[index].strip()
        if line.startswith("### "):
            current_section = section_slug(line[4:].strip())
            index += 1
            continue

        match = scenario_pattern.match(line)
        if match:
            if not current_section:
                raise ValueError(f"Scenario {match.group(1)} has no section heading.")
            scenario_id = int(match.group(1))
            paragraph_lines = [match.group(2)]
            index += 1
            while index < section_end:
                continuation = lines[index]
                if not continuation.strip():
                    break
                if continuation.lstrip().startswith("### "):
                    break
                if scenario_pattern.match(continuation.strip()):
                    break
                paragraph_lines.append(continuation)
                index += 1

            scenario_prompt = "\n".join(paragraph_lines).strip()
            if not scenario_prompt:
                raise ValueError(f"Scenario {scenario_id} is empty.")
            scenarios.append((scenario_id, current_section, scenario_prompt))
            continue

        index += 1

    if len(scenarios) != 26:
        raise ValueError(f"Expected exactly 26 scenarios; found {len(scenarios)}.")
    scenario_ids = [scenario_id for scenario_id, _, _ in scenarios]
    if scenario_ids != list(range(1, 27)):
        raise ValueError(f"Expected scenarios numbered 1 through 26; found {scenario_ids}.")
    return scenarios


def toml_string(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\b", "\\b")
        .replace("\t", "\\t")
        .replace("\n", "\\n")
        .replace("\f", "\\f")
        .replace("\r", "\\r")
    )
    return f'"{escaped}"'


def task_config(
    scenario_id: int, slug: str, section: str, scenario_prompt: str
) -> str:
    name = f"web-{scenario_id:02d}-{slug}"
    description = scenario_prompt[:120]
    if len(scenario_prompt) > 120:
        description += "…"

    return f'''schema_version = "1.4"
artifacts = ["/app/index.html"]

[task]
name = {toml_string(f"deb/{name}")}
description = {toml_string(description)}
keywords = ["frontend", "web-design", "ai-slop", {toml_string(section)}]

[metadata]
category = "web-design"
section = {toml_string(section)}
prompt_id = {scenario_id}
prompt_source = "prompts.md"

[agent]
timeout_sec = 1800.0

[environment]
build_timeout_sec = 600.0
cpus = 2
memory_mb = 4096
storage_mb = 10240
network_mode = "public"

[verifier]
timeout_sec = 600.0
environment_mode = "separate"

[verifier.environment]
build_timeout_sec = 900.0
cpus = 2
memory_mb = 4096
storage_mb = 10240
network_mode = "public"
'''


def generate() -> None:
    prompts_text = PROMPTS_PATH.read_text()
    system_prompt = extract_system_prompt(prompts_text)
    scenarios = extract_scenarios(prompts_text)
    if set(SLUGS) != {scenario_id for scenario_id, _, _ in scenarios}:
        raise ValueError("Scenario numbers do not match the configured slug list.")

    instruction_template = INSTRUCTION_TEMPLATE_PATH.read_text()
    TASKS_PATH.mkdir(parents=True, exist_ok=True)

    for scenario_id, section, scenario_prompt in scenarios:
        slug = SLUGS[scenario_id]
        task_name = f"web-{scenario_id:02d}-{slug}"
        task_dir = TASKS_PATH / task_name
        task_dir.mkdir(parents=True, exist_ok=True)

        instruction = instruction_template.replace("{system_prompt}", system_prompt)
        instruction = instruction.replace("{scenario_prompt}", scenario_prompt)
        (task_dir / "instruction.md").write_text(instruction)
        (task_dir / "task.toml").write_text(
            task_config(scenario_id, slug, section, scenario_prompt)
        )

        environment_dir = task_dir / "environment"
        environment_dir.mkdir(exist_ok=True)
        (environment_dir / "Dockerfile").write_text(
            """FROM ubuntu:24.04
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl git \\
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
"""
        )

        tests_dir = task_dir / "tests"
        tests_dir.mkdir(exist_ok=True)
        for template_file in TESTS_TEMPLATE_PATH.iterdir():
            if template_file.is_file():
                shutil.copyfile(template_file, tests_dir / template_file.name)
        (tests_dir / "Dockerfile").write_text(
            """FROM mcr.microsoft.com/playwright/python:v1.49.0-noble
RUN python -m pip install --no-cache-dir playwright==1.49.0
WORKDIR /app
COPY . /tests/
RUN chmod +x /tests/test.sh
"""
        )

        solution_dir = task_dir / "solution"
        solution_dir.mkdir(exist_ok=True)
        solve_path = solution_dir / "solve.sh"
        solve_path.write_text(SMOKE_TEST_HTML)
        solve_path.chmod(0o755)

    print(f"Generated {len(scenarios)} tasks in {TASKS_PATH}.")


if __name__ == "__main__":
    generate()
