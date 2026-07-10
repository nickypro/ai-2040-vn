#!/usr/bin/env node
"use strict";

// Standalone candidate generator. It does not touch the VN runtime.
const fs = require("fs");
const https = require("https");
const path = require("path");

const ROOT = __dirname;
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "source-data.json"), "utf8")).snapshots;
const ATLAS = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";
const CREAM = "#f4f0e4", PAPER = "#fbf9f0", INK = "#171510", RED = "#930f18", GRID = "#c8c1af";

const fetchJson = url => new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode !== 200) return reject(new Error(`atlas HTTP ${res.statusCode}`));
    let body = "";
    res.setEncoding("utf8");
    res.on("data", chunk => body += chunk);
    res.on("end", () => { try { resolve(JSON.parse(body)); } catch (error) { reject(error); } });
  }).on("error", reject);
});

function decodeArcs(topology) {
  const { scale, translate } = topology.transform;
  return topology.arcs.map(arc => {
    let x = 0, y = 0;
    return arc.map(([dx, dy]) => {
      x += dx; y += dy;
      return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
    });
  });
}

function ringsFor(topology) {
  const decoded = decodeArcs(topology), rings = [];
  const readArc = index => index >= 0 ? decoded[index] : decoded[~index].slice().reverse();
  const stitch = indexes => {
    const points = [];
    indexes.forEach((index, i) => points.push(...readArc(index).slice(i ? 1 : 0)));
    return points;
  };
  for (const geometry of topology.objects.countries.geometries) {
    if (geometry.type === "Polygon") geometry.arcs.forEach(r => rings.push(stitch(r)));
    if (geometry.type === "MultiPolygon") geometry.arcs.forEach(p => p.forEach(r => rings.push(stitch(r))));
  }
  return rings;
}

const project = (lat, lng, box) => [
  box.x + (lng + 180) / 360 * box.w,
  box.y + (90 - lat) / 180 * box.h,
];

function worldPath(rings, box) {
  return rings.map(ring => ring.map(([lng, lat], i) => {
    const [x, y] = project(lat, lng, box);
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join("") + "Z").join("");
}

// The filled topology may close across the antimeridian. Draw its ink as
// split, open segments so a Pacific-crossing country never creates a false
// horizontal line across the entire flat map.
function worldOutlinePath(rings, box) {
  return rings.map(ring => {
    let segment = "", previousLng = null;
    for (const [lng, lat] of ring) {
      const [x, y] = project(lat, lng, box);
      const breaksAtDateline = previousLng !== null && Math.abs(lng - previousLng) > 180;
      segment += `${!segment || breaksAtDateline ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      previousLng = lng;
    }
    return segment;
  }).join("");
}

function hatching(id) {
  return `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".65" fill="${RED}" opacity=".23"/></pattern>`;
}

function graticule(box) {
  let out = "";
  for (let lng = -150; lng <= 150; lng += 30) {
    const [x] = project(0, lng, box);
    out += `<path d="M${x.toFixed(1)} ${box.y}V${box.y + box.h}"/>`;
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const [, y] = project(lat, 0, box);
    out += `<path d="M${box.x} ${y.toFixed(1)}H${box.x + box.w}"/>`;
  }
  return `<g fill="none" stroke="${GRID}" stroke-width=".7" stroke-dasharray="1 4">${out}</g>`;
}

function stack(site, box, sharedBounds, compact = false) {
  const [name, lat, lng, compute] = site;
  const [x, y] = project(lat, lng, box);
  const norm = (Math.log10(compute) - sharedBounds.min) / (sharedBounds.max - sharedBounds.min);
  const levels = Math.max(1, Math.round(1 + Math.max(0, norm) * (compact ? 4 : 7)));
  const size = compact ? 3.8 : 5.8;
  let blocks = "";
  for (let level = 0; level < levels; level++) {
    const ox = level * (compact ? 1.25 : 1.7), oy = -level * (compact ? 1.6 : 2.2);
    blocks += `<rect x="${(x + ox - size / 2).toFixed(1)}" y="${(y + oy - size / 2).toFixed(1)}" width="${size}" height="${size}" fill="${level === levels - 1 ? RED : PAPER}" stroke="${RED}" stroke-width="${compact ? .7 : 1}"/>`;
  }
  return `<g data-site="${name.replaceAll("&", "&amp;").replaceAll('"', '&quot;')}">${blocks}</g>`;
}

function mapPanel(rings, date, box, options = {}) {
  const sites = DATA[date];
  const values = Object.values(DATA).flat().map(s => s[3]);
  const bounds = { min: Math.log10(Math.min(...values)), max: Math.log10(Math.max(...values)) };
  const d = worldPath(rings, box);
  const outline = worldOutlinePath(rings, box);
  return `<g>
    <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="${options.radius || 0}" fill="${PAPER}" stroke="${INK}" stroke-width="1.2"/>
    ${graticule(box)}
    <path d="${d}" fill="url(#dots)" fill-rule="evenodd" stroke="none"/>
    <path d="${outline}" fill="none" stroke="${INK}" stroke-width=".75" stroke-linejoin="round"/>
    <g>${sites.slice().sort((a,b) => a[3]-b[3]).map(site => stack(site, box, bounds, options.compact)).join("")}</g>
  </g>`;
}

function fmtCompute(value) {
  if (value >= 1e12) return `${(value / 1e12).toFixed(1)}e12`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(value >= 1e11 ? 0 : 1)}e9`;
  return `${(value / 1e6).toFixed(0)}e6`;
}

function singleSvg(rings) {
  const W = 1280, H = 720, box = { x: 54, y: 122, w: 880, h: 440 };
  const sites = DATA["2040-01-01"], total = sites.reduce((sum, s) => sum + s[3], 0);
  const labels = sites.map((s, i) => {
    const [x, y] = project(s[1], s[2], box), tx = 988, ty = 186 + i * 65;
    return `<path d="M${(x+7).toFixed(1)} ${(y-11).toFixed(1)} C${(x+40).toFixed(1)} ${(y-35).toFixed(1)},${tx-32} ${ty-8},${tx-8} ${ty-8}" fill="none" stroke="${i ? INK : RED}" stroke-width=".9" stroke-dasharray="2 3"/>
      <circle cx="${tx}" cy="${ty-8}" r="3" fill="${i ? INK : RED}"/>
      <text x="${tx+12}" y="${ty-12}" class="site">${s[0].replace(" Inference Site", "")}</text>
      <text x="${tx+12}" y="${ty+7}" class="compute">${fmtCompute(s[3])} compute</text>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">AI 2040 compute centers, flat projection candidate</title>
  <desc id="desc">A dossier-style flat world map showing five ocean compute centers in 2040, based on the official AI 2040 timeline data.</desc>
  <defs>${hatching("dots")}<filter id="paper"><feTurbulence baseFrequency=".8" numOctaves="2" seed="7" type="fractalNoise"/><feColorMatrix values="0 0 0 0 .25 0 0 0 0 .2 0 0 0 0 .12 0 0 0 .055 0"/></filter></defs>
  <style>.eyebrow{font:700 15px ui-monospace,monospace;letter-spacing:2px;fill:${RED}}.title{font:700 36px Georgia,serif;fill:${INK}}.sub{font:14px ui-monospace,monospace;fill:${INK}}.site{font:700 13px ui-monospace,monospace;fill:${INK}}.compute{font:11px ui-monospace,monospace;fill:${RED}}.note{font:12px Georgia,serif;fill:${INK}}</style>
  <rect width="100%" height="100%" fill="${CREAM}"/><rect width="100%" height="100%" filter="url(#paper)" opacity=".28"/>
  <text x="54" y="50" class="eyebrow">GLOBAL COMPUTE CENTERS / PLAN A</text><text x="54" y="91" class="title">The machine archipelago</text>
  <text x="934" y="50" class="eyebrow">2040.01.01</text><text x="934" y="77" class="sub">${sites.length} primary sites  ·  ${fmtCompute(total)} total</text>
  ${mapPanel(rings, "2040-01-01", box)}${labels}
  <g transform="translate(54 603)"><rect width="12" height="12" fill="${PAPER}" stroke="${RED}"/><rect x="3" y="-4" width="12" height="12" fill="${RED}" stroke="${RED}"/><text x="27" y="8" class="sub">stack height encodes compute on a shared logarithmic scale</text></g>
  <text x="934" y="535" class="note">Flat projection makes the geographic shift legible:</text><text x="934" y="555" class="note">by 2040, compute has moved offshore.</text>
  <path d="M54 678H1226" stroke="${INK}"/><text x="54" y="700" class="sub">CANDIDATE ONLY  ·  NOT WIRED INTO THE VN</text><text x="1226" y="700" class="sub" text-anchor="end">SOURCE: AI-2040.COM</text>
  </svg>`;
}

function timelineSvg(rings) {
  const W = 1440, H = 720, dates = ["2027-01-01", "2034-01-01", "2040-01-01"];
  const boxes = dates.map((_, i) => ({ x: 40 + i * 470, y: 155, w: 430, h: 290 }));
  const captions = [
    ["2027", "33 conventional sites", "US and China clusters thicken"],
    ["2034", "7 continental megasites", "R&amp;D and inference concentrate"],
    ["2040", "5 ocean sites", "the center of gravity leaves land"],
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="title desc">
  <title id="title">AI 2040 compute center timeline, flat projection candidate</title><desc id="desc">Three maps compare the official Plan A compute centers in 2027, 2034, and 2040.</desc>
  <defs>${hatching("dots")}</defs><style>.eyebrow{font:700 14px ui-monospace,monospace;letter-spacing:2px;fill:${RED}}.title{font:700 32px Georgia,serif;fill:${INK}}.year{font:700 27px Georgia,serif;fill:${INK}}.stat{font:700 13px ui-monospace,monospace;fill:${RED}}.note{font:13px Georgia,serif;fill:${INK}}.small{font:11px ui-monospace,monospace;fill:${INK}}</style>
  <rect width="100%" height="100%" fill="${CREAM}"/><text x="40" y="47" class="eyebrow">COMPUTE GEOGRAPHY / PLAN A</text><text x="40" y="89" class="title">From data centers to machine continents</text><text x="1400" y="54" class="small" text-anchor="end">FLAT EQUIRECTANGULAR PROJECTION</text>
  ${dates.map((date, i) => mapPanel(rings, date, boxes[i], { compact: true, radius: 2 })).join("")}
  ${captions.map((c, i) => `<text x="${boxes[i].x}" y="497" class="year">${c[0]}</text><text x="${boxes[i].x}" y="526" class="stat">${c[1]}</text><text x="${boxes[i].x}" y="552" class="note">${c[2]}</text>`).join("")}
  <path d="M40 611H1400" stroke="${INK}"/><g transform="translate(40 639)"><rect width="10" height="10" fill="${PAPER}" stroke="${RED}"/><rect x="3" y="-4" width="10" height="10" fill="${RED}" stroke="${RED}"/><text x="26" y="7" class="small">Every square stack is a source location; height uses one shared log scale across all three years.</text></g>
  <text x="40" y="692" class="small">CANDIDATE ONLY  ·  NOT WIRED INTO THE VN</text><text x="1400" y="692" class="small" text-anchor="end">SOURCE: AI-2040.COM BUNDLED PLAN A DATA</text>
  </svg>`;
}

(async () => {
  const topology = await fetchJson(ATLAS);
  const rings = ringsFor(topology);
  fs.writeFileSync(path.join(ROOT, "compute-centers-flat.svg"), singleSvg(rings));
  fs.writeFileSync(path.join(ROOT, "compute-centers-timeline.svg"), timelineSvg(rings));
  console.log(`generated 2 SVGs from ${rings.length} world-atlas rings`);
})().catch(error => { console.error(error); process.exit(1); });
