# PLAN A — an AI 2040 visual novel

Current release: **v1.5.2** · [Changelog](CHANGELOG.md)

An interactive visual-novel adaptation of **[ai-2040.com](https://ai-2040.com)** ("Plan A",
by the [AI Futures Project](https://ai-futures.org): Larsen, Dean, Halstead, Lifland,
Greenblatt, Kokotajlo). **Unofficial fan work** — not affiliated with or endorsed by the
authors. Made in the spirit of the kinetic novel
[*Everything That Hurt You*](https://github.com/esyudkowsky/everything-that-hurt-you).

Adaptation & direction by [meowtase](https://sus.cat/) ([@cutesuscat](https://x.com/cutesuscat)).
Built with Claude; art by Google Gemini image models ("Nano Banana") via OpenRouter;
music by Google Lyria. See the in-game **Credits** page for full attribution.

> **Faithful on the plumbing, and honest that it's a recommendation, not a prediction.**
> Plan A is the AI Futures Project's *positive* vision, which they themselves rate at only
> ~42% odds of a great future. This adaptation dramatizes one successful run of it; see
> `claude-notes/CRITIQUE-summary.md` for where the adaptation still over-smooths the risk.

You play the President's senior advisor on AI, from the 2027 wakeup through the 2029
branch point where the country picks one of five plans. Four of them (D, C, B, S) play
out as short endings and return you to the choice. **Plan A** continues all the way to
2040 and the epilogue, then unlocks tracked Public POV and Insider POV bonus stories.

## Play it

Static site, no build step. Serve the folder and open `index.html`:

```
cd /workspace/media/ai-2040-vn
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Click / tap / Space to advance. Arrow keys roll back through past beats. The menu
(top-right) has chapter jump, settings, and backlog. Progress autosaves every line.

## What's here

| Path | What |
|---|---|
| `index.html` + `engine.js` | The whole engine: 16:9 cqh-scaled stage, script compiled to an instruction list, autosave, seek-by-replay, branching (`@choice`/`@label`/`@jump`), rollback, chapter menu. Vanilla JS, no framework. |
| `script.md` | The stage script. 14 chapters + 5 plans, three Plan A turning points, and full postgame Public/Insider POV stories (~1,000 instructions). Plain text; `@directive` staging + `Speaker: line` dialogue. |
| `assets/manifest.json` | Indirection for every art/audio id. Missing image → labeled placeholder card; missing audio → silent no-op. |
| `assets/{bg,cg,sprites,ui,audio}` | Art (Dossier Red style) and music. |
| `tools/validate.js` | Script + manifest validator (unknown directives, undeclared speakers, dead jumps, branch DFS, files-exist). Exit 1 on error. |
| `tools/e2e.js` | Playwright click-through of all five branches + save/resume/rollback. |
| `CHANGELOG.md` | Versioned release history. |
| `tools/gen.py`, `cutout.py`, `gen_music.py`, `make_loops.py` | Art + audio generation pipeline (OpenRouter). |
| `claude-notes/` | Design doc, engine contract (`ENGINE-NOTES.md`), art pipeline + style bible, source text. |

## Verify

```
node tools/validate.js     # exit 0
node tools/e2e.js          # E2E PASSED
```

## Art & audio

Art style is **Dossier Red**: cream editorial paper, black ink linework, halftone
dot-matrix maps, a single red accent, with the AI-assistant avatar (Lux, a warm
holographic catgirl) as the one warm note. Character sprites use the master-first method: one master per character,
expressions generated as reference edits, magenta chroma-keyed to transparent. Full
method + prompts in `claude-notes/ART-PIPELINE.md`.

BGM is optional and degrades gracefully to silence. See `HUMAN.md` for the audio tasks
that need a human ear (Claude cannot hear).

## Credits

Source scenario: **Plan A / AI 2040**, the AI Futures Project (ai-2040.com). This
adaptation compresses their ~30,000-word scenario into a playable novel; all the
policy ideas, numbers, and the five-plan structure are theirs. Engine architecture
adapted from *Everything That Hurt You* by Eliezer Yudkowsky.
