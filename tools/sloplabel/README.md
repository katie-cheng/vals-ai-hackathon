# SlopLabel

Component-level AI-slop annotation tool for the 30 mirrored Design Arena webapps (S01–S30).

## Run

```bash
cd ~/slopbench/sloplabel
uv run python server.py        # serves on 0.0.0.0:8700
```

Open `http://localhost:8700/` — the site index lists all 30 mirrors with model, arena placement, prompt, label counts and a done checkbox.

## Annotating

1. Click a site card → opens the mirrored site with the overlay bar on top.
2. Click **Pick element** (or press **Q**), hover to highlight, click to select. Pick mode stays on so you can label one thing after another.
   - If the build has `data-source-loc` markers, the tooltip shows component › file › line, e.g. `Navigation › UI · UI:16 <span>`.
   - **W** / ↑ parent element, **S** / ↓ back to child, **E** / ⇧↑ jump to enclosing component (works until you start typing).
   - Sites without source-loc (S07, S08, S22, S25 and a few near-empty ones) fall back to CSS selectors — the bar says `(no source map)`.
3. Every label means "this is slop". Clicking an element **immediately creates the row**; optionally press **F** (or click the box) and write why it is slop. It **autosaves** as you type (status in the panel header). The comment is optional: closing the panel (**Esc**, Done, or clicking another element) keeps the label. **Clicking the same element again** removes it if it has no comment (a commented label just reopens); **D** deletes any label. Saved labels show a red outline + numbered pin. No verdicts, severities or tags — categories will be assigned later by a model pass over all comments.
4. Saved labels appear as numbered pins; the **Labels** drawer (**A**) edits; **D** deletes the open label. Element + context screenshots are captured in the background (`shot_status` pending → ok; **recapture** from the labels page if it was mid-animation).
5. Other keys: **R** minimize panel, **H** hide pins, **?** cheat sheet. Letter keys are ignored while typing.
6. **Mobile view** opens a 390px (toggle 390/430/768) framed copy of the site — labels saved there record that viewport.

## Data

- SQLite: `~/slopbench/sloplabel/data/sloplabel.db` (`sites`, `labels` tables).
- Element/context PNGs: `~/slopbench/sloplabel/data/shots/`.
- `/__slop/labels` — filterable gallery of every label with screenshots.
- Export: `/__slop/api/export.json`, `/__slop/api/export.csv` (linked from the index).

## Tests

```bash
uv run python tests/e2e.py            # pick→save→capture→pin flow on a few sites (cleans up its own labels)
uv run python tests/all_sites.py      # loads all 30 sites, reports overlay/locs/errors
```

## Known limitations

- Site selection is a cookie (`slop_site`): annotate one site per browser profile at a time; two tabs on different sites will fight over the cookie.
- A few sites (S15, S16, S19, S20) render tiny amounts of content — that's how the arena deploys look, not a bug.
- Mirrors may fetch missing assets lazily from the original `*.arcada.app` URLs and cache them.
- No auth; annotator is a name field stored per browser (localStorage).

## Layout

- `server.py` — FastAPI: site proxy w/ overlay injection, labels API, SQLite, Playwright screenshot capture.
- `static/overlay.js` — injected picker overlay (shadow DOM).
- `static/index.html` — site index. `static/frame.html` — mobile frame. `static/labels.html` — label gallery.
- `tests/` — Playwright smoke tests.
