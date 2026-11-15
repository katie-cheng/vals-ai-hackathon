# Design Engineer Bench (DEB)

Design Engineers, simplified, have two core functions: turning an idea into an interface that works, while also being visually pleasing to look at.

Half of this is objective engineering work: ensuring that our code works, and effectively. The other half is arbitrary and harder to quantify: artistic principles, good rhythm, beautiful aesthetics, “correct” positioning, etc.

Models are now good enough at the first half, that the second half is what separates a well designed front-end from one that is easily recognized as made by a machine, of which some refer to as “AI Slop”. The Design Engineer Benchmark (DEB) was created to evaluate agents on one-shot Design Engineering work to evaluate both halves at once.

Most front-end benchmarks score functional correctness or are Arena-based and ask people to vote on screenshots, neither of which tells you precisely whether a page is bad. Our tasks require agents to work through website creation, and are evaluated based on their ability to create functional front-ends that follow artistic principles.

## Running the tasks

The tasks are in [Harbor format](https://docs.harborframework.com/tasks/overview) under [`tasks/`](tasks/). [`tasks/README.md`](tasks/README.md) describes the task layout, the grader and the reward.

```bash
uv tool install valkyrie-cli
valkyrie org use hackathon-what-does-the-fox-say-c2f1ff2066
valkyrie run start --agent terminus2 --dataset deb/slopbench@5 \
  --model openai/gpt-6-astra --provider modal \
  -s OPENAI_API_KEY openai-api-key -k reasoning_effort high --concurrency 15
```
