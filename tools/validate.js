#!/usr/bin/env node
/* PLAN A script validator. Uses the engine's REAL parser (module.exports
 * escape hatch in engine.js) — never a reimplementation.
 * Exit 1 on any error; warnings don't fail the build.
 *
 * Checks:
 *  - parser-reported authoring problems (undeclared speakers, dup labels,
 *    unclosed/empty @choice blocks, bad options/@chapter) -> ERROR
 *  - unknown directives -> ERROR
 *  - every @jump / @choice option target exists -> ERROR
 *  - orphan labels (never targeted) -> WARN
 *  - label re-establishment: every jump/choice TARGET label must set @bg/@cg
 *    within its next 8 instructions (replays stay visually correct) -> WARN
 *  - image asset ids resolve in the manifest and exist on disk -> ERROR
 *    audio ids/files missing -> WARN (audio is optional by design)
 *  - chapter numbers form exactly 1..N, no duplicates -> ERROR
 *  - montage begin/end balance; @voiceover modes valid; no dialogue inside
 *    an active voiceover -> ERROR
 *  - DFS click-through of EVERY branch: each path must terminate at script
 *    end, @title, or a loop that re-presents a choice; a loop containing NO
 *    choice is a softlock -> ERROR
 *  - unused manifest assets -> INFO
 */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const { parseScript } = require(path.join(root, "engine.js"));

const scriptText = fs.readFileSync(path.join(root, "script.md"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "assets", "manifest.json"), "utf8"));
const S = parseScript(scriptText);
const { ins, chapters, speakers, labels } = S;

const errors = [];
const warnings = [];
const info = [];
const loc = (c) => "line " + (c && c.line ? c.line : "?");

/* 1. parser-reported authoring problems are errors */
for (const w of S.warnings) errors.push(w);

/* 2. unknown directives */
for (const c of ins)
  if (c.op === "unknown") errors.push(loc(c) + ": unknown directive @" + c.name);

/* 2b. @dashboard: unrecognized keys are ignored at render time -> WARN (not error) */
for (const c of ins)
  if (c.op === "dashboard" && c.unknownKeys)
    for (const uk of c.unknownKeys)
      warnings.push("line " + uk.line + ": unknown @dashboard key '" + uk.key + "' (ignored)");

/* 3. jump/choice targets exist; collect targeted labels */
const targeted = new Set();
for (const c of ins) {
  if (c.op === "jump") {
    if (labels[c.target] === undefined) errors.push(loc(c) + ": @jump to missing label '" + c.target + "'");
    else targeted.add(c.target);
  } else if (c.op === "choice") {
    for (const o of c.options) {
      if (labels[o.target] === undefined)
        errors.push("line " + o.line + ": choice option '" + o.text + "' -> missing label '" + o.target + "'");
      else targeted.add(o.target);
    }
  }
}

/* 4. orphan labels */
for (const name in labels)
  if (!targeted.has(name))
    warnings.push(loc(ins[labels[name]]) + ": label '" + name + "' is never a @jump/@choice target");

/* 5. label re-establishment rule (targets only) */
for (const name of targeted) {
  const at = labels[name];
  if (at === undefined) continue;
  let ok = false;
  for (let j = at + 1; j <= at + 8 && j < ins.length; j++) {
    const op = ins[j].op;
    if (op === "bg" || op === "cg") { ok = true; break; }
    if (op === "label" || op === "jump" || op === "choice" || op === "title") break;
  }
  if (!ok)
    warnings.push(loc(ins[at]) + ": label '" + name + "' is a branch target but has no @bg/@cg in its first 8 instructions (replay may show a stale scene)");
}

/* 6. assets: images must resolve AND exist; audio is optional (warn) */
const exists = (p) => { try { return fs.existsSync(path.join(root, p)); } catch (e) { return false; } };
// CG ids the engine draws as built-in SVG charts (no image asset; see engine.js CHART_IDS)
const CHART_IDS = new Set(["cg_chart_explosion", "cg_chart_labor", "cg_dividend"]);
const usedIds = new Set();
function checkImg(kind, id, c) {
  const key = kind + ":" + id;
  usedIds.add(key);
  if (kind === "cg" && CHART_IDS.has(id)) return; // engine-drawn chart, not a manifest asset
  const p = manifest[kind] && manifest[kind][id];
  if (!p) { errors.push(loc(c) + ": " + kind + " id '" + id + "' not in manifest"); return; }
  if (!exists(p)) errors.push(loc(c) + ": " + kind + " '" + id + "' -> missing file " + p);
}
function checkAudio(id, c) {
  if (id === "stop") return;
  usedIds.add("audio:" + id);
  const p = manifest.audio && manifest.audio[id];
  if (!p) { warnings.push(loc(c) + ": audio id '" + id + "' not in manifest (plays silently)"); return; }
  if (!exists(p)) warnings.push(loc(c) + ": audio '" + id + "' -> missing file " + p);
}
for (const c of ins) {
  if (c.op === "bg") checkImg("bg", c.id, c);
  else if (c.op === "cg") checkImg("cg", c.id, c);
  else if (c.op === "sprite") checkImg("sprites", c.char + "." + c.expr, c);
  else if (c.op === "bgm" || c.op === "sfx") checkAudio(c.id, c);
}
/* every manifest image path must exist on disk (audio/ui: warn) */
for (const kind of ["bg", "cg", "sprites"])
  for (const id in manifest[kind] || {})
    if (!exists(manifest[kind][id]))
      errors.push("manifest: " + kind + "." + id + " -> missing file " + manifest[kind][id]);
for (const kind of ["audio", "ui"])
  for (const id in manifest[kind] || {})
    if (!exists(manifest[kind][id]))
      warnings.push("manifest: " + kind + "." + id + " -> missing file " + manifest[kind][id]);

/* 7. chapters: numbers are exactly 1..N, no duplicates (count derived, never hardcoded) */
{
  const ns = chapters.map((c) => c.n).sort((a, b) => a - b);
  const dup = ns.find((n, k) => k > 0 && ns[k - 1] === n);
  if (dup !== undefined) errors.push("duplicate @chapter number " + dup);
  for (let k = 0; k < ns.length; k++)
    if (ns[k] !== k + 1) { errors.push("chapter numbers not contiguous 1.." + ns.length + " (got " + ns.join(",") + ")"); break; }
}

/* 8. voiceover / montage balance (linear scan) */
{
  let vo = "off", montage = false;
  for (const c of ins) {
    if (c.op === "voiceover") {
      if (!["on", "off", "over"].includes(c.mode)) errors.push(loc(c) + ": bad @voiceover mode '" + c.mode + "' (want on|off|over)");
      vo = c.mode;
    } else if (c.op === "fadeout") vo = "off";
    else if (c.op === "say" && vo !== "off") errors.push(loc(c) + ": dialogue inside an active @voiceover block");
    else if (c.op === "label" || c.op === "jump" || c.op === "choice" || c.op === "title") {
      if (vo !== "off") { errors.push(loc(c) + ": flow control (" + c.op + ") inside an open @voiceover block"); vo = "off"; }
    } else if (c.op === "montage") {
      if (montage) errors.push(loc(c) + ": nested @montage begin");
      montage = true;
    } else if (c.op === "montage_end") {
      if (!montage) errors.push(loc(c) + ": @montage end without begin");
      montage = false;
    }
  }
  if (vo !== "off") errors.push("script ends inside an open @voiceover block");
  if (montage) errors.push("script ends inside an open @montage block");
}

/* 9. DFS click-through of every branch */
const BLOCKING = new Set(["say", "narrate", "hold", "pause", "overlay", "dashboard"]);
let pathsEnded = 0, endsAtTitle = 0, endsAtEnd = 0, loopsToChoice = 0, rejoins = 0, maxBeats = 0;
const exploredChoiceOpts = new Set(); // "choicePc:optIdx" — explore each option once
function explore(start, stack, inStack, beats) {
  let j = start;
  let guard = 0;
  while (true) {
    if (++guard > ins.length * 4 + 64) { errors.push("DFS guard tripped at pc " + j + " — pathological flow"); return; }
    if (j >= ins.length) { pathsEnded++; endsAtEnd++; maxBeats = Math.max(maxBeats, beats); return; }
    if (inStack.has(j)) {
      const cyc = stack.slice(stack.indexOf(j));
      if (cyc.some((p) => ins[p].op === "choice")) { pathsEnded++; loopsToChoice++; maxBeats = Math.max(maxBeats, beats); }
      else errors.push(loc(ins[j]) + ": infinite loop with no @choice inside it (softlock) at pc " + j);
      return;
    }
    inStack.add(j); stack.push(j);
    const c = ins[j];
    if (BLOCKING.has(c.op)) beats++;
    if (c.op === "jump") {
      const t = labels[c.target];
      if (t === undefined) return; // already reported
      j = t; continue;
    }
    if (c.op === "title") { pathsEnded++; endsAtTitle++; maxBeats = Math.max(maxBeats, beats); return; }
    if (c.op === "choice") {
      beats++;
      for (let oi = 0; oi < c.options.length; oi++) {
        const key = j + ":" + oi;
        const t = labels[c.options[oi].target];
        if (t === undefined) continue;
        if (exploredChoiceOpts.has(key)) {
          // option already explored from an earlier route: this path rejoins
          // verified territory and therefore terminates
          rejoins++;
          continue;
        }
        exploredChoiceOpts.add(key);
        explore(t, stack.slice(), new Set(inStack), beats);
      }
      return;
    }
    j++;
  }
}
const reached = new Set();
{
  // run DFS and also record global reachability for dead-code detection
  const origExplore = explore;
  // simple wrapper: mark every pc entered
  const mark = (stack) => { for (const p of stack) reached.add(p); };
  // monkey-patch via re-run: easiest is to collect inside explore — do a
  // second lightweight pass instead:
  origExplore(0, [], new Set(), 0);
  // reachability pass (choices: all options)
  const q = [0];
  while (q.length) {
    let j = q.pop();
    while (j < ins.length && !reached.has(j)) {
      reached.add(j);
      const c = ins[j];
      if (c.op === "jump") { const t = labels[c.target]; if (t === undefined) break; j = t; continue; }
      if (c.op === "choice") { for (const o of c.options) { const t = labels[o.target]; if (t !== undefined) q.push(t); } break; }
      if (c.op === "title") break;
      j++;
    }
  }
}
for (let j = 0; j < ins.length; j++)
  if (!reached.has(j)) { warnings.push(loc(ins[j]) + ": unreachable instruction (op " + ins[j].op + ") at pc " + j); }

/* 10. speakers sanity + unused-asset report */
if (!Object.keys(speakers).length) warnings.push("no @speaker declarations in the script header");
for (const kind of ["bg", "cg", "sprites", "audio"])
  for (const id in manifest[kind] || {})
    if (!usedIds.has(kind + ":" + id) && !(kind === "audio" && (id === "bgm_title" || id.startsWith("sfx"))))
      info.push("unused asset: " + kind + "." + id);

/* ---- report ---- */
console.log("PLAN A validate: " + ins.length + " instructions, " + chapters.length + " chapters, " +
  Object.keys(labels).length + " labels, " + Object.keys(speakers).length + " speakers");
console.log("branch coverage: " + pathsEnded + " path terminations (" + endsAtEnd + " at script end, " +
  endsAtTitle + " at @title, " + loopsToChoice + " loop back to a choice, " + rejoins +
  " rejoin verified choices); longest path ≈ " + maxBeats + " blocking beats");
for (const m of info) console.log("  [info] " + m);
for (const m of warnings) console.log("  [warn] " + m);
for (const m of errors) console.log("  [ERROR] " + m);
console.log(errors.length + " errors, " + warnings.length + " warnings");
process.exit(errors.length ? 1 : 0);
