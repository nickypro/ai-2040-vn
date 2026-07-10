#!/bin/bash
# Batch: 9 expression variants as reference-conditioned edits of the raw masters.
set -u
cd /workspace/media/ai-2040-vn
source /workspace/tools/env/.keys

SPRITE="STYLE: editorial risograph character illustration for a visual novel: confident black ink linework, halftone dot shading, limited flat color fills, a single red spot accent (#d64533), screenprint texture on the FIGURE ONLY. Sober graphic-novel look. The BACKGROUND must be a single flat uniform BRIGHT NEON MAGENTA #FF00FF at full brightness, full-bleed to all four edges, no border, no frame, no paper texture on the background, like a chroma-key greenscreen. EXACTLY ONE FIGURE, no extra limbs, no second person. NO text anywhere."

gen () { # $1 out $2 ref $3 expr-clause
  .venv/bin/python tools/gen.py --out "$1" --aspect 3:4 --ref "$2" \
    --prompt "$SPRITE Reproduce this EXACT character: same face, hair, ears, tail, glasses, outfit, pose, and the flat magenta background. Change ONLY the facial expression to $3 Keep the single red accent. EXACTLY ONE FIGURE. NO text." \
    > "jobs/$(basename "$1" .png).log" 2>&1
  echo "$1 exit=$?"
}

NIKO="She is a catgirl: ginger cat ears on her head, exactly ONE ginger cat tail, AMBER eyes, human face with NO muzzle, long wavy ginger hair."

gen raw/pres_stern_raw.png raw/pres_neutral_master.png \
  "stern: brow lowered, jaw set, mouth a firm hard line. No smile, mouth closed, no tears." &
gen raw/pres_weary_raw.png raw/pres_neutral_master.png \
  "weary: tired, eyes heavy-lidded, slight downward gaze, mouth closed. No smile, no tears." &
gen raw/chen_wry_raw.png raw/chen_neutral_master.png \
  "wry: a faint knowing half-smile, one brow slightly raised. Mouth closed, subtle, no teeth showing." &
wait
gen raw/chen_grave_raw.png raw/chen_neutral_master.png \
  "grave: serious, mouth closed, eyes level and cold. No smile, no tears." &
gen raw/reed_defensive_raw.png raw/reed_confident_master.png \
  "defensive: guarded, a tight forced half-smile that does not reach the eyes, slightly raised chin. Mouth closed, no teeth showing." &
gen raw/park_worried_raw.png raw/park_neutral_master.png \
  "worried: brow furrowed with concern, mouth slightly tense. NO tears, no crying, eyes dry." &
wait
gen raw/park_bright_raw.png raw/park_neutral_master.png \
  "bright: a genuine warm smile, eyes lit up, hopeful. Keep her glasses on. No tears." &
gen raw/niko_serious_raw.png raw/niko_cheerful_master.png \
  "serious: calm and quiet, gentle but NO smile, mouth closed, softer eyes. No grin, no tears. $NIKO" &
gen raw/niko_radiant_raw.png raw/niko_cheerful_master.png \
  "radiant: a serene gentle smile, superintelligent but kind, eyes soft; ALSO add a soft warm halftone glow aura around her figure (on the figure edge only, background stays flat pure magenta). No tears. $NIKO" &
wait
echo ALL DONE
