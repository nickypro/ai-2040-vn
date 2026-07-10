# STYLE-KIT — shared brief for style-exploration subagents

You are generating a small, COHERENT sample set in ONE assigned art style, so the
author can compare distinct visual directions for a visual novel. Save all output to
`qa/styles/<YOUR_STYLE_NAME>/`. Do NOT touch anything else in the repo.

## The project

An interactive visual novel adaptation of ai-2040.com (a serious AI-policy scenario by
the AI Futures Project). Tone: intelligent, tense, geopolitical, with moments of warmth.
The art must be **distinctly visual-novel art** (character sprites + painted scene
backgrounds) that **incorporates two reference aesthetics**:

1. **ai-2040.com aesthetic** — cream/off-white paper, black serif type, a single RED
   accent color (#d64533-ish), halftone / dot-matrix globes and maps, monospace data
   labels, editorial think-tank restraint. Cool, diagrammatic, sober.
2. **catgirl aesthetic** — soft warm anime; the project has a recurring ginger catgirl
   AI avatar (long wavy ginger hair, cat ears + tail, amber eyes, cozy casual clothes).
   Warmth, approachability, a little charm.

Your assigned style (in your task prompt) says how to FUSE these into one VN look.

## The generator

`source /workspace/tools/env/.keys` first (sets OPENROUTER_API_KEY). Then:

```
.venv/bin/python tools/gen.py --out qa/styles/<name>/<file>.png --aspect 16:9 --prompt "..."
.venv/bin/python tools/gen.py --out qa/styles/<name>/<file>.png --aspect 3:4  --prompt "..."   # sprites
```

- Backgrounds/CGs: `--aspect 16:9`. Character sprites: `--aspect 3:4`.
- Each call is one image, ~15-20s. Run several concurrently with `&` + `wait`.
- Model default is Nano Banana Pro (google/gemini-3-pro-image). Good at both.
- **Sprites go on flat chroma magenta** so they can be cut out: include verbatim
  `on a single flat uniform BRIGHT NEON MAGENTA background exactly #FF00FF at full
  brightness like a greenscreen chroma key, no gradient, no vignette`. (This is a
  production requirement even for samples; the author judges the character on magenta.)
- **NO text in images.** Say `NO text, no lettering, no words anywhere` in every prompt.
  Maps/charts should be abstract shapes only ("greeked, no readable text").
- Put your STYLE description at the FRONT of every prompt so it dominates.

## The 5 images to generate (same subjects for every style, for comparison)

Prefix each filename with nothing special; just these names inside your folder:

1. `bg_sitroom.png` (16:9) — The White House Situation Room: tense windowless briefing
   room, long dark table, empty chairs, wall screens showing abstract world maps and
   charts (NO readable text), low dramatic lighting. Establishing shot, no people.
2. `pres.png` (3:4 sprite, magenta) — a FICTIONAL US President (must NOT resemble any
   real person, avoid celebrity likeness), man in his fifties, short greying hair,
   clean-shaven, dark navy suit, small American-flag lapel pin, dignified and tired.
   Standing, facing viewer, neutral. EXACTLY ONE FIGURE, no extra limbs.
3. `chen.png` (3:4 sprite, magenta) — a FICTIONAL senior Chinese government minister
   (not resembling any real person), woman in her fifties, black hair in a neat low
   bun, dark tailored charcoal suit, composed and sharp. Standing, facing viewer, faint
   wry look. EXACTLY ONE FIGURE.
4. `niko.png` (3:4 sprite, magenta) — the ginger catgirl AI avatar: young woman, long
   wavy ginger hair, ginger cat ears on her head, ONE ginger cat tail, amber eyes,
   human face with NO muzzle, slightly oversized charcoal off-shoulder t-shirt and dark
   denim shorts, warm friendly smile (mouth closed). EXACTLY ONE FIGURE. She is the
   ONE spot of warmth/color in an otherwise sober cast; let your style show how she
   reads against the serious characters.
5. `scene_mongolia.png` (16:9) — hero scene, no readable text: a tense modern standoff
   on the Mongolian steppe at dusk. A fenced cluster of enormous windowless datacenter
   buildings glowing with cooling vents, guarded by a thin line of soldiers and light
   vehicles; across empty desert grassland, another distant military formation waits.
   Vast cold sky, amber horizon, long shadows. Cinematic wide shot.

## Process

1. Read this file. Generate all 5 (concurrently is fine).
2. **View each result with the Read tool.** Judge: does it match the assigned style?
   Is character identity right (Niko's ears+tail+ginger+amber eyes; Chen Chinese;
   President not a real-person lookalike)? Clean magenta on sprites? Any text leaked
   (regenerate with stronger NO-text negative)? Exactly one figure?
3. Do at MOST one regen pass on the weakest 1-2 images. Don't perfectionist-loop.
4. Final message: one paragraph on how your style fused the two aesthetics, what works,
   what's risky, and a self-assessment of whether this direction is worth pursuing for
   ~40 assets. List the 5 file paths.
