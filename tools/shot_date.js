"use strict";
const { spawn, execSync } = require("child_process");
const path=require("path"), os=require("os");
const pw=require("/workspace/tools/headless-browser/node_modules/playwright-core");
const chrome=execSync("ls -d "+os.homedir()+"/.cache/ms-playwright/chromium-*/chrome-linux64/chrome 2>/dev/null|sort -V|tail -1",{encoding:"utf8"}).trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  const root=path.join(__dirname,".."), PORT=8956;
  const srv=spawn("python3",["-m","http.server",String(PORT),"--directory",root],{stdio:"ignore"});
  await sleep(700);
  const b=await pw.chromium.launch({executablePath:chrome,args:["--no-sandbox","--disable-dev-shm-usage","--mute-audio"],env:Object.assign({},process.env,{LD_LIBRARY_PATH:path.join(os.homedir(),".local/chrome-deps/lib")})});
  const ctx=await b.newContext({viewport:{width:1366,height:768},deviceScaleFactor:2});
  await ctx.addInitScript(()=>{try{localStorage.setItem("plana_settings",JSON.stringify({typeMs:0,autoplay:false,autoplayDelayMs:900,showChapter:"number",musicOn:false,musicVolume:0.7}))}catch(e){}});
  const p=await ctx.newPage();
  const dlg=async()=>((await p.locator("#dialog").textContent().catch(()=>""))||"")+" "+((await p.locator("#volines").textContent().catch(()=>""))||"");
  await p.goto("http://127.0.0.1:"+PORT+"/index.html",{waitUntil:"networkidle"});
  await sleep(500); await p.click("#btn-begin"); await sleep(400);
  // advance to the hearing scene (Reed) which is a normal bg scene in 2027
  for(let k=0;k<80 && !(await dlg()).toLowerCase().includes("marcus reed");k++){await p.mouse.click(683,250);await sleep(35);}
  await sleep(300);
  await p.locator("#stage").screenshot({path:path.join(root,"qa","date_scene.png")});
  await b.close(); srv.kill(); console.log("date shot done");
})().catch(e=>{console.error(e);process.exit(1)});
