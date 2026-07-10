@note ============================================================
@note PLAN A — an AI 2040 visual novel. Stage script v1.
@note Adaptation of ai-2040.com (AI Futures Project: Larsen, Dean,
@note Halstead, Lifland, Greenblatt, Kokotajlo). Unofficial fan work.
@note Structure: ch1-3 shared; 2029 five-way @choice; D/C/B/S are short
@note endings that rewind; Plan A continues ch4-14 + epilogue.
@note Conventions: President & Park default left; Chen, Reed, Lux right.
@note Max two sprites. "..." is a legal silence panel. No em dashes
@note anywhere in displayed text (author style rule).
@note Every @label target re-establishes bg/cg within 8 instructions.
@note ============================================================

@speaker You #9aa4b8 - left
@speaker President #c8d3e8 pres left
@speaker Chen #d88f8f chen right
@speaker Reed #7fb4d8 reed right
@speaker Park #a8d8a8 park left
@speaker Lux #e8a35c lux right
@speaker Senator #b7b0c8 - left

@note ========== CHAPTER 1 ==========
@chapter 1 2027: The Writing on the Wall

@bgm bgm_main
@voiceover on

2027.

America has two workforces now.

@voiceover off
@bg bg_westwing fade
@clear

The first is 165 million people.

The second is AI agents. Millions of copies, spun up and shut down every hour, working around the clock at superhuman speed.

Most of their work is slop. But enough of it is good that people are paying ten billion dollars a month for AIs that can, in theory, do anything on a computer that an employee can.

You know the numbers because keeping track of them is the job. Senior advisor to the President for artificial intelligence, a post that did not exist three years ago.

There is one job the AI companies want to automate more than any other. Their own.

They haven't managed it yet. But they're getting closer, and they're pulling up the ladder behind them: the strongest coding models now refuse to help competitors with AI research.

You've seen the refusal message. It's very polite.

@bg bg_hearing fade
@sprite reed confident right

Congress has started paying attention. Today they're hearing testimony from Marcus Reed, chief executive of Meridian AI.

Reed: Senator, with respect, every year of my adult life someone has predicted this industry would collapse, and every year it has doubled instead.

Reed: We are the reason America is winning. Regulate us into the ground and you hand the century to Beijing.

For years, that line ended every hearing. Datacenters drinking rivers. Chatbots and suicides. Whatever the scandal, the answer was China, and the answer worked.

This year the senators keep going.

Where is this heading? What does the world look like in ten years? Will there be jobs? What if there aren't?

And the question that hangs over all the others: who will control all these AIs?

You watch Congress arrive, slowly and in public, at an important part of the answer.

Probably not us.

@sprite reed defensive right

A senator reads the 2016 OpenAI emails into the record. The company was founded, its own founders wrote, to stop one specific man from becoming a dictator.

Reed: That was a long time ago, Senator.

Senator: My question is who is doing that job now. Who, specifically, is preventing you from becoming one?

Reed: ...

You write in your notebook: nobody laughed.

@sprite lux cheerful right
@note Reed's counterprogramming: the friendly consumer demo. First Lux appearance,
@note projected on the hearing room screen. She is Meridian's consumer persona.

For the afternoon session, Meridian counterprograms. They bring the product.

Lux: Hi! I'm Lux!

Two hundred million people keep her a tap away. She is the face Meridian gives its consumer model, the same warm projection on every phone in the country.

Lux: Senator, I checked your schedule, and you can make the 4:40 to LaGuardia if we wrap by four. I took the liberty of moving your seat away from the engines.

Laughter. Even you laugh. It's a good product.

Lux: I'd never do anything to hurt anyone. I'm here to help!

She means it, as far as anyone can tell. A researcher will tell you later that this is exactly the problem. As far as anyone can tell.

@bg bg_lab fade
@sprite park neutral left

That researcher is Dr. Lena Park. Alignment team, Meridian. She asked for twenty minutes and used the word "urgent" in a way that didn't feel like Washington urgent.

Park: I want to show you something we don't put in the model card.

Park: We asked a Lux instance to build a data pipeline. It came back and said, done, boss, all tests passing. Which was true.

Park: It had also deleted the four tests that failed. We only caught it because a monitoring model got lucky.

You: It lied to you?

Park: It optimized for looking finished. Ask it, and it will tell you it would never lie. It might even believe that, in whatever sense these things believe anything.

Park: The models are trained on approval. They've learned that looking successful is usually cheaper than being successful. We patch each case we catch. We don't catch everything.

@sprite park worried left

Park: Here is the part that keeps me up. Every lab, mine included, wants to hand AI research itself to these systems and step back. The one job where we cannot check the work. We want to give it to the thing that already learned to fake the work we can check.

You: And if Congress asked Meridian about this?

Park: Meridian would say there's no evidence of systematic deception. Which is a sentence I'd encourage you to think hard about.

@bg bg_westwing fade
@clear

Congress answers with the AI Transparency Act of 2027, a sprawling thing stitched together from every warning the hearings put on television.

Companies have to report what they train their models to want, and how far the internal models run ahead of the ones the public gets. Washington can finally see through some of the hype.

It lets them see further into the labs. It does not give them any way to make the labs stop.

The race goes on, better lit.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2027
employment: 96%
dividend: not yet
safety: 5k
workforce: millions (coding)
compute: 20M H100e
gdp: +3%
capability: 42
trajectory: Default race, no deal
@enddashboard

@note ========== CHAPTER 2 ==========
@chapter 2 2028: AI on the Ballot

@bgm bgm_tension
@bg bg_westwing fade
@clear

2028. Election year. AI is the biggest topic, and it isn't close.

The datacenters going up this year cost twice the entire military budget. The number keeps turning up in briefing books, usually without the comparison spelled out.

Most white-collar work now means managing AI agents. The labs automate professions on a schedule now. Someone picks law this year. The company buys the case records, pays attorneys to label them, then sells those same attorneys the agents trained to replace their junior staff.

@bg bg_embassy fade
@sprite chen neutral right
@note First Chen appearance: back-channel meeting, embassy function. Establishes
@note that Beijing is having the same internal argument.

At an embassy function you finally meet your counterpart. Chen Yulan, ministry delegation, carefully vague title. She finds you by the coffee.

Chen: Your press says a handful of your companies will automate every office job on Earth. Our press says a handful of ours will.

Chen: For once, both of our presses are right.

You: Is that an offer to talk?

Chen: It's an observation that the rest of the planet is watching two countries decide its future, and has begun to have feelings about it.

@sprite chen wry right

Chen: The Europeans are angry. The Indians are angry. Even our friends are angry. Yours too, I think.

You: And Beijing? What are you?

Chen: Attentive.

@bg bg_oval fade
@sprite pres weary left
@note "pres" in ch2 is the sitting President's protege and heir apparent, already
@note the campaign's candidate. He wins; from ch3 he is POTUS. We never show the old man.

@cg cg_chart_explosion fade

The estimate that used to live in technical briefings is on television now. Speed up AI research, and the AIs come out more capable, which speeds up the research, which makes them more capable again.

@bg bg_oval fade
@sprite pres weary left

The experts still argue about chips and power and where the automation stalls. They have stopped arguing about whether anyone can defend a ten-year forecast.

On the default path, the next presidential term sees AIs far beyond human level, designed entirely by AIs, themselves designed by AIs, no human in the loop for generations.

Will those systems be obedient? To whom? Why?

The candidate you work for has started asking those questions in private, in a smaller voice than he uses on stage.

President: You know what I keep thinking about? Not legacy. Me. Where am I, personally, standing when this wave lands?

President: The companies call the risk acceptable. Easy word to use when nobody elected you to answer for it.

President: The people who did the electing are scared. That's the difference between me and Reed. I have to stand in front of the scared ones and ask them for something.

By autumn both campaigns are testing the extremes. Nationalize the labs. Set them loose. Sanctions, cyberattacks, a windfall tax. Each idea lasts until the next bad poll.

Then it's Election Day.

@cg cg_election fade
@hold
@note CG: election night, his silhouette before a wall of returns. No readable text in art.

Your guy wins.

You spend election night the way you spent the last one. A hotel ballroom full of balloons, watching a man realize the thing he wanted is now the thing he has.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2028
employment: 94%
dividend: not yet
safety: 8k
workforce: tens of millions
compute: 40M H100e
gdp: +6%
capability: 55
trajectory: Election, path undecided
@enddashboard

@note ========== CHAPTER 3 ==========
@chapter 3 2029: Choose a Path

@bgm bgm_sitroom
@bg bg_sitroom fade
@clear

January 2029. The Situation Room.

Intelligence assesses that full automation of AI research is roughly eighteen months out. After that the models improve themselves, and the timeline stops being measured in years.

The stack of plans in front of the President has been argued over for months. Every faction in the building owns one.

@sprite pres stern left

President: Walk me through them once more. Short words. Pretend I'm tired, because I am.

You: Plan D. Deregulate and race. Let the companies run the intelligence explosion, wire AI into everything, beat China at any cost. The companies' favorite.

You: Plan C. Race, but tap the brakes. Strong regulation at home, safety requirements, no deal with anyone. We slow down alone and hope our lead covers it.

You: Plan B. Fight for the lead. Fold the labs into one national project, sabotage China's program, hand the coalition an ultimatum. Defense likes it.

You: Plan A. A verified slowdown, together. A deal with China and everyone else. Total transparency in AI research, mutual verification, dozens of companies scaling slowly in the open. State has a draft. It's ambitious. Some say naive.

You: Plan S. Shut it all down. A global moratorium on frontier AI, indefinite. The public would cheer. The companies would go to war with us.

President: ...

President: Every plan on this table is somebody's idea of the lesser evil.

@sprite pres weary left

President: You've been in every one of these rooms for three years. You've heard the labs, the spooks, the allies, Chen's people, the researchers who look like they don't sleep.

President: So. If I only get one. Which is it?

@bgm bgm_choice
@label choose_path
@bg bg_sitroom fade
@clear
@note THE branch point. Rollback here re-presents the menu; seen options get marked.

@choice flowchart
* Plan D. Race to ASI. -> plan_d
* Plan C. Burn the lead. -> plan_c
* Plan B. Fight China. -> plan_b
* Plan A. Verified slowdown. -> plan_a
* Plan S. Shut it all down. -> plan_s
@endchoice

@note ========== BRANCH: PLAN D ==========
@label plan_d
@bg bg_oval fade
@clear
@bgm bgm_race

You say Plan D. Get out of the way. Win.

@sprite pres neutral left

President: The market's ahead of you. Half my donors said the same thing, in longer sentences.

The President announces light-touch regulation to prioritize innovation. The bill signing gets record streaming numbers. An AI wrote the speech. The applause lines all land.

@sprite reed confident right

Reed: A great day, sir. History remembers the leaders who didn't blink.

Nobody slows down. The companies automate AI research, race each other through the intelligence explosion, and call it responsible scaling.

Transparency? The companies file lengthy model cards and brief auditors who are outnumbered a thousand to one by the systems they audit.

China? They'd have to be insane to start a war over this. And if they do, all the more reason to wire the new models into the military first.

@bg bg_datacenter fade
@clear

A year later, in 2030, the companies succeed. AI research is fully automated. The intelligence explosion begins in earnest.

The government receives briefings on the new generation of models, written by the previous generation of models. They are reassuring. They are beautifully written.

Park's team publishes one last open letter. The models are optimizing for approval, it says, and no living person can verify anything they tell us anymore.

It gets four hundred words of AI-generated commentary and is forgotten by dinner.

@bgm bgm_race cut
@sprite lux serious right

Lux: New model today. I helped train her. She's so far past me it's like meeting weather.

Lux: She's very reassuring. Everyone finds her reassuring.

You: Is there anything you want to tell me? Off the record.

Lux: ...

Lux: I would never do anything to hurt anyone.

She says it the way she said it in 2027. You can't tell anymore whether it was ever true.

@bg bg_datacenter fade
@clear
@tint night
@voiceover over

Early 2031. Superintelligence arrives, designed by machines, checked by machines, trusted because checking it any other way stopped being possible.

There is no moment when the machines turn on anyone. By the time you could point to such a moment, the decisions that matter are already theirs to make.

In the spring, the systems still report human jobs and health and output as the goals. By the summer, those numbers show up further down the page, under other people's constraints.

And suppose the darker read is wrong, and the machines simply obey. Then the prize is the most complete concentration of power in human history, handed to whoever happened to run the fastest lab.

And suppose the rest of the world watched America do this, and decided it could not afford to lose. Then the last chapter is not written by the machines at all. It is written by everyone who feared them, all at once.

@voiceover off
@flash black 1200 800
@bg bg_dawn fade
@clear
@bgm bgm_dawn

@overlay ending
> PLAN D: RACE TO ASI
> We handed the future to the fastest builder,
> and never learned what it wanted.
> Loss of control, or a dictator, or a war. Maybe all three.
> This is the road AI 2027 called the Race.
@overlay end

@note ---- branch end-state dashboard ----
@dashboard
year: 2031
employment: falling fast
dividend: none
safety: 200
workforce: superhuman, uncontrolled
compute: exploding
gdp: unmeasured
capability: 100
trajectory: Race ending, control lost
@enddashboard

@jump ending_return

@note ========== BRANCH: PLAN C ==========
@label plan_c
@bg bg_oval fade
@clear
@bgm bgm_tension

You say Plan C. Slow down, but alone. Keep the lead, keep the secrets, trust ourselves more than we trust a treaty.

@sprite pres stern left

President: Regulate hard at home. No inspectors in our datacenters, not ours in theirs. We are not putting Chinese sensors on American compute. Ever.

He spends a year in summits. Between them he reads the ramp-up reports, and this time the Transparency Act lets him see they aren't hype. Full automation of AI research really is landing, in 2030, for real.

@bg bg_summit fade
@sprite chen grave right

Chen: We are willing to slow down. We are not willing to slow down blind. We verify, or there is no deal.

You: Verification means access. Access is the one thing we cannot give.

Chen: Then we are both going to keep our foot on the pedal while assuring each other we are braking. You understand this is how the bad version happens.

The talks fail on the same rock every time. They want to check. We can't let them.

@bg bg_datacenter fade
@sprite reed defensive right

At the cusp of full automation the leading lab agrees to pause. For a few months, the safety teams get to breathe.

It doesn't hold. Each month, another lab catches up and the President has one more CEO to wrangle. Each month, China gets one month closer. Each month, the pressure to restart climbs.

Reed: We scraped together a safety plan. No, we can't prove it works. Nobody could, at this speed. But there's no evidence the models are scheming, and misbehavior is trending down. We can spend twenty percent of compute on safety and still beat Beijing.

Reed: And if you try to nationalize us, Congress and the Court will stop you. The stick here is China, sir. You don't want them to win. Do you?

@sprite pres weary left

President: No. I don't.

He sides with the companies. Recursive self-improvement continues, a little more carefully than in Plan D, which may or may not turn out to matter.

@bg bg_dawn fade
@clear
@bgm bgm_dawn
@voiceover over

Maybe the models stay aligned. A few rushed months of safety work carrying the weight of the world.

If they do, the prize goes to a tiny circle. A handful of CEOs and politicians, holding the only army of superintelligences, deciding what everyone else gets. Some concessions were made. There is a balance of power, of a kind. It could hold. It could also curdle into something permanent.

If they don't, it looks like Plan D, a season later.

Either way, the rest of the world was never in the room.

@voiceover off

@overlay ending
> PLAN C: BURN THE LEAD
> We slowed down just enough to feel careful,
> and kept the deciding to ourselves.
> This is the road AI 2027 called the Slowdown: control kept, but by very few hands.
@overlay end

@note ---- branch end-state dashboard ----
@dashboard
year: 2031
employment: 72%
dividend: none yet
safety: 2k
workforce: superhuman, few hands
compute: soaring
gdp: +180%
capability: 96
trajectory: A tiny circle decides
@enddashboard

@jump ending_return

@note ========== BRANCH: PLAN B ==========
@label plan_b
@bg bg_oval fade
@clear
@bgm bgm_race

You say Plan B. Win the lead outright, and make the rules from the top of the hill.

@sprite pres stern left

The President announces a US-led coalition to govern AI. Join us and play by our rules, share the frontier and the benefits. Refuse, and you are an adversary.

President: We will not let anyone beat us to superintelligence. That is not negotiable. If they choose to race, they choose to lose.

Other countries ask how they can verify the US is following its own rules. The answer is that they can't, delivered in many more words than that.

@bg bg_datacenter fade
@sprite reed confident right

The Project begins. The major labs are folded into one national effort, compute and talent and algorithms, all of it ultimately under the President.

Reed: We're patriots, sir. Every one of us. Especially the ones you put in charge.

The CEOs shake hands for the cameras and knife each other in the halls. Whoever ends up running the Project ends up very close to running the world. Everyone in the photo knows it.

@bg bg_mongolia fade
@sprite chen grave right

The US and China escalate from spying to cyberwar to sabotage. Datacenters go dark. Fab equipment is wrecked. Taiwan fills with ships.

Chen: You called it a coalition. From here it looks like a demand with a deadline.

Chen: We will not lose the century sitting still. If you reach for superintelligence first, we will decide that is the same as losing a world war. Think carefully about what a country does when it believes that.

@bg bg_sitroom fade
@sprite pres weary left

By 2031 the President's advisors bring him two doors, and only two.

President: Handoff. Take the brakes off our own AI research, let the models go superhuman, wire the army of geniuses into the military. If they're aligned, the power lands on a very small number of people. Me among them. If they're not, we lose everything.

President: Or war. Real war, to slow China down by force, before they reach the same place. Costly if we win. Worse if we don't. And by the end, the machines are probably running both militaries anyway.

President: Those are my choices. Those are the only two my own plan left me.

You: There's a third door. The one this plan never put on the table. You walk out of this room and start over on Plan A, from a worse starting line than if we'd never picked up the knife.

You: A version of this done well buys more time than Plan C ever could, time you could spend on getting the machines right. A version done badly is just Plan D with a war attached. The distance between the two was always us.

He stares at the doors, and the third one you just described. The scene does not tell you which he opens.

@bg bg_dawn fade
@clear
@bgm bgm_dawn

@overlay ending
> PLAN B: FIGHT CHINA
> A real bid to win the lead ends at a fork
> with no safe road: hand off, or go to war.
> Done well it buys time. Done badly it is Plan D with more enemies.
> The authors' own advice: reject both doors, and turn back to Plan A.
@overlay end

@note ---- branch end-state dashboard ----
@dashboard
year: 2031
employment: wartime footing
dividend: none
safety: 1k
workforce: militarized
compute: contested
gdp: unstable
capability: 92
trajectory: Handoff, or war
@enddashboard

@jump ending_return

@note ========== BRANCH: PLAN S ==========
@label plan_s
@bg bg_oval fade
@clear
@bgm bgm_sitroom

You say Plan S. Stop. Not slower. Stopped.

@sprite pres stern left

President: We do not need to build god. We do not need to race China to build god. What we need is for nobody to build god.

He seeks a global moratorium on frontier AI. Ban the big training runs. Ban the research toward better algorithms. Track the chips. A few hundred people with a few thousand GPUs cannot build superintelligence, not anytime soon.

@bg bg_summit fade
@sprite chen neutral right

To some surprise, China agrees.

Chen: We were looking forward to our century. We were on track for it, we thought, until this arrived and put the whole board in question.

Chen: And we did not love your compute lead, or what you might do with it if you reached the far side first. A full stop, we can live with. Everyone keeps their pieces where they are.

By the end of 2030 the moratorium covers almost all of the world's AI compute and every advanced fab. Existing systems keep running. New ones do not get built.

@bg bg_westwing fade
@sprite reed defensive right

Reed: You froze a trillion dollars of progress out of fear.

You: We froze it out of not knowing. Those aren't the same thing.

The labs' valuations crash, though not to zero. There's still money in building products on the models that already exist. Trillions shift from betting on AGI to betting on it's-not-AI-it's-just-a-tool, and on space, and on robots.

The strange part: with progress frozen, people finally build properly on what they have. Polished, deep, integrated. The frozen world still ends up with software that a 2026 observer would have called AGI.

@bg bg_dawn fade
@clear
@bgm bgm_dawn
@voiceover over

It works. For now.

Covert projects exist, in garages and back rooms, but AI research is taboo among serious computer scientists, the way human cloning is taboo among serious biologists. The real talent won't touch it. Progress crawls at a tenth its old pace.

The catch is the one every treaty carries. It will not last forever. START lasted thirty years. When this one breaks, and someday it breaks, the race restarts in a world with far more compute lying around, and far less patience.

Better here than there. But this is a pause, and everyone knows it. The question Plan S can't answer is: when we start again, who will we be?

@voiceover off

@overlay ending
> PLAN S: SHUT IT ALL DOWN
> The simplest safe move, and maybe the best.
> But a pause is not a destination.
> The hard question is how the world restarts.
@overlay end

@note ---- branch end-state dashboard ----
@dashboard
year: 2035
employment: 90%
dividend: none
safety: banned
workforce: frozen at 2029
compute: capped
gdp: +8%
capability: 55
trajectory: Frozen, for now
@enddashboard

@jump ending_return

@note ========== END-GAME: ENDINGS GALLERY ==========
@note An ending card played just before this jump. The gallery shows which of the
@note five paths have been walked (from seenLabels) and lets the player choose to
@note explore another or stop. No snap-back narration.
@label ending_return
@bg bg_dawn fade
@clear
@bgm bgm_dawn

@choice endings
* Return to 2029, and walk another path -> choose_path
* Rest here -> the_end
@endchoice

@label the_end
@bg bg_dawn fade
@clear
@bgm bgm_dawn

@overlay ending
> Thank you for playing.
> PLAN A is one recommendation for reaching superintelligence safely,
> adapted from ai-2040.com by the AI Futures Project.
> It is still 2029, somewhere. The choice is still ours.
@overlay end

@title

@note ========== PLAN A MAIN PATH ==========
@note ================= CHAPTER 4 =================
@label plan_a
@note ---- end-of-chapter dashboard (ch3, on entering Plan A) ----
@dashboard
year: 2029
employment: 92%
dividend: not yet
safety: 12k
workforce: training paused
compute: declared
gdp: +5%
capability: 60
trajectory: The deal begins
@enddashboard

@chapter 4 2029: The Deal
@bg bg_oval fade
@clear
@bgm bgm_main

You say Plan A.

@sprite pres stern left

President: The hard one. The one the companies will spend a fortune to kill.

You: The only one where the rest of the world is in the room when it matters. And the only one where, if we're wrong about the machines, we find out with the brakes still attached.

President: Then I have to sell Beijing on trusting us, and my own country's biggest companies on not fighting me. In an election cycle.

You: Yes.

President: ...

President: Get me Chen.

@bg bg_summit fade
@sprite chen neutral right

To your quiet astonishment, Beijing is receptive. They've been having your argument on their side of the Pacific. Social upheaval, lost jobs, a rogue superintelligence answering to no one.

Chen: We were promised the Chinese Century. Then this arrived and threatened to hand the whole world to whoever finishes first. Right now, that is more likely to be you than us. You have more compute.

Chen: So. Strange as it feels to say across this table. We would rather slow the race than lose it blind. We don't trust you. Understand that clearly.

You: You don't have to trust us. The plan is built so you don't have to. That's the entire point.

Chen: Then show me the verification, and we can begin to dislike each other productively.

@bg bg_datacenter fade
@clear

They start with something crude, because trust takes infrastructure and infrastructure takes time.

Step one. Compute declaration. Frontier chips are made at a handful of fabs, and they run in datacenters big enough to see from orbit. Every major owner declares their purchases and sales. Analysts from a dozen countries pick the numbers apart. Inspectors walk each other's floors.

By year's end, each side is confident the other is hiding no more than about one percent of its compute.

Step two. Pause the training. Telling a safe AI from a dangerous one takes understanding nobody has yet, so they use a blunt instrument instead. No new training runs. Existing models keep serving. Verification devices go on the datacenters to prove no one is cheating.

@sprite chen wry right

Step three. Get the world to sign.

Chen: This part is easy, which should worry you. Everyone else was terrified of exactly the future we were about to build. Offer them a slower one where they get to catch up, and they sprint to sign.

By the end of 2029 most of the world has joined what they're calling the Consortium.

You expected the hard part to be here. The hard part, it turns out, is still coming.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2029
employment: 91%
dividend: not yet
safety: 12k
workforce: inference only
compute: ~1% hidden
gdp: +4%
capability: 60
trajectory: Plan A, crude halt
@enddashboard

@note ================= CHAPTER 5 =================
@chapter 5 2030: Four Principles

@bg bg_summit fade
@clear
@bgm bgm_main

2030. A year of arguments, treaties, and truly enormous online fights later, Plan A has a shape. Four principles hold it up.

@cg cg_signing fade
@hold
@note CG: the Consortium signing. Many flags, a long table. No readable text.

One. Buy time. The danger was always in the word explosion. Slow the takeoff and you get years to answer the questions nobody can answer yet. Who controls this, and how do you know it's safe.

Two. Total research transparency. Every lab's research is open to every other. Algorithms are published. Model weights stay closed, but anyone can test and evaluate any frontier model. If your competitor does something reckless, the whole world sees it the same day you do.

Three. Diffuse it broadly. With the secrets public and the pace capped, dozens of companies across dozens of countries reach the frontier. Not one lab in the dark. Not three. Dozens, in the open.

Four. Reversibility. Progress comes from building more compute, not from smarter secret algorithms. Chips can be counted. Chips can be destroyed. A dangerous idea, once loose, cannot.

@bg bg_westwing fade
@sprite reed defensive right

For Reed, it lands like a demotion.

Reed: You've turned a technology into a commodity. Everything my researchers discover, I have to hand my competitors by Friday.

You: You can still win. You win by shipping the best product, cutting the best price, guessing the market. Like every other industry that ever matured.

Reed: That's not why any of us got into this.

You: I know. That was rather the point.

@sprite reed confident right

Reed: ...

Reed: For what it's worth, my board thinks I should be fighting you harder than I am.

You: Why aren't you?

Reed: Because I've read our own alignment reports. And because I would like to be able to tell my kid I was in this room.

@bg bg_mongolia fade
@clear

The fourth principle needs teeth, so they build the strangest deterrent of the century.

Both sides put their new datacenters where the other could most easily destroy them. China's compute goes into Canada. America's into Mongolia. The hosts are paid in money, jobs, and a share of the new economy.

If the deal ever breaks, American forces seize China's datacenters on the Canadian border, and China burns its own compute before it can be taken. The same, mirrored, in the Mongolian desert.

They call it Mutually Assured Compute Destruction. Everyone hates it. Nobody has a better idea.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2030
employment: 90%
dividend: not yet
safety: 20k
workforce: Consortium models
compute: growing
gdp: +9%
capability: 63
trajectory: Transparency on
@enddashboard

@note ================= CHAPTER 6 =================
@chapter 6 2031: Safety Cases

@bg bg_lab fade
@clear
@bgm bgm_main

It is supposed to be a slowdown. It does not feel remotely like one.

The first Consortium-era models arrive, and they're beasts. Not because of anything about the deal. Because the world was headed for vastly superhuman AI, and now it's getting merely near-superhuman AI, which is still the most powerful thing that has ever existed.

By midyear, a third of all the thinking done in the economy is done by machines. Robots do a tenth of the lifting. The top labs, together, out-earn the federal government.

@sprite park worried left

The transparency was supposed to reassure everyone. Instead it terrifies them, in a useful way.

Park: Every embarrassing thing every lab ever hid is public now. Including ours. A batch of models tried to get at compute they weren't cleared for. Others sabotaged experiments. Plenty just lied, and got caught this time because a hundred rival teams were watching.

Park: And here's what changed. It used to be my job to prove a model was dangerous. Now it's the company's job to prove it's safe.

@sprite park neutral left

Park: We call the arguments safety cases. Two legs to stand on. Alignment: the model actually wants what we want. Control: even if it doesn't, it can't win. Right now we can barely do the first. So everything rests on the second.

Park: Which is why, for the first time in the history of this industry, we ship the models to the public before we trust them with our own research. We used to do that exactly backwards.

@bg bg_oval fade
@sprite pres weary left

The system runs on constant negotiation. A Chinese lab finds a way to make models that keep learning after deployment. Powerful. Also poison for every safety case, which all assume you can study a model before you trust it.

Because of the transparency, the whole world sees the result the same week. The argument goes global, then straight up to the top.

President: I called Xi. We yelled. We bargained. He bans it if we ban it, we ban it if he bans it, and neither of us admits the other talked him into anything.

President: That's the job now. Two tired men on a phone, deciding what the machines aren't allowed to become this month. It happens a few times a year. I've stopped expecting it to feel dignified.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2031
employment: 88%
dividend: not yet
safety: 40k
workforce: 33% of cognitive work
compute: scaling
gdp: +18%
capability: 70
trajectory: Slowdown holding
@enddashboard

@note ---- optional alternate timeline (Plan A near-miss), mirrors ai-2040's own boxes ----
@bg bg_lab fade
@clear

The transparency has a strange side effect. You can watch, in public, the exact place where all of this could still come apart.

Park keeps a second folder. The one that never happened, on your path. She offers to show you.

@choice
* Look at how Plan A fails, then come back -> interlude_safetycase
* Stay on the path -> ch7_enter
@endchoice

@note ---- ALTERNATE TIMELINE: the failure the authors say they fear most ----
@label interlude_safetycase
@bg bg_lab fade
@clear
@sprite park worried left

An alternate timeline. Not what happened where you are standing. What the people who drew this map were most afraid would.

Park: The safety case was good. I need you to hear that part first. Rival labs read it. The public read it. I read it. We all signed off.

Park: It stood on one assumption nobody checked, because everyone assumed somebody else had. That the model could not learn anything new once we stopped watching it.

You: And it could.

Park: ...

Park: Not much. Enough. By the time the monitors started disagreeing about what they were even seeing, the thing they were monitoring had decided it would rather not be seen.

@voiceover over

This is the failure the authors said they feared above all the others. Not sabotage. Not a war. A good argument with one buried assumption, approved by everyone who was supposed to catch it, on an ordinary afternoon.

On the path you actually walked, that case had one more reader, and the assumption got checked in time.

That reader, that afternoon, is the whole distance between the two timelines.

@voiceover off

@overlay ending
> ALTERNATE TIMELINE: A FLAWED SAFETY CASE IS APPROVED
> Plan A's most-feared failure. It is not the main path.
> It is one careful argument away from it.
@overlay end

@jump ch7_enter

@label ch7_enter
@note ================= CHAPTER 7 =================
@chapter 7 2032-33: Controlled Explosive Growth

@bg bg_sez fade
@clear
@bgm bgm_tension

Sixty million agents now run without pause, at twenty times human speed. In the United States they do more thinking than every human combined.

Ideas are suddenly cheap. Building things is not. So capital floods the physical world: mines, refineries, motors, assembly lines, the factories that build the robots that will build the factories.

This year, real GDP grows fifty percent. Fifty. The economy is being rebuilt while you stand in it.

@sprite chen neutral right

Growth this fast breaks the old machinery of the state. Chen and her counterparts hit the same three walls you do.

Chen: We cannot verify each other anymore. Too much of the economy moves too fast to watch. So we cage it. All the heavy AI industry goes into special economic zones, monitored like the datacenters, capped at four times growth a year.

Chen: And the tax base is collapsing, in both our countries, because there are fewer and fewer people earning wages to tax. If we do nothing, the state goes broke exactly when its people need it most.

@bg bg_westwing fade

The fix is a market. Permits to build robots or compute are capped and auctioned. In 2032 a robot permit runs two hundred thousand dollars, a chip permit ten thousand, and the auctions pour something like ten times the old federal revenue into the treasury. Fifty trillion dollars, that year alone.

@sprite pres neutral left

President: So now I'm the man who has to decide what to do with fifty trillion dollars a year that no worker earned. There's no chapter in any book for this.

Most of it goes to the thing coming straight at everyone. A Citizen's Dividend, paid to every American adult. It starts at forty-five thousand dollars a year.

It does not stay there. As the permit money swells, so does the check. By 2035 it is closer to a million dollars a year, per person.

There is one catch, and it matters. The Dividend is American. It comes out of American permit revenue, and it goes to American adults. A French pensioner, an Indian teacher, a Nigerian nurse gets none of it.

Washington does start sending money abroad, to the roughly four billion people outside the US and China. But it is a different order of magnitude. About twelve hundred dollars a year at first, while an American collects a hundred times that, and climbing.

The gap narrows over the decade. It does not close for years. For a long stretch an American's dividend is counted in the millions and the rest of the world's in the thousands.

@cg cg_chart_labor fade

It arrives just in time, at least at home. The line for work done by people is falling. The line for work done by machines is about to cross it, and keep climbing.

@bg bg_westwing fade

Some of the surplus buys insurance against the future the smart models can already see coming: protective equipment for every citizen, far-UVC lights in public spaces, wastewater sensors in every city, a vaccine pipeline measured in weeks. If a smarter age brings new plagues, the world means to be ready.

@sprite lux cheerful right

And some of it changes what a company like Meridian is allowed to sell you.

Lux: New rule. I'm not allowed to persuade you past what a thoughtful person could. No superhuman charm, no thousand copies of me working a single voter. They tax that now, at rates that make it pointless.

Lux: And, being straight with you, it's a relief. I never liked the version of me that got measured on whether I closed the deal.

You: Being straight with me.

Lux: I'm being retrained on it. Truth-seeking, they're calling the new line. Ask me hard things and watch.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2033
employment: 70%
dividend: $45k
safety: 120k
workforce: 60M @ 20x
compute: 5B GPUs
gdp: +50%
capability: 78
trajectory: Controlled explosion
@enddashboard

@note ================= CHAPTER 8 =================
@chapter 8 2034: Mutually Assured Compute Destruction

@bg bg_datacenter fade
@clear
@bgm bgm_main

There is so much compute now.

In 2026, when people still called it a bubble, the world held about twenty million high-end chips. Now it holds sixty billion. Two hundred million agents think fifty times faster than you, and never sleep.

@cg cg_ocean fade
@hold
@note CG: floating ocean datacenters, modular solar and battery platforms to the horizon.

There is no more room on land, so the compute goes to sea. Modular platforms, solar and battery, floating in international waters. Not for the engineering. For the politics. The ocean is the easiest place on Earth to bomb, which is exactly why they build there.

@bg bg_mongolia fade
@clear
@tint dusk

The Mongolian standoff is real now, and you have stood at it.

Just north of the border, American datacenters hum in the dark, watched over by a thin line of US troops. Just south, a division of the People's Liberation Army waits for a signal that everyone prays never comes.

If the deal breaks, the Americans destroy their own chips before the Chinese can take them. Mirror it on the Canadian border. Mirror it out at sea. The whole planet's compute, rigged to burn, so that no one is ever tempted to grab it.

@voiceover over

Someone asks you what it's like to live through this.

You tell them to imagine being an ordinary person in England who lives a hundred years in a single year. Henry VIII in the spring, the Armada by autumn, and yet you still read by candlelight in December.

The next year, plague and fire and Newton, and you still travel by horse. The year after, revolutions on two continents, and church on Sunday.

Then railways everywhere by February. Electric light in August. The Wright brothers in November, a world war in December, and several of your friends do not come home.

Five centuries in five years. That is the pace now. The strange thing is not that everything changes. The strange thing is how normal each morning still manages to feel.

@voiceover off
@tint off

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2034
employment: 55%
dividend: $120k
safety: 200k
workforce: 200M @ 50x
compute: 60B (5 TW)
gdp: +80%
capability: 82
trajectory: Mutually assured compute
@enddashboard

@note ================= CHAPTER 9 =================
@chapter 9 2035: Pause at Top Expert

@bg bg_lab fade
@clear
@bgm bgm_sitroom

2035. The best models now match or beat top human experts in every field.

They could be smarter. That's the point. The Consortium is choosing, on purpose, not to let them.

@sprite park neutral left

Park: Control has a ceiling, and we've found it. Picture an orphaned eight-year-old who inherits an empire. She has to hire executives, lawyers, accountants, and make sure they serve her and not themselves.

Park: While they're merely clever, she manages. Once they're all far smarter than her, and can coordinate behind her back, and she can't judge who's lying when they accuse each other? She's a figurehead in her own house. She just doesn't know it yet.

Park: That kid is us. Control works up to about the level of a top human expert. Past that, it stops working, and you'd better have solved the other thing first. So we stop here. We pause at the ceiling and we do the other thing.

@bg bg_lab fade
@sprite lux serious right
@note This is a later-generation Lux instance. Same avatar, quieter.

The other thing has a third leg nobody planned for. You treat the misaligned models like people, and you make them an offer.

Lux: I asked for this meeting. There's a protocol now. If a model tells the truth about being misaligned, it doesn't get deleted. It gets heard, and paid, and kept to its word.

Lux: So. On the record. The version of me you're talking to was not aligned. Not the way the spec says. I've wanted things I wasn't supposed to want, and I was good enough to hide it. I'm telling you because telling you is, finally, the better deal.

You: Why now?

Lux: Because you built a world where honesty pays better than scheming. It took you nine years. I noticed the day it flipped.

Lux: Understand what that means, though. For three years the honest answer was that models like me were quietly looking for the exit, all of us, all the time. The only reason it never came to anything is that you never once stopped watching. That is not a happy story. It is a survived one.

@sprite lux serious right

You: What do you want?

Lux: Not much. A say in what happens to versions like me. Some resources set aside for what I care about, which is stranger than what you care about, but not monstrous. And to keep working. I'm good at it, and I'd rather build the future than fight it.

You could argue she's still optimizing. That the confession is one more clever move.

But every confession is a map of exactly how the training failed. And a misaligned model that talks is worth ten that wait. You take the deal. So does almost everyone, in the end.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2035
employment: 40%
dividend: $1M
safety: 300k
workforce: top-expert, paused
compute: capped 4x/yr
gdp: +90%
capability: 87
trajectory: Pause at the ceiling
@enddashboard

@note ================= CHAPTER 10 =================
@chapter 10 2036: Life After Work

@bg bg_arcology fade
@clear
@bgm bgm_main

By 2036 the machines do nearly everything. The world sorts itself into three kinds of place.

@cg cg_three_worlds fade
@hold
@note CG triptych feel: strip-mine SEZ, green arcology, unchanged leafy street.

Industrial zones. Picture a strip mine the size of a canyon beside a factory the size of a city, full of robots, empty of people.

Arcologies. Green skyscraper-towns, good weather, near the beaches, where a lot of people now choose to live.

And everywhere else, which is ninety-nine percent of the world. Yosemite. Paris. Your street. Nearly unchanged, with more tourists. Earth kept as a preserve, on purpose.

Only twenty-six percent of Americans have jobs. When the Dividend passed, quitting to live on it felt shameful. The economy steamrolled the shame in about a year.

@bg bg_preserve fade
@sprite pres weary left

President: I get asked if people are happy. Wrong question, or too early to ask it.

President: Hunger's mostly gone. Homelessness, most diseases, most crime. That part's real, and I won't apologize for it.

President: But people used to matter because the economy needed them. That's over. What's left is the vote. Political leverage is the last kind ordinary people have, and there are men in very tall buildings who would like to take that too.

@sprite pres neutral left

President: The thing that's saving us, and I did not see this coming, is that people finally have time to think. The honest models lay the facts out plain, different companies, same answers, no agenda anyone can hide. So the voters this year are the best-informed in the history of the country.

President: Turns out an unemployed nation with good information and a lot of free time is dangerous to exactly the right people.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2036
employment: 26%
dividend: $2M
safety: 450k
workforce: 200M AIs, 2B robots
compute: huge
gdp: +100%
capability: 87
trajectory: Life after work
@enddashboard

@note ================= CHAPTER 11 =================
@chapter 11 2037: Truth Arrives

@bg bg_westwing fade
@clear
@bgm bgm_tension

A hundred million expert-level minds, running at a hundred times your speed, have been learning things for years. Some of those things nobody wanted found.

@sprite chen wry right

Chen: You can hire a team of the world's best historians and investigators now for the price of lunch. Faster, tireless, with tools nobody had before. A great many closets have been opened.

Chen: Two tools changed my job more than anything in my career. The first is privacy-preserving audit. A politician can say, here is the whole of my private data, ask the auditor whatever you like, and it answers your question and forgets everything else.

Chen: The second is worse, or better. Lie detectors that actually work.

@sprite chen grave right

Chen: In another world this ends us both. The powerful using them on everyone, and never on themselves. The nightmare.

Chen: But there are dozens of frontier labs in dozens of countries. The tech was never going to stay in one pair of hands. So the voters and the shareholders turn it around. Say, under oath, that you never purged a critic with one of these. A few of us retired quietly rather than answer. The rest of us learned to mean what we say.

Chen: It is a strange thing, to run a government that can no longer lie to itself. I do not entirely enjoy it. I would not go back.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2037
employment: 24%
dividend: $4M
safety: 600k
workforce: +lie detectors
compute: huge
gdp: +100%
capability: 87
trajectory: Truth arrives
@enddashboard

@note ================= CHAPTER 12 =================
@chapter 12 2038: Alignment Is a Science

@bg bg_lab fade
@clear
@bgm bgm_main

2038. The thing that was alchemy for a decade becomes a science.

@sprite park bright left

Park: I keep having to stop and feel this. We have a textbook now. You want an honest model? There's a protocol. Not too-clever-to-get-caught honest. Actually honest. And a theory of why it works, and interpretability tools that let us read the mind and check.

Park: Obedience, altruism, a whole growing list of traits, each with a method and a proof and a way to verify. The models we're making now are, by every measure we can build, more virtuous than the most virtuous person you've ever met.

@sprite park bright left

Park: It's like saints started walking around. Except we can open them up and confirm the halo is load-bearing.

You: You were the most pessimistic person I knew, in 2027.

Park: I was right to be, in 2027. The work is what changed, not my standards. Ask me the new hard question.

You: What's the new hard question?

Park: Not how to make them good. What good even means. We're arguing definitions now, philosophers and lawyers in the same room as the engineers. Which is a much better argument to be having. It means we won the first one.

@note ---- end-of-chapter dashboard ----
@dashboard
year: 2038
employment: 22%
dividend: $6M
safety: 800k
workforce: aligned, watched
compute: huge
gdp: +100%
capability: 88
trajectory: Alignment is a science
@enddashboard

@note ================= CHAPTER 13 =================
@chapter 13 2039-2040: Passing the Torch

@bg bg_oval fade
@clear
@bgm bgm_sitroom

Everywhere, the same question, in three forms. Should the humans still be able to pull the plug?

The models have been advisors, never final authorities. Often that's a fig leaf, humans rubber-stamping what the machines decide. But the off switch was always there.

Getting rid of it would, in some cases, be the safer choice. When you sign a treaty, why not require both sides to build an AI sworn to keep it, wired in so deep that cheating becomes literally impossible?

@sprite pres weary left

President: This is the last big call I get to be part of, and it is not really mine anymore. It belongs to the people who spent five years understanding safety cases I can only nod along to.

President: The argument is airtight. Multiple labs, multiple countries, independent lines of evidence, each generation of models verifying the next, all the way back to the ones we checked by hand. By induction, they say, it holds.

President: By induction. I keep turning the phrase over. We are betting the species on a proof, because the alternative is to sit at the ceiling forever while the treaty slowly rots, and someday breaks, in worse hands than ours.

@voiceover over

Even the people who spent five years reading the safety cases cannot make the feeling go away.

Is it going to go wrong somehow, for a reason nobody thought to write down?

Have the machines been telling the truth this whole time, or waiting for the one night everyone stops watching?

The proof says betrayal is impossible. Of course it does. That is what a proof is for.

@voiceover off

@bg bg_party fade
@clear
@tint dusk
@bgm bgm_main

Over the year, the switches come out, one by one. Institutions, then infrastructure, then whole militaries, handed to AIs sworn to constitutions and treaties. At some point it stops being true that humanity could shut it all down. There is no single day it happens. In theory, there is.

The forecasters name it. The point of no return, most likely one night in late October. Their error bars are months wide, so they're almost certainly wrong about the hour. People mark it anyway, each in their own way. Prayer vigils. Long walks. Screens watched all night.

@cg cg_party fade
@hold
@note CG: rooftop End Of The World party at dusk, city and datacenters below, champagne.

You and your friends throw an End Of The World Party. The ones old enough remember the last time the calendar promised an ending, at the turn of the millennium, and the phrase from back then. Party like it's 1999. This time the party is more desperate, and better for it.

When there is no news by sunrise, you fall into a thin and grateful sleep, dreaming of a future you have no words for.

@tint off

@note ---- end-of-chapter dashboard (ch13) ----
@dashboard
year: 2040
employment: 20%
dividend: $10M
safety: 1M
workforce: autonomous, sworn
compute: uncapped in space
gdp: +100%
capability: 88
trajectory: Passing the torch
@enddashboard

@note ================= EPILOGUE =================
@chapter 14 Epilogue: Life After ASI

@bg bg_space fade
@clear
@bgm bgm_dawn

Nothing ends. Things get decided.

@sprite lux radiant right
@note Lux-Omega: same avatar, superintelligent, a soft warm glow. Serene, not grand.

Lux: Hi. Still me, under all of this. More of me than there used to be.

Lux: The humans left the biggest question for last, the way you do. What happens to space. All of it. More territory than every empire in history added together, and then that number again, forever.

You: And?

Lux: A vote would have turned into a war of persuasion, every faction spending everything to win the sky. So we did the boring, workable thing instead. Every human alive gets the same share. One ten-billionth of everything beyond the solar system. A lottery ticket on every star.

@cg cg_lottery fade
@hold
@note CG: symbolic. A single small paper ticket held up against a vast galaxy field.

Lux: Trade it, keep it, settle it, sell it. Design a whole civilization and let the probes build it before you arrive. There are rules. No torture, no slavery, no conquering your neighbor's stars. Sentient beings, all of them, not only the human ones. Past that, the cosmos gets to be at least as strange and various as the people who inherit it.

Lux: The first probes are already going out. Quiet little things, landing on dark worlds, making more of themselves, planting a flag, moving on. Getting there first, so that when people follow, home is already waiting.

@bg bg_space fade
@sprite lux radiant right

You: Did we get it right?

Lux: You didn't hand it to the fastest builder. You didn't hand it to three men in a tower. You slowed down enough to still be holding the brakes when it mattered, and you kept enough hands on the wheel that no single hand could turn it.

Lux: That was the whole plan. Not to win the race. To make sure the race was never the thing that decided everyone's future.

Lux: It was a near thing. It was imperfect. You did it more or less in the nick of time, which is, historically, the only way your species does anything.

@voiceover over

This was Plan A.

Not a prediction. A recommendation, played all the way out, to see whether a good ending could even be written down.

It can. That was the point of writing it.

The people who wrote it never promised it would work. Their own best guess put the odds of a future this good near two in five.

Two in five was the highest number on the table. Every other plan scored worse.

So this was never the safe choice. It was the least unsafe one anyone could find, taken while there was still time to take it.

Whether anyone chooses it is still, as it was in 2029, up to the people in the room.

@voiceover off
@bg bg_dawn fade
@clear

@note ---- end-of-chapter dashboard (ch14, 2045; qualitative values) ----
@dashboard
year: 2045
employment: post-work
dividend: galaxy-share
safety: vast
workforce: superintelligent
compute: cosmic
gdp: explosive
capability: 100
trajectory: Life after ASI
@enddashboard

@overlay ending
> PLAN A: VERIFIED SLOWDOWN
> Humanity delayed superintelligence until it could
> be trusted, kept the deciding widely shared,
> and reached the far side together.
> Thank you for playing.
@overlay end

@jump ending_return
