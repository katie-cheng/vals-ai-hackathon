# Grader and classifier design

Distilled from Ali's discussion with Claude, plus notes on how it fits what we already have.

## Graders, layered
1. **Code/DOM checks** on the rendered page (Playwright + computed styles). Examples:
   - default font stacks and framework palettes
   - identical radius/shadow on every card
   - three-column feature grids
   - emoji used as icons
   - gradient hero text
   - a repeated CTA
   - a "01 / LABEL" eyebrow on every heading

   Cheap and explainable, but they only catch known tells and are easy to game.
2. **Rubric VLM judge.** Screenshots at several viewports, one yes/no question per criterion with cited evidence. Catches what code can't: weak hierarchy, generic composition, filler copy, purposeless decoration. Pairwise comparisons ("which is sloppier?") are more reliable than absolute scores. Use judges from multiple labs, since a judge may be blind to its own family's habits.
3. **Trained classifier** (secondary signal). Linear probe on frozen screenshot embeddings (SigLIP / DINOv2 / CLIP) plus DOM features. Train on human slop ratings, not on provenance (AI-made vs human-made).
4. **Sameness across outputs.** Slop is partly a property of a model's whole output distribution. Give each model many varied briefs and measure how similar its outputs are, in both embedding and DOM structure. Needs no labels and is hard to game.

## Labels
- Several raters do pairwise comparisons; fit a Bradley–Terry ranking.
- Check inter-rater agreement first. If humans don't agree on a criterion, no grader can measure it.
- A few hundred held-out human pairs are enough to validate each grader.
- Free weak labels (award galleries vs raw model outputs) can help training but are too confounded to validate on.

## One-week classifier roadmap (if we build it)
1. **Dataset (days 1–2).** 1–2k sites from several models across ~100 briefs, plus several hundred human-made sites of mixed quality, so that "AI-made" and "slop" are different labels. Screenshot at a fixed viewport, tiled down the page.
2. **Labels (days 2–4).** VLM-judge noisy labels on everything, plus 300–500 human pairwise comparisons, mostly held out.
3. **Features (day 4).** Frozen SigLIP/DINOv2 tile embeddings plus DOM features (font count, palette entropy, repeated-link count, ...).
4. **Train (day 5).** Logistic regression or GBDT. On pairs, P(a ≻ b) = σ(wᵀ(φ(a) − φ(b))), and wᵀφ(x) becomes the scalar slop score.
5. **Validate (days 5–7).** Hold out whole generator models and whole briefs. Compare classifier–human agreement to human–human agreement. Test the confound directly: polished AI sites should score low and sloppy human sites should score high.

**Risks:**
- Shortcut learning ("looks like model X" or "default component library").
- Drift as models change.
- Gaming a fixed public classifier.

**Verdict:** cut the classifier first if time is short. Timebox the probe to about 2 days and keep it only if it beats the judge on held-out human pairs.

## Granular (element-level) feedback
The DOM already gives bounding boxes, so the job is choosing which elements to flag, not running a detector. Four ways to flag them:
- **Code checks** fire on specific elements, so selector and bbox come for free.
- **Marked-element VLM judge.** Overlay numbered boxes and have the judge return IDs + criterion + reason. Models are far better at picking IDs than producing coordinates.
- **Classifier attribution.** Neutralize one element, re-render, and take Δₑ = s(x) − s(x∖e).
- **Human click-to-tag annotation.** This is what SlopLabel does, and it yields selectors that map back to code.

Some slop is not local (templated section order, weak overall hierarchy, every card identical), so page-level and group tags are also needed.

Denser feedback helps both the grader (dozens of labels per page, less shortcut learning) and a generator (flag → selector → source line → revise loop → before/after preference pairs). Elements aren't independent, so still split by page and generator.

Failure modes when training against it:
- **Whack-a-mole:** new tells replace old ones.
- **Blandness:** a near-empty page scores perfectly.

Counter both by pairing element penalties with a positive brief-fulfillment score (the `requirements` checklist) and the cross-brief diversity measure.

## How this maps to our assets
- SlopLabel element labels give us dense human labels from the start. They seed the rubric (each recurring tag becomes a criterion), validate the judge per element, and can later train the probe.
- `data-source-loc` tags give component-level attribution on arena sites.
- The prompt DB's 191 requirements are the positive brief-fulfillment score.
