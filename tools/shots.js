#!/usr/bin/env node
/* Capture a few in-engine beauty shots against real art. */
"use strict";
const { spawn, execSync } = require("child_process");
const path = require("path"), fs = require("fs"), os = require("os");
const root = path.join(__dirname, ".."), QA = path.join(root, "qa", "shots"), PORT = 8942;
const pw = require("/workspace/tools/headless-browser/node_modules/playwright-core");
const chrome = execSync("ls -d " + os.homedir() + "/.cache/ms-playwright/chromium-*/chrome-linux64/chrome 2>/dev/null | sort -V | tail -1", {encoding:"utf8"}).trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(QA, { recursive: true });
  const server = spawn("python3", ["-m", "http.server", String(PORT), "--directory", root], { stdio: "ignore" });
  await sleep(800);
  const browser = await pw.chromium.launch({ executablePath: chrome,
    args: ["--no-sandbox","--disable-dev-shm-usage","--mute-audio","--force-device-scale-factor=1"],
    env: Object.assign({}, process.env, { LD_LIBRARY_PATH: path.join(os.homedir(),".local/chrome-deps/lib") }) });
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(() => { try { localStorage.setItem("plana_settings", JSON.stringify({ typeMs: 0, autoplay:false, autoplayDelayMs:900, showChapter:"number", musicOn:false, musicVolume:0.7 })); } catch(e){} });
  const page = await ctx.newPage();
  const url = "http://127.0.0.1:" + PORT + "/index.html";
  const stage = page.locator("#stage");
  const shot = (n) => stage.screenshot({ path: path.join(QA, n) });
  const dlg = async () => ((await page.locator("#dialog").textContent().catch(()=>""))||"") + " " + ((await page.locator("#volines").textContent().catch(()=>""))||"");
  async function advTo(sub, max=1000){ sub=sub.toLowerCase(); for(let k=0;k<max;k++){ if((await dlg()).toLowerCase().includes(sub)) return true; if(await page.locator("#choicemenu").isVisible()){ /*stop*/ return (await dlg()).toLowerCase().includes(sub);} await page.mouse.click(683,250); await sleep(40);} return false; }
  async function choiceUp(){ return page.locator("#choicemenu").isVisible(); }

  await page.goto(url, { waitUntil: "networkidle" }); await sleep(600);
  await shot("01-title.png");
  await page.click("#btn-begin"); await sleep(500);
  await advTo("marcus reed"); await sleep(200); await shot("02-hearing-reed.png");
  await advTo("i'm lux"); await sleep(200); await shot("03-lux.png");
  await advTo("optimized for looking finished"); await sleep(200); await shot("04-park.png");
  // reach the 5-way choice
  for(let k=0;k<700 && !(await choiceUp());k++){ await page.mouse.click(683,250); await sleep(40);}
  await sleep(300); await shot("05-choice.png");
  // Plan A
  await page.locator(".choice-btn", { hasText: "Plan A" }).first().click(); await sleep(900);
  await advTo("get me chen"); await sleep(200); await shot("06-chen.png");
  await advTo("mutually assured compute"); await sleep(200); await shot("07-mongolia.png");
  await advTo("still me, under all of this"); await sleep(200); await shot("08-lux-radiant.png");
  await advTo("verified slowdown"); await sleep(300); await shot("09-ending.png");
  await browser.close(); server.kill();
  console.log("shots saved to qa/shots/");
})().catch((e)=>{ console.error(e); process.exit(1); });
