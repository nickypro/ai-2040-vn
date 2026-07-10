#!/usr/bin/env node
/* Scratch QA: screenshots the two new menu panels — "Where Things Stand"
 * (at the 2027 baseline AND after advancing a few chapters) and "Controls". */
"use strict";
const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const root = path.join(__dirname, "..");
const QA = path.join(root, "qa");
const PORT = 8934;
const pw = require("/workspace/tools/headless-browser/node_modules/playwright-core");

function findChrome() {
  return execSync(
    "ls -d " + os.homedir() + "/.cache/ms-playwright/chromium-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1",
    { encoding: "utf8" }).trim();
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
  const errs = [];
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
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push(String(e)));
    const url = "http://127.0.0.1:" + PORT + "/index.html";
    const shot = (n) => page.screenshot({ path: path.join(QA, n) });
    const vis = (s) => page.locator(s).isVisible();

    await page.goto(url, { waitUntil: "networkidle" });
    await sleep(400);
    await page.click("#btn-begin");
    await sleep(400);
    // advance a few beats but stay before the ch1 dashboard (baseline case)
    for (let k = 0; k < 6; k++) { await page.mouse.click(640, 250); await sleep(50); }

    // --- overview at baseline (no dashboard passed yet) ---
    await page.keyboard.press("Escape");
    await sleep(200);
    await page.click("#btn-overview");
    await sleep(300);
    console.log("overview(baseline) visible:", await vis("#overviewmenu"));
    console.log("baseline year text:", await page.locator("#overview-card .dash-year").textContent());
    await shot("panel-overview-baseline.png");
    await page.click("#btn-overview-back");
    await sleep(150);

    // --- controls ---
    await page.click("#btn-controls");
    await sleep(250);
    console.log("controls visible:", await vis("#controlsmenu"));
    await shot("panel-controls.png");
    await page.click("#btn-controls-back");
    await sleep(150);
    await page.keyboard.press("Escape"); // close pause -> resume
    await sleep(200);

    // --- advance well past several dashboards, then re-open overview ---
    // stop before the 2029 choice menu so we don't branch
    for (let k = 0; k < 400; k++) {
      if (await vis("#choicemenu")) break;
      await page.mouse.click(640, 250);
      await sleep(20);
    }
    await page.keyboard.press("Escape");
    await sleep(200);
    await page.click("#btn-overview");
    await sleep(300);
    console.log("overview(advanced) visible:", await vis("#overviewmenu"));
    console.log("advanced year text:", await page.locator("#overview-card .dash-year").textContent());
    console.log("advanced traj text:", await page.locator("#overview-card .dash-traj").textContent().catch(() => "(none)"));
    await shot("panel-overview-advanced.png");

    console.log("console errors:", errs.length ? errs.slice(0, 5).join(" | ") : "none");
  } finally {
    await browser.close();
    server.kill();
  }
})().catch((e) => { console.error(e); process.exit(1); });
