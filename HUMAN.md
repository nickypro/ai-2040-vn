# HUMAN.md — tasks that need a human

Claude cannot hear audio. Everything below either needs your ears or your explicit
go-ahead. Money amounts are OpenRouter list prices.

## Audio (BGM) — optional; the game plays fine silent

The engine treats every missing track as a silent no-op, so shipping without music is
fine. If you want music, the pipeline is ready (`tools/gen_music.py` + `tools/make_loops.py`,
OpenRouter Lyria, ~$0.04–0.08/track). Seven tracks are wired in the script/manifest:

| id | where | mood brief |
|---|---|---|
| `bgm_title` | title screen | quiet, hopeful, unresolved; sparse piano + soft pad |
| `bgm_main` | Plan A throughline | measured, sober-but-warm, forward motion |
| `bgm_tension` | 2028 / growth chapters | low pulse, unease, restrained |
| `bgm_sitroom` | Situation Room / negotiations | tense, spare, clock-ticking |
| `bgm_choice` | the 2029 choice | held breath, suspended |
| `bgm_race` | Plan D / Plan B | driving, cold, accelerating |
| `bgm_dawn` | endings / epilogue | resolution, dawn, bittersweet relief |

Recipe (from the reference project's lessons, went 6-for-6):
1. `source /workspace/tools/env/.keys`
2. `.venv/bin/python tools/gen_music.py --out assets/audio/raw/<id>.mp3 --model clip --prompt "..."`
   Prompt formula: "Instrumental background music for a visual novel about <scene>." +
   concrete instrumentation + emotional register including what it is NOT + "even
   dynamics throughout, suitable for seamless background looping" + hard negatives:
   "Strictly instrumental, NO vocals, no singing, no big finale/ending swell."
   (The streamed text is your vocal check: `<instrumental>` markers good, real words = vocals leaked, regen.)
3. Loop-ify (Lyria always fades out): `.venv/bin/python tools/make_loops.py assets/audio/raw/<id>.mp3 assets/audio/<id>.mp3`
4. **Human audition (this is the mandatory gate).** Claude's only QA is ffmpeg
   spectrograms/waveforms, which catch clipping and structure but NOT mood or whether
   it loops pleasantly. Listen to each. Feedback format that makes a regen one command:
   "regenerate bgm_X, sounds like Y, should sound like Z."

**Closed lanes (do not retry, per the reference's hard-won notes):** foley via a music
model (always returns music); gpt-audio / ElevenLabs for voice acting (rejected for
emotionality). Voice acting is out of scope for this project anyway.

## Deployment

- Any static host (Vercel, GitHub Pages, Netlify). No build step. Just serve the folder.
- The repo is not committed. `git add -A && git commit` when you're ready; nothing here
  auto-commits.

## Spending so far

- Art (Dossier Red full set, ~40 images via OpenRouter Nano Banana Pro): on the order
  of a few US dollars total.
- Audio: $0 (not generated yet).
