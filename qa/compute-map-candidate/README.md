# Compute-centers flat map candidate

This is a standalone review candidate. Nothing here is referenced by the VN, and no manifest or runtime file was changed for it.

## Files

- `compute-centers-flat.svg` — detailed 2040 map with callouts.
- `compute-centers-timeline.svg` — 2027 / 2034 / 2040 comparison, useful for judging whether the flat projection preserves the original globe's narrative.
- `preview-flat.png` and `preview-timeline.png` — raster review renders at the SVGs' native sizes.
- `source-data.json` — exact selected rows from the official bundled Plan A datacenter timeline.
- `generate.js` — deterministic SVG renderer. It fetches the same pinned `world-atlas@2.0.2` 110m geography used by AI 2040's own globe code.

Regenerate with:

```sh
node qa/compute-map-candidate/generate.js
```

## Source evidence

The live official site's dynamically loaded chunk `3709-62370a9358ce0da8.js` contains module `12842`, a JSON parse of `data/datacenter_timeline_2040_no_overlaps.json`. Its published source map identifies that import in `app/playbook/globe/datacenterData/datacenterRawData.ts`. The snapshots here preserve the exact site names, latitude, longitude, and compute fields for 2027-01-01, 2034-01-01, and 2040-01-01.

The official source map for chunk `3134-95280ea477077464.js` also shows that the globe:

- uses `world-atlas@2.0.2/countries-110m.json` for land geometry;
- places datacenter marks by latitude and longitude;
- normalizes stack size logarithmically against one shared Plan A scale;
- renders red/cream stack geometry, including satellite tiles for very large sites.

The candidate keeps the first three behaviors and translates the visual treatment into the VN's cream paper, black ink, dossier red, and halftone language. It intentionally uses a flat equirectangular projection so every center remains visible and geography is immediately readable. The base map uses the atlas's merged `land` geometry, so only coastlines and island edges appear—there are no internal country borders competing with the compute marks. Coastlines are deliberately light and consistent.

Both stack height and square footprint use the same shared logarithmic compute normalization across years. This keeps the 2027 conventional sites pin-like while making the 2034 megasites and especially the 2040 ocean centers substantially larger. The detailed 2040 view uses callouts because the canonical timeline has consolidated from dozens of conventional sites to five offshore centers by then.

Source checked on 2026-07-10 at <https://ai-2040.com/>.
