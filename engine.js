/* ============================================================
 * PLAN A — branching visual-novel engine
 * Ported from "Everything That Hurt You" (kinetic engine) and
 * extended with @speaker declarations, @label/@jump/@choice
 * branching, path-aware saves/backlog/rollback, and @title.
 * Vanilla JS, no dependencies, no build step. Serve statically.
 * ============================================================ */
"use strict";

/* ---------------- parser ----------------
 * Exported for Node (tools/validate.js uses the REAL parser). */

// recognized @dashboard keys; anything else is ignored (validator WARN, not error)
const DASH_KEYS = new Set([
  "year", "employment", "dividend", "safety", "workforce", "compute", "gdp", "capability", "trajectory",
]);

function parseScript(text) {
  const raw = text.split(/\r?\n/);
  const ins = [];
  const chapters = [];
  const speakers = {}; // Name -> { color, prefix, slot }
  const labels = {};   // label name -> instruction index
  const warnings = []; // authoring problems; the validator treats these as errors
  let pendingSmall = false; // @small marks the NEXT line
  let pendingSlow = false;  // @slow marks the NEXT line
  let i = 0;
  const addSpeaker = (spec, ln) => {
    const p = spec.trim().split(/\s+/);
    if (p.length < 2) { warnings.push("line " + ln + ": bad speaker declaration: " + spec); return; }
    // re-join multi-word names? No: names are single tokens up to the color.
    // Multi-word names: everything before the #color token is the name.
    const ci = p.findIndex((t) => /^#[0-9a-fA-F]{3,8}$/.test(t));
    if (ci < 1) { warnings.push("line " + ln + ": speaker declaration needs a #hex color: " + spec); return; }
    const name = p.slice(0, ci).join(" ");
    // spritePrefix "-" declares a speaker with NO sprite (e.g. the POV
    // character): no dim association, no default slot ownership
    const rawPrefix = p[ci + 1] || name.toLowerCase().replace(/\s+/g, "");
    speakers[name] = {
      color: p[ci],
      prefix: rawPrefix === "-" ? null : rawPrefix,
      slot: p[ci + 2] || "left",
    };
  };
  while (i < raw.length) {
    const line = raw[i].trim();
    const ln = i + 1;
    i++;
    if (!line) continue;
    if (line.startsWith("@")) {
      const m = line.match(/^@(\w+)\s*(.*)$/);
      if (!m) continue;
      const name = m[1];
      const rest = m[2].trim();
      switch (name) {
        case "note":
          break;
        case "speaker":
          addSpeaker(rest, ln);
          break;
        case "speakers":
          for (const s of rest.split(",")) if (s.trim()) addSpeaker(s, ln);
          break;
        case "label":
          if (!rest) { warnings.push("line " + ln + ": @label needs a name"); break; }
          if (labels[rest] !== undefined) warnings.push("line " + ln + ": duplicate @label " + rest);
          labels[rest] = ins.length;
          ins.push({ op: "label", name: rest, line: ln });
          break;
        case "jump":
          if (!rest) { warnings.push("line " + ln + ": @jump needs a label"); break; }
          ins.push({ op: "jump", target: rest, line: ln });
          break;
        case "choice": {
          const options = [];
          let closed = false;
          while (i < raw.length) {
            const l = raw[i].trim();
            const oln = i + 1;
            i++;
            if (!l) continue;
            if (l === "@endchoice") { closed = true; break; }
            const om = l.match(/^\*\s*(.+?)\s*->\s*(\S+)\s*$/);
            if (om) options.push({ text: om[1], target: om[2], line: oln });
            else warnings.push("line " + oln + ": bad @choice option (want '* Text -> label'): " + l);
          }
          if (!closed) warnings.push("line " + ln + ": @choice block never closed with @endchoice");
          if (!options.length) warnings.push("line " + ln + ": @choice block has no options");
          // optional presentation mode: `@choice flowchart` renders the 2029
          // decision-tree; `@choice endings` renders the end-game endings gallery;
          // anything else (incl. bare `@choice`) is the plain list.
          const mode = (rest === "flowchart" || rest === "endings") ? rest : "list";
          if (rest && mode === "list")
            warnings.push("line " + ln + ": unknown @choice mode '" + rest + "' (want 'flowchart', 'endings', or none)");
          ins.push({ op: "choice", options, mode, line: ln });
          break;
        }
        case "title":
          ins.push({ op: "title", line: ln });
          break;
        case "bg": {
          const [id, trans, ms] = rest.split(/\s+/);
          ins.push({ op: "bg", id, trans: trans || "fade", ms: +ms || 0, line: ln });
          break;
        }
        case "cg": {
          const [id, trans] = rest.split(/\s+/);
          ins.push({ op: "cg", id, trans: trans || "fade", line: ln });
          break;
        }
        case "sprite": {
          const [char, expr, slot, anim] = rest.split(/\s+/);
          // slot may be omitted: resolved at run time from the speaker
          // declaration whose prefix matches the char id's first segment
          ins.push({ op: "sprite", char, expr, slot: slot || null, anim: anim || null, line: ln });
          break;
        }
        case "clear":
          ins.push({ op: "clear", what: rest || "all", line: ln });
          break;
        case "voiceover":
          ins.push({ op: "voiceover", mode: rest, line: ln }); // on | off | over
          break;
        case "flash": {
          const [color, ms, hold] = rest.split(/\s+/);
          ins.push({ op: "flash", color: color || "white", ms: +ms || 300, hold: +hold || 0, line: ln });
          break;
        }
        case "overlay": {
          if (rest === "end") break; // stray end; ignore
          const kind = rest.split(/\s+/)[0] || "inscription";
          const lines = [];
          while (i < raw.length) {
            const l = raw[i].trim();
            i++;
            if (l === "@overlay end") break;
            if (l.startsWith(">")) lines.push(l.replace(/^>\s?/, ""));
          }
          ins.push({ op: "overlay", kind, lines, line: ln });
          break;
        }
        case "montage": {
          const p = rest.split(/\s+/);
          if (p[0] === "begin") ins.push({ op: "montage", secs: +p[1] || 4, line: ln });
          else ins.push({ op: "montage_end", line: ln });
          break;
        }
        case "enddashboard":
          break; // stray terminator; a well-formed block is consumed by @dashboard
        case "dashboard": {
          if (rest === "end") break; // tolerate "@dashboard end" as a stray
          // Blocking status card. Reads `key: value` lines into a data object
          // until @enddashboard. Unknown keys are collected separately so the
          // validator can WARN (parser `warnings` are treated as errors).
          const data = {};
          const unknownKeys = [];
          let closed = false;
          while (i < raw.length) {
            const l = raw[i].trim();
            const dln = i + 1;
            i++;
            if (l === "@enddashboard") { closed = true; break; }
            if (!l || l.startsWith("@")) continue; // blank / @note / stray directive
            const km = l.match(/^([A-Za-z_]+)\s*:\s*(.+)$/);
            if (!km) { warnings.push("line " + dln + ": bad @dashboard line (want 'key: value'): " + l); continue; }
            const key = km[1].toLowerCase();
            if (DASH_KEYS.has(key)) data[key] = km[2].trim();
            else unknownKeys.push({ key, line: dln });
          }
          if (!closed) warnings.push("line " + ln + ": @dashboard block never closed with @enddashboard");
          ins.push({ op: "dashboard", data, unknownKeys, line: ln });
          break;
        }
        case "pause":
          ins.push({ op: "pause", ms: +rest || 800, line: ln });
          break;
        case "fadeout":
          ins.push({ op: "fadeout", ms: +rest || 800, line: ln });
          break;
        case "hold":
          ins.push({ op: "hold", line: ln });
          break;
        case "small":
          pendingSmall = true;
          break;
        case "slow":
          pendingSlow = true;
          break;
        case "autoplay":
          ins.push({ op: "autoplay", ms: rest === "off" ? null : (+rest || 3000), line: ln });
          break;
        case "textbox":
          ins.push({ op: "textbox", show: rest !== "hide", line: ln });
          break;
        case "tint":
          ins.push({ op: "tint", mode: rest || "off", line: ln });
          break;
        case "sfx":
          ins.push({ op: "sfx", id: rest, line: ln });
          break;
        case "bgm": {
          const p = rest.split(/\s+/);
          ins.push({ op: "bgm", id: p[0], instant: p[1] === "cut", line: ln });
          break;
        }
        case "chapter": {
          const cm = rest.match(/^(\d+)\s+(.*)$/);
          if (!cm) { warnings.push("line " + ln + ": bad @chapter (want '@chapter <n> <title>'): " + rest); break; }
          const ch = { op: "chapter", n: +cm[1], title: cm[2], at: ins.length, line: ln };
          chapters.push(ch);
          ins.push(ch);
          break;
        }
        default:
          ins.push({ op: "unknown", name, rest, line: ln });
      }
    } else {
      const dm = line.match(/^([A-Za-z][A-Za-z0-9 .'-]{0,30}?):\s+(.*)$/);
      if (dm && speakers[dm[1]]) {
        ins.push({ op: "say", speaker: dm[1], text: dm[2], small: pendingSmall, slow: pendingSlow, line: ln });
        pendingSmall = false; pendingSlow = false;
      } else {
        // a dialogue-looking line whose name isn't declared is an authoring
        // error (validator gate) — but the engine still shows it as narration
        if (dm && /^([A-Z][\w.'-]*)( [A-Z][\w.'-]*){0,2}$/.test(dm[1]))
          warnings.push("line " + ln + ": dialogue with undeclared speaker \"" + dm[1] + "\" (add an @speaker line)");
        ins.push({ op: "narrate", text: line, small: pendingSmall, slow: pendingSlow, line: ln });
        pendingSmall = false; pendingSlow = false;
      }
    }
  }
  return { ins, chapters, speakers, labels, warnings };
}

/* *word* -> emphasis tokens; used by the typer and the backlog */
function emphasisTokens(text) {
  const tokens = [];
  const parts = text.split(/\*([^*]+)\*/);
  for (let j = 0; j < parts.length; j++) {
    if (parts[j] === "") continue;
    tokens.push({ t: parts[j], em: j % 2 === 1 });
  }
  return tokens;
}

/* node export for the validation harness */
if (typeof module !== "undefined" && module.exports) {
  module.exports = { parseScript, emphasisTokens };
}

/* ---------------- player (browser only) ---------------- */

if (typeof document !== "undefined") (function () {
  const APP_VERSION = "1.1.1"; // shown on the title screen and in Settings; bump to release
  const $ = (id) => document.getElementById(id);
  const SAVE_KEY = "plana_save";
  const SETTINGS_KEY = "plana_settings";
  const HINT_KEY = "plana_hinted";
  const DEFAULT_SETTINGS = { typeMs: 14, autoplay: false, autoplayDelayMs: 900, showChapter: "number", musicOn: true, musicVolume: 0.7 };
  const TINTS = {
    night: "rgba(14, 24, 66, 0.32)",
    dusk: "rgba(120, 60, 20, 0.22)",
    dawn: "rgba(232, 163, 92, 0.12)",
    firelight: "rgba(255, 140, 40, 0.14)",
    off: "rgba(0,0,0,0)",
  };

  let MANIFEST = null;
  let SCRIPT = null;

  let pc = 0;
  let finished = false;
  let waiting = false;
  let autoTimer = null;
  let voHideTimer = null;
  let typer = null;
  let mode = "title";       // title | play | menu
  // --- branching state ---
  let choiceRecords = {};   // { "<choicePc>": optIdx } — the CURRENT path's answers
  let seenLabels = new Set(); // labels ever visited (drives the ✓ marker on options)
  let seenPcs = new Uint8Array(1); // furthest-read bitmap (replaces maxPc)
  let path = [];            // pcs executed since script start, in order (rebuilt by seek)
  let choiceActive = false; // a choice menu is on screen awaiting a pick
  let choiceSel = 0;        // keyboard-highlighted option (an OPTION index)
  let flowLeaves = null;    // flowchart mode: [{optIdx, el}] in visual L->R order, else null
  let flowChevron = null;   // flowchart mode: the down-chevron marking the highlighted leaf
  let presentPathSnap = null; // path snapshot taken when review (rollback) starts
  // --- rollback / review ---
  let history = [];         // pcs of blocking stops this play session
  let reviewIdx = 0;
  let reviewing = false;
  let uiHidden = false;
  let shiftPeek = false;
  let capsSticky = false;
  let musicEnabled = true;
  let audioUnlocked = false;
  let chapFading = false;
  let chapArmed = false;
  const CHAP_FADE_MS = 1500;
  const CHAP_HOLD_MS = 350;
  const st = freshState();
  let settings = loadSettings();

  function loadSettings() {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch (e) {}
    const merged = Object.assign({}, DEFAULT_SETTINGS, s || {});
    if (merged.showChapter === true) merged.showChapter = "full";
    else if (merged.showChapter === false) merged.showChapter = "off";
    return merged;
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  function freshState() {
    return {
      bg: null, cg: null,
      sprites: { left: null, center: null, right: null },
      tint: "off",
      vo: "off", voLines: [], voDeferred: false, voDeferredPc: null,
      voGroup: [], voShown: 0, voSeg: 0, voPartEls: [],
      autoAdvanceMs: null,
      montage: null,
      bgm: null,
      inscription: null,
      chapter: 0,
      prevDash: null, // last dashboard's parsed numbers, for trend arrows
    };
  }

  /* ---------- speakers (declared in the script header) ---------- */

  function speakerInfo(name) {
    return (SCRIPT && SCRIPT.speakers[name]) || null;
  }
  function slotForChar(char) {
    if (!char) return "left";
    const base = char.split("_")[0];
    for (const nm in SCRIPT.speakers) {
      const pf = SCRIPT.speakers[nm].prefix;
      if (pf && pf === base) return SCRIPT.speakers[nm].slot;
    }
    return "left";
  }
  function spriteSlot(c) { return c.slot || slotForChar(c.char); }

  /* ---------- assets (manifest-indirected; every miss degrades) ---------- */

  function assetPath(kind, id) {
    const sect = MANIFEST[kind];
    return (sect && sect[id]) || null;
  }
  function spritePath(char, expr) {
    return assetPath("sprites", char + "." + expr);
  }
  const preloaded = new Map();
  function preload(path2) {
    if (!path2 || preloaded.has(path2)) return;
    const img = new Image();
    img.src = path2;
    preloaded.set(path2, img);
  }
  function preloadAt(j) {
    const c = SCRIPT.ins[j];
    if (!c) return;
    if (c.op === "bg") preload(assetPath("bg", c.id));
    else if (c.op === "cg") preload(assetPath("cg", c.id));
    else if (c.op === "sprite") preload(spritePath(c.char, c.expr));
  }
  // scan ahead ~24 instructions FOLLOWING the flow: through @jump, and a few
  // instructions into every option of an upcoming @choice
  function preloadAhead() {
    const queue = [[pc + 1, 24]];
    const visited = new Set();
    while (queue.length) {
      let [j, budget] = queue.shift();
      while (budget > 0 && j < SCRIPT.ins.length && !visited.has(j)) {
        visited.add(j);
        const c = SCRIPT.ins[j];
        if (c.op === "jump") { const t = SCRIPT.labels[c.target]; if (t === undefined) break; j = t; continue; }
        if (c.op === "choice") {
          for (const o of c.options) {
            const t = SCRIPT.labels[o.target];
            if (t !== undefined) queue.push([t, 8]);
          }
          break;
        }
        if (c.op === "title") break;
        preloadAt(j);
        budget--; j++;
      }
    }
  }

  /* full-screen image element; falls back to a labeled placeholder card */
  function makeLayerImg(kind, id) {
    const wrap = document.createElement("div");
    wrap.className = "layer-img";
    const path2 = assetPath(kind, id);
    if (path2) {
      wrap.style.backgroundImage = "url('" + path2 + "')";
    } else {
      const card = assetPath("ui", "placeholder_card");
      if (card) wrap.style.backgroundImage = "url('" + card + "')";
      wrap.classList.add("missing");
      const label = document.createElement("div");
      label.className = "placeholder-label";
      label.textContent = id;
      wrap.appendChild(label);
    }
    return wrap;
  }

  function swapLayer(container, el, trans, ms) {
    const old = Array.from(container.children);
    container.appendChild(el);
    if (trans === "cut") {
      el.style.opacity = "1";
      old.forEach((o) => o.remove());
    } else {
      if (ms > 0) el.style.transition = "opacity " + ms + "ms ease";
      el.style.opacity = "0";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => { el.style.opacity = "1"; })
      );
      setTimeout(() => old.forEach((o) => o.remove()), (ms > 0 ? ms : 600) + 100);
    }
  }

  /* ---------- render primitives ----------
     BG and CG share ONE scene layer with replace semantics (two independently
     cross-fading layers caused ghost/flash bugs in the reference build). */
  function setBg(id, trans, instant, ms) {
    st.bg = id; st.cg = null;
    swapLayer($("bglayer"), makeLayerImg("bg", id), instant ? "cut" : trans, ms);
    clearInscription();
    hideDashboard();
  }
  function showCg(id, trans, instant) {
    st.cg = id; st.bg = null;
    execClear("all", instant); // a CG is full art: it clears sprites
    swapLayer($("bglayer"), makeLayerImg("cg", id), instant ? "cut" : trans);
    clearInscription();
    hideDashboard();
  }
  function clearScene(trans) {
    st.cg = null; st.bg = null;
    hideDashboard();
    const c = $("bglayer");
    if (!c.children.length) return;
    if (trans === "cut") {
      c.innerHTML = "";
    } else {
      Array.from(c.children).forEach((o) => {
        o.style.opacity = "0";
        setTimeout(() => o.remove(), 700);
      });
    }
  }

  let sprGen = 0; // generation counter: cancels pending deferred slot wipes
  function setSprite(char, expr, slot, instant, anim) {
    st.sprites[slot] = { char, expr };
    const holder = $("spr-" + slot);
    holder.dataset.gen = ++sprGen;
    const path2 = spritePath(char, expr);
    let img = holder.querySelector("img");
    const entering = !img || holder.dataset.char !== char;
    if (!img) {
      img = document.createElement("img");
      img.alt = "";
      holder.appendChild(img);
    }
    img.onerror = () => { img.src = assetPath("ui", "placeholder_card") || ""; };
    img.src = path2 || (assetPath("ui", "placeholder_card") || "");
    holder.dataset.char = char;
    holder.style.display = "";
    if (entering && !instant) {
      holder.style.opacity = "0";
      if (anim === "slide")
        holder.style.transform = "translateX(" + (slot === "right" ? "45%" : "-45%") + ")";
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          holder.style.opacity = "1";
          if (anim === "slide") holder.style.transform = "translateX(0)";
        })
      );
    } else {
      holder.style.opacity = "1";
      holder.style.transform = "translateX(0)";
    }
  }
  function clearSlot(slot, instant) {
    st.sprites[slot] = null;
    const holder = $("spr-" + slot);
    delete holder.dataset.char;
    const gen = String(++sprGen);
    holder.dataset.gen = gen;
    if (instant) {
      holder.style.display = "none";
      holder.innerHTML = "";
    } else {
      holder.style.opacity = "0";
      setTimeout(() => {
        if (holder.dataset.gen !== gen) return; // a newer sprite took the slot
        holder.style.display = "none";
        holder.innerHTML = "";
      }, 400);
    }
  }
  function execClear(what, instant) {
    if (what === "all") {
      clearSlot("left", instant);
      clearSlot("center", instant);
      clearSlot("right", instant);
    } else clearSlot(what, instant);
  }

  function applyDim(speaker) {
    const info = speakerInfo(speaker);
    const pref = info ? info.prefix : null;
    for (const slot of ["left", "center", "right"]) {
      const holder = $("spr-" + slot);
      const s = st.sprites[slot];
      if (!s) continue;
      const base = s.char.split("_")[0];
      const speaking = pref && (s.char === pref || base === pref);
      holder.style.filter = !pref || speaking ? "none" : "brightness(0.6)";
    }
  }

  function setTint(mode2) {
    st.tint = mode2;
    $("tint").style.background = TINTS[mode2] || TINTS.off;
  }

  function flash(color, ms, holdMs) {
    const f = $("flash");
    f.style.transition = "none";
    f.style.background = color === "black" ? "#000" : "#fff";
    f.style.opacity = "1";
    const startFade = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          f.style.transition = "opacity " + ms + "ms ease-out";
          f.style.opacity = "0";
        })
      );
    if (holdMs > 0) setTimeout(startFade, holdMs);
    else startFade();
  }

  /* ---------- textbox / dialogue ---------- */

  function showTextbox(speaker) {
    $("textbox").style.display = "";
    const info = speakerInfo(speaker);
    $("namelabel").style.display = speaker ? "" : "none";
    $("namelabel").textContent = speaker || "";
    $("namelabel").style.color = info ? info.color : "";
  }
  function hideTextbox() {
    $("textbox").style.display = "none";
  }

  /* long paragraphs must fit the box: pre-measure at full text and step the
     font size down until nothing clips */
  const DIALOG_SIZES = ["3.4cqh", "3.0cqh", "2.7cqh", "2.4cqh", "2.15cqh", "1.95cqh"];
  function fitDialogFont(text) {
    const node = $("dialog");
    node.textContent = text;
    for (const size of DIALOG_SIZES) {
      node.style.fontSize = size;
      if (node.scrollHeight <= node.clientHeight + 2) break;
    }
    node.textContent = "";
  }

  // Auto-insert a mid-line click-pause ("|") at sentence boundaries so the reader
  // advances sentence by sentence within a beat (kinetic-novel rhythm). Skips when
  // the author placed explicit "|" (they took control), respects abbreviations and
  // ellipses, and won't pause after a very short exclamation ("Hi!").
  const PACE_ABBR = new Set(["Dr","Mr","Mrs","Ms","St","Sen","Gen","Rep","Sgt","Lt",
    "Jr","Sr","vs","etc","Inc","No","Gov","Col","Capt","U.S","a.m","p.m","Mt","Ave"]);
  function autoPace(text) {
    if (text.indexOf("|") >= 0) return text;
    const t = text.replace(/\.\.\./g, "…"); // shield ellipses
    const raw = t.split(/(?<=[.!?]["'\)\]]?)\s+/);
    if (raw.length < 2) return text;
    const out = [];
    for (let s of raw) {
      s = s.trim();
      if (!s) continue;
      if (!out.length) { out.push(s); continue; }
      const prev = out[out.length - 1];
      const lw = (prev.match(/([^\s.!?]+)[.!?]["'\)\]]?$/) || [])[1] || "";
      const endsAbbr = PACE_ABBR.has(lw) || /^[A-Z]$/.test(lw); // abbrev or single initial
      const shortExclaim = prev.replace(/[*_]/g, "").length < 14 && /[!?]["'\)\]]?$/.test(prev);
      if (endsAbbr || shortExclaim) out[out.length - 1] = prev + " " + s;
      else out.push(s);
    }
    return out.join(" | ").replace(/…/g, "...");
  }
  function startTyper(text, italicAll, small, slow) {
    const node = $("dialog");
    node.innerHTML = "";
    text = autoPace(text);
    // "|" = mid-line pause: type up to it, wait for a click, continue.
    // Fit the font against the FULL text so the size never changes mid-line.
    fitDialogFont(text.replace(/\s*\|\s*/g, " "));
    node.classList.toggle("small-line", !!small);
    if (small) node.style.fontSize = "1.9cqh";
    const segments = text.split("|").map((s) => {
      const tokens = emphasisTokens(s.trim());
      return { tokens, total: tokens.reduce((a, t) => a + t.t.length, 0) };
    });
    typer = { segments, segIdx: 0, count: 0, node, italicAll, atPause: false, slow: !!slow };
    tickTyper();
  }
  function renderTyper() {
    const { segments, segIdx, count, node, italicAll } = typer;
    node.innerHTML = "";
    for (let si = 0; si <= segIdx; si++) {
      if (si > 0) node.appendChild(document.createTextNode(" "));
      const seg = segments[si];
      let left = si < segIdx ? seg.total : count;
      for (const tk of seg.tokens) {
        if (left <= 0) break;
        const s = tk.t.slice(0, left);
        left -= tk.t.length;
        const span = document.createElement(tk.em || italicAll ? "em" : "span");
        span.textContent = s;
        node.appendChild(span);
      }
    }
    const segDone = count >= segments[segIdx].total;
    $("adv").style.visibility = segDone ? "visible" : "hidden";
  }
  function tickTyper() {
    if (!typer) return;
    const seg = typer.segments[typer.segIdx];
    const slow = typer.slow;
    const step2 = (!slow && settings.typeMs <= 0) ? seg.total : 1;
    const delay = slow ? 95 : settings.typeMs;
    typer.count = Math.min(typer.count + step2, seg.total);
    renderTyper();
    if (typer.count < seg.total) {
      typer.timer = setTimeout(tickTyper, delay);
    } else {
      typer.atPause = typer.segIdx < typer.segments.length - 1;
      maybeAutoplay();
    }
  }
  function finishTyperFully() {
    if (!typer) return;
    clearTimeout(typer.timer);
    typer.segIdx = typer.segments.length - 1;
    typer.count = typer.segments[typer.segIdx].total;
    typer.atPause = false;
    renderTyper();
  }
  function completeTyper() {
    if (!typer) return false;
    const seg = typer.segments[typer.segIdx];
    if (typer.count < seg.total) {
      clearTimeout(typer.timer);
      typer.count = seg.total;
      typer.atPause = typer.segIdx < typer.segments.length - 1;
      renderTyper();
      maybeAutoplay();
      return true;
    }
    if (typer.atPause) {
      typer.segIdx++;
      typer.count = 0;
      typer.atPause = false;
      tickTyper();
      return true;
    }
    return false;
  }

  /* ---------- voiceover (narrator layer: on-black or over-the-scene) ----------
     The overlay always fades AS ONE UNIT and its content is cleared only once
     the layer is fully hidden. Every deferred hide carries a cancellation
     (cancelVoHide) so a re-show can't be vanished by a stale timer. */
  function cancelVoHide() {
    if (voHideTimer) { clearTimeout(voHideTimer); voHideTimer = null; }
  }
  function showVoLayer(mode2, instant) {
    const layer = $("volayer");
    cancelVoHide();
    if (mode2 === "on") clearScene(instant ? "cut" : "fade"); // narration on black
    layer.classList.toggle("vo-wash", mode2 === "over");
    layer.style.transitionDuration = "";
    layer.style.display = "";
    layer.style.opacity = instant ? "1" : "0";
    if (!instant)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => (layer.style.opacity = "1"))
      );
    hideTextbox();
    st.voDeferred = false;
  }
  function hideVoLayer(instant) {
    const layer = $("volayer");
    cancelVoHide();
    if (instant) {
      layer.style.display = "none";
      layer.style.transitionDuration = "";
      $("volines").innerHTML = "";
    } else {
      layer.style.opacity = "0";
      voHideTimer = setTimeout(() => {
        voHideTimer = null;
        layer.style.display = "none";
        layer.style.transitionDuration = "";
        $("volines").innerHTML = "";
      }, 800);
    }
  }
  function setVoiceover(mode2, instant) {
    st.vo = mode2;
    if (mode2 === "on" || mode2 === "over") {
      st.voLines = [];
      $("volines").innerHTML = "";
      showVoLayer(mode2, instant);
    } else {
      hideVoLayer(instant);
      st.voLines = [];
      st.voDeferred = false;
      st.voDeferredPc = null;
    }
  }
  /* "@fadeout [ms]": fade the WHOLE visible scene to black as one unit. */
  function fadeSceneOut(ms) {
    const layer = $("volayer");
    cancelVoHide();
    hideTextbox();
    layer.style.transitionDuration = ms + "ms";
    layer.style.opacity = "0";
    const kids = Array.from($("bglayer").children);
    for (const o of kids) { o.style.transitionDuration = ms + "ms"; o.style.opacity = "0"; }
    setTimeout(() => kids.forEach((k) => k.remove()), ms + 60);
    execClear("all");
    hideDashboard();
    st.vo = "off"; st.voLines = []; st.voDeferred = false; st.voDeferredPc = null;
    st.cg = null; st.bg = null; st.inscription = null;
    voHideTimer = setTimeout(() => {
      voHideTimer = null;
      layer.style.display = "none";
      layer.style.transitionDuration = "";
      $("volines").innerHTML = "";
    }, ms);
  }
  function parseVoLine(text) {
    return text.split("|").map((s) => s.trim()).filter((s) => s.length)
      .map((seg) => ({ text: seg }));
  }
  // Pre-lay-out the WHOLE group (hidden at opacity 0) so revealing a part
  // never nudges what's already shown ("line moves 0px").
  function prerenderVoGroup(fromIdx) {
    const lines = [];
    for (let j = fromIdx; j < SCRIPT.ins.length; j++) {
      const c = SCRIPT.ins[j];
      if (c.op === "voiceover" || c.op === "fadeout" || c.op === "label" ||
          c.op === "jump" || c.op === "choice" || c.op === "title" || c.op === "chapter") break;
      if (c.op === "narrate") lines.push(parseVoLine(c.text));
    }
    st.voGroup = lines;
    st.voShown = 0;
    st.voSeg = 0;
    st.voLines = [];
    st.voPartEls = [];
    const box = $("volines");
    box.innerHTML = "";
    for (const parts of lines) {
      const div = document.createElement("div");
      div.className = "voline";
      const els = [];
      parts.forEach((p, k) => {
        const span = document.createElement("span");
        span.className = "voseg";
        if (k > 0) span.appendChild(document.createTextNode(" "));
        for (const tk of emphasisTokens(p.text)) {
          const t = document.createElement(tk.em ? "em" : "span");
          t.textContent = tk.t;
          span.appendChild(t);
        }
        div.appendChild(span);
        els.push(span);
      });
      box.appendChild(div);
      st.voPartEls.push(els);
    }
  }
  function revealPart(el) {
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => (el.style.opacity = "1")));
  }
  function revealVoLine(instant) {
    const li = st.voShown;
    const parts = st.voGroup[li] || [];
    const els = st.voPartEls[li] || [];
    st.voLines.push(parts.map((p) => p.text).join(" ").trim());
    st.voShown++;
    st.voSeg = 1;
    if (instant) {
      for (const el of els) if (el) el.style.opacity = "1";
      st.voSeg = els.length;
    } else {
      revealPart(els[0]);
    }
  }
  function revealNextVoSegment() {
    if (st.vo === "off") return false;
    const li = st.voShown - 1;
    if (li < 0) return false;
    const els = st.voPartEls[li] || [];
    if (st.voSeg >= els.length) return false;
    revealPart(els[st.voSeg]);
    st.voSeg++;
    return true;
  }

  /* ---------- overlay (generic centered inscription card) ---------- */

  function showInscription(lines) {
    st.inscription = lines;
    const box = $("inscription");
    box.innerHTML = "";
    for (const l of lines) {
      const div = document.createElement("div");
      div.textContent = l;
      box.appendChild(div);
    }
    box.style.display = "";
  }
  function clearInscription() {
    st.inscription = null;
    $("inscription").style.display = "none";
  }

  /* ---------- dashboard (end-of-chapter status readout, dossier-red) ----------
     A blocking beat like @overlay: renders a cream/halftone card of the year,
     a trajectory label, a row of stat tiles (each with a trend arrow vs the
     PREVIOUS dashboard's numeric value where both parse), and a 0-100 AI
     capability bar with labeled stops + a ~88 ceiling marker. State-effect
     no-op during silent seek (prevDash is tracked in the walk); rendered only
     on the live step that lands on it. */
  const DASH_TILES = [
    { key: "employment", label: "Employment" },
    { key: "dividend",   label: "Citizen Dividend" },
    { key: "safety",     label: "Safety Researchers" },
    { key: "workforce",  label: "AI Workforce" },
    { key: "compute",    label: "Compute" },
    { key: "gdp",        label: "GDP Growth" },
  ];
  const CAP_CEILING = 88; // top-human-expert pause line
  function dashNum(str) {
    if (str == null) return null;
    const s = String(str).replace(/,/g, "");
    const m = s.match(/(-?\d+(?:\.\d+)?)\s*([kKmMbBtT])?/);
    if (!m) return null;
    const n = parseFloat(m[1]);
    if (!isFinite(n)) return null;
    const suf = (m[2] || "").toLowerCase();
    const mult = suf === "k" ? 1e3 : suf === "m" ? 1e6 : suf === "b" ? 1e9 : suf === "t" ? 1e12 : 1;
    return n * mult;
  }
  function dashNums(data) {
    const o = {};
    if (data) for (const k in data) o[k] = dashNum(data[k]);
    return o;
  }
  function dashEsc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function trendArrow(cur, prev) {
    if (cur == null || prev == null || !isFinite(cur) || !isFinite(prev)) return "";
    if (cur > prev) return ' <span class="dt-trend up">▲</span>';
    if (cur < prev) return ' <span class="dt-trend down">▼</span>';
    return ' <span class="dt-trend flat">▬</span>';
  }
  function dashGlobeSvg() {
    let dots = "";
    for (let gy = -40; gy <= 40; gy += 7) {
      for (let gx = -40; gx <= 40; gx += 7) {
        if (gx * gx + gy * gy > 40 * 40) continue;
        dots += '<circle cx="' + (50 + gx) + '" cy="' + (50 + gy) + '" r="0.9" fill="#16130d33"/>';
      }
    }
    let hot = "";
    for (const p of [[46, 41], [58, 47], [50, 58], [41, 51], [55, 60]])
      hot += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.7" fill="#d64533"/>';
    return '<svg class="dash-globe" viewBox="0 0 100 100" aria-hidden="true">' +
      '<defs><clipPath id="dashglobeclip"><circle cx="50" cy="50" r="42"/></clipPath></defs>' +
      '<circle cx="50" cy="50" r="42" fill="#fbf6ea" stroke="#16130d" stroke-width="1.3"/>' +
      '<g clip-path="url(#dashglobeclip)">' + dots +
        '<ellipse cx="50" cy="50" rx="42" ry="15" fill="none" stroke="#16130d3a" stroke-width="0.7"/>' +
        '<ellipse cx="50" cy="50" rx="15" ry="42" fill="none" stroke="#16130d3a" stroke-width="0.7"/>' +
        hot +
      '</g></svg>';
  }
  /* Builds the inner cream-paper card HTML. Shared by the in-play @dashboard
     beat and the "Where Things Stand" run-overview panel. `eyebrow` is the
     small caps line top-left; `metaHTML` (optional) is an extra strip inserted
     after the hero (used by the overview for the plan + endings-seen row). */
  function dashCardHTML(data, prevNums, eyebrow, metaHTML) {
    data = data || {};
    const cur = dashNums(data);
    const prev = prevNums || {};
    const year = data.year != null ? dashEsc(data.year) : "—";
    const traj = data.trajectory != null ? dashEsc(data.trajectory) : "";
    let tiles = "";
    for (const t of DASH_TILES) {
      if (data[t.key] == null) continue;
      tiles +=
        '<div class="dash-tile">' +
          '<div class="dt-label">' + dashEsc(t.label) + '</div>' +
          '<div class="dt-value">' + dashEsc(data[t.key]) + trendArrow(cur[t.key], prev[t.key]) + '</div>' +
        '</div>';
    }
    const capN = cur.capability;
    const capPct = (capN != null && isFinite(capN)) ? Math.max(0, Math.min(100, capN)) : null;
    const capText = data.capability != null ? dashEsc(data.capability) : "—";
    const bar =
      '<div class="dash-cap">' +
        '<div class="dc-head"><span class="dc-label">AI Capability</span>' +
          '<span class="dc-val">' + capText + (capPct != null ? ' <span class="dc-slash">/ 100</span>' : '') + '</span></div>' +
        '<div class="dc-track">' +
          (capPct != null ? '<div class="dc-fill" style="width:' + capPct + '%"></div>' : '') +
          '<div class="dc-ceiling" style="left:' + CAP_CEILING + '%"><span class="dc-ceiling-lbl">ceiling</span></div>' +
          (capPct != null ? '<div class="dc-marker" style="left:' + capPct + '%"><span class="dc-dot"></span></div>' : '') +
        '</div>' +
        '<div class="dc-stops">' +
          '<span class="dc-s0">sub-human</span>' +
          '<span class="dc-s1">human-expert</span>' +
          '<span class="dc-s2">superintelligence</span>' +
        '</div>' +
      '</div>';
    return '<div class="dash-card">' +
        '<div class="dash-top">' +
          '<div class="dash-eyebrow">' + (eyebrow || "Status Dossier &middot; Plan A") + '</div>' +
          dashGlobeSvg() +
        '</div>' +
        '<div class="dash-hero">' +
          '<div class="dash-year">' + year + '</div>' +
          (traj ? '<div class="dash-traj">' + traj + '</div>' : '') +
        '</div>' +
        (metaHTML || '') +
        '<div class="dash-tiles">' + tiles + '</div>' +
        bar +
      '</div>';
  }
  function showDashboard(c, prevNums) {
    const box = $("dashboard");
    box.innerHTML = dashCardHTML(c.data || {}, prevNums, "Status Dossier &middot; Plan A", "");
    box.style.display = "";
  }
  function hideDashboard() {
    const box = $("dashboard");
    if (box) { box.style.display = "none"; box.innerHTML = ""; }
  }

  /* ---------- audio (optional; silent no-op when files absent) ---------- */

  let bgmEl = null;
  const BGM_VOL = 0.7;
  const BGM_FADE_MS = 1200;
  function bgmTargetVol() {
    const v = settings.musicVolume;
    return typeof v === "number" ? v : BGM_VOL;
  }
  function fadeOutBgmEl(el, instant) {
    if (!el) return;
    if (instant) { el.pause(); return; }
    const t0 = performance.now();
    const startVol = el.volume;
    (function tick() {
      const t = Math.min(1, (performance.now() - t0) / BGM_FADE_MS);
      el.volume = startVol * (1 - t);
      if (t < 1) requestAnimationFrame(tick);
      else el.pause();
    })();
  }
  /* guarded by "bgmEl === el" so a superseded fade-in can't clobber a newer
     track's volume */
  function fadeInBgmEl(el, instant) {
    if (instant) { el.volume = bgmTargetVol(); return; }
    const t0 = performance.now();
    (function tick() {
      if (bgmEl !== el) return;
      const t = Math.min(1, (performance.now() - t0) / BGM_FADE_MS);
      el.volume = bgmTargetVol() * t;
      if (t < 1) requestAnimationFrame(tick);
    })();
  }
  function playBgm(id, instant) {
    const outgoing = bgmEl;
    if (id === "stop" || !id) {
      st.bgm = null;
      bgmEl = null;
      fadeOutBgmEl(outgoing, instant);
      return;
    }
    st.bgm = id;
    // Idempotent: re-requesting the currently-playing track (duplicate @bgm,
    // or a seek re-applying it) must NOT restart it.
    if (bgmEl && !bgmEl.paused && bgmEl.dataset && bgmEl.dataset.bgmId === id) return;
    const path2 = assetPath("audio", id);
    if (!path2 || !musicEnabled) {
      bgmEl = null;
      fadeOutBgmEl(outgoing, instant);
      return;
    }
    const el = new Audio(path2);
    el.dataset.bgmId = id;
    el.loop = true;
    el.volume = instant ? bgmTargetVol() : 0;
    el.play().then(() => {
      if (!audioUnlocked) { audioUnlocked = true; updateMusicBtn(); }
    }).catch(() => {});
    bgmEl = el;
    fadeOutBgmEl(outgoing, instant);
    fadeInBgmEl(el, instant);
  }
  function updateMusicBtn() {
    const btn = $("musicbtn");
    if (!btn) return;
    btn.classList.toggle("off", !(musicEnabled && audioUnlocked));
    btn.title = !musicEnabled
      ? "Music off — click to play"
      : audioUnlocked
        ? "Music on — click to mute"
        : "Music on (starts on your first click) — click here to keep it off";
  }
  function toggleMusic() {
    if (!audioUnlocked && musicEnabled) {
      audioUnlocked = true;
      if (st.bgm) playBgm(st.bgm, false);
      updateMusicBtn();
      return;
    }
    musicEnabled = !musicEnabled;
    settings.musicOn = musicEnabled;
    saveSettings();
    audioUnlocked = true;
    updateMusicBtn();
    if (musicEnabled) {
      if (st.bgm) playBgm(st.bgm, false);
    } else {
      fadeOutBgmEl(bgmEl, false);
      bgmEl = null;
    }
  }

  const sfxCache = {};
  function preloadSfx(id) {
    const path2 = assetPath("audio", id);
    if (!path2 || sfxCache[id]) return;
    const a = new Audio(path2);
    a.volume = 0.8;
    a.preload = "auto";
    try { a.load(); } catch (e) {}
    sfxCache[id] = a;
  }
  function playSfx(id) {
    if (id === "stop" || !id) return;
    const path2 = assetPath("audio", id);
    if (!path2) return;
    let a = sfxCache[id];
    if (!a) { a = new Audio(path2); a.volume = 0.8; sfxCache[id] = a; }
    try { a.currentTime = 0; } catch (e) {}
    a.play().catch(() => {});
  }

  /* ---------- persistence ----------
     Save = { pc, choices, seenLabels, seen (base64 bitmap), fin, ts } written
     to BOTH localStorage and a cookie on every displayed line. The path is
     deterministic given `choices`: resume replays from 0 following them. */

  function bitsToB64(u8) {
    let s = "";
    for (let k = 0; k < u8.length; k++) s += String.fromCharCode(u8[k]);
    try { return btoa(s); } catch (e) { return ""; }
  }
  function b64ToBits(b64, nIns) {
    const bytes = new Uint8Array(Math.max(1, Math.ceil((nIns || 1) / 8)));
    if (b64) {
      try {
        const s = atob(b64);
        for (let k = 0; k < s.length && k < bytes.length; k++) bytes[k] = s.charCodeAt(k);
      } catch (e) {}
    }
    return bytes;
  }
  function seenBit(k) { return !!(seenPcs[k >> 3] & (1 << (k & 7))); }
  function markSeen(k) { if (k >= 0 && (k >> 3) < seenPcs.length) seenPcs[k >> 3] |= (1 << (k & 7)); }

  function save() {
    const rec = {
      pc,
      choices: choiceRecords,
      seenLabels: Array.from(seenLabels),
      seen: bitsToB64(seenPcs),
      fin: finished ? 1 : 0,
      ts: Date.now(),
    };
    const data = JSON.stringify(rec);
    try { localStorage.setItem(SAVE_KEY, data); } catch (e) {}
    try {
      // cookies cap near 4KB: drop the bitmap there if the record is too big
      // (loadSave merges the bitmap back in from localStorage)
      let cdata = data;
      if (cdata.length > 3600) {
        const slim = Object.assign({}, rec); delete slim.seen;
        cdata = JSON.stringify(slim);
      }
      document.cookie =
        SAVE_KEY + "=" + encodeURIComponent(cdata) +
        "; max-age=31536000; path=/; SameSite=Lax";
    } catch (e) {}
  }
  function loadSave() {
    let a = null, b = null;
    try { a = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) {}
    try {
      const m = document.cookie.match(new RegExp("(?:^|; )" + SAVE_KEY + "=([^;]*)"));
      if (m) b = JSON.parse(decodeURIComponent(m[1]));
    } catch (e) {}
    if (!a && !b) return null;
    let primary = a, other = b;
    if (a && b && (b.ts || 0) > (a.ts || 0)) { primary = b; other = a; }
    if (!primary) { primary = other; other = null; }
    if (primary && !primary.seen && other && other.seen) primary.seen = other.seen;
    return primary;
  }
  function applySave(sv) {
    if (!sv) return;
    choiceRecords = sv.choices || {};
    seenLabels = new Set(sv.seenLabels || []);
    seenPcs = b64ToBits(sv.seen, SCRIPT.ins.length);
    finished = !!sv.fin;
  }

  /* ---------- path walking ----------
     walkPath: follow the script from 0 through @jump and RECORDED choices,
     calling visit(j, ins[j]) for every instruction strictly before the stop.
     Stops at: stopPc ("target"); an unanswered or already-consumed-this-walk
     choice ("choice"); @title ("title"); script end ("end"). Consuming each
     choice record at most once per walk guarantees termination, and means a
     replay can never run past a re-presented choice. */
  function walkPath(records, stopPc, visit) {
    let j = 0;
    const consumed = new Set();
    let guard = 0;
    const cap = (SCRIPT.ins.length + 8) * 4;
    while (j < SCRIPT.ins.length) {
      if (++guard > cap) return { pc: j, reason: "loop" };
      if (j === stopPc) return { pc: j, reason: "target" };
      const c = SCRIPT.ins[j];
      if (visit) visit(j, c);
      if (c.op === "jump") {
        const t = SCRIPT.labels[c.target];
        if (t === undefined) { j++; continue; } // validator prevents; degrade to no-op
        j = t; continue;
      }
      if (c.op === "choice") {
        const rec = records[String(j)];
        if (rec === undefined || consumed.has(j) || !c.options[rec]) return { pc: j, reason: "choice" };
        consumed.add(j);
        const t = SCRIPT.labels[c.options[rec].target];
        if (t === undefined) { j++; continue; }
        j = t; continue;
      }
      if (c.op === "title") return { pc: j, reason: "title" };
      j++;
    }
    return { pc: SCRIPT.ins.length, reason: "end" };
  }
  // the set of pcs reachable from 0 on the CURRENT recorded choices
  function reachableNow() {
    const set = new Set();
    walkPath(choiceRecords, -1, (j) => set.add(j));
    return set;
  }

  /* ---------- execution ---------- */

  function clearTimers() {
    if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    if (typer) { clearTimeout(typer.timer); typer = null; }
    clearAutoplayTimer();
  }

  let autoplayTimer = null;
  let lastAutoAdvance = 0;
  function clearAutoplayTimer() {
    if (autoplayTimer) { clearTimeout(autoplayTimer); autoplayTimer = null; }
  }
  function maybeAutoplay() {
    clearAutoplayTimer();
    if (reviewing || chapFading || choiceActive) return;
    const ms = st.autoAdvanceMs != null ? st.autoAdvanceMs
             : (settings.autoplay ? settings.autoplayDelayMs : null);
    if (ms == null) return;
    autoplayTimer = setTimeout(() => {
      autoplayTimer = null;
      if (mode === "play" && waiting) { lastAutoAdvance = Date.now(); advance(true); }
    }, ms);
  }

  /* returns true if execution must wait for input/timer */
  function exec(c) {
    switch (c.op) {
      case "say":
      case "narrate": {
        if ((st.vo === "on" || st.vo === "over") && c.op === "narrate") {
          if (st.voDeferred) {
            if (st.voDeferredPc != null) { prerenderVoGroup(st.voDeferredPc); st.voDeferredPc = null; }
            showVoLayer(st.vo, false);
          }
          revealVoLine(false);
          save();
          maybeAutoplay();
          return true;
        }
        showTextbox(c.op === "say" ? c.speaker : null);
        applyDim(c.op === "say" ? c.speaker : null);
        startTyper(c.text, false, c.small, c.slow);
        save();
        return true;
      }
      case "hold":
        hideTextbox();
        save();
        maybeAutoplay();
        return true;
      case "pause":
        autoTimer = setTimeout(advance, c.ms);
        return true;
      case "bg":
        setBg(c.id, c.trans, false, c.ms);
        return false;
      case "cg":
        showCg(c.id, c.trans);
        if (st.montage) {
          hideTextbox();
          save();
          if (settings.autoplay) autoTimer = setTimeout(advance, st.montage.secs * 1000);
          return true;
        }
        return false;
      case "sprite":
        setSprite(c.char, c.expr, spriteSlot(c), false, c.anim);
        return false;
      case "clear":
        execClear(c.what);
        return false;
      case "voiceover":
        if (c.mode === "off") { setVoiceover("off"); return false; }
        st.vo = c.mode;
        st.voDeferred = true;
        st.voDeferredPc = pc + 1;
        return c.mode !== "on";
      case "fadeout":
        fadeSceneOut(c.ms);
        return false;
      case "autoplay":
        st.autoAdvanceMs = c.ms;
        return false;
      case "flash":
        flash(c.color, c.ms, c.hold);
        return false;
      case "overlay":
        hideTextbox();
        showInscription(c.lines);
        save();
        maybeAutoplay();
        return true;
      case "dashboard":
        hideTextbox();
        showDashboard(c, st.prevDash);
        st.prevDash = dashNums(c.data); // trends for the NEXT dashboard compare to this one
        save();
        maybeAutoplay();
        return true;
      case "montage":
        st.montage = { secs: c.secs };
        hideTextbox();
        return false;
      case "montage_end":
        st.montage = null;
        return false;
      case "textbox":
        if (!c.show) hideTextbox();
        return false;
      case "tint":
        setTint(c.mode);
        return false;
      case "bgm":
        playBgm(c.id, c.instant);
        return false;
      case "sfx":
        playSfx(c.id);
        return false;
      case "chapter":
        st.chapter = c.n;
        return false;
      default:
        return false;
    }
  }

  function pushPath(p2) {
    if (path[path.length - 1] !== p2) path.push(p2);
  }

  function step() {
    waiting = false;
    let guard = 0;
    const cap = (SCRIPT.ins.length + 8) * 4;
    while (pc < SCRIPT.ins.length) {
      if (++guard > cap) { console.warn("step(): flow guard tripped at pc " + pc); break; }
      const c = SCRIPT.ins[pc];
      // coordinated chapter fade: forward click-driven play only (never seeks)
      if (c.op === "chapter" && chapArmed && !chapFading) {
        startChapterFade();
        return;
      }
      if (c.op === "label") {
        markSeen(pc); pushPath(pc);
        seenLabels.add(c.name);
        pc++;
        continue;
      }
      if (c.op === "jump") {
        markSeen(pc); pushPath(pc);
        const t = SCRIPT.labels[c.target];
        if (t === undefined) { console.warn("@jump to missing label " + c.target); pc++; continue; }
        pc = t;
        continue;
      }
      if (c.op === "choice") {
        markSeen(pc); pushPath(pc);
        showChoice(c);
        waiting = true;
        save();
        preloadAhead();
        updateChapterIndicator();
        return;
      }
      if (c.op === "title") {
        markSeen(pc); pushPath(pc);
        execTitleReturn();
        return;
      }
      markSeen(pc); pushPath(pc);
      const blocked = exec(c);
      if (blocked) {
        waiting = true;
        preloadAhead();
        updateChapterIndicator();
        return;
      }
      pc++;
    }
    if (pc >= SCRIPT.ins.length) endCard();
  }

  /* @title: return to the title screen; the resume point rewinds to the last
     choice on the path (so Continue re-presents it), else to the start. */
  function execTitleReturn() {
    let back = -1;
    for (let k = path.length - 1; k >= 0; k--) {
      const c = SCRIPT.ins[path[k]];
      if (c && c.op === "choice") { back = path[k]; break; }
    }
    pc = back >= 0 ? back : 0;
    save();
    clearTimers();
    hideChoice();
    showTitle();
  }

  /* ---------- choice menu ---------- */

  function showChoice(c) {
    choiceActive = true;
    choiceSel = 0;
    flowLeaves = null;
    flowChevron = null;
    hideTextbox();
    const menu = $("choicemenu");
    const box = $("choice-list");
    box.innerHTML = "";
    menu.classList.remove("flowchart", "endings");
    if (c.mode === "flowchart") {
      menu.classList.add("flowchart");
      buildFlowchart(c, box);
      // default the highlight to Plan A (the source emphasises it), else leftmost
      if (flowLeaves && flowLeaves.length) {
        const aLeaf = flowLeaves.find((lf) => c.options[lf.optIdx].text.trim().startsWith("Plan A"));
        choiceSel = (aLeaf || flowLeaves[0]).optIdx;
      }
    } else if (c.mode === "endings") {
      menu.classList.add("endings");
      buildEndingsGallery(box);       // completion gallery (display only)
      renderChoiceButtons(c, box, false); // nav buttons (no seen-dimming)
    } else {
      renderChoiceButtons(c, box, true);
    }
    menu.style.display = "";
    renderChoiceSel();
  }
  function renderChoiceButtons(c, box, showSeen) {
    c.options.forEach((opt, idx) => {
      const seen = showSeen && seenLabels.has(opt.target);
      const b = document.createElement("button");
      b.className = "choice-btn" + (seen ? " seen" : "");
      const t = document.createElement("span");
      t.className = "choice-text";
      t.textContent = opt.text;
      b.appendChild(t);
      if (seen) {
        const chk = document.createElement("span");
        chk.className = "choice-check";
        chk.textContent = "✓";
        b.appendChild(chk);
      }
      b.onclick = (e) => { e.stopPropagation(); commitChoice(idx); };
      b.onmouseenter = () => { choiceSel = idx; renderChoiceSel(); };
      box.appendChild(b);
    });
  }
  // Endings gallery: the five plans with played/unplayed status (from seenLabels).
  const ENDINGS_LIST = [ // shown order
    { letter: "A", label: "plan_a", name: "Verified Slowdown",  note: "Reached 2040, together." },
    { letter: "B", label: "plan_b", name: "Fight China",        note: "A fork with no safe road." },
    { letter: "C", label: "plan_c", name: "Burn the Lead",      note: "A tiny circle decides." },
    { letter: "D", label: "plan_d", name: "Race to ASI",        note: "Handed to the fastest builder." },
    { letter: "S", label: "plan_s", name: "Shut It All Down",   note: "A pause, not a destination." },
  ];
  function buildEndingsGallery(box) {
    const seenN = ENDINGS_LIST.filter((e) => seenLabels.has(e.label)).length;
    const card = document.createElement("div");
    card.className = "endings-card";
    let tiles = "";
    for (const e of ENDINGS_LIST) {
      const done = seenLabels.has(e.label);
      tiles +=
        '<div class="end-tile' + (done ? " done" : "") + '">' +
          '<div class="et-letter">' + e.letter + '</div>' +
          '<div class="et-name">' + (done ? e.name : "Not yet seen") + '</div>' +
          '<div class="et-note">' + (done ? e.note : "&mdash;") + '</div>' +
          '<div class="et-status">' + (done ? "✓ seen" : "&#9675; unseen") + '</div>' +
        '</div>';
    }
    const done5 = seenN >= ENDINGS_LIST.length;
    const altSeen = seenLabels.has("interlude_safetycase");
    const altLine =
      '<div class="end-alt">' +
        '<span class="end-alt-k">Alternate timeline</span> ' +
        (altSeen
          ? '&#10003; A flawed safety case is approved &mdash; Plan A’s most-feared failure, one careful argument off the main path.'
          : '&#9675; A near-miss on the Plan A path is still unseen. (Offered mid-story, after 2031.)') +
      '</div>';
    card.innerHTML =
      '<div class="end-head">The Endings</div>' +
      '<div class="end-sub">' +
        (done5 ? "You have walked every path."
               : "Paths seen: " + seenN + " of " + ENDINGS_LIST.length +
                 ". Each plan plays all the way out; return and try another.") +
      '</div>' +
      '<div class="end-grid">' + tiles + '</div>' + altLine;
    box.appendChild(card);
  }

  /* Flowchart presentation of a `@choice flowchart`. Renders the 2029
     decision tree (guiding questions + branch labels are decorative; the five
     leaf boxes are the real options). Leaves are matched to options by their
     "Plan X" text prefix — the engine never hardcodes the target labels. Each
     leaf is a `.choice-btn` (so save/seek/seen and the e2e selectors keep
     working) and clicking one calls the normal commitChoice path. */
  const FLOW_PLANS = [ // visual order left -> right: D, C, B, A, S
    { letter: "D", prefix: "Plan D", name: "Race to ASI",        x: 13 },
    { letter: "C", prefix: "Plan C", name: "Burn the Lead",      x: 30 },
    { letter: "B", prefix: "Plan B", name: "Fight China",        x: 47 },
    { letter: "A", prefix: "Plan A", name: "Verified Slowdown",  x: 68 },
    { letter: "S", prefix: "Plan S", name: "Shut it all down",   x: 87 },
  ];
  function buildFlowchart(c, box) {
    const card = document.createElement("div");
    card.className = "flow-card";
    const LEAF_TOP = 82; // % — top edge of the leaf boxes; connectors meet here
    // connectors + question boxes + edge labels are static markup
    card.innerHTML =
      '<div class="flow-head">2029: Choose a Path</div>' +
      '<svg class="flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none">' +
        // Q1 down to the distribution bus
        '<path d="M50 24 V31"/>' +
        // the bus, and its three drops
        '<path d="M13 31 H73"/>' +
        '<path d="M13 31 V' + LEAF_TOP + '"/>' +          // race -> Plan D (far left)
        '<path d="M27 31 V42"/>' +                        // -> Slow-down box top
        '<path class="bold" d="M73 31 V42"/>' +           // -> deal box top (BOLD, route to A)
        // Slow-down box -> Plan C ("nope")
        '<path d="M27 53 V70 H30 V' + LEAF_TOP + '"/>' +
        // Slow-down box <-> deal box ("yes"): touches both inner edges
        '<path d="M45 47 H55"/>' +
        // deal box -> Plan B ("slow China too")
        '<path d="M64 53 V72 H47 V' + LEAF_TOP + '"/>' +
        // deal box -> Plan A (BOLD)
        '<path class="bold" d="M73 53 V74 H68 V' + LEAF_TOP + '"/>' +
        // deal box -> Plan S ("two of many deals")
        '<path d="M82 53 V74 H87 V' + LEAF_TOP + '"/>' +
      '</svg>' +
      '<div class="flow-q" style="left:50%;top:15%;width:150cqh"><b>Race through the intelligence explosion</b> by having AIs self-improve and putting them in charge of more things (datacenters, factories, weapons) faster than China can?</div>' +
      '<div class="flow-q" style="left:27%;top:47%;width:60cqh">Slow down at least a bit for safety and governance?</div>' +
      '<div class="flow-q" style="left:73%;top:47%;width:60cqh">Let&rsquo;s make a deal with China. But what?</div>' +
      '<div class="flow-lbl" style="left:18.5%;top:37%">&ldquo;Yes, and that&rsquo;s good actually and/or we have no choice.&rdquo;</div>' +
      '<div class="flow-lbl" style="left:63%;top:36%">&ldquo;What? No, that&rsquo;s crazy!&rdquo;</div>' +
      '<div class="flow-lbl" style="left:22%;top:64%">&ldquo;Nope.&rdquo;</div>' +
      '<div class="flow-lbl" style="left:50%;top:43.5%">&ldquo;Yes.&rdquo;</div>' +
      '<div class="flow-lbl" style="left:56%;top:64%">&ldquo;Yes, and slow China down too.&rdquo;</div>' +
      '<div class="flow-lbl" style="left:84%;top:64%">(Two of many possible deals)</div>';
    box.appendChild(card);
    // down-chevron beneath the highlighted leaf (as the source marks its pick)
    const chev = document.createElement("div");
    chev.className = "flow-chevron";
    chev.textContent = "⌄";
    chev.style.top = (LEAF_TOP + 15) + "%";
    card.appendChild(chev);
    flowChevron = chev;
    // clickable leaves — one per plan, matched to its option by "Plan X" prefix
    flowLeaves = [];
    FLOW_PLANS.forEach((p) => {
      const idx = c.options.findIndex((o) => o.text.trim().startsWith(p.prefix));
      if (idx < 0) return; // option not present — skip (defensive)
      const seen = seenLabels.has(c.options[idx].target);
      const b = document.createElement("button");
      b.className = "choice-btn flow-leaf" + (seen ? " seen" : "");
      b.style.left = p.x + "%";
      b.style.top = LEAF_TOP + "%";
      b.innerHTML =
        '<span class="lf-plan">Plan ' + p.letter + '</span>' +
        '<span class="lf-letter">' + p.letter + '</span>' +
        '<span class="lf-name">' + p.name + '</span>' +
        (seen ? '<span class="lf-check">✓</span>' : '');
      b.onclick = (e) => { e.stopPropagation(); commitChoice(idx); };
      b.onmouseenter = () => { choiceSel = idx; renderChoiceSel(); };
      card.appendChild(b);
      flowLeaves.push({ optIdx: idx, el: b });
    });
  }
  function renderChoiceSel() {
    if (flowLeaves) {
      for (const lf of flowLeaves) lf.el.classList.toggle("sel", lf.optIdx === choiceSel);
      const cur = flowLeaves.find((lf) => lf.optIdx === choiceSel);
      if (flowChevron && cur) flowChevron.style.left = cur.el.style.left;
      return;
    }
    const kids = $("choice-list").children;
    for (let k = 0; k < kids.length; k++) kids[k].classList.toggle("sel", k === choiceSel);
  }
  function hideChoice() {
    choiceActive = false;
    flowLeaves = null;
    flowChevron = null;
    const menu = $("choicemenu");
    menu.style.display = "none";
    menu.classList.remove("flowchart", "endings");
    $("choice-list").innerHTML = "";
  }
  // keyboard: arrows move the highlight, Enter/Space picks. Returns true if consumed.
  function choiceKey(e) {
    if (!choiceActive || mode !== "play") return false;
    const c = SCRIPT.ins[pc];
    const n = c && c.op === "choice" ? c.options.length : 0;
    if (!n) return false;
    if (flowLeaves && flowLeaves.length) {
      // choiceSel holds an option index; step through leaves in visual order
      const cur = Math.max(0, flowLeaves.findIndex((lf) => lf.optIdx === choiceSel));
      const m = flowLeaves.length;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        choiceSel = flowLeaves[(cur + m - 1) % m].optIdx; renderChoiceSel(); return true;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        choiceSel = flowLeaves[(cur + 1) % m].optIdx; renderChoiceSel(); return true;
      }
      if (e.key === "Enter" || e.key === " ") { if (e.repeat) return true; commitChoice(choiceSel); return true; }
      return false;
    }
    if (e.key === "ArrowUp") { choiceSel = (choiceSel + n - 1) % n; renderChoiceSel(); return true; }
    if (e.key === "ArrowDown") { choiceSel = (choiceSel + 1) % n; renderChoiceSel(); return true; }
    if (e.key === "Enter" || e.key === " ") { if (e.repeat) return true; commitChoice(choiceSel); return true; }
    return false;
  }

  /* Committing a pick — from live play OR from a rollback review landed on the
     choice. Truncates the path/history at the choice and deletes recorded
     answers of any choice further along the (pre-review) path, then jumps. */
  function commitChoice(idx) {
    const c = SCRIPT.ins[pc];
    if (!c || c.op !== "choice" || !c.options[idx]) return;
    hideChoice();
    // delete downstream choice records along whichever path knows about them:
    // the pre-review snapshot when we got here by rolling back, else the live path
    const base = (presentPathSnap && presentPathSnap.lastIndexOf(pc) >= 0) ? presentPathSnap : path;
    const at = base.lastIndexOf(pc);
    if (at >= 0) {
      for (let k = at + 1; k < base.length; k++) {
        const p2 = base[k];
        if (SCRIPT.ins[p2] && SCRIPT.ins[p2].op === "choice") delete choiceRecords[String(p2)];
      }
    }
    const pAt = path.lastIndexOf(pc);
    if (pAt >= 0) path.length = pAt + 1;
    const hAt = history.lastIndexOf(pc);
    if (hAt >= 0) history.length = hAt + 1;
    reviewIdx = Math.max(0, history.length - 1);
    reviewing = false;
    presentPathSnap = null;
    choiceRecords[String(pc)] = idx;
    seenLabels.add(c.options[idx].target);
    save();
    const t = SCRIPT.labels[c.options[idx].target];
    clearTimers();
    if (t === undefined) pc++; else pc = t;
    chapArmed = true; // a pick is click-driven forward play: chapter fades allowed
    step();
    chapArmed = false;
    if (waiting) pushHistory();
  }

  /* ---------- chapter fade ---------- */

  function startChapterFade() {
    chapFading = true;
    chapArmed = false;
    clearTimers();
    const cf = $("chapfade");
    cf.style.transition = "opacity " + CHAP_FADE_MS + "ms ease";
    cf.style.opacity = "1";
    setTimeout(finishChapterFade, CHAP_FADE_MS + CHAP_HOLD_MS);
  }
  function finishChapterFade() {
    // under full black: run the new chapter's setup to its first blocking beat
    step(); // chapArmed is false, so the @chapter executes without re-triggering
    const cf = $("chapfade");
    if (mode !== "play") { // ran to the end card or a @title under the curtain
      chapFading = false;
      cf.style.transition = "none";
      cf.style.opacity = "0";
      return;
    }
    pushHistory();
    requestAnimationFrame(() => {
      cf.style.transition = "opacity " + CHAP_FADE_MS + "ms ease";
      cf.style.opacity = "0";
    });
    setTimeout(() => { chapFading = false; if (waiting) maybeAutoplay(); }, CHAP_FADE_MS);
  }
  function cancelChapterFade() {
    chapFading = false;
    chapArmed = false;
    const cf = $("chapfade");
    cf.style.transition = "none";
    cf.style.opacity = "0";
  }

  function updateChapterIndicator() {
    updateDateIndicator();
    const el = $("chapter-indicator");
    const modeSet = settings.showChapter;
    const total = SCRIPT && SCRIPT.chapters ? SCRIPT.chapters.length : 0;
    if (modeSet === "off" || !modeSet || mode !== "play" || !st.chapter || !total) {
      el.style.display = "none";
      return;
    }
    const cur = SCRIPT.chapters.find((c) => c.n === st.chapter);
    let text = "Ch. " + st.chapter + "/" + total;
    if (modeSet === "full" && cur) text += " · " + cur.title;
    el.textContent = text;
    el.style.display = "";
  }
  // in-fiction year, shown in the textbox's bottom-right. Lives inside #textbox, so
  // it is hidden automatically on black voiceover / holds / choices / the title.
  function updateDateIndicator() {
    const el = $("date-indicator");
    if (!el) return;
    let year = "";
    if (mode === "play" && SCRIPT && SCRIPT.chapters) {
      const cur = SCRIPT.chapters.find((c) => c.n === st.chapter);
      if (cur) {
        const m = cur.title.match(/(\d{4})/);
        if (m) year = m[1];
        else if (st.chapter === SCRIPT.chapters.length) year = "2045"; // epilogue
      }
    }
    el.textContent = year;
    el.style.display = year ? "" : "none";
  }

  function advance(fromAuto) {
    if (mode !== "play" || reviewing || chapFading || choiceActive) return;
    if (!fromAuto) dismissAdvanceHint();
    if (!fromAuto && st.autoAdvanceMs != null && Date.now() - lastAutoAdvance < 250) return;
    if (completeTyper()) return;
    if (revealNextVoSegment()) return;
    if (!waiting) return;
    if (!fromAuto) lastAutoAdvance = Date.now();
    if (capsSticky) { capsSticky = false; refreshUiHidden(); }
    clearTimers();
    pc++;
    chapArmed = true;
    step();
    chapArmed = false;
    if (waiting) pushHistory();
  }

  /* ---------- skip (hold Ctrl; hard-stops at unread text and at choices) ---------- */

  let skipActive = false;
  let skipTimer = null;
  // is the NEXT blocking beat (following jumps) already read?
  function nextStopSeen() {
    let j = pc + 1;
    let guard = 0;
    while (j < SCRIPT.ins.length && ++guard <= SCRIPT.ins.length + 8) {
      const c = SCRIPT.ins[j];
      if (c.op === "jump") {
        const t = SCRIPT.labels[c.target];
        if (t === undefined) return false;
        j = t; continue;
      }
      if (c.op === "choice" || c.op === "title") return false; // never skip into these
      if (c.op === "say" || c.op === "narrate" || c.op === "hold" ||
          c.op === "pause" || c.op === "overlay" || c.op === "dashboard" ||
          c.op === "voiceover" || c.op === "cg")
        return seenBit(j);
      j++;
    }
    return false;
  }
  function skipTick() {
    skipTimer = null;
    if (!skipActive || mode !== "play" || reviewing || chapFading || choiceActive) return;
    if (!nextStopSeen()) return;
    advance();
    if (skipActive) skipTimer = setTimeout(skipTick, 40);
  }
  function startSkip() {
    if (skipActive) return;
    skipActive = true;
    skipTick();
  }
  function stopSkip() {
    skipActive = false;
    if (skipTimer) { clearTimeout(skipTimer); skipTimer = null; }
  }

  /* ---------- rollback / review (derived from the executed path) ---------- */

  function pushHistory() {
    if (history[history.length - 1] !== pc) history.push(pc);
    if (history.length > 1000) history.shift();
    reviewIdx = history.length - 1;
    reviewing = false;
    presentPathSnap = null;
  }
  function reviewSeek(target) {
    seek(target);       // path-aware reconstruction (instant transitions)
    finishTyperFully(); // no typing animation in review
  }
  function rollBack() {
    if (mode !== "play" || uiHidden || chapFading) return;
    if (reviewIdx <= 0) return;
    if (!reviewing) presentPathSnap = path.slice(); // remember the full present path
    reviewIdx--;
    reviewing = true;
    reviewSeek(history[reviewIdx]);
  }
  function rollForward() {
    if (mode !== "play" || uiHidden || chapFading) return;
    if (reviewIdx >= history.length - 1) { advance(); return; }
    reviewIdx++;
    if (reviewIdx >= history.length - 1) { reviewing = false; presentPathSnap = null; }
    reviewSeek(history[reviewIdx]);
  }
  function returnToPresent() {
    if (!reviewing) return;
    reviewIdx = history.length - 1;
    reviewing = false;
    presentPathSnap = null;
    reviewSeek(history[reviewIdx]);
  }

  /* ---------- hide-UI (Shift peek / CapsLock sticky) ---------- */

  const HIDEABLE = ["textbox", "volines", "musicbtn", "menubtn", "chapter-indicator", "date-indicator", "choicemenu"];
  function applyUiHidden(hide) {
    for (const id of HIDEABLE) {
      const el = $(id);
      if (!el) continue;
      if (hide) {
        if (el.dataset.peek === undefined) el.dataset.peek = el.style.display;
        el.style.display = "none";
      } else if (el.dataset.peek !== undefined) {
        el.style.display = el.dataset.peek;
        delete el.dataset.peek;
      }
    }
  }
  function refreshUiHidden() {
    const shouldHide = mode === "play" && (shiftPeek || capsSticky);
    if (shouldHide === uiHidden) return;
    uiHidden = shouldHide;
    applyUiHidden(shouldHide);
  }
  function hideUI() { shiftPeek = true; refreshUiHidden(); }
  function showUI() { shiftPeek = false; refreshUiHidden(); }

  /* ---------- seek: silent path-aware replay (resume / chapter jump / rollback).
     State effects only — never presentation effects (no fades, no autoplay arm,
     no bgm restart thanks to playBgm idempotency). ---------- */

  function seek(target) {
    clearTimers();
    cancelChapterFade();
    hideChoice();
    Object.assign(st, freshState());
    $("bglayer").innerHTML = "";
    execClear("all", true);
    clearInscription();
    hideDashboard();
    setVoiceover("off", true);
    hideTextbox();

    path = [];
    let voGroupStart = 0;
    const end = walkPath(choiceRecords, target, (j, c) => {
      path.push(j);
      switch (c.op) {
        case "bg": st.bg = c.id; st.cg = null; st.inscription = null; break;
        case "cg": st.cg = c.id; st.bg = null; st.inscription = null; st.sprites = { left: null, center: null, right: null }; break;
        case "sprite": st.sprites[spriteSlot(c)] = { char: c.char, expr: c.expr }; break;
        case "clear":
          if (c.what === "all") st.sprites = { left: null, center: null, right: null };
          else st.sprites[c.what] = null;
          break;
        case "voiceover": st.vo = c.mode; if (c.mode !== "off") { st.voLines = []; voGroupStart = j + 1; } break;
        case "fadeout":
          st.vo = "off"; st.voLines = [];
          st.cg = null; st.bg = null; st.inscription = null;
          st.sprites = { left: null, center: null, right: null };
          break;
        case "narrate": if (st.vo === "on" || st.vo === "over") st.voLines.push(c.text); break;
        case "autoplay": st.autoAdvanceMs = c.ms; break;
        case "tint": st.tint = c.mode; break;
        case "montage": st.montage = { secs: c.secs }; break;
        case "montage_end": st.montage = null; break;
        case "bgm": st.bgm = c.id === "stop" ? null : c.id; break;
        case "overlay": st.inscription = c.lines; break;
        case "dashboard": st.prevDash = dashNums(c.data); break; // silent: track for trends only
        case "chapter": st.chapter = c.n; break;
      }
    });

    // render the reconstructed state instantly
    if (st.bg) setLayerInstant("bg", st.bg);
    if (st.cg) setLayerInstant("cg", st.cg);
    for (const slot of ["left", "center", "right"])
      if (st.sprites[slot]) setSprite(st.sprites[slot].char, st.sprites[slot].expr, slot, true);
    setTint(st.tint);
    if (st.vo === "on" || st.vo === "over") {
      const shown = st.voLines.length;
      if (shown > 0) {
        setVoiceover(st.vo, true);
        prerenderVoGroup(voGroupStart);
        for (let k = 0; k < shown; k++) revealVoLine(true);
      } else {
        st.voDeferred = true;
        st.voDeferredPc = voGroupStart;
      }
    }
    if (st.inscription) showInscription(st.inscription);
    playBgm(st.bgm || "stop", true);

    pc = end.pc;
    if (end.reason === "end") { endCard(); return; }
    step();
  }
  function setLayerInstant(kind, id) {
    const el = makeLayerImg(kind, id);
    el.style.opacity = "1";
    $("bglayer").innerHTML = "";
    $("bglayer").appendChild(el);
  }

  /* ---------- title / menus / end ---------- */

  function showTitle() {
    mode = "title";
    hideChoice();
    $("title").style.display = "";
    $("pausemenu").style.display = "none";
    $("chapters").style.display = "none";
    $("endcard").style.display = "none";
    $("historymenu").style.display = "none";
    $("settingsmenu").style.display = "none";
    $("overviewmenu").style.display = "none";
    $("controlsmenu").style.display = "none";
    $("creditsmenu").style.display = "none";
    $("menubtn").style.display = "";
    const sv = loadSave();
    $("btn-continue").style.display = sv && sv.pc > 0 && !sv.fin ? "" : "none";
    const anySeen = sv && sv.seen && /[^A]/.test(sv.seen); // any nonzero base64 byte
    $("btn-chapters-title").style.display = anySeen || finished ? "" : "none";
    playBgm("bgm_title"); // idempotent; silent no-op when the track is absent
    updateChapterIndicator();
  }
  function beginPlay(target) {
    $("title").style.display = "none";
    $("endcard").style.display = "none";
    $("pausemenu").style.display = "none";
    $("chapters").style.display = "none";
    $("menubtn").style.display = "";
    mode = "play";
    uiHidden = false; shiftPeek = false; capsSticky = false;
    seek(target);
    // rollback derives from the executed PATH (not linear pc order): seed the
    // review history with every blocking stop along the replayed path, so
    // rolling back works across resumes and across choices
    const BLOCK = { say: 1, narrate: 1, hold: 1, pause: 1, overlay: 1, dashboard: 1, choice: 1 };
    history = path.filter((p2) => SCRIPT.ins[p2] && BLOCK[SCRIPT.ins[p2].op]);
    if (history[history.length - 1] !== pc) history.push(pc);
    if (history.length > 1000) history = history.slice(-1000);
    reviewIdx = history.length - 1; reviewing = false; presentPathSnap = null;
    if (target === 0) maybeShowAdvanceHint();
  }
  function endCard() {
    clearTimers();
    setVoiceover("off", true);
    hideChoice();
    finished = true;
    pc = 0;
    save();
    mode = "menu";
    $("menubtn").style.display = "none";
    $("endcard").style.display = "";
    updateChapterIndicator();
  }

  /* chapter menu: a chapter unlocks when it is BOTH reachable on the current
     recorded choices AND already read; branches not on the current path (or
     never visited) show locked. No hardcoded chapter count anywhere. */
  function openChapters(fromTitle) {
    const list = $("chapter-list");
    list.innerHTML = "";
    const reach = reachableNow();
    const titleBtn = document.createElement("button");
    titleBtn.className = "chapter-btn";
    titleBtn.textContent = "0 · Title";
    titleBtn.onclick = (e) => {
      e.stopPropagation();
      $("chapters").style.display = "none";
      showTitle();
    };
    list.appendChild(titleBtn);
    for (const ch of SCRIPT.chapters) {
      const reached = reach.has(ch.at) && seenBit(ch.at);
      const btn = document.createElement("button");
      btn.className = "chapter-btn" + (reached ? "" : " locked");
      btn.textContent = reached ? ch.n + " · " + ch.title : ch.n + " · ─────";
      if (reached)
        btn.onclick = (e) => {
          e.stopPropagation();
          $("chapters").style.display = "none";
          beginPlay(ch.at);
        };
      list.appendChild(btn);
    }
    $("chapters").dataset.from = fromTitle ? "title" : "pause";
    if (fromTitle) { $("title").style.display = "none"; $("menubtn").style.display = "none"; }
    $("endcard").style.display = "none";
    $("pausemenu").style.display = "none";
    $("chapters").style.display = "";
    if (!fromTitle) mode = "menu";
    updateChapterIndicator();
  }
  function closeChapters() {
    $("chapters").style.display = "none";
    if ($("chapters").dataset.from === "pause") openPause();
    else showTitle();
  }

  function openPause() {
    mode = "menu";
    renderMenuOverview();
    $("pausemenu").style.display = "";
    $("pause-save-note").style.display = finished ? "none" : "";
    updateChapterIndicator();
  }
  function closePause() {
    $("pausemenu").style.display = "none";
    mode = "play";
    updateChapterIndicator();
  }

  /* ---------- "Where Things Stand": ai-2040 run overview ----------
     Reuses the dashboard card. The snapshot is the most recent end-of-chapter
     @dashboard the player has PASSED (scanned from the executed path; the one
     before it drives the trend arrows). Before any dashboard is reached it
     falls back to the 2027 baseline. Adds the current plan + endings-seen. */
  const DASH_BASELINE = { // ch1 / 2027 baseline (see claude-notes/DASHBOARD-DATA.md)
    year: "2027", employment: "96%", dividend: "not yet",
    workforce: "millions (coding)", compute: "20M H100e",
    gdp: "+3%", capability: "42", trajectory: "Default race, no deal",
  };
  function currentPlan() {
    for (let k = path.length - 1; k >= 0; k--) {
      const c = SCRIPT.ins[path[k]];
      if (c && c.op === "label" && /^plan_/.test(c.name))
        return ENDINGS_LIST.find((e) => e.label === c.name) || null;
    }
    return null;
  }
  function openOverview() {
    let last = null, prev = null;
    for (const p of path) {
      const c = SCRIPT.ins[p];
      if (c && c.op === "dashboard" && c.data) { prev = last; last = c.data; }
    }
    const data = last || DASH_BASELINE;
    const prevNums = last ? dashNums(prev) : null;
    const plan = currentPlan();
    const seenN = ENDINGS_LIST.filter((e) => seenLabels.has(e.label)).length;
    const planText = plan
      ? ("Plan " + plan.letter + " &middot; " + dashEsc(plan.name))
      : "Not yet chosen";
    const meta =
      '<div class="dash-meta">' +
        '<div class="dm-item"><span class="dm-k">Your Plan</span>' +
          '<span class="dm-v">' + planText + '</span></div>' +
        '<div class="dm-item"><span class="dm-k">Endings Seen</span>' +
          '<span class="dm-v">' + seenN + ' <span class="dm-slash">of ' + ENDINGS_LIST.length + '</span></span></div>' +
      '</div>';
    const eyebrow = "Run Overview" + (plan ? " &middot; Plan " + plan.letter : "") +
      (last ? "" : " &middot; where you began");
    $("overview-card").innerHTML = dashCardHTML(data, prevNums, eyebrow, meta);
    $("pausemenu").style.display = "none";
    $("overviewmenu").style.display = "";
    mode = "menu";
    updateChapterIndicator();
  }
  function closeOverview() {
    $("overviewmenu").style.display = "none";
    openPause();
  }
  function openControls() {
    $("pausemenu").style.display = "none";
    $("controlsmenu").style.display = "";
    mode = "menu";
    updateChapterIndicator();
  }
  function closeControls() {
    $("controlsmenu").style.display = "none";
    openPause();
  }
  function openCredits(fromTitle) {
    $("creditsmenu").dataset.from = fromTitle ? "title" : "pause";
    $("title").style.display = "none";
    $("pausemenu").style.display = "none";
    $("creditsmenu").style.display = "";
  }
  function closeCredits() {
    $("creditsmenu").style.display = "none";
    if ($("creditsmenu").dataset.from === "title") showTitle();
    else openPause();
  }
  // compact run-overview shown at the top of the pause menu by default
  function renderMenuOverview() {
    const el = $("menu-overview");
    if (!el) return;
    let last = null;
    for (const p of path) {
      const c = SCRIPT.ins[p];
      if (c && c.op === "dashboard" && c.data) last = c.data;
    }
    const d = last || DASH_BASELINE;
    const plan = currentPlan();
    const seenN = ENDINGS_LIST.filter((e) => seenLabels.has(e.label)).length;
    const planText = plan ? ("Plan " + plan.letter + " &middot; " + dashEsc(plan.name)) : "Not yet chosen";
    const cap = dashNum(d.capability);
    const stat = (k, v) => v == null ? "" :
      '<span class="mo-stat"><span class="mo-k">' + k + '</span> ' + dashEsc(String(v)) + '</span>';
    el.innerHTML =
      '<div class="mo-top">' +
        '<span class="mo-year">' + dashEsc(d.year || "") + '</span>' +
        '<span class="mo-traj">' + dashEsc(d.trajectory || "") + '</span>' +
      '</div>' +
      '<div class="mo-row">' +
        '<span class="mo-stat"><span class="mo-k">Plan</span> ' + planText + '</span>' +
        '<span class="mo-stat"><span class="mo-k">Endings</span> ' + seenN + ' of ' + ENDINGS_LIST.length + '</span>' +
      '</div>' +
      '<div class="mo-row">' +
        stat("Employment", d.employment) + stat("Dividend", d.dividend) +
        (isFinite(cap) ? '<span class="mo-stat"><span class="mo-k">Capability</span> ' + cap + '/100</span>' : "") +
      '</div>';
  }

  /* ---------- backlog: derived from the executed PATH, not linear pc order ---------- */

  function backlogHtml(text) {
    return text
      .replace(/\s*\|\s*/g, " ")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  }
  function openHistory() {
    const list = $("history-list");
    list.innerHTML = "";
    for (const j of path) {
      const c = SCRIPT.ins[j];
      if (!c || (c.op !== "say" && c.op !== "narrate")) continue;
      const row = document.createElement("div");
      row.className = "hist-row";
      if (c.op === "say") {
        const nm = document.createElement("span");
        nm.className = "hist-name";
        nm.textContent = c.speaker;
        const info = speakerInfo(c.speaker);
        if (info) nm.style.color = info.color;
        row.appendChild(nm);
      }
      const tx = document.createElement("span");
      tx.className = "hist-text" + (c.op === "narrate" ? " hist-narr" : "");
      tx.innerHTML = backlogHtml(c.text);
      row.appendChild(tx);
      list.appendChild(row);
    }
    if (!list.children.length) {
      const empty = document.createElement("div");
      empty.className = "hist-empty";
      empty.textContent = "No dialogue yet.";
      list.appendChild(empty);
    }
    $("pausemenu").style.display = "none";
    $("historymenu").style.display = "";
    mode = "menu";
    list.scrollTop = list.scrollHeight;
  }
  function closeHistory() {
    $("historymenu").style.display = "none";
    openPause();
  }

  /* ---------- first-time hint ---------- */

  let hintActive = false;
  function maybeShowAdvanceHint() {
    let seen = false;
    try { seen = !!localStorage.getItem(HINT_KEY); } catch (e) {}
    if (seen) return;
    hintActive = true;
    $("advance-hint").classList.add("show");
  }
  function dismissAdvanceHint() {
    if (!hintActive) return;
    hintActive = false;
    $("advance-hint").classList.remove("show");
    try { localStorage.setItem(HINT_KEY, "1"); } catch (e) {}
  }

  /* ---------- settings ---------- */

  function renderSettingsUI() {
    for (const btn of $("speed-group").children)
      btn.classList.toggle("selected", +btn.dataset.speed === settings.typeMs);
    for (const btn of $("autoplay-group").children)
      btn.classList.toggle("selected", (btn.dataset.autoplay === "1") === settings.autoplay);
    for (const btn of $("delay-group").children)
      btn.classList.toggle("selected", +btn.dataset.delay === settings.autoplayDelayMs);
    $("autoplay-delay-row").classList.toggle("disabled", !settings.autoplay);
    for (const btn of $("showchapter-group").children)
      btn.classList.toggle("selected", btn.dataset.showchapter === settings.showChapter);
    $("volume-slider").value = Math.round(bgmTargetVol() * 100);
  }
  function openSettings(fromTitle) {
    disarmDelete();
    renderSettingsUI();
    $("settingsmenu").dataset.from = fromTitle ? "title" : "pause";
    if (fromTitle) { $("title").style.display = "none"; $("menubtn").style.display = "none"; }
    else $("pausemenu").style.display = "none";
    $("settingsmenu").style.display = "";
    if (!fromTitle) mode = "menu";
    updateChapterIndicator();
  }
  function closeSettings() {
    disarmDelete();
    $("settingsmenu").style.display = "none";
    if ($("settingsmenu").dataset.from === "title") showTitle();
    else openPause();
  }
  let deleteArmed = false;
  function disarmDelete() {
    deleteArmed = false;
    const b = $("btn-delete-progress");
    if (b) { b.classList.remove("armed"); b.textContent = "Delete all progress"; }
  }
  function onDeleteProgress() {
    const b = $("btn-delete-progress");
    if (!deleteArmed) {
      deleteArmed = true;
      b.classList.add("armed");
      b.textContent = "Click again to erase everything";
      return;
    }
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
    try { localStorage.removeItem(SETTINGS_KEY); } catch (e) {}
    document.cookie = SAVE_KEY + "=; max-age=0; path=/";
    settings = Object.assign({}, DEFAULT_SETTINGS);
    finished = false; pc = 0;
    choiceRecords = {};
    seenLabels = new Set();
    seenPcs = new Uint8Array(Math.max(1, Math.ceil(SCRIPT.ins.length / 8)));
    path = []; history = []; reviewIdx = 0; reviewing = false;
    musicEnabled = settings.musicOn;
    disarmDelete();
    updateMusicBtn();
    $("settingsmenu").style.display = "none";
    showTitle();
  }

  /* ---------- input ---------- */

  function onAdvanceInput(e) {
    if (mode !== "play") return;
    e.preventDefault();
    if (chapFading) return;
    if (shiftPeek) return;
    if (capsSticky) { capsSticky = false; refreshUiHidden(); }
    if (reviewing) { returnToPresent(); return; } // a click during review returns to present
    advance();
  }

  function wire() {
    const unlockAudio = (e) => {
      if (e && e.target && e.target.closest && e.target.closest("#musicbtn")) return;
      const wasLocked = !audioUnlocked;
      audioUnlocked = true;
      if (musicEnabled && bgmEl && bgmEl.paused) bgmEl.play().catch(() => {});
      if (wasLocked) updateMusicBtn();
    };
    window.addEventListener("pointerdown", unlockAudio, { capture: true });
    window.addEventListener("keydown", unlockAudio, { capture: true });

    $("stage").addEventListener("click", (e) => {
      if (e.target.closest("#menubtn") || e.target.closest("#musicbtn") ||
          e.target.closest("#chapter-indicator") || e.target.closest(".menu") ||
          e.target.closest("#choicemenu .choice-btn")) return;
      if (choiceActive && !reviewing) return; // clicks outside the menu don't pick
      onAdvanceInput(e);
    });
    $("musicbtn").onclick = (e) => { e.stopPropagation(); toggleMusic(); };
    $("chapter-indicator").onclick = (e) => {
      e.stopPropagation();
      if (mode === "play") openChapters(false);
    };
    document.addEventListener("keydown", (e) => {
      if (choiceKey(e)) { e.preventDefault(); return; }
      if (e.key === " " || e.key === "Enter") {
        if (choiceActive) return;
        onAdvanceInput(e);
      } else if (e.key === "Escape") {
        if (mode === "play") openPause();
        else if ($("historymenu").style.display !== "none") closeHistory();
        else if ($("chapters").style.display !== "none") closeChapters();
        else if ($("settingsmenu").style.display !== "none") closeSettings();
        else if ($("overviewmenu").style.display !== "none") closeOverview();
        else if ($("controlsmenu").style.display !== "none") closeControls();
        else if ($("creditsmenu").style.display !== "none") closeCredits();
        else if ($("pausemenu").style.display !== "none") closePause();
      } else if (e.key === "Control") {
        startSkip();
      } else if (e.key === "Shift") {
        if (mode === "play") { e.preventDefault(); hideUI(); }
      } else if (e.key === "CapsLock") {
        if (mode === "play") {
          capsSticky = !!(e.getModifierState && e.getModifierState("CapsLock"));
          refreshUiHidden();
        }
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (mode === "play") { e.preventDefault(); rollBack(); }
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (mode === "play") { e.preventDefault(); rollForward(); }
      } else if (e.key === "End") {
        if (mode === "play" && reviewing) { e.preventDefault(); returnToPresent(); }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key === "Control") stopSkip();
      else if (e.key === "Shift") showUI();
    });
    window.addEventListener("blur", () => { capsSticky = false; showUI(); stopSkip(); });
    $("menubtn").onclick = (e) => {
      e.stopPropagation();
      if (mode === "title") openSettings(true); else openPause();
    };
    $("btn-begin").onclick = () => beginPlay(0);
    $("btn-continue").onclick = () => {
      const sv = loadSave();
      applySave(sv);
      beginPlay((sv && sv.pc) || 0);
    };
    $("btn-chapters-title").onclick = () => openChapters(true);
    $("btn-settings-title").onclick = () => openSettings(true);
    $("btn-resume").onclick = closePause;
    $("btn-overview").onclick = openOverview;
    $("btn-overview-back").onclick = closeOverview;
    $("btn-controls").onclick = openControls;
    $("btn-controls-back").onclick = closeControls;
    $("btn-credits-title").onclick = () => openCredits(true);
    if ($("btn-credits")) $("btn-credits").onclick = () => openCredits(false);
    $("btn-credits-back").onclick = closeCredits;
    $("btn-chapters").onclick = () => openChapters(false);
    $("btn-history").onclick = () => openHistory();
    $("btn-history-back").onclick = closeHistory;
    $("btn-settings").onclick = () => openSettings(false);
    $("btn-settings-back").onclick = closeSettings;
    $("volume-slider").addEventListener("input", (e) => {
      settings.musicVolume = Math.max(0, Math.min(1, (+e.target.value || 0) / 100));
      saveSettings();
      if (bgmEl && musicEnabled) bgmEl.volume = settings.musicVolume;
    });
    $("btn-delete-progress").onclick = (e) => { e.stopPropagation(); onDeleteProgress(); };
    $("btn-totitle").onclick = () => showTitle();
    $("btn-chapters-back").onclick = closeChapters;
    $("btn-end-title").onclick = () => showTitle();
    $("btn-end-chapters").onclick = () => openChapters(true);

    $("speed-group").addEventListener("click", (e) => {
      const btn = e.target.closest(".opt-btn");
      if (!btn) return;
      settings.typeMs = +btn.dataset.speed;
      saveSettings();
      renderSettingsUI();
    });
    $("autoplay-group").addEventListener("click", (e) => {
      const btn = e.target.closest(".opt-btn");
      if (!btn) return;
      settings.autoplay = btn.dataset.autoplay === "1";
      saveSettings();
      renderSettingsUI();
      if (settings.autoplay && mode === "play" && waiting) maybeAutoplay();
    });
    $("delay-group").addEventListener("click", (e) => {
      const btn = e.target.closest(".opt-btn");
      if (!btn) return;
      settings.autoplayDelayMs = +btn.dataset.delay;
      saveSettings();
      renderSettingsUI();
    });
    $("showchapter-group").addEventListener("click", (e) => {
      const btn = e.target.closest(".opt-btn");
      if (!btn) return;
      settings.showChapter = btn.dataset.showchapter;
      saveSettings();
      renderSettingsUI();
      updateChapterIndicator();
    });
  }

  /* ---------- boot ---------- */

  async function fetchText(url) {
    const r = await fetch(url, { cache: "no-cache" });
    if (!r.ok) throw new Error(url + ": " + r.status);
    return r.text();
  }

  async function boot() {
    try {
      const [mtext, stext] = await Promise.all([
        fetchText("assets/manifest.json"),
        fetchText("script.md"),
      ]);
      MANIFEST = JSON.parse(mtext);
      SCRIPT = parseScript(stext);
    } catch (err) {
      $("boot-error").style.display = "";
      $("boot-error").textContent =
        "Could not load script/assets (" + err.message + "). " +
        "If opening from file://, serve the folder instead, e.g.: python3 -m http.server";
      return;
    }
    seenPcs = new Uint8Array(Math.max(1, Math.ceil(SCRIPT.ins.length / 8)));
    applySave(loadSave());
    for (const id of Object.keys(MANIFEST.audio || {}))
      if (id.startsWith("sfx")) preloadSfx(id);
    const t = assetPath("ui", "ui_title");
    if (t) $("title-art").style.backgroundImage = "url('" + t + "')";
    musicEnabled = settings.musicOn !== false;
    const vt = $("version-tag"); if (vt) vt.textContent = "v" + APP_VERSION;
    const sv = $("settings-version"); if (sv) sv.textContent = "PLAN A · v" + APP_VERSION;
    wire();
    updateMusicBtn();
    showTitle();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
