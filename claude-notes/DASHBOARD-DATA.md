# End-of-chapter dashboard data (Plan A path)

The dashboard mirrors the ai-2040.com stats widget. Signature elements:

- **Trajectory field** — a halftone-red field where the "Reliable Agent" curve
  climbs left-to-right. x = time (2027..2045), y = AI capability (0..100). The
  traveled portion is a solid red curve to the current (year, capability) point;
  the looming intelligence explosion carries on as a dashed black curve to the
  top-right corner. A faint horizontal line marks the ~88 ceiling — during Plan
  A's pause the solid curve flattens along it while the dashed future keeps
  rocketing up. A dot-matrix globe + year tag sit top-left; a "Reliable Agent"
  scrubber runs along the bottom (fill = year progress).
- **Core-four tiles**, named exactly as ai-2040: Employment · Median Income ·
  Safety Researchers · Total Slowdown. Each carries a trend arrow vs the previous
  dashboard where both values parse.
- **Workforce dot-rows** — Human Labor (@ ×1 speed) and Reliable Agents (@ ×N
  speed). Filled dots scale to log10(head-count) over 1e6..1e10; the ×speed
  multiplier rides alongside. Agent dots animate in on reveal.

`@dashboard` keys: `year, employment, income, safety, slowdown, humanlabor,
agents, agentspeed, tier, capability, trajectory`. (Legacy keys `dividend,
workforce, compute, gdp` are still accepted by the parser but no longer
rendered.) `tier` is the capability milestone name (Reliable Agent → Automated
coder → Top-Expert-Dominating AI → Superintelligent); it drives the scrubber
label and the (pluralized) agent dot-row label.

Values below are transcribed from the live ai-2040.com widget scrubbed year by
year (see assets/uploaded/). The key story: **human labor stays ~3.5B global at
×1**, employment-to-population falls, and the agent population plateaus ~170–190M
while its **speed** is where the explosion actually shows (×114 → ×2,500). The
trajectory bends at the ceiling for 2035–2040, then crosses to ASI in 2045.

| ch | year | tier | emp | income | safety | slowdown | human | agents | speed | cap |
|----|------|------|-----|--------|--------|----------|-------|--------|-------|-----|
| 1  | 2027 | Reliable Agent | 62% | US$47K | 1.2K | 0 mo | 3.5B | 28M | 114x | 42 |
| 2  | 2028 | Reliable Agent | 62% | US$49K | 1.4K | 0 mo | 3.5B | 23M | 131x | 48 |
| 3  | 2029 | Reliable Agent | 62% | US$50K | 3K | 3 mo | 3.5B | 35M | 150x | 55 |
| 4  | 2029 | Reliable Agent | 61% | US$50K | 6K | 6 mo | 3.5B | 38M | 120x | 58 |
| 5  | 2030 | Automated coder | 62% | US$51K | 8K | 1 yr | 3.5B | 42M | 200x | 63 |
| 6  | 2031 | Automated coder | 61% | US$52K | 10.4K | 1.5 yrs | 3.4B | 46M | 238x | 70 |
| 7  | 2033 | Automated coder | 52% | US$193K | 31.1K | 2.5 yrs | 3.7B | 120M | 378x | 78 |
| 8  | 2034 | Automated coder | 44% | US$429K | 46.7K | 3 yrs | 3.9B | 170M | 476x | 82 |
| 9  | 2035 | Top-Expert-Dominating AI | 32% | US$1.1M | 60.7K | 4 yrs | 3.8B | 180M | 600x | 87 |
| 10 | 2036 | Top-Expert-Dominating AI | 26% | US$2.1M | 78.8K | 5 yrs | 3.5B | 170M | 814x | 87 |
| 11 | 2037 | Top-Expert-Dominating AI | 21% | US$3.9M | 102.5K | 6 yrs | 3.0B | 170M | 1,105x | 87 |
| 12 | 2038 | Top-Expert-Dominating AI | 17% | US$6.8M | 133.3K | 7 yrs | 2.5B | 180M | 1,500x | 88 |
| 13 | 2040 | Top-Expert-Dominating AI | 12% | US$13M | 225.2K | 9 yrs | 1.8B | 190M | 2,500x | 88 |
| 14 | 2045 | Superintelligent | post-work | galaxy-share | vast | lifted | 1B | cosmic | ∞ | 100 |

Notes:
- ch14 values are qualitative (post-scarcity); qualitative magnitudes render as
  text with no filled dots and no trend arrow.
- Median income absorbs the old Citizen's Dividend arc (US$47K → US$13M → galaxy-share).
- 2029/2030 rows are interpolated (no scrubbed screenshot at those exact years);
  everything else is read off the widget.

## Branch endings (single end-state dashboard)

| branch | year | headline | trajectory |
|--------|------|----------|------------|
| Plan D | 2031 | control: LOST (cap 100) | Race ending, control lost |
| Plan C | 2031 | power concentrated (cap 96) | A tiny circle decides |
| Plan B | 2031 | handoff or war (cap 92) | Handoff, or war |
| Plan S | 2035 | progress frozen (cap 55) | Frozen, for now |
