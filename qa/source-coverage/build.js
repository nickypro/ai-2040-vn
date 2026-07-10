const fs = require('fs');
const path = require('path');

const here = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(here, 'coverage.json'), 'utf8'));
const source = fs.readFileSync(path.join(here, '../../claude-notes/source-main.md'), 'utf8').split(/\r?\n/);
const script = fs.readFileSync(path.join(here, '../../script.md'), 'utf8').split(/\r?\n/);

const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/_(.+?)_/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');

const statusAt = (lineNo) => data.mappings.filter(m => lineNo >= m.source_lines[0] && lineNo <= m.source_lines[1]);
const headingYear = (line) => {
  const cleaned = line.replace(/^#+\s*/, '').replace(/^\[\]\([^)]*\)/, '');
  return cleaned || 'Source';
};

let current = 'Front matter';
const chunks = [];
for (let i = 0; i < source.length; i++) {
  const n = i + 1;
  const raw = source[i];
  if (/^#\s/.test(raw)) current = headingYear(raw);
  const maps = statusAt(n);
  const status = maps.some(m => m.status === 'included') ? 'included' : maps.some(m => m.status === 'partial') ? 'partial' : 'excluded';
  const ids = maps.map(m => m.id).join(' ');
  if (!raw.trim()) {
    chunks.push(`<div class="source-line blank ${status}" id="src-L${n}" data-map="${ids}" data-section="${esc(current)}"><span class="ln">${n}</span></div>`);
    continue;
  }
  const tag = /^#\s/.test(raw) ? 'h2' : /^##\s/.test(raw) ? 'h3' : 'p';
  const body = raw.replace(/^#{1,2}\s*/, '').replace(/^\[\]\([^)]*\)/, '');
  chunks.push(`<${tag} class="source-line ${status}" id="src-L${n}" data-map="${ids}" data-section="${esc(current)}"><span class="ln">${n}</span><span class="txt">${inline(body)}</span></${tag}>`);
}

const mappingCards = data.mappings.map(m => {
  const evidence = script.slice(m.script_lines[0]-1, m.script_lines[1]).filter(x => x.trim() && !x.startsWith('@')).slice(0, 3).join(' ');
  return `<article class="mapping-card ${m.status}" id="${m.id}">
    <div class="card-top"><span class="badge">${m.status === 'included' ? 'INCLUDED / ADAPTED' : 'PARTIAL'}</span><span class="confidence">${m.confidence} confidence</span></div>
    <h3>${esc(m.beat)}</h3>
    <div class="ranges"><a href="#src-L${m.source_lines[0]}">source L${m.source_lines[0]}–${m.source_lines[1]}</a><a href="../../script.md#L${m.script_lines[0]}">script.md L${m.script_lines[0]}–${m.script_lines[1]}</a></div>
    <blockquote>${esc(evidence || '(directive-only evidence)')}</blockquote>
    ${m.note ? `<p class="note">${esc(m.note)}</p>` : ''}
  </article>`;
}).join('\n');

const fabricated = data.fabricated_annotations.map(f => `<article class="fabricated-card" id="${f.id}">
  <div><span class="badge">VN-FABRICATED</span><span class="chapter">${esc(f.chapter)}</span></div>
  <h3>${esc(f.label)}</h3><p>${esc(f.note)}</p>
  <a href="../../script.md#L${f.script_lines[0]}">script.md L${f.script_lines[0]}–${f.script_lines[1]}</a>
</article>`).join('\n');

const stats = {
  included: new Set(data.mappings.filter(m => m.status === 'included').flatMap(m => Array.from({length:m.source_lines[1]-m.source_lines[0]+1},(_,i)=>m.source_lines[0]+i))).size,
  partial: new Set(data.mappings.filter(m => m.status === 'partial').flatMap(m => Array.from({length:m.source_lines[1]-m.source_lines[0]+1},(_,i)=>m.source_lines[0]+i))).size
};

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(data.title)}</title>
<style>
:root{--ink:#19222e;--muted:#65717f;--paper:#f6f4ee;--panel:#fffdf8;--inc:#b8ead0;--inc-strong:#176b49;--part:#ffe29a;--part-strong:#8a5a00;--fab:#d9d1ff;--fab-strong:#5742a0;--line:#d8d5cc}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}header{position:sticky;top:0;z-index:20;background:rgba(246,244,238,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:14px 22px}.headrow{display:flex;align-items:center;justify-content:space-between;gap:20px}.title{font-weight:800;font-size:18px}.tabs{display:flex;gap:6px;flex-wrap:wrap}.tabs button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 12px;cursor:pointer}.tabs button.active{background:var(--ink);color:#fff}.legend{display:flex;gap:15px;color:var(--muted);font-size:12px;margin-top:8px;flex-wrap:wrap}.key::before{content:"";display:inline-block;width:11px;height:11px;border-radius:3px;margin-right:6px;vertical-align:-1px}.key.inc::before{background:var(--inc)}.key.part::before{background:var(--part)}.key.exc::before{background:#fff;border:1px solid var(--line)}.key.fab::before{background:var(--fab)}main{max-width:1500px;margin:auto}.view{display:none}.view.active{display:block}.overview{padding:32px}.lede{max-width:850px;font-size:18px}.statgrid{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:12px;margin:24px 0}.stat{background:var(--panel);border:1px solid var(--line);padding:18px;border-radius:12px}.stat b{display:block;font-size:28px}.method{max-width:900px;background:var(--panel);border:1px solid var(--line);padding:20px;border-radius:12px}.source-layout{display:grid;grid-template-columns:minmax(0,1fr) 400px;align-items:start}.source-doc{padding:28px 34px 100px;max-width:950px}.source-line{position:relative;margin:0;padding:5px 12px 5px 58px;border-left:5px solid transparent;border-radius:2px}.source-line .ln{position:absolute;left:10px;width:35px;color:#9a9a93;text-align:right;font:11px/1.8 ui-monospace,monospace}.source-line.included{background:linear-gradient(90deg,var(--inc),rgba(184,234,208,.25));border-left-color:var(--inc-strong)}.source-line.partial{background:linear-gradient(90deg,var(--part),rgba(255,226,154,.2));border-left-color:var(--part-strong)}.source-line[data-map]:not([data-map=""]){cursor:pointer}.source-line[data-map]:not([data-map=""]):hover{filter:saturate(1.2);outline:1px solid currentColor}.source-line.blank{height:9px;padding:0}.source-line h2{margin-top:30px}.source-line a{color:inherit}.side{position:sticky;top:101px;height:calc(100vh - 101px);overflow:auto;border-left:1px solid var(--line);background:#eceae3;padding:18px}.side h2{margin:0 0 12px}.mapping-card,.fabricated-card{background:var(--panel);border:1px solid var(--line);border-left:5px solid var(--inc-strong);border-radius:8px;padding:13px;margin-bottom:11px;scroll-margin-top:120px}.mapping-card.partial{border-left-color:var(--part-strong)}.mapping-card.focus{outline:3px solid #222}.card-top,.fabricated-card>div{display:flex;justify-content:space-between;gap:8px}.badge{font-size:10px;font-weight:800;letter-spacing:.06em}.included .badge{color:var(--inc-strong)}.partial .badge{color:var(--part-strong)}.confidence,.chapter{font-size:11px;color:var(--muted)}.mapping-card h3,.fabricated-card h3{font-size:14px;line-height:1.3;margin:6px 0}.ranges{display:flex;gap:12px;font-size:12px}.ranges a,.fabricated-card a{color:#365d9d}blockquote{margin:9px 0 0;padding:8px 10px;border-left:2px solid var(--line);background:#f5f3ed;color:#525a64;font-size:12px}.note{font-size:12px;color:var(--muted);margin-bottom:0}.cards{padding:28px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}.cards .mapping-card,.cards .fabricated-card{margin:0}.fabricated-card{border-left-color:var(--fab-strong)}.fabricated-card .badge{color:var(--fab-strong)}.fabricated-intro{grid-column:1/-1;max-width:850px}.excluded-hidden .source-line.excluded{display:none}.only-included .source-line.partial,.only-included .source-line.excluded{display:none}@media(max-width:900px){header{position:relative}.source-layout{display:block}.side{position:relative;top:auto;height:auto;border-left:0;border-top:1px solid var(--line)}.statgrid{grid-template-columns:1fr 1fr}.source-doc{padding:20px 10px}.headrow{align-items:flex-start;flex-direction:column}}
</style></head><body><header><div class="headrow"><div class="title">AI 2040 → VN coverage review</div><nav class="tabs"><button data-view="overview" class="active">Overview</button><button data-view="source">Annotated source</button><button data-view="mappings">Coverage index</button><button data-view="fabricated">VN-only additions</button></nav></div><div class="legend"><span class="key inc">Included / adapted</span><span class="key part">Partial</span><span class="key exc">Excluded / unhighlighted</span><span class="key fab">VN-fabricated (side annotation only)</span></div></header><main>
<section class="view overview active" data-view="overview"><h1>Passage-level adaptation map</h1><p class="lede">This is a review aid built from the repository's existing source capture and VN script. Green means a source passage has clear script evidence; amber means only part of its content or qualification survives. Everything unhighlighted has no asserted mapping. Purple notes describe VN material that cannot be highlighted in the source because it was invented for the adaptation.</p><div class="statgrid"><div class="stat"><b>${data.mappings.length}</b>mapped passages</div><div class="stat"><b>${stats.included}</b>source lines included/adapted</div><div class="stat"><b>${stats.partial}</b>source lines partially covered</div><div class="stat"><b>${data.fabricated_annotations.length}</b>VN-only annotations</div></div><div class="method"><h2>How to read this</h2><p>Open <strong>Annotated source</strong> for the complete local source capture. Click a highlighted passage to focus its evidence card. Evidence links identify the relevant <code>script.md</code> line range, and a short excerpt appears in each card. “Excluded” is deliberately conservative: it means only that this pass found no direct adaptation evidence, not that the idea had zero indirect influence.</p><p>This viewer does not reproduce or scrape a new website. It transforms <code>claude-notes/source-main.md</code>, already in the workspace, and stays isolated under <code>qa/</code>.</p></div></section>
<section class="view" data-view="source"><div class="source-layout"><article class="source-doc"><div style="display:flex;gap:8px;margin-bottom:18px"><button id="show-all">Show full source</button><button id="hide-excluded">Hide unhighlighted</button><button id="only-included">Only included</button></div>${chunks.join('\n')}</article><aside class="side"><h2>Evidence</h2><p style="color:var(--muted);font-size:12px">Click highlighted source text to focus a mapping.</p>${mappingCards}</aside></div></section>
<section class="view" data-view="mappings"><div class="cards">${mappingCards}</div></section>
<section class="view" data-view="fabricated"><div class="cards"><div class="fabricated-intro"><h1>VN-only additions</h1><p>These elements are useful adaptation choices, but they should not be confused with claims or characters in the source. They are kept outside the source highlighting for that reason.</p></div>${fabricated}</div></section>
</main><script>
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===b.dataset.view));scrollTo(0,0)}));
document.querySelectorAll('.source-line[data-map]:not([data-map=""])').forEach(line=>line.addEventListener('click',()=>{const id=line.dataset.map.split(' ')[0];document.querySelectorAll('.mapping-card').forEach(c=>c.classList.toggle('focus',c.id===id));document.querySelector('.side #'+id)?.scrollIntoView({behavior:'smooth',block:'center'})}));
const doc=document.querySelector('.source-doc');document.querySelector('#show-all').onclick=()=>doc.className='source-doc';document.querySelector('#hide-excluded').onclick=()=>doc.className='source-doc excluded-hidden';document.querySelector('#only-included').onclick=()=>doc.className='source-doc only-included';
</script></body></html>`;

// Template fragments are indented for readability; normalize generated output
// so the committed review artifact stays clean under `git diff --check`.
const cleanHtml = html.split('\n').map(line => line.trimEnd()).join('\n');
fs.writeFileSync(path.join(here, 'index.html'), cleanHtml);
console.log(`Wrote index.html with ${data.mappings.length} mappings and ${data.fabricated_annotations.length} fabricated annotations.`);
