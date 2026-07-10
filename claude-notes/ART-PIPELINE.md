# ART-PIPELINE — Dossier Red (locked style + character bible)

Chosen style (author pick, 2026-07-09): **DOSSIER RED**. Master-first method
(reference LESSONS §4). Generator: `tools/gen.py` (OpenRouter Nano Banana Pro).
Cutout: `tools/cutout.py` (magenta -> alpha, trims the cream mat the model adds).
`source /workspace/tools/env/.keys` before any generation.

## Style strings (paste at FRONT of every prompt)

SCENE (bg + cg, `--aspect 16:9`):
> STYLE: editorial risograph illustration on warm cream paper, confident black ink
> linework, halftone dot-matrix texture, limited palette, a SINGLE red spot color
> (#d64533) used sparingly for emphasis, screenprint/riso feel, sober diagrammatic
> "think-tank scenario" mood, distinctly a visual-novel background. Any maps, globes,
> or charts are red-and-black halftone DOT-MATRIX diagrams, greeked, with NO readable
> text. NO text, no lettering, no words anywhere in the image.

SPRITE (`--aspect 3:4`, on magenta — note: NO "cream paper" here, it causes a border):
> STYLE: editorial risograph character illustration for a visual novel: confident
> black ink linework, halftone dot shading, limited flat color fills, a single red
> spot accent (#d64533), screenprint texture on the FIGURE ONLY. Sober graphic-novel
> look. The BACKGROUND must be a single flat uniform BRIGHT NEON MAGENTA #FF00FF at
> full brightness, full-bleed to all four edges, no border, no frame, no paper
> texture on the background, like a chroma-key greenscreen. EXACTLY ONE FIGURE, no
> extra limbs, no second person. NO text anywhere.

## Character bible (restate the FULL description in every sprite prompt; identity
## traits silently vanish otherwise)

- **pres** — a FICTIONAL US President, NOT resembling any real or famous person
  (vary the face away from any celebrity/actor likeness): man in his fifties, short
  neat greying hair, clean-shaven, lined tired face, dark navy suit, white shirt,
  dark tie, small red-and-white American-flag lapel pin. Dignified, weary.
- **chen** — Minister Chen Yulan, a FICTIONAL senior Chinese government official,
  clearly East Asian / Chinese, woman in her fifties, black hair in a neat low bun,
  dark charcoal tailored suit, a single small red lapel pin. Composed, sharp, dry.
- **reed** — Marcus Reed, tech-CEO, white American man late forties, short dark hair
  greying at temples, clean-shaven or light stubble, charcoal blazer over a dark
  crew-neck (no tie), expensive-casual. Charismatic, smooth.
- **park** — Dr. Lena Park, alignment researcher, Korean-American woman late thirties,
  shoulder-length black hair, glasses, plain dark shirt or knit, lanyard. Earnest,
  intense, no-nonsense.
- **niko** — the ginger catgirl AI avatar: young woman, long wavy GINGER hair, ginger
  CAT EARS on her head, exactly ONE ginger cat tail, AMBER eyes, human face with NO
  muzzle, slightly oversized charcoal-grey off-shoulder t-shirt, dark denim shorts,
  dark sneakers. Warm and friendly. In Dossier Red her ginger/ochre hair is the ONE
  warm mass in the palette. (radiant variant: add a soft warm halftone glow/aura,
  serene, superintelligent-but-gentle.)

## Expression sets (master = first listed; rest are edits of the master)

- pres: neutral(master), stern, weary
- chen: neutral(master), wry, grave
- reed: confident(master), defensive
- park: neutral(master), worried, bright
- niko: cheerful(master), serious, radiant

Expression edit prompt = SPRITE style + `--ref <master.png>` +
"Reproduce this EXACT character, same face, hair, ears, tail, outfit, pose, and
magenta background. Change ONLY the facial expression to <X> (describe mechanics;
add negatives e.g. mouth closed / no tears). Keep the single red accent."

## Backgrounds (15) — brief per id (all SCENE style, no people unless noted)

- bg_westwing — a quiet West Wing office, flags, desk, warm lamplight, window.
- bg_hearing — a US congressional hearing room, tiered dais, empty witness table,
  microphone, wood panels, a large seal (abstract, no readable text).
- bg_lab — a modern AI-lab meeting room / office, monitors with greeked dot-matrix
  charts, glass walls, whiteboard with abstract diagrams.
- bg_embassy — an elegant diplomatic reception hall, chandeliers, coffee service,
  people as distant blurred silhouettes.
- bg_oval — the Oval Office: resolute desk, twin flags, tall windows, seal on the
  floor rendered abstractly (no readable text). Empty.
- bg_sitroom — the White House Situation Room (see style samples; the strong one):
  long dark table, empty leather chairs, wall of red dot-matrix world maps + greeked
  charts, low light.
- bg_datacenter — interior aisle of a vast AI datacenter, rows of server racks
  receding, red status LEDs, cold blue-neutral light with red accents.
- bg_summit — an international summit / negotiation hall, long table, many national
  flags (abstract, no readable text), tall windows.
- bg_mongolia — the Mongolian-steppe standoff at dusk (see samples): fenced
  datacenter monoliths with red-glowing vents, thin line of soldiers/vehicles, distant
  opposing formation across empty grassland, amber horizon.
- bg_sez — an industrial Special Economic Zone: a vast open-pit strip mine beside a
  city-sized robot factory, empty of people, dust and machinery.
- bg_arcology — a green skyscraper-arcology: tall mixed-use tower wrapped in terraces
  and plants, near a beach, good weather.
- bg_preserve — an ordinary leafy suburban American street, nearly unchanged, calm,
  a couple of tourists, warm daylight.
- bg_party — a rooftop "End of the World" party at dusk: string lights, a small group
  (distant silhouettes), a city and glowing datacenters below, champagne on a ledge.
- bg_space — Earth from orbit at the dawn terminator, the day-night line glowing, a
  scatter of city lights, deep starfield. (Also the title backdrop.)
- bg_dawn — dawn breaking over a plain of datacenters/solar fields, pink-amber sky,
  quiet and hopeful (ending backdrop).

## CGs (6) — illustrated single-moment panels (SCENE style, 16:9)

- cg_election — election night: a man's lone silhouette before a glowing wall of
  results (returns as abstract red/black blocks, no readable text). Back view.
- cg_signing — the Consortium signing: a long table, many national flags (abstract),
  figures signing, a wide formal hall. Historic, sober.
- cg_ocean — a vast fleet of modular floating ocean datacenters to the horizon under
  a pale dawn sky, solar + battery platforms, aerial three-quarter view (see samples).
- cg_three_worlds — a triptych-feel single image split into three bands: a strip-mine
  industrial zone / a green arcology / an unchanged leafy street. One composition.
- cg_party — the rooftop End-of-the-World party at dusk, a small group toasting, city
  and datacenters glowing below, warm and wistful. (May reuse bg_party framing but
  as a peopled CG.)
- cg_lottery — symbolic: a single small paper lottery ticket held up against a vast
  starfield / galaxy (the "one ten-billionth of space"). NO readable text on ticket.

## UI

- ui_title — title splash backdrop: Earth at the dawn terminator (like bg_space) with
  room at the top for the engine-drawn "PLAN A" wordmark. NO baked text.
- placeholder_card — keep the generated ImageMagick card (engine fallback).

## Process / batching

1. Masters first: pres.neutral, chen.neutral, reed.confident, park.neutral,
   niko.cheerful. QA hard (identity, clean key, no border, no text, one figure).
   Cut out each with cutout.py -> assets/sprites/<char>_<expr>.png.
2. Expression edits from each master (ref = the RAW master png in raw/, not the
   cutout), then cutout.
3. Backgrounds + CGs (SCENE style) straight to assets/bg / assets/cg (no cutout).
4. Keep RAW pre-cutout masters in raw/ (they are the refs for future expressions).
5. Save every prompt to jobs/*.json is optional here; the batch scripts capture them.
6. Contact-sheet each batch and view with vision. Regen the weak ones. Don't loop.
7. Re-run `node tools/validate.js` (files-exist) and `node tools/e2e.js` after art
   lands (screenshots become real).

## Known pitfalls (from the style exploration)

- Sprites: the model adds a cream border if "cream paper" is in the prompt -> use the
  SPRITE style string (no cream paper) + cutout.py trims any residual mat anyway.
- President drifts toward real-actor likeness -> add "not resembling any real or
  famous person, invent a new face" and check each generation.
- Keep magenta PURE on sprites (do not duotone/texture the background).
- Restate ears + ONE tail + amber eyes + no muzzle in EVERY niko prompt.
