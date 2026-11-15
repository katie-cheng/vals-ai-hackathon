# Website generation prompts database

Built from `source_prompts.md` by `python3 build_db.py` (stdlib only). 1 system prompt, 26 scenario prompts, 191 requirements.

| file | contents |
| --- | --- |
| `prompts.db` | SQLite: `system_prompt`, `categories`, `prompts`, `prompt_libraries`, `requirements`, view `prompts_full` |
| `prompts.json` | system prompt + template + all prompts with metadata |
| `prompts.jsonl` | one prompt per line |
| `prompts.csv` | spreadsheet view (lists joined with `; `) |
| `system_prompt.txt` | the shared system prompt |

Fields per prompt: `id`, `task_id` (e.g. `07-indian-restaurant`), `category`, `title`, `entity`, `prompt` (verbatim), `word_count`, `specificity` (vague <15 words, moderate <60, heavy), `libraries` (named in the prompt), `requirements` (checklist of explicit asks, usable as a grading rubric).

```sql
SELECT * FROM prompts_full WHERE category = 'Dashboards and data';
SELECT p.task_id, r.position, r.text FROM requirements r JOIN prompts p ON p.id = r.prompt_id WHERE p.id = 16;
```
