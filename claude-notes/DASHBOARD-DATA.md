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
agents, agentspeed, capability, trajectory`. (Legacy keys `dividend, workforce,
compute, gdp` are still accepted by the parser but no longer rendered.)

Values are approximate/illustrative; the trajectory bends at the ceiling for
2035–2038 then crosses to superintelligence in 2045.

| ch | year | employment | income | safety | slowdown | humanlabor | agents | speed | cap | trajectory |
|----|------|-----------|--------|--------|----------|-----------|--------|-------|-----|------------|
| 1  | 2027 | 96% | $47k | 1.2k | 0 mo  | 165M | 3M   | 1x   | 42 | Default race, no deal |
| 2  | 2028 | 94% | $49k | 8k   | 0 mo  | 164M | 30M  | 2x   | 55 | Election, path undecided |
| 3  | 2029 | 92% | $50k | 8k   | 2 mo  | 163M | 40M  | 3x   | 60 | The deal begins |
| 4  | 2029 | 91% | $50k | 12k  | 4 mo  | 163M | 40M  | 1x   | 60 | Plan A, crude halt |
| 5  | 2030 | 90% | $52k | 20k  | 6 mo  | 162M | 80M  | 4x   | 63 | Transparency on |
| 6  | 2031 | 88% | $55k | 40k  | 9 mo  | 160M | 120M | 8x   | 70 | Slowdown holding |
| 7  | 2033 | 70% | $90k | 120k | 14 mo | 115M | 200M | 20x  | 78 | Controlled explosion |
| 8  | 2034 | 55% | $250k| 200k | 18 mo | 90M  | 400M | 50x  | 82 | Mutually assured compute |
| 9  | 2035 | 40% | $1M  | 300k | 24 mo | 66M  | 600M | 100x | 87 | Pause at the ceiling |
| 10 | 2036 | 26% | $2M  | 450k | 30 mo | 43M  | 2B   | 100x | 87 | Life after work |
| 11 | 2037 | 24% | $4M  | 600k | 36 mo | 40M  | 5B   | 100x | 87 | Truth arrives |
| 12 | 2038 | 22% | $6M  | 800k | 42 mo | 36M  | 10B  | 100x | 88 | Alignment is a science |
| 13 | 2040 | 20% | $10M | 1M   | 48 mo | 33M  | 60B  | 100x | 88 | Passing the torch |
| 14 | 2045 | post-work | galaxy-share | vast | — | post-work | cosmic | ∞ | 100 | Life after ASI |

Notes:
- ch14 values are qualitative (post-scarcity); qualitative magnitudes render as
  text with no filled dots and no trend arrow.
- Median income absorbs the old Citizen's Dividend arc ($47k → $10M).

## Branch endings (single end-state dashboard)

| branch | year | headline | trajectory |
|--------|------|----------|------------|
| Plan D | 2031 | control: LOST (cap 100) | Race ending, control lost |
| Plan C | 2031 | power concentrated (cap 96) | A tiny circle decides |
| Plan B | 2031 | handoff or war (cap 92) | Handoff, or war |
| Plan S | 2035 | progress frozen (cap 55) | Frozen, for now |
