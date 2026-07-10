#!/usr/bin/env bash
# Generate all 7 BGM tracks concurrently via Lyria clip model.
# Logs per-track transcript to jobs/bgm_<id>.log for the vocal-leak check.
set -u
cd /workspace/media/ai-2040-vn
source /workspace/tools/env/.keys
mkdir -p assets/audio/raw qa/audio jobs

PY=.venv/bin/python

gen() {
  local id="$1"; local prompt="$2"
  echo "[$id] start $(date +%T)"
  $PY tools/gen_music.py --out "assets/audio/raw/${id}.mp3" --model clip \
     --prompt "$prompt" > "jobs/bgm_${id}.log" 2>&1
  echo "[$id] exit=$? $(date +%T)"
}

gen bgm_title "Instrumental background music for a visual novel about humanity standing at the threshold of an uncertain AI future. Sparse solo piano with slow, widely spaced notes over a soft warm synth pad. Quiet and hopeful but unresolved, gentle and contemplative, not triumphant and not sad. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_main "Instrumental background music for a visual novel about people methodically building a careful plan to steer a powerful new technology. Gentle piano arpeggios and sustained warm strings with a soft steady pulse and subtle forward motion. Measured, sober but warm, purposeful, not urgent and not sentimental. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_tension "Instrumental background music for a visual novel about accelerating technological growth slipping beyond control. A low sustained drone with a slow restrained pulse, muted low strings and distant soft synth, faint unease. Tense and restrained, never breaking into drama, not loud and not resolving. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_sitroom "Instrumental background music for a visual novel about a late night crisis meeting in a government situation room. Spare ticking percussive pulse, sparse low piano notes and a cold sustained pad, a sense of time running out. Tense, spare and clinical, not melodic, not warm and not climactic. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_choice "Instrumental background music for a visual novel about a single decision that will change everything, the moment just before it is made. A single sustained high string tone and slow soft piano over near silence, suspended and weightless, a held breath. Still and suspended, tense but quiet, not resolving and not moving forward. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_race "Instrumental background music for a visual novel about a high stakes technological race against the clock. A cold driving pulse with insistent staccato synth and low pounding bass, mechanical and accelerating, urgent. Driving, cold and relentless, not warm, not melodic and not heroic. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

gen bgm_dawn "Instrumental background music for a visual novel about the quiet morning after a long crisis has finally passed. Warm piano melody with gentle strings and a soft glowing pad, slow and breathing, like dawn light. Resolved, bittersweet and gently relieved, calm not triumphant, hopeful but touched with loss. Even dynamics throughout, suitable for seamless background looping. Strictly instrumental, NO vocals, no singing, no big finale or ending swell." &

wait
echo "ALL DONE $(date +%T)"
