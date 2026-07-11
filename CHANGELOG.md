# Changelog

All notable changes to the PLAN A visual novel are documented here. Releases use
[Semantic Versioning](https://semver.org/).

## [1.5.3] — 2026-07-11

### Added

- The opening “two workforces” passage now uses a dedicated compute-center map
  before returning to the West Wing.

## [1.5.2] — 2026-07-11

### Fixed

- The “Two of many possible deals” caption now spans the shared fork to Plans A
  and S, clarifying that A and S are the two example deals.

## [1.5.1] — 2026-07-11

### Changed

- The 2029 choice diagram now follows AI 2040's original branch topology and
  captions more faithfully: the slowdown question leads to Plans D/C/B, while
  the China-deal question leads to Plans A/S.
- Citizen's Dividend arrows now read `25% citizens` and `10% world`, with darker
  labels moved outward from the diagonal lines for easier reading.

## [1.5.0] — 2026-07-10

### Added

- Maya and Tomas now have Dossier Red character sprites throughout Public POV.
- Two dedicated, looped bonus scores: a humane public-life motif and an analytical
  research motif, supplemented by scene-specific cues from the main soundtrack.
- Completing Plan A upgrades the chapter browser to `Chapters / Bonus`, with direct
  Public and Insider POV access and persistent visited/unvisited status.
- Explicit script years for multi-year sequences, reconstructed by save, resume,
  chapter seek, and rollback.
- Three new Nano Banana Pro bonus environments: Maya's commuter train, the public
  alignment seminar, and Meridian's open international audit room.

### Changed

- Both bonus stories now carry continuous, scene-appropriate music instead of only
  occasional broad main-story cues.
- Ending-gallery navigation now says `Return to title screen` instead of the vague
  `Rest here`.
- Maya and Tomas use closer VN portrait framing, with larger faces and their feet
  naturally below the camera line.

### Fixed

- The bottom-right year badge now follows the actual year of every Insider and
  Public POV scene instead of inheriting a stale numbered-chapter year.
- Bonus title cards now clear before their first playable scenes instead of lingering
  over the characters and background.

## [1.4.1] — 2026-07-10

### Added

- Decision screens now show a clickable `H · History` hint. Pressing `H` opens
  the dialogue history and returns directly to the same decision when closed.
- Public POV is now a multi-scene 2027–2040 story following two ordinary
  citizens through job loss, the Dividend, post-work life, public truth systems,
  alignment debates, and a changing relationship with Lux.
- Insider POV is now a multi-scene 2027–2040 research story following Dr. Park
  through apparent-success seeking, open evaluation, control, interpretability,
  alignment science, and the final safety case.

### Changed

- The final `cosmic` workforce display now fills a dense 15-row, 420-dot field.

### Fixed

- Dead-end recovery actions such as “Go back to the decision” no longer display
  a misleading completed-branch checkmark.

## [1.4.0] — 2026-07-10

### Added

- Plan A turning points for covert projects and deal breakdown, joining the
  existing flawed-safety-case decision. Each supports failure, rewind, and a
  canonical recovery path.
- Public and Insider POV bonus sequences, unlocked after completing Plan A.
- A standalone flat-projection compute-center map candidate and timeline using
  source datacenter locations and shared logarithmic sizing.
- A standalone annotated AI 2040 → VN coverage viewer with passage-level source
  mappings and separately labeled VN-created material.
- A distinct post-human ending background for catastrophic terminal routes.

### Changed

- Capability trajectories now use AI 2040's source R&D-speedup data on an
  origin-based logarithmic chart.
- The Human/AI/Robot chart now uses the source annual population series and has
  interactive logarithmic and linear views.
- Agent populations expand into an animated 84-dot cloud; the cosmic state
  saturates the display.
- Citizen's Dividend exposition is chronological: 2032 introduces the 25% U.S.
  and 10% international distributions, while the 75%/$1M/$10K milestone appears
  in 2035.
- Dashboard income notes distinguish U.S. and international distributions.
- Data-chart cards were resized to remain fully above the dialogue panel.
- The review-only compute map now uses light coastlines only and larger later-year
  datacenter stacks.

### Fixed

- Catastrophic branches now retain their ending art through the final screen.
- The decorative globe no longer obscures the capability graph's origin.
- Human labor remains legible instead of being crushed against a linear baseline.

## [1.3.0] — 2026-07-10

- Replaced number-bearing generated-image CGs with deterministic engine-drawn SVG
  charts for compute, labor, and the Citizen's Dividend.

## [1.2.1] — 2026-07-10

- Corrected dashboard data and capability tiers and removed mobile tap-flash.

## [1.2.0] — 2026-07-10

- Rebuilt dashboards to match the AI 2040 status widget.

## [1.1.2] — 2026-07-10

- Made the flawed safety case a playable failure decision and standardized numeric
  presentation.

## [1.1.1] — 2026-07-10

- Reworked the Citizen's Dividend sequence with explicit figures and a diagram.

## [1.1.0] — 2026-07-10

- Improved risk fidelity, capability pauses, safety metrics, and alternate-timeline
  framing.

## [1.0.1] — 2026-07-10

- Prevented fast-forward from selecting choices and clarified Dividend scope.

## [1.0.0] — 2026-07-09

- Initial visual-novel release.

[1.5.3]: https://github.com/nickypro/ai-2040-vn/compare/v1.5.2...v1.5.3
[1.5.2]: https://github.com/nickypro/ai-2040-vn/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/nickypro/ai-2040-vn/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/nickypro/ai-2040-vn/compare/v1.4.1...v1.5.0
[1.4.1]: https://github.com/nickypro/ai-2040-vn/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/nickypro/ai-2040-vn/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/nickypro/ai-2040-vn/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/nickypro/ai-2040-vn/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/nickypro/ai-2040-vn/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/nickypro/ai-2040-vn/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/nickypro/ai-2040-vn/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/nickypro/ai-2040-vn/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/nickypro/ai-2040-vn/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/nickypro/ai-2040-vn/releases/tag/v1.0.0
