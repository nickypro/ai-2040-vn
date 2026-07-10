#!/usr/bin/env node
/* PLAN A e2e: drives the REAL script in a real headless Chromium
 * (playwright-core reused from /workspace/tools/headless-browser).
 * Serves over http (fetch() means file:// never works).
 *
 * Covers: clean boot (no console errors / page errors / HTTP>=400),
 * click-through of ALL FIVE plan branches to their endings, the 5-way choice
 * menu + seen-markers accumulating, save/resume mid-branch (Plan A) with scene
 * reconstruction, rollback across the choice re-presenting it, @title from
 * the_pause, chapter menu derivation. Screenshots land in qa/.
 */
"use strict";
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const root = path.join(__dirname, "..");
const QA = path.join(root, "qa");
const PORT = 8931;
const pw = require("/workspace/tools/headless-browser/node_modules/playwright-core");

function findChrome() {
  return execSync(
    "ls -d " + os.homedir() + "/.cache/ms-playwright/chromium-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1",
    { encoding: "utf8" }).trim();
}

let failures = 0;
function check(cond, msg) {
  if (cond) console.log("  ok  " + msg);
  else { failures++; console.log("  FAIL " + msg); }
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(QA, { recursive: true });
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--directory", root], { stdio: "ignore" });
  await sleep(800);

  const depLibs = path.join(os.homedir(), ".local", "chrome-deps", "lib");
  const browser = await pw.chromium.launch({
    executablePath: findChrome(),
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--mute-audio"],
    env: Object.assign({}, process.env, {
      LD_LIBRARY_PATH: depLibs + (process.env.LD_LIBRARY_PATH ? ":" + process.env.LD_LIBRARY_PATH : ""),
    }),
  });
  const consoleErrors = [];
  const badResponses = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("plana_settings", JSON.stringify({
          typeMs: 0, autoplay: false, autoplayDelayMs: 900,
          showChapter: "number", musicOn: false, musicVolume: 0.7,
        }));
      } catch (e) {}
    });
    const page = await ctx.newPage();
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));
    page.on("response", (r) => { if (r.status() >= 400) badResponses.push(r.status() + " " + r.url()); });

    const url = "http://127.0.0.1:" + PORT + "/index.html";
    const vis = (sel) => page.locator(sel).isVisible();
    const shot = (name) => page.screenshot({ path: path.join(QA, name) });
    const choiceUp = () => vis("#choicemenu");
    // narration lands in #dialog; @voiceover lines land in #volines. Read both,
    // case-insensitively, so markers match wherever the beat rendered.
    async function stageText() {
      const a = (await page.locator("#dialog").textContent().catch(() => "")) || "";
      const b = (await page.locator("#volines").textContent().catch(() => "")) || "";
      return (a + " " + b).toLowerCase();
    }
    const dialogHas = async (s) => (await stageText()).includes(String(s).toLowerCase());
    // advance until predicate; check BEFORE each click so a choice is never
    // accidentally picked. Handles voiceover/hold/chapter-curtain panels.
    async function advanceUntil(pred, label, max = 500) {
      for (let k = 0; k < max; k++) {
        if (await pred()) return true;
        await page.mouse.click(640, 250);
        await sleep(45);
      }
      console.log("  (advanceUntil timed out: " + label + ")");
      return false;
    }
    // click the choice option whose text contains `frag`
    async function pick(frag) {
      const btn = page.locator(".choice-btn", { hasText: frag }).first();
      await btn.click();
      await sleep(400);
    }
    // walk one plan branch from the 2029 choice to the ending_return menu
    async function runBranch(frag, marker, endShot) {
      await pick(frag);
      const entered = await advanceUntil(() => dialogHas(marker), "enter branch " + frag, 12);
      check(entered, "entered branch " + frag + " (saw '" + marker + "')");
      const back = await advanceUntil(choiceUp, "reach ending_return after " + frag);
      check(back, frag + " reaches the rejoin choice");
      if (endShot) await shot(endShot);
    }

    console.log("== boot ==");
    await page.goto(url, { waitUntil: "networkidle" });
    await sleep(500);
    check(await vis("#title"), "title screen visible");
    check(await vis("#btn-begin"), "Begin button visible");
    check(!(await vis("#btn-continue")), "Continue hidden with no save");
    await shot("e2e-01-title.png");

    console.log("== chapter 1 -> the 2029 choice ==");
    await page.click("#btn-begin");
    await sleep(700);
    // opens on a @voiceover panel (on black), not the textbox; advance to prose
    const sawOpen = await advanceUntil(() => dialogHas("two workforces"), "opening voiceover");
    check(sawOpen, "opening narration shows (two workforces)");
    const gotChoice = await advanceUntil(choiceUp, "reach the 2029 choice");
    check(gotChoice, "choice menu appears");
    const optCount = await page.locator(".choice-btn").count();
    check(optCount === 5, "choice renders 5 options (got " + optCount + ")");
    check((await page.locator(".choice-btn.seen").count()) === 0, "no option marked seen on first arrival");
    check(await vis("#choice-history-hint"), "decision shows the clickable History hint");
    await page.locator("#choice-history-hint").click();
    check(await vis("#historymenu"), "clicking the decision hint opens History");
    await page.locator("#btn-history-back").click();
    check(await choiceUp(), "closing hinted History returns to the same decision");
    await page.keyboard.press("h");
    check(await vis("#historymenu"), "H opens History from a decision");
    await page.locator("#btn-history-back").click();
    check(await choiceUp(), "closing keyboard-opened History returns to the decision");
    const ind = await page.locator("#chapter-indicator").textContent();
    check(ind && /\/14/.test(ind), "chapter indicator derives N/14 from the script (got '" + ind + "')");
    await shot("e2e-02-choice5.png");

    console.log("== branch: Plan D (race ending) ==");
    await runBranch("Plan D", "get out of the way", "e2e-03-planD-end.png");
    check(await page.locator(".choice-btn", { hasText: "Extra: Public POV" }).count() === 0,
      "bonus POVs remain locked before Plan A completion");
    console.log("== endings gallery -> return to 2029 ==");
    await pick("Return to 2029");
    const re1 = await advanceUntil(choiceUp, "re-reach 2029 choice");
    check(re1, "rejoin returns to the 2029 choice");
    check((await page.locator(".choice-btn.seen").count()) === 1, "one option now marked seen (Plan D)");

    console.log("== branch: Plan C ==");
    await runBranch("Plan C", "alone", null);
    await pick("Return to 2029");
    await advanceUntil(choiceUp, "re-reach choice after C");
    console.log("== branch: Plan B ==");
    await runBranch("Plan B", "top of the hill", null);
    await pick("Return to 2029");
    await advanceUntil(choiceUp, "re-reach choice after B");
    console.log("== branch: Plan S ==");
    await runBranch("Plan S", "Stopped", null);
    await pick("Return to 2029");
    const re4 = await advanceUntil(choiceUp, "re-reach choice after S");
    check(re4, "all four short branches traversed and rejoined");
    check((await page.locator(".choice-btn.seen").count()) === 4, "four options marked seen (D/C/B/S)");
    await shot("e2e-04-four-seen.png");

    console.log("== branch: Plan A + save/resume mid-branch ==");
    await pick("Plan A");
    await sleep(900); // let the ch4 chapter curtain settle before probing
    // entering Plan A is confirmed by reaching its unique material (the entry
    // line can be consumed by a click landing as the curtain lifts, so accept
    // any ch4/ch5 marker as proof of entry)
    const planAin = await advanceUntil(
      () => dialogHas("you say plan a") || dialogHas("the hard one") || dialogHas("get me chen"),
      "Plan A ch4 material", 60);
    check(planAin, "Plan A entered (ch4 material shown)");
    const atCh5 = await advanceUntil(() => dialogHas("four principles") || dialogHas("buy time"), "advance into Plan A ch5", 400);
    check(atCh5, "advanced into Plan A main path (ch5 material)");
    const lsSave = await page.evaluate(() => localStorage.getItem("plana_save"));
    check(!!lsSave, "autosave present in localStorage");
    check(await page.evaluate(() => document.cookie.includes("plana_save=")), "autosave present in cookie");
    check(Object.keys(JSON.parse(lsSave).choices || {}).length >= 1, "save records at least one choice");
    await page.reload({ waitUntil: "networkidle" });
    await sleep(500);
    check(await vis("#btn-continue"), "Continue offered after reload");
    await page.click("#btn-continue");
    await sleep(700);
    // resume lands on the saved beat, showing its first sentence; advance a few
    // sentence-pauses so the Plan A marker (which may be in a later sentence of
    // the beat or the next beat) becomes visible.
    const resumedOk = await advanceUntil(
      () => stageText().then((t) => /buy time|four principles|consortium|reversibility|diffuse|transparency|plan a/.test(t)),
      "resume shows Plan A material", 40);
    check(resumedOk, "resume lands back inside Plan A");
    await shot("e2e-05-resumed.png");

    console.log("== rollback across the 2029 choice re-presents it ==");
    let hit = false;
    for (let k = 0; k < 400 && !(hit = await choiceUp()); k++) {
      await page.keyboard.press("ArrowLeft");
      await sleep(30);
    }
    check(hit, "rolling back reaches a choice menu again");
    const optAtRollback = await page.locator(".choice-btn").count();
    check(optAtRollback === 5, "the re-presented menu is the 5-way 2029 choice (got " + optAtRollback + ")");
    await shot("e2e-06-rollback-choice.png");

    console.log("== play full Plan A (with the safety-case decision), then endings gallery ==");
    await pick("Plan A");
    // mid-Plan-A (after ch6) the safety-case decision appears
    const sc = await advanceUntil(choiceUp, "reach the safety-case decision", 900);
    check(sc, "safety-case decision appears on the Plan A path");
    check(await page.locator(".choice-btn", { hasText: "Approve the safety case" }).count() === 1,
      "decision offers to approve");
    await pick("Approve the safety case");          // exercise the failure branch
    const failEnd = await advanceUntil(choiceUp, "reach the failure ending", 60);
    check(failEnd, "approving reaches the failure ending + back choice");
    check(await page.locator(".choice-btn", { hasText: "Go back to the decision" }).count() === 1,
      "the failure ending offers a back button");
    check(await page.locator(".choice-btn.seen", { hasText: "Go back to the decision" }).count() === 0,
      "the failure back button is not checkmarked");
    await pick("Go back to the decision");          // the back button
    const sc2 = await advanceUntil(choiceUp, "back at the decision", 60);
    check(sc2, "the back button returns to the safety-case decision");
    await pick("Send it back for one more check");  // the canonical branch
    const rejoined = await advanceUntil(() => dialogHas("without pause"), "rejoin Plan A after the check", 160);
    check(rejoined, "one-more-check rejoins the Plan A path");

    console.log("== turning point: covert project ==");
    const covert = await advanceUntil(choiceUp, "reach covert-project decision", 700);
    check(covert, "covert-project decision appears");
    check(await page.locator(".choice-btn", { hasText: "Restart a secret American project" }).count() === 1,
      "covert decision puts failure first");
    await pick("Restart a secret American project");
    await advanceUntil(choiceUp, "reach covert-project failure", 80);
    check(await page.locator(".choice-btn", { hasText: "Go back to the covert-project decision" }).count() === 1,
      "covert failure offers a back button");
    check(await page.locator(".choice-btn.seen", { hasText: "Go back to the covert-project decision" }).count() === 0,
      "covert failure back button is not checkmarked");
    await pick("Go back to the covert-project decision");
    await advanceUntil(choiceUp, "return to covert-project decision", 80);
    await pick("Freeze research sharing");

    console.log("== turning point: deal breakdown ==");
    const deal = await advanceUntil(choiceUp, "reach deal-breakdown decision", 900);
    check(deal, "deal-breakdown decision appears");
    check(await page.locator(".choice-btn", { hasText: "Cross the border" }).count() === 1,
      "deal decision puts failure first");
    await pick("Cross the border");
    await advanceUntil(choiceUp, "reach deal-breakdown failure", 80);
    check(await page.locator(".choice-btn", { hasText: "Go back to the deal-breakdown decision" }).count() === 1,
      "deal failure offers a back button");
    check(await page.locator(".choice-btn.seen", { hasText: "Go back to the deal-breakdown decision" }).count() === 0,
      "deal failure back button is not checkmarked");
    await pick("Go back to the deal-breakdown decision");
    await advanceUntil(choiceUp, "return to deal-breakdown decision", 80);
    await pick("Keep the troops back");

    const cosmic = await advanceUntil(() => vis("#dashboard .dr-cosmic"), "reach cosmic workforce dashboard", 2000);
    check(cosmic, "final dashboard renders the cosmic workforce field");
    check((await page.locator("#dashboard .dr-cosmic .dr-dot").count()) === 420,
      "cosmic workforce fills 15 rows / 420 dots");
    await sleep(2200); // let all 420 staggered dots finish animating before QA capture
    await shot("e2e-07-cosmic-dashboard.png");

    const endRejoin = await advanceUntil(choiceUp, "reach endings gallery after full Plan A", 2000);
    check(endRejoin, "full Plan A path reaches the endings gallery");
    check(await page.locator(".choice-btn", { hasText: "Extra: Public POV" }).count() === 1,
      "Public POV unlocks after completing Plan A");
    check(await page.locator(".choice-btn", { hasText: "Extra: Insider POV" }).count() === 1,
      "Insider POV unlocks after completing Plan A");
    await pick("Extra: Public POV");
    const bonusBack = await advanceUntil(choiceUp, "finish Public POV bonus", 400);
    check(bonusBack, "Public POV bonus returns to endings gallery");
    await pick("Extra: Insider POV");
    const insiderBack = await advanceUntil(choiceUp, "finish Insider POV bonus", 400);
    check(insiderBack, "Insider POV bonus returns to endings gallery");
    await pick("Rest here");
    const titled = await advanceUntil(() => vis("#title"), "reach @title via the_pause", 20);
    check(titled, "@title returns to the title screen");
    check(await vis("#btn-continue"), "Continue offered (resume rewound to last choice)");
    await shot("e2e-07-title-after.png");

    console.log("== chapters menu ==");
    await page.click("#btn-continue");
    await sleep(700);
    check(await choiceUp(), "Continue after @title re-presents the last choice");
    await page.keyboard.press("Escape");
    await sleep(200);
    const chBtnSel = "#chapter-list .chapter-btn";
    if (await vis("#btn-chapters")) {
      await page.click("#btn-chapters");
      await sleep(300);
      const chCount = await page.locator(chBtnSel).count();
      check(chCount >= 3, "chapter menu lists reachable chapters (got " + chCount + ")");
      await shot("e2e-08-chapters.png");
    }

    console.log("== console/network hygiene ==");
    check(consoleErrors.length === 0, "0 console errors" + (consoleErrors.length ? ": " + consoleErrors.slice(0, 3).join(" | ") : ""));
    check(badResponses.length === 0, "0 HTTP>=400" + (badResponses.length ? ": " + badResponses.slice(0, 3).join(", ") : ""));
  } finally {
    await browser.close();
    server.kill();
  }
  console.log(failures ? "\nE2E FAILED: " + failures + " check(s)" : "\nE2E PASSED");
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
