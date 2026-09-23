import type { DomainId } from "./types";

export interface DomainPlaybook {
  id: DomainId;
  label: string;
  blurb: string;
  /** The irreducible unit of value in this domain. Used by the first-principles pass. */
  atom: string;
  /** What actually moves the needle, ranked by leverage. */
  levers: string[];
  /** Where projects in this domain reliably stall. */
  bottlenecks: { risk: string; mitigation: string }[];
  /** The layers of the strategic map. */
  layers: { name: string; question: string }[];
  /** Concrete first-week-of-work moves. */
  openingMoves: string[];
  /** Leading indicators, not vanity numbers. */
  leadingMetrics: string[];
  laggingMetrics: string[];
  /** Tooling that is genuinely load-bearing, not a listicle. */
  tools: { name: string; why: string }[];
  /** Mental models worth applying here. */
  frameworks: { name: string; why: string }[];
  /** Non-obvious angles the walkthrough should surface. */
  alternatives: string[];
  /** Questions that most often unblock a vague brief in this domain. */
  probes: string[];
}

export const DOMAINS: Record<DomainId, DomainPlaybook> = {
  software: {
    id: "software",
    label: "Software & Product",
    blurb: "Shipping a system users touch.",
    atom: "one user completing one job end to end",
    levers: [
      "Cut scope to a single complete path instead of five half-paths",
      "Put a working artifact in a real user's hands before week two of building",
      "Remove one dependency rather than adding one abstraction",
      "Instrument the funnel before optimizing any part of it",
      "Automate the thing you repeat manually three times",
    ],
    bottlenecks: [
      {
        risk: "Scope creep disguised as 'we'll need it anyway'",
        mitigation:
          "Write the v1 cut-list before writing code; anything not on the critical path becomes a `/later` file, not a branch.",
      },
      {
        risk: "Building on an unvalidated assumption about user behaviour",
        mitigation:
          "Name the single riskiest assumption and design the cheapest test that could falsify it this week.",
      },
      {
        risk: "Integration and auth work discovered late",
        mitigation:
          "Spike every third-party boundary on day one with a throwaway script; unknowns cost more when they surface at the end.",
      },
      {
        risk: "No feedback loop, so quality is judged by the author",
        mitigation:
          "Set up error tracking plus one analytics event per critical step before launch, not after.",
      },
    ],
    layers: [
      { name: "User & Job", question: "Who is it for and what job do they hire it to do?" },
      { name: "Core Loop", question: "What is the repeatable action that creates value each time?" },
      { name: "Surface", question: "What is the minimum interface that supports that loop?" },
      { name: "Data & State", question: "What must persist, and what can be derived?" },
      { name: "Distribution", question: "How does a stranger find and start using this?" },
    ],
    openingMoves: [
      "Write the README for the finished product before the first commit",
      "Draw the single happy path as a sequence of screens or calls",
      "Stub every external dependency with a fake so the loop runs offline",
      "Ship the ugly-but-working version to one real user",
    ],
    leadingMetrics: [
      "Time from idea to first usable artifact",
      "Number of real users who completed the core loop unaided",
      "Share of sessions that hit an error or dead end",
    ],
    laggingMetrics: ["Week-4 retention", "Activation rate", "Support load per active user"],
    tools: [
      { name: "Next.js + TypeScript", why: "One repo for UI and API; types catch the refactors you will do." },
      { name: "shadcn/ui + Tailwind", why: "Accessible primitives you own, so design debt stays local." },
      { name: "Playwright", why: "One end-to-end test on the happy path is worth twenty unit tests early." },
      { name: "Sentry or equivalent", why: "You cannot fix what you never see; silent failures are the real killer." },
      { name: "Cursor Cloud Agents", why: "Parallelize the mechanical slices while you hold the architecture." },
    ],
    frameworks: [
      { name: "Jobs To Be Done", why: "Forces the brief to name a situation, not a persona." },
      { name: "Walking Skeleton", why: "Thin end-to-end slice first; thickness is cheap, connectivity is not." },
      { name: "RFC-before-code", why: "A one-page design doc surfaces disagreement while it is still free." },
    ],
    alternatives: [
      "Replace the build with a no-code assembly to test demand first",
      "Sell or pre-sell the outcome manually before automating it",
      "Narrow to a single opinionated workflow instead of a configurable platform",
    ],
    probes: [
      "Who is the first real user, by name, and what do they do today instead?",
      "What is the one screen or command that, if it worked, would make this obviously valuable?",
      "What are you explicitly choosing not to build in v1?",
    ],
  },

  business: {
    id: "business",
    label: "Business & Strategy",
    blurb: "Creating and capturing value in a market.",
    atom: "one customer paying for one outcome",
    levers: [
      "Talk to ten buyers before building anything sellable",
      "Raise price before raising volume; pricing is the fastest untested lever",
      "Find the channel that already has your buyers rather than building an audience",
      "Fix the leakiest step in the funnel, not the most interesting one",
      "Make the offer concrete enough that a stranger can say yes in one sentence",
    ],
    bottlenecks: [
      {
        risk: "Building demand assumptions from your own enthusiasm",
        mitigation:
          "Require evidence of pull: a waitlist deposit, a signed LOI, or a paid pilot before committing resources.",
      },
      {
        risk: "Undifferentiated offer in a crowded category",
        mitigation:
          "Write the one sentence a customer would use to explain why they chose you over the obvious alternative. If it is generic, the offer is the problem.",
      },
      {
        risk: "Channel dependence on a single platform",
        mitigation: "Own an email list or direct relationship from day one, whatever the acquisition channel.",
      },
      {
        risk: "Cash-out before product-market fit",
        mitigation:
          "Model runway against the slowest plausible sales cycle, not the expected one; pre-decide the pivot trigger.",
      },
    ],
    layers: [
      { name: "Buyer & Pain", question: "Who has this pain badly enough to pay today?" },
      { name: "Offer", question: "What exact outcome is promised, at what price, with what proof?" },
      { name: "Channel", question: "Where do these buyers already gather, and who has their attention?" },
      { name: "Economics", question: "What does it cost to acquire and serve one customer?" },
      { name: "Moat", question: "What compounds over time and gets harder to copy?" },
    ],
    openingMoves: [
      "List 25 named prospects who fit the pain, not a market-size estimate",
      "Write the offer as a one-page sales page and show it to five of them",
      "Price it and ask for money; a soft yes is a no",
      "Run the unit economics on the back of an envelope before the spreadsheet",
    ],
    leadingMetrics: [
      "Qualified conversations per week",
      "Conversion from conversation to paid pilot",
      "Time from first contact to first payment",
    ],
    laggingMetrics: ["Revenue per customer", "Gross margin", "Logo and revenue retention"],
    tools: [
      { name: "A named-prospect CRM (even a spreadsheet)", why: "Pipeline discipline beats pipeline software." },
      { name: "Stripe Payment Links", why: "Fastest path from 'interesting' to a real transaction." },
      { name: "Customer interview script", why: "Keeps you asking about past behaviour instead of future intent." },
      { name: "Financial model, one tab", why: "If the model needs a second tab this early, the business is too complex." },
    ],
    frameworks: [
      { name: "The Mom Test", why: "Removes the false positives that kill early-stage judgement." },
      { name: "Value Equation (dream outcome / effort × time × risk)", why: "Diagnoses why an offer is not converting." },
      { name: "Bullseye framework", why: "Systematically tests channels instead of defaulting to the loudest one." },
    ],
    alternatives: [
      "Sell the service manually first and productize only what repeats",
      "License or partner into an existing distribution instead of building your own",
      "Target a narrower, wealthier segment at 5× the price and a tenth of the volume",
    ],
    probes: [
      "Who has already paid money for a worse version of this?",
      "What does the buyer do today, and what does that cost them?",
      "What would have to be true for this to be a bad idea?",
    ],
  },

  content: {
    id: "content",
    label: "Content & Audience",
    blurb: "Earning attention and converting it into trust.",
    atom: "one person finishing one piece and wanting the next",
    levers: [
      "Publish on a fixed cadence you can sustain at your worst week, not your best",
      "Make the first three seconds carry the promise; everything else is downstream",
      "Reuse one strong idea across formats instead of chasing new ideas",
      "Build a direct channel (email) so the algorithm is an input, not a dependency",
      "Study your top 3 performers and make more of that, deliberately",
    ],
    bottlenecks: [
      {
        risk: "Cadence collapse after the initial burst",
        mitigation: "Batch production and hold a two-piece buffer; treat the buffer as the real deliverable.",
      },
      {
        risk: "Breadth without a recognizable point of view",
        mitigation: "Pick one sentence you are willing to repeat for a year and make everything an argument for it.",
      },
      {
        risk: "Optimizing for reach that never converts",
        mitigation: "Define the one action a reader should take and measure that, not impressions.",
      },
      {
        risk: "Platform dependence",
        mitigation: "Every piece should have an owned-channel call to action from day one.",
      },
    ],
    layers: [
      { name: "Audience", question: "Whose problem are you narrating, and what do they already believe?" },
      { name: "Point of View", question: "What do you claim that a competent peer would argue with?" },
      { name: "Format & Cadence", question: "What can you produce repeatably at quality?" },
      { name: "Distribution", question: "Where does discovery actually happen for this audience?" },
      { name: "Conversion", question: "What is the next step for someone who trusts you now?" },
    ],
    openingMoves: [
      "Write down 20 headlines; keep the 3 that make you slightly nervous",
      "Ship one piece this week at 70% polish rather than one at 100% next month",
      "Set up the email capture before the traffic arrives",
      "Define the single recurring theme for the next 10 pieces",
    ],
    leadingMetrics: [
      "Pieces shipped per month versus the committed cadence",
      "Completion or watch-through rate",
      "Subscriber conversion per 1,000 views",
    ],
    laggingMetrics: ["Owned audience size", "Inbound opportunities per month", "Revenue attributable to content"],
    tools: [
      { name: "A swipe file", why: "Ideas compound only if they are captured where you will actually look." },
      { name: "Email platform with a simple capture form", why: "Owned distribution is the only durable asset here." },
      { name: "Editorial calendar, one page", why: "Cadence is a systems problem, not a motivation problem." },
      { name: "Analytics with one conversion event", why: "Keeps attention honest about what content is for." },
    ],
    frameworks: [
      { name: "Hook / Retain / Reward", why: "Structures any piece around the viewer's decision points." },
      { name: "One idea per piece", why: "Shareability collapses when a piece has three theses." },
      { name: "Content-market fit loop", why: "Double down on outliers instead of averaging across everything." },
    ],
    alternatives: [
      "Go deep on one platform for 90 days instead of shallow on four",
      "Collaborate into an existing audience rather than building cold",
      "Turn the best-performing piece into a product instead of making more pieces",
    ],
    probes: [
      "What do you believe about this topic that most people in it get wrong?",
      "What cadence can you hold during your busiest month?",
      "What should a reader do after they trust you?",
    ],
  },

  research: {
    id: "research",
    label: "Research & Analysis",
    blurb: "Converting uncertainty into defensible conclusions.",
    atom: "one question answered with evidence you would defend publicly",
    levers: [
      "Write the question precisely enough that a wrong answer is recognizable",
      "Define what evidence would change your mind before gathering any",
      "Find the existing survey or dataset before generating your own",
      "Separate observation from inference explicitly in every note",
      "Timebox the search; breadth has sharply diminishing returns after the first strong sources",
    ],
    bottlenecks: [
      {
        risk: "Question drift — the answer no longer matches the question asked",
        mitigation: "Pin the question at the top of the working doc and re-read it before each session.",
      },
      {
        risk: "Confirmation bias in source selection",
        mitigation: "Mandate a steelman: find the strongest source that contradicts the emerging conclusion.",
      },
      {
        risk: "Infinite collection, no synthesis",
        mitigation: "Write the one-paragraph answer after every three sources, even when it is wrong.",
      },
      {
        risk: "Unmarked confidence levels",
        mitigation: "Tag every claim as established, contested, or speculative; never let them blur.",
      },
    ],
    layers: [
      { name: "Question", question: "What exactly is being asked, and who needs the answer?" },
      { name: "Decision", question: "What action changes depending on the answer?" },
      { name: "Evidence Base", question: "What sources exist, and how good are they?" },
      { name: "Synthesis", question: "What is the claim, and what is the strongest counter-claim?" },
      { name: "Communication", question: "What format makes this usable for the decision-maker?" },
    ],
    openingMoves: [
      "State the question in one sentence and the decision it informs in a second",
      "List what you would expect to see if the answer were yes, and if it were no",
      "Find three highest-quality sources before reading broadly",
      "Draft the conclusion early and treat it as a hypothesis to attack",
    ],
    leadingMetrics: [
      "Number of claims with a named source versus unsourced assertions",
      "Counter-evidence actively sought per conclusion",
      "Time to first defensible draft answer",
    ],
    laggingMetrics: [
      "Decisions changed by the research",
      "Conclusions that survived external review",
      "Reuse of the output by others",
    ],
    tools: [
      { name: "A single working document", why: "Fragmented notes are where synthesis goes to die." },
      { name: "Citation capture at read time", why: "Reconstructing sources later costs more than capturing them now." },
      { name: "Deep-research modes in frontier models", why: "Good at breadth-first sweeps; still requires your verification." },
      { name: "Confidence tagging convention", why: "Makes the honest uncertainty visible to the reader." },
    ],
    frameworks: [
      { name: "Steelman before conclusion", why: "The fastest way to find the flaw in your own reasoning." },
      { name: "Fermi decomposition", why: "Gets a defensible order of magnitude when precise data does not exist." },
      { name: "Claim / Evidence / Confidence", why: "Structures output so a reader can audit it." },
    ],
    alternatives: [
      "Interview two practitioners instead of reading twenty articles",
      "Run a small experiment that generates primary data faster than the literature search",
      "Answer a narrower question decisively rather than a broad one vaguely",
    ],
    probes: [
      "What decision does this research inform, and who makes it?",
      "What evidence would change your mind?",
      "What is your current best guess, stated with confidence levels?",
    ],
  },

  creative: {
    id: "creative",
    label: "Creative & Craft",
    blurb: "Making something that lands emotionally.",
    atom: "one moment that makes one person feel something specific",
    levers: [
      "Name the intended feeling before choosing the form",
      "Produce volume in the ugly phase; judge later, never simultaneously",
      "Cut the 20% that is merely competent to let the rest breathe",
      "Get one honest reaction from a stranger before polishing",
      "Steal structure from a form you admire and change the content",
    ],
    bottlenecks: [
      {
        risk: "Premature editing kills generation",
        mitigation: "Physically separate the make session from the judge session; different days if possible.",
      },
      {
        risk: "Feedback from people invested in your feelings",
        mitigation: "Seek reactions from the target audience, and ask what they felt rather than what they think.",
      },
      {
        risk: "Perfectionism preventing release",
        mitigation: "Set a ship date first and let quality be the variable within a floor you define now.",
      },
      {
        risk: "Derivative output from a shallow reference pool",
        mitigation: "Widen inputs outside the genre; cross-domain reference is where originality comes from.",
      },
    ],
    layers: [
      { name: "Intent", question: "What should someone feel, and when exactly?" },
      { name: "Form", question: "What medium and structure carries that feeling best?" },
      { name: "Craft", question: "What technical skill gates the current quality ceiling?" },
      { name: "Iteration", question: "How do you get honest signal without losing your voice?" },
      { name: "Release", question: "Who sees it, in what context, and what happens next?" },
    ],
    openingMoves: [
      "Write the one-line intent and pin it where you work",
      "Make three rough versions before judging any of them",
      "Find two references you would be proud to be compared to",
      "Set the ship date now",
    ],
    leadingMetrics: [
      "Volume produced in the generation phase",
      "Honest reactions collected from target audience",
      "Cycles from rough to shipped",
    ],
    laggingMetrics: ["Unprompted sharing", "Work that outlives its launch week", "Invitations the work generates"],
    tools: [
      { name: "A capture system for fragments", why: "Most good work starts as a note you almost lost." },
      { name: "Reference board", why: "Taste is trainable; it needs a visible corpus." },
      { name: "A ship-date calendar entry", why: "Constraint is the most reliable creative input." },
    ],
    frameworks: [
      { name: "Generate / Judge separation", why: "The two modes actively damage each other when mixed." },
      { name: "Kill your darlings", why: "The parts you are proudest of are often the ones serving you, not the audience." },
      { name: "Constraint-first design", why: "Limits produce originality more reliably than freedom does." },
    ],
    alternatives: [
      "Ship a small complete piece instead of a large unfinished one",
      "Collaborate with someone whose weakness is your strength",
      "Change the medium entirely and see what survives the translation",
    ],
    probes: [
      "What should someone feel in the first ten seconds?",
      "What are you afraid to include, and why is that the interesting part?",
      "What is the smallest complete version of this?",
    ],
  },

  personal: {
    id: "personal",
    label: "Personal Systems & Skill",
    blurb: "Changing what you reliably do.",
    atom: "one repetition you can perform on a bad day",
    levers: [
      "Shrink the unit until failure is implausible, then let consistency compound",
      "Design the environment instead of relying on intention",
      "Attach the new behaviour to an existing anchor in your day",
      "Track the streak, not the outcome, for the first month",
      "Make the feedback loop shorter than your motivation half-life",
    ],
    bottlenecks: [
      {
        risk: "Ambition set for your best day, not your median one",
        mitigation: "Define a minimum viable version that takes under five minutes and counts as a success.",
      },
      {
        risk: "No trigger, so the behaviour depends on remembering",
        mitigation: "Bind it to a stable existing cue: after coffee, before the first meeting, on closing the laptop.",
      },
      {
        risk: "All-or-nothing collapse after one miss",
        mitigation: "Adopt the never-miss-twice rule and pre-write the recovery action.",
      },
      {
        risk: "Invisible progress",
        mitigation: "Keep one visible artifact — a log, a chart, a growing file — that proves the work happened.",
      },
    ],
    layers: [
      { name: "Outcome", question: "What would be observably different in 90 days?" },
      { name: "Behaviour", question: "What specific repeatable action produces that?" },
      { name: "Trigger & Environment", question: "What cue starts it, and what friction is in the way?" },
      { name: "Feedback", question: "How will you know it is working before results arrive?" },
      { name: "Identity", question: "Who does this make you, and does that story hold on a bad week?" },
    ],
    openingMoves: [
      "Define the five-minute version that counts as a win",
      "Remove one piece of friction physically, today",
      "Pick the anchor cue and write it down",
      "Start the log before you start the habit",
    ],
    leadingMetrics: [
      "Adherence rate against the minimum version",
      "Longest current streak",
      "Friction points removed",
    ],
    laggingMetrics: ["Observable skill or outcome change at 90 days", "Effort required per repetition", "Relapse recovery time"],
    tools: [
      { name: "A single visible log", why: "The record is the motivation once novelty fades." },
      { name: "Calendar block treated as an appointment", why: "Unscheduled intentions lose to scheduled ones." },
      { name: "Environment edits over apps", why: "Most habit apps solve tracking when the real problem is friction." },
    ],
    frameworks: [
      { name: "Tiny Habits", why: "Reduces the activation energy below the threshold where willpower matters." },
      { name: "Implementation intentions", why: "'When X, I will Y' roughly doubles follow-through in the literature." },
      { name: "Never miss twice", why: "Makes the system robust to the inevitable miss." },
    ],
    alternatives: [
      "Buy the outcome or hire the accountability instead of building the discipline",
      "Change the environment so the old behaviour becomes inconvenient",
      "Commit publicly with a real stake attached",
    ],
    probes: [
      "What does this look like on your worst realistic day?",
      "What have you already tried, and at what point did it break?",
      "What would make it embarrassing to skip?",
    ],
  },
};

export const DOMAIN_LIST = Object.values(DOMAINS);

const DOMAIN_SIGNALS: { domain: DomainId; words: string[] }[] = [
  {
    domain: "software",
    words: [
      "app","api","code","software","platform","saas","website","web","build","ship","deploy","feature",
      "product","dashboard","bug","database","frontend","backend","mobile","tool","automation","agent",
      "integration","developer","repo","launch a product","prototype","mvp","ui","ux",
    ],
  },
  {
    domain: "business",
    words: [
      "business","revenue","customers","clients","pricing","sell","sales","market","startup","company",
      "profit","monetize","funding","investors","growth","b2b","b2c","agency","consulting","offer",
      "margin","churn","pipeline","gtm","go-to-market","hire","hiring",
    ],
  },
  {
    domain: "content",
    words: [
      "content","audience","newsletter","youtube","blog","podcast","twitter","x","linkedin","tiktok",
      "instagram","followers","subscribers","post","video","write","publish","brand","social","seo",
      "views","engagement","creator",
    ],
  },
  {
    domain: "research",
    words: [
      "research","analyze","analysis","study","investigate","compare","evaluate","data","evidence",
      "literature","survey","report","findings","benchmark","due diligence","understand","learn about",
      "explore the","whitepaper","thesis",
    ],
  },
  {
    domain: "creative",
    words: [
      "novel","story","song","album","film","screenplay","art","design","painting","game design","poem",
      "write a book","creative","narrative","aesthetic","illustration","photography","music","character",
    ],
  },
  {
    domain: "personal",
    words: [
      "habit","routine","discipline","learn","skill","fitness","health","sleep","productivity","focus",
      "career","myself","my life","daily","practice","morning","gym","language","study","procrastination",
      "time management",
    ],
  },
];

export function detectDomain(text: string): DomainId {
  const haystack = ` ${text.toLowerCase()} `;
  let best: DomainId = "business";
  let bestScore = 0;

  for (const { domain, words } of DOMAIN_SIGNALS) {
    let score = 0;
    for (const word of words) {
      if (haystack.includes(` ${word} `) || haystack.includes(` ${word}s `) || haystack.includes(`${word} `)) {
        score += word.includes(" ") ? 2 : 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }

  return bestScore === 0 ? "business" : best;
}
