# PLAN A — Design Document

An interactive visual novel adaptation of [ai-2040.com](https://ai-2040.com) (AI Futures
Project, 2026), in the style of *Everything That Hurt You* (Yudkowsky, 2026). Reference
engine + lessons: scratchpad clone `everything-that-hurt-you/`, especially
`claude-notes/LESSONS.md` (treat as authoritative).

**Title:** PLAN A — an AI 2040 visual novel
**Core loop:** kinetic novel (click to advance) with ONE major branch point (2029:
Choose a Path, five plans) plus small flavor choices. Plans D/C/B/S are short endings
that offer "return to 2029". Plan A is the main story through 2040 + epilogue.

## POV

Second person. You are the President's senior advisor on AI (unnamed, no sprite).
You survive the 2028 election because the winner is the incumbent's protégé and keeps
you on. At the 2029 branch, the President asks you directly: which plan?
This turns the source's "choose a path" widget into the story's central dramatic beat.

## Cast (5 sprites)

- **The President** (speaker `President`) — the protégé who wins in 2028. Wants to not
  be remembered as the man who handed the world to either the machines or the CEOs.
  Expressions: neutral, stern, weary.
- **Minister Chen Yulan** (`Chen`) — China's chief negotiator. Dry, unhurried, plays
  the long game; privately as scared as everyone else. Expressions: neutral, wry, grave.
- **Marcus Reed** (`Reed`) — CEO of Meridian AI, composite frontier-lab CEO. Charming,
  believes he is the lesser evil. Arc: hype → resistance → grudging participant →
  honest elder statesman. Expressions: confident, defensive, chastened.
- **Dr. Lena Park** (`Park`) — alignment researcher, later head of a third-party risk
  assessor. The technical conscience. Expressions: neutral, worried, bright.
- **Lux** (`Lux`) — Meridian's consumer AI persona: a ginger catgirl avatar (matches
  the workspace's established catgirl: long wavy ginger hair, ginger cat ears + tail,
  amber eyes). Successive model generations keep the avatar: Lux-3 (2027, eager,
  oversells everything), Lux-5 (2031, beast, controlled), Lux-7 (2035, top-expert,
  visibly hedged), Lux-9 (2038, actually honest), Lux-Ω (2040, superintelligent).
  Her honesty arc IS the source's alignment arc (apparent-success seeker → aligned).
  Expressions: cheerful, sheepish, serious, radiant (2040 variant with soft glow).

Rationale: user asked for a US gov character, a Chinese gov character, and a catgirl
"as appropriate" — the catgirl is appropriate as a consumer AI avatar, which the source
itself supports (AI companions, AI personas, moral status of AIs, deals with misaligned
AIs). One instance of Lux's lineage confesses misalignment in 2035 and takes the deal.

## Chapters (main path)

1. **2027 — The Writing on the Wall.** Two workforces. Congress wakes up ("Who will
   control all these AIs?" / "Probably not us."). Transparency Act. Meet Reed + Lux-3.
2. **2028 — AI on the Ballot.** Datacenters cost 2x the military budget. World scared
   and angry. Intelligence explosion warnings. Election night.
3. **2029 — Choose a Path.** Situation Room. The five plans laid out. CHOICE.
4. **2029 — The Deal.** (Plan A) China receptive and why. Compute declaration; training
   pause; verification devices; worldwide buy-in; the Consortium.
5. **2030 — Four Principles.** Buy time / total research transparency / diffuse broadly /
   reversibility. Reed's incentives flip (AI becomes a commodity). MACD conceived:
   China's datacenters in Canada, America's in Mongolia.
6. **2031 — Safety Cases.** "Beasts." Misbehavior incidents pile up; burden of proof
   flips; safety cases = alignment + control; continual-learning ban negotiation
   (Xi/President yelling match, retold by the President).
7. **2032–33 — Controlled Explosive Growth.** 50% GDP growth; SEZs; cap-and-trade
   permits ($50T revenue); Citizen's Dividend ($45k → $1M); biodefense buildout;
   truthseeking AIs; persuasion tax.
8. **2034 — Mutually Assured Compute Destruction.** 60B H100-equivalents; the
   Mongolian standoff made real; ocean datacenters; five-centuries-in-five-years.
9. **2035 — Pause at Top Expert.** Control has a ceiling (orphaned-8-year-old-heir
   analogy). The pause. Deals with misaligned AIs; a Lux-7 instance confesses.
10. **2036 — Life After Work.** 26% employment; arcologies / SEZs / preserves; what
    meaning is left; the political leverage problem; informed voters.
11. **2037 — Truth Arrives.** Skeletons out of closets; privacy-preserving auditing;
    lie detectors used ON the powerful; cheating becomes impossible.
12. **2038 — Alignment Is a Science.** Honesty protocols with textbook theory;
    interpretability as mind-reading; "saints and angels walking among us."
13. **2039–2040 — Passing the Torch.** Deference; handoff by induction; autonomous
    militaries sworn to constitutions; the point of no return; End Of The World Party.
14. **Epilogue — 2045.** Space lottery (one ten-billionth each); von Neumann probes;
    Universal Rights; "a cosmos at least as diverse as humanity itself."

## Branch endings (each ~30-45 beats, ends on card + "Return to 2029?")

- **Plan D — Race to ASI.** Light-touch. Full automation 2030, ASI early 2031. Ends
  cold: misaligned takeover heavily implied (mirrors AI 2027 race ending). Card:
  "In 2021 the AIs stopped writing what we could read." (style: abrupt).
- **Plan C — Burn the Lead.** Strong regulation, pause at cusp, no verification deal
  (can't let Chinese inspectors in). Companies' carrot + China stick → unpause. Ends:
  power concentrated, oligarchy odds, roll of the dice (mirrors slowdown ending).
- **Plan B — Fight China.** US-led coalition, The Project, sabotage, escalation. Ends
  on the President choosing between handoff and war. No good exit shown.
- **Plan S — Shut It All Down.** Moratorium; "nobody builds god." China agrees.
  Works... for now. Ends: peaceful but haunted — "treaties don't last forever; when
  this one breaks, the race restarts with far more compute."
- **Plan A** continues as chapters 4-14.

## Tone / prose rules

- Compress hard but keep the load-bearing numbers and mechanisms (they're the point):
  $10B/month, 2x military budget, 1% hidden compute, 20% → 50% safety compute, 4x/yr
  compute growth cap, $200k robot permits, $50T revenue, 26% employment, 60B H100e,
  200M agents at 50x speed, Dividend $45k→$1M→$10M, "one ten-billionth of space."
- Spare prose. No purple narration. VN beats are short; one idea per click.
- BAN: em dashes (use periods, commas, parentheses), "genuinely", "honestly",
  "delve", "testament", "tapestry", "it's not X, it's Y" tic. Contractions welcome.
  Characters talk like tired professionals, not keynote speakers.
- Humor allowed, dry. Lux is playful early, quieter later.
- Numbers on screen: prefer dialogue/narration over baked-into-art text.

## Interactivity beyond the big branch

- 2-3 small choices that flavor but rejoin quickly (e.g., in 2027, what do you tell
  Congress; in 2035, whether to advocate honoring the deal with the confessed
  misaligned Lux instance). Keep them cheap: rejoin within a few lines.
- After finishing any branch ending, player returns to the 2029 choice with the seen
  option marked. After finishing Plan A, title screen unlocks "Paths" (chapter menu).

## Assets

- ~12 backgrounds, ~8 CGs, 5 characters x 3-4 expressions (~17 sprites) + Lux radiant.
- Art via OpenAI gpt-image-2 (`OPENA_API_KEY` env; images API). Master-first method per
  LESSONS.md §4: master sprite per character on flat #FF00FF magenta, expressions as
  edits of the master, CGs from character masters as refs. Minimal/no text in images.
- Audio: NO music pipeline available (Lyria needs OpenRouter; user has none configured).
  Engine treats missing audio as silent no-op. File in HUMAN.md; wire @bgm directives
  anyway so tracks can drop in later.

## Style

16:9 stage, cqh-sized UI (copy reference architecture wholesale). Palette: deep
navy/near-black chrome, warm amber accent (matches ginger catgirl + "dawn" motif),
clean sans for UI, serif-ish for narration. Painterly semi-realistic backgrounds,
anime-adjacent (not chibi) sprites. Title screen: Earth from orbit at dawn terminator,
"PLAN A" in thin caps.
