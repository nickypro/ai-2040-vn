# Engine port + branching spec

Port the engine from `/tmp/claude-1000/-workspace/638c97f4-1bb2-4345-9818-a4c4a9666941/scratchpad/everything-that-hurt-you/`
(files: `engine.js`, `index.html`, `assets/manifest.json` structure, any UI asset
generation approach) into `/workspace/media/ai-2040-vn/`. Read that repo's
`claude-notes/LESSONS.md` §1, §2, §6, §7 first and honor every rule in §6.

Keep the architecture: single stage div, aspect 16/9, cqh units, script.md compiled
to instruction list, saves in localStorage+cookie, seek-by-replay, manifest-indirected
assets with graceful missing-asset degradation, Node-exported parser for the validator.

## Changes from the reference

1. **Speakers declared in script, not engine.** New header directive:
   `@speakers Name colorHex spritePrefix defaultSlot, ...` or one `@speaker` line each:
   `@speaker Niko #e8a35c niko right`. Unknown speaker in dialogue = validator error.
2. **No hardcoded chapter count.** Derive from script.
3. **Branching.** New directives:
   - `@label <name>` — jump target. No-op state-wise.
   - `@jump <name>` — unconditional goto.
   - `@choice` block:
     ```
     @choice
     * Plan D: Race to ASI -> plan_d
     * Plan A: Verified slowdown -> plan_a
     @endchoice
     ```
     Renders a centered menu (stage-styled buttons); textbox hidden; click on option
     jumps to its label. Options can carry a `[seen]`-style marker automatically:
     if the player has previously visited the option's target label (persisted in
     save), render a small check/dim tint on that option. Keyboard: up/down + enter.
   - `@title` — return to title screen (used at "The End" of branch endings if the
     player declines returning to 2029; simplest: endings just @jump back to the
     choice or to a label near the end; @title optional, implement if cheap).
4. **Save format.** `{pc, choices: {"<choicePc>": optIdx, ...}, seenLabels: [...],
   fin, ts}` (+ keep whatever else the reference saves). Path is deterministic given
   `choices`: to resume/seek, replay instructions from 0 following recorded choices
   (a choice with no record during seek = stop there, i.e. never seek past an
   unanswered choice). maxPc / furthest-read gating: keep a `seenPcs` bitmap
   (serialized compactly, e.g. base64 of a bit array) — skip mode and "unread text"
   logic use it instead of a single maxPc integer.
5. **Seek/backlog/rollback must follow the actual path**, not linear pc order:
   - Maintain `path` = array of executed pcs since script start (rebuild on resume by
     replay-with-choices). Backlog and rollback derive from `path`, not from scanning
     0..pc linearly.
   - Authoring rule (validator-enforced): the first 8 instructions after every @label
     that is a @jump/@choice target must re-establish state (@bg or @cg required;
     @clear implied allowed) so replays are visually correct. Validator warns if a
     label target lacks a @bg/@cg within 8 instructions.
6. **Rollback across a choice** re-presents the choice (player can pick differently;
   this truncates `choices` records at that point and clears downstream path).
7. Keep: @bg @cg @sprite @clear @bgm @sfx @hold @voiceover @textbox @pause @flash
   @tint @autoplay @small @slow @chapter @montage @overlay @note `|` mid-line pauses,
   `"..."` silence, dialogue font auto-fit, autosave every line, Continue, chapter
   jump (chapter list = chapters reachable on the CURRENT choices; chapters inside
   unvisited branches show locked), hold-Ctrl skip stopping at unread, hide-UI
   (Shift/CapsLock), settings (text speed, autoplay, music toggle, delete-all),
   first-run hint, rollback arrows.
   Cut (do NOT port): jukebox, voice-acting hooks, spoiler notice, title-music-
   continuity subtleties. BGM code stays but must silently no-op when files missing.
8. **Validator** (`tools/validate.js`, run with node, exit 1 on error): everything in
   LESSONS §2's validator list, plus: labels unique; every @jump/choice target exists;
   no orphan labels (warn); choice blocks closed; label re-establishment rule (warn);
   simulated click-through of EVERY branch (dfs over choices) terminates without
   running off the script end (every path must end at @title or an explicit `@jump`
   loop back to a choice, or script end); speakers declared.
9. **UI theme**: deep navy chrome (#0b0e1a-ish), warm amber accent (#e8a35c),
   thin-caps title styling. Placeholder cards for missing images must show the asset
   id (copy reference behavior).
10. **Demo script**: write a tiny `script.md` (10-20 lines, 2 chapters, one @choice
    with 2 options each jumping to a short labeled segment, one rejoin) so the engine
    is testable before the real script lands. The real script will replace it.
11. **E2E test** (`tools/e2e.js`, Playwright against `python3 -m http.server`):
    boots clean (no console errors, no HTTP>=400), click-through both demo branches,
    choice renders, save/resume mid-branch works, rollback across the choice
    re-presents it. Screenshots to `qa/`. Chromium is installed (channel: system
    chrome at /usr/bin or via headless-browser tool's node_modules; check
    `/workspace/tools/headless-browser/` for a working playwright install to reuse).

Deliverables in /workspace/media/ai-2040-vn/: index.html, engine.js, script.md
(demo), assets/manifest.json (skeleton), tools/validate.js, tools/e2e.js, qa/
screenshots, and a short claude-notes/ENGINE-NOTES.md documenting deviations.
Do not commit. Verify with the e2e before declaring done.
