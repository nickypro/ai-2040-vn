# ENGINE-NOTES — script language contract + port notes

2026-07-09. Audience: the scriptwriter session (this is the CONTRACT the real
script must follow — the engine will not change for a conforming script) and
future engine sessions. Engine ported from *Everything That Hurt You*
(`engine.js` + `index.html`, architecture kept wholesale per its LESSONS.md
§1/§6/§7) and extended with branching.

**Status note (2026-07-09):** a partial draft of the real script was found in
`script.md` mid-write during the engine port — it ends mid-sentence inside the
Plan D branch and its 5-way choice targets four labels that don't exist yet.
It is preserved verbatim at `claude-notes/script-v1-draft-partial.txt`; the
running `script.md` is a small demo. When finishing the draft: it already
conforms to this contract (parses to 125 instructions, 3 chapters, 6 speakers)
except ONE parser warning — line 74 has dialogue by undeclared speaker
"Senator" (add `@speaker Senator #... - left` or reword). Restore it over
`script.md` and run `node tools/validate.js` until exit 0.

## Running / verifying

- Serve statically: `python3 -m http.server` in the repo root (fetch() means
  file:// never works). No build step.
- `node tools/validate.js` — exit 1 on any error. Run after every script batch.
- `node tools/e2e.js` — Playwright click-through (reuses
  `/workspace/tools/headless-browser/node_modules/playwright-core` and the
  chromium in `~/.cache/ms-playwright/`, with `LD_LIBRARY_PATH=~/.local/chrome-deps/lib`
  because this box has no system GUI libs). Screenshots to `qa/`.

## Script language

Line-oriented plain text. `@directive args`, `Speaker: text` for dialogue,
bare lines = narration, `@note` = comment. `*word*` = emphasis. `|` = mid-line
click-pause (font is fitted against the full text, so size never changes
mid-line). `"..."` as dialogue text is a legal silence panel.

### Header: speaker declarations (REQUIRED before any dialogue)

```
@speaker Name #hexcolor spritePrefix defaultSlot
@speakers Name #hex prefix slot, Name2 #hex2 prefix2 slot2
```

- `Name` may be multi-word (everything before the `#color` token). Dialogue
  lines match `Name: text` against declared names only.
- `#hexcolor` colors the name plate (and the name in the backlog).
- `spritePrefix` links the speaker to sprite char ids for the speaking-dim
  effect: a sprite whose char id (or its first `_`-segment) equals the prefix
  stays bright while others dim. Use `-` for a speaker with NO sprite (e.g.
  the POV character `You`) — no dim association, others stay bright.
- `defaultSlot` (`left|center|right`) is used when `@sprite` omits its slot
  argument (matched via the char id's first segment).
- Dialogue by an undeclared speaker renders as narration AND is a validator
  ERROR (a colon line only trips the check when the pre-colon text looks like
  a 1-3-word capitalized name, so ordinary narration colons are safe).

### Branching

```
@label name          — jump target; no state effects. Names are unique.
@jump name           — unconditional goto.
@choice
* Option text -> target_label
* Other option -> other_label
@endchoice
@title               — return to the title screen (branch-ending exit).
```

- `@choice` hides the textbox and shows a centered stage-styled menu.
  Mouse hover or Up/Down move the highlight; click or Enter/Space picks.
  Options whose target label was EVER visited (persisted `seenLabels`) render
  dimmed with a ✓ marker. Clicks outside the menu do nothing. Autoplay and
  Ctrl-skip stop at a choice, always.
- Reaching a choice a second time in live play (e.g. an ending that jumps back
  to it) always re-presents the menu; the new pick overwrites the recording.
- **Rollback across a choice re-presents it**: picking (possibly differently)
  truncates the recorded answers of any choice later on the pre-rollback path
  and clears the downstream path/history. Records of choices on abandoned
  sub-paths that occurred BEFORE the re-picked choice may remain in the save;
  they are inert (live play always re-presents, and replays consume each
  choice record at most once).
- `@title` returns to the title screen and rewinds the save's resume point to
  the last choice on the path (Continue then re-presents that choice); if the
  path had no choice it rewinds to the start. Running off the end of the
  script instead shows the end card and sets `fin`.
- **Label re-establishment rule (validator-enforced, warning):** every label
  that is a `@jump`/`@choice` target must issue `@bg` or `@cg` within its
  first 8 instructions (before any further flow control), so path replays and
  rollback reconstruct the correct scene. `@clear` before the `@bg` is fine.
- Every branch must terminate: script end, `@title`, or a loop back into a
  choice. A loop containing no choice is a validator ERROR (softlock). The
  validator DFS-explores every option of every choice.
- Don't open a `@voiceover` block across a label/jump/choice/chapter boundary
  (validator ERROR): flow control ends the prerendered group.

### Full directive set (ported, unchanged semantics)

`@bg <id> [fade|cut] [ms]` · `@cg <id> [fade|cut]` (clears sprites; put a
`@sprite` AFTER the `@cg` to layer a figure) · `@sprite <char> <expr> [slot]
[slide]` (slot defaults per speaker declaration) · `@clear [all|left|center|right]`
· `@bgm <id> [cut]` (crossfade default; duplicate @bgm never restarts the
track; `@bgm stop`) · `@sfx <id>` · `@hold` (textbox hidden, wait one click)
· `@voiceover on|off|over` (narrator layer: on = on black, over = over the
scene; bare lines inside are the group, revealed one per click, pre-laid-out
so nothing moves) · `@textbox hide|show` · `@pause <ms>` · `@fadeout [ms]`
(whole scene to black as one unit) · `@flash <white|black> <fadeMs> [holdMs]`
· `@tint night|dusk|dawn|firelight|off` · `@autoplay <ms>|off` (scoped
auto-advance, honored even with the global setting off) · `@small` / `@slow`
(attach to the NEXT line) · `@chapter <n> <title>` (drives the indicator,
menu, and a black-curtain transition; numbers must be exactly 1..N, order of
appearance free) · `@montage begin [secs]` / `@montage end` · `@overlay <kind>`
+ `> lines` + `@overlay end` (renders a centered inscription-style card; see
deviations) · `@note`.

Asset ids resolve through `assets/manifest.json`
(`bg` / `cg` / `sprites` (`char.expr`) / `ui` / `audio`). Missing image =
labeled placeholder card; missing audio = silent no-op (validator: image
misses are ERRORS, audio misses are warnings — wire @bgm now, drop files
later).

## Save format

`{ pc, choices: {"<choicePc>": optIdx}, seenLabels: [names], seen: base64
bitmap of executed pcs, fin, ts }` — written to localStorage AND a cookie on
every displayed line (newer `ts` wins on load; the bitmap is dropped from the
cookie if the record nears the 4KB cap and merged back from localStorage).
Resume/chapter-jump/rollback = silent replay from 0 following `choices`
(state effects only, no presentation effects, never past an unanswered or
re-presented choice). `path` (executed pcs) is rebuilt by the same walk;
backlog and rollback derive from it, never from linear pc order. Skip mode
and unread-gating use the `seen` bitmap (there is no maxPc integer).
Chapter list: a chapter unlocks when its pc is reachable on the CURRENT
choices AND has been read; branches not on the current path show locked.

## Deviations from ENGINE-SPEC.md / reference (with reasons)

1. **@title implemented** (spec marked it optional) — it was cheap and the
   endings design wants it. Rewind-to-last-choice semantics as above.
2. **Reference's RPG status screens / floor markers not ported.** Story-
   specific (LESSONS said give such overlays a plugin seam). `@overlay <kind>`
   renders ANY kind as the generic centered inscription card; a future
   status-like screen gets its own renderer keyed on `kind`.
3. **Voiceover "bubble" mode dropped** (kept on/off/over) — undocumented
   story-specific extra in the reference.
4. **Textbox/name plate are CSS-drawn** (navy panel, amber border) instead of
   PIL-drawn frame images; `ui.ui_title` and `ui.placeholder_card` manifest
   hooks remain. Reason: no frame art exists yet; CSS keeps exact geometry.
5. **Cut per spec:** jukebox, voice-acting hooks, spoiler notice, title-music
   continuity (title always requests `bgm_title`, silently absent for now),
   plus the reference's "unlock all chapters" button (meaningless under
   path-gated chapters) and title-screen chapter-progress readout (the
   indicator is in-play only; chapter progress lives in the Chapters menu).
6. **`fin` does not unlock all chapters** (reference behavior) — with branches
   that would unlock unvisited branch chapters; unlocking stays
   reachable+read.
7. **Demo script.md** is in place instead of the (incomplete) real draft —
   see the status note above; the draft is preserved, nothing lost.
8. Placeholder art (`assets/bg`, `assets/sprites`, `assets/ui`) is generated
   with ImageMagick so the validator's files-exist check is meaningful; the
   art pipeline replaces the files without touching the manifest ids.

## Known-subtle behaviors (don't "fix")

- Duplicate `@bgm` (and every seek) is a no-op on the playing track by design.
- Deferred hides carry cancellation (voiceover hide timer, sprite-slot
  generation counter); keep that pattern for anything new.
- A click while reviewing (rolled back) returns to the present and EATS the
  click — except when the review landed on a choice, where clicking an option
  commits the rollback (that's the re-pick feature).
- Chapter fades arm only on click-driven forward play (`chapArmed`), never on
  seeks; picking a choice option counts as forward play.
- The advance-until predicate in the e2e checks BEFORE clicking so a choice is
  never accidentally picked by the advance key; keep that if extending it.

## Verification (2026-07-09)

- `node tools/validate.js` → exit 0: 44 instructions, 2 chapters, 5 labels,
  3 speakers; DFS: 2 terminations + 2 rejoins, longest path ≈ 15 beats;
  0 errors, 3 warnings (absent bgm files — intentional).
- `node tools/e2e.js` → E2E PASSED, 36/36 checks, 0 console errors,
  0 HTTP≥400; screenshots `qa/e2e-01…08.png` (title, choice, seen-marker,
  resume, rollback-choice, back-at-title, chapters).
