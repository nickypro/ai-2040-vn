# AI 2040 → VN coverage review

Open [`index.html`](./index.html) in a browser. This directory is a QA-only review artifact and is not referenced by the visual novel.

## Inputs

- `../../claude-notes/source-main.md`: the repository's existing capture of the AI 2040 Plan A page. No new web copy was scraped or reproduced for this tool.
- `../../script.md`: the VN adaptation.

## Outputs

- `index.html`: navigable annotated source, coverage index, evidence excerpts, and separate VN-only annotations.
- `coverage.json`: machine-readable passage mappings and VN-fabricated annotations.
- `build.js`: deterministic local generator for `index.html`.

Rebuild with:

```sh
node qa/source-coverage/build.js
```

## Classification method

Mappings are deliberately passage-level rather than chapter-level. A passage is `included` when its central claim or narrative beat has clear evidence in `script.md`, even if prose was compressed or dramatized. It is `partial` when only some claims survive, important qualifications are omitted, or a long analytical passage becomes a short scene. Source text with no asserted mapping remains unhighlighted and is treated as `excluded` for this review.

`fabricated_annotations` are separate because a source highlighter cannot honestly show material that is absent from the source. These annotations identify major VN-original characters, dialogue, connective scenes, and interactive staging.

For interactive alternate timelines, the underlying risk can be source-grounded while the mechanic is not. The covert-project and deal-dissolution passages therefore receive ordinary source mappings for their strategic premises, plus separate VN-fabricated annotations for the exact crisis trigger, binary choice, rewind, and staged success/failure outcomes.

The same rule applies to the post-completion Public and Insider POV extras. Their year-by-year policy, economic, alignment, and handoff milestones are mapped back to the relevant source passages. Maya, Tomas, their conversations with Lux, Park's recurring lab chronicle, and the specific evaluation failures and experiments are separately marked as VN-created dramatization rather than source evidence.

Citizen's Dividend mappings are chronological. The 2032 passage covers the initial $45K American and $1.2K international payments; a separate 2035 mapping covers the later ~$1M and ~$10K amounts. `source-main.md` does not contain the Compute Dividend Corporation name, Alaska Permanent Fund analogy, or exact 25%→75% share, so those details are explicitly identified as outside this local baseline even though the permit-funded dividend and payment amounts are present.

Every mapped passage records source and script line ranges, a beat description, and a confidence level. The HTML shows a short script excerpt and links to the relevant `script.md` range.

## Known limitations

- This is a human-authored semantic crosswalk, not plagiarism detection or a sentence-similarity score.
- `source-main.md` is a markdown capture of a dynamic site. Interactive graphs, tabs, linked alternate timelines, supplements, audio, images, and some page structure are not fully represented in that capture.
- Line links use `#L…` fragments. Many code hosts/editors recognize them; a plain browser opening raw markdown may ignore the fragment, so the visible line range remains the authoritative locator.
- “Excluded” means “not directly evidenced in this pass,” not “irrelevant” or “definitely uninfluential.”
- Dashboard numbers and visual assets are not audited exhaustively here; this artifact focuses on narrative/source passage coverage.
- Some exact policy details may come from AI 2040 material absent from the local page capture or from user-provided context. Unless they can be located in `source-main.md`, this crosswalk does not mark them as baseline-grounded.
- Confidence describes the mapping, not the truth or plausibility of the underlying scenario.
