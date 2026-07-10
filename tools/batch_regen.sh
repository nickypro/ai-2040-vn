#!/bin/bash
# Regen pass: reed_defensive (rat ears/tail/glasses), niko_radiant (glasses on head),
# pres_stern (blue tie).
set -u
cd /workspace/media/ai-2040-vn
source /workspace/tools/env/.keys

SPRITE="STYLE: editorial risograph character illustration for a visual novel: confident black ink linework, halftone dot shading, limited flat color fills, a single red spot accent (#d64533), screenprint texture on the FIGURE ONLY. Sober graphic-novel look. The BACKGROUND must be a single flat uniform BRIGHT NEON MAGENTA #FF00FF at full brightness, full-bleed to all four edges, no border, no frame, no paper texture on the background, like a chroma-key greenscreen. EXACTLY ONE FIGURE, no extra limbs, no second person. NO text anywhere."

gen () {
  .venv/bin/python tools/gen.py --out "$1" --aspect 3:4 --ref "$2" --prompt "$3" \
    > "jobs/$(basename "$1" .png).log" 2>&1
  echo "$1 exit=$?"
}

gen raw/reed_defensive_raw.png raw/reed_confident_master.png \
  "$SPRITE Reproduce this EXACT character: same face, same short dark hair greying at the temples, same light stubble, same charcoal blazer over dark crew-neck with the red pocket square, same pose, and the flat full-bleed magenta background. He is an ordinary human man: NO glasses, NO animal ears, NO tail, NO animal features of any kind. Change ONLY the facial expression to defensive: guarded, a tight forced half-smile that does not reach the eyes, slightly raised chin, mouth closed, no teeth showing. Keep the single red accent. EXACTLY ONE FIGURE. NO text." &

gen raw/niko_radiant_raw.png raw/niko_cheerful_master.png \
  "$SPRITE Reproduce this EXACT character: same face, same long wavy ginger hair, ginger CAT EARS on her head, exactly ONE ginger cat tail, AMBER eyes, human face with NO muzzle, same slightly oversized charcoal off-shoulder t-shirt, dark denim shorts, same pose, and the flat full-bleed magenta background. She wears NO glasses, NO sunglasses, NO eyewear anywhere (not on her face, not on her head). Change ONLY the facial expression to radiant: a serene gentle smile, superintelligent but kind, soft eyes, and add a soft warm halftone glow aura hugging the edge of her figure only; the background stays flat pure magenta. Keep the single red accent. EXACTLY ONE FIGURE. NO text." &

gen raw/pres_stern_raw.png raw/pres_neutral_master.png \
  "$SPRITE Reproduce this EXACT character: same face, same short neat greying hair, clean-shaven, same dark navy suit, white shirt, and the SAME very dark near-black tie (do NOT change the tie color, absolutely no blue tie), same small red-and-white flag lapel pin, same pose, and the flat full-bleed magenta background. Change ONLY the facial expression to stern: brow lowered, jaw set, mouth a firm hard line, mouth closed, no smile. Keep the single red accent. EXACTLY ONE FIGURE. NO text." &

wait
echo REGEN DONE
