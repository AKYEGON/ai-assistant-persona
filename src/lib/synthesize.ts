import { DOMAINS, detectDomain, type DomainPlaybook } from "./domains";
import type { Block, Brief, DomainId, Section, Stance, Walkthrough } from "./types";

const LEAD_INS = [
  "i want to", "i'd like to", "i would like to", "i am trying to", "i'm trying to", "i need to",
  "i plan to", "my plan is to", "help me", "i'm working on", "i am working on", "we want to",
  "we're trying to", "we are trying to", "my goal is to", "the goal is to", "i'm thinking about",
  "i am thinking about", "how do i", "how can i", "i should",
];

const ACTION_VERBS = [
  "build", "launch", "ship", "create", "start", "grow", "scale", "learn", "write", "design",
  "research", "analyze", "fix", "improve", "automate", "hire", "raise", "sell", "publish",
  "make", "plan", "decide", "validate", "rebuild", "migrate", "refactor",
];

export interface Extraction {
  subject: string;
  verb: string;
  domain: DomainId;
  signals: {
    audience: boolean;
    metric: boolean;
    horizon: boolean;
    budget: boolean;
    priorArt: boolean;
    constraint: boolean;
    done: boolean;
  };
}

function clean(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function stripTrailingPunctuation(text: string): string {
  return text.replace(/[.!?,;:]+$/, "").trim();
}

export function extractSubject(goal: string): string {
  let working = clean(goal).toLowerCase();

  for (const lead of LEAD_INS) {
    if (working.startsWith(`${lead} `)) {
      working = working.slice(lead.length + 1);
      break;
    }
  }

  const firstSentence = working.split(/[.!?\n]/)[0] ?? working;
  working = clean(firstSentence);

  const words = working.split(" ");
  if (words.length > 0 && ACTION_VERBS.includes(words[0])) {
    working = words.slice(1).join(" ");
  }
  working = working.replace(/^(a|an|the|my|our)\s+/, "");

  const result = stripTrailingPunctuation(working);
  if (!result) return "this goal";
  const trimmed = result.split(" ").slice(0, 12).join(" ");
  return trimmed;
}

export function extractVerb(goal: string): string {
  const lower = clean(goal).toLowerCase();
  for (const verb of ACTION_VERBS) {
    if (new RegExp(`\\b${verb}\\b`).test(lower)) return verb;
  }
  return "deliver";
}

const METRIC_PATTERN = /\b(\d+%|\$\s?\d|\d+\s?(k|m|users|customers|subscribers|clients|sales|hours|words|pounds|kg)|revenue|mrr|arr|conversion|retention|target|kpi|metric)\b/i;
const HORIZON_PATTERN = /\b(day|days|week|weeks|month|months|quarter|year|years|deadline|by (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|q[1-4]|asap|end of)\b/i;
const BUDGET_PATTERN = /\b(budget|\$|cost|spend|free|cheap|bootstrap|funded|capital|afford|price)\b/i;
const AUDIENCE_PATTERN = /\b(for|audience|users|customers|clients|readers|developers|founders|students|teams|buyers|people who|aimed at|target)\b/i;
const PRIOR_ART_PATTERN = /\b(tried|already|currently|so far|previously|existing|today we|right now|before)\b/i;

export function extract(brief: Brief): Extraction {
  const all = `${brief.goal}\n${brief.context}\n${brief.constraints}\n${brief.definitionOfDone}`;
  const domain = brief.domain === "auto" ? detectDomain(all) : brief.domain;

  return {
    subject: extractSubject(brief.goal),
    verb: extractVerb(brief.goal),
    domain,
    signals: {
      audience: AUDIENCE_PATTERN.test(all),
      metric: METRIC_PATTERN.test(all),
      horizon: HORIZON_PATTERN.test(all),
      budget: BUDGET_PATTERN.test(all),
      priorArt: PRIOR_ART_PATTERN.test(brief.context) || clean(brief.context).length > 40,
      constraint: clean(brief.constraints).length > 10,
      done: clean(brief.definitionOfDone).length > 10,
    },
  };
}

function sentenceCase(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function buildContextBlock(brief: Brief, ex: Extraction): string {
  const lines = [
    `GOAL: ${clean(brief.goal) || "(not stated)"}`,
    `DOMAIN: ${DOMAINS[ex.domain].label}`,
    `CURRENT SITUATION: ${clean(brief.context) || "(not stated — ask before assuming)"}`,
    `CONSTRAINTS: ${clean(brief.constraints) || "(not stated — ask before assuming)"}`,
    `DEFINITION OF DONE: ${clean(brief.definitionOfDone) || "(not stated — propose one)"}`,
  ];
  return lines.join("\n");
}

const STANCE_DIRECTIVE: Record<Stance, string> = {
  challenge:
    "Be adversarial with my assumptions. Your default is to look for the reason this fails. Say plainly when a premise is weak and name the better path.",
  expand:
    "Prioritize option generation. Give me angles I have not considered, including at least one that reframes the goal itself.",
  execute:
    "Prioritize immediate executability. Skip theory. Everything you produce should be something I can act on without further interpretation.",
};

function promptFor(sectionTitle: string, instruction: string, brief: Brief, ex: Extraction): string {
  return [
    "You are an elite strategic collaborator: prompt engineer, deep researcher, and systems thinker.",
    STANCE_DIRECTIVE[brief.stance],
    "",
    "## Context",
    buildContextBlock(brief, ex),
    "",
    `## Task — ${sectionTitle}`,
    instruction,
    "",
    "## Rules",
    "- Be specific to my context. If a line would apply to any project, delete it and write a better one.",
    "- State assumptions explicitly where information is missing. Never silently invent facts.",
    "- Mark each non-obvious claim as established, contested, or speculative.",
    "- Lead with the answer. No preamble, no summary of what you are about to do.",
  ].join("\n");
}

function pick<T>(items: T[], count: number): T[] {
  return items.slice(0, count);
}

/* ------------------------------------------------------------------ */
/* Section builders                                                    */
/* ------------------------------------------------------------------ */

function clarifySection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const questions: string[] = [];
  const { signals, subject } = ex;

  if (!signals.done) {
    questions.push(
      `What does "done" look like for ${subject}? Describe the state of the world the day after it succeeds.`,
    );
  }
  if (!signals.metric) {
    questions.push(
      `What single number, if it moved, would prove this worked? Name the metric and the target value.`,
    );
  }
  if (!signals.horizon) {
    questions.push(
      `What is the real deadline, and is it externally imposed or self-set? The answer changes how aggressively we cut scope.`,
    );
  }
  if (!signals.audience) {
    questions.push(
      `Who specifically is this for? Name one real person or account that fits, not a segment.`,
    );
  }
  if (!signals.constraint) {
    questions.push(
      `What are the hard constraints — time per week, money, skills you do not have, things you will not do?`,
    );
  }
  if (!signals.priorArt) {
    questions.push(
      `What have you already tried, and at exactly what point did it stop working? The failure point is more informative than the attempt.`,
    );
  }

  for (const probe of play.probes) {
    if (questions.length >= 6) break;
    questions.push(probe);
  }

  const ranked = pick(questions, 6);

  const blocks: Block[] = [
    {
      kind: "callout",
      tone: "insight",
      text:
        ranked.length >= 5
          ? "Your brief is currently under-specified in several load-bearing places. Answering the first two questions will change the plan more than anything else here."
          : "Your brief is reasonably well-specified. These are the remaining questions where a different answer would produce a materially different plan.",
    },
    {
      kind: "checks",
      heading: "Highest-leverage unknowns",
      items: ranked,
    },
    {
      kind: "prose",
      heading: "How to use this",
      text:
        "Answer these in the mission notes below, then regenerate. Every downstream section — especially the execution plan and the metrics — gets sharper as these close. Do not answer all six if two of them dominate; rank by 'which answer would change what I do on Monday'.",
    },
  ];

  return {
    id: "clarify",
    index: 1,
    title: "Clarifying Questions",
    purpose: "Close the gaps where a different answer produces a different plan.",
    blocks,
    modelPrompt: promptFor(
      "Clarifying Questions",
      [
        "Ask me the 5–7 highest-leverage questions about this goal. A high-leverage question is one where two different answers lead to two genuinely different plans.",
        "",
        "For each question, add one line explaining what changes depending on my answer.",
        "Order them by how much the answer would reshape the plan. Do not ask anything already answered in the context above.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function firstPrinciplesSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const { subject } = ex;

  const blocks: Block[] = [
    {
      kind: "prose",
      heading: "The irreducible unit",
      text: `Strip ${subject} down and the atom is **${play.atom}**. Everything else — tooling, branding, process, polish — is scaffolding around that atom. If the atom does not work at a scale of one, nothing built on top of it works at scale.`,
    },
    {
      kind: "pairs",
      heading: "Assumption audit",
      labelA: "You are assuming",
      labelB: "Cheapest falsification test",
      items: [
        {
          a: `That there is real demand or need for ${subject}, not just interest.`,
          b: "Find one person who will commit something scarce — money, time, a calendar slot — before you build.",
        },
        {
          a: "That you are the right person or team to execute this now.",
          b: "Name the one capability gap and decide: learn it, buy it, or cut the part that needs it.",
        },
        {
          a: "That the approach you have in mind is the shortest path.",
          b: "Write down the three-step version. If it exists, the ten-step version was ego or habit.",
        },
        {
          a: `That the current plan for ${subject} would still be right if your deadline halved.`,
          b: "Do the halving exercise on paper. Whatever survives is the actual plan.",
        },
      ],
    },
    {
      kind: "list",
      heading: "What is actually true versus inherited",
      items: [
        `Physics of the problem: ${play.atom} must happen repeatedly and cheaply. That is non-negotiable.`,
        "Convention you inherited: the standard sequence everyone in this space follows. Most of it is habit, not necessity.",
        "Your constraint set is the only real boundary. Treat everything else as a default you are free to reject.",
        "The gap between where you are and the atom working once is almost always smaller than it feels.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      text: `The most common failure in ${play.label.toLowerCase()} is optimizing the scaffolding before the atom works once. Check honestly which one you are currently doing.`,
    },
  ];

  return {
    id: "first-principles",
    index: 2,
    title: "First-Principles Breakdown",
    purpose: "Separate what is physically necessary from what you inherited by convention.",
    blocks,
    modelPrompt: promptFor(
      "First-Principles Breakdown",
      [
        "Decompose this goal to first principles.",
        "",
        "1. State the irreducible unit of value — the smallest thing that, if it works once, proves the concept.",
        "2. List every assumption embedded in my framing, separating what is physically or economically necessary from what is inherited convention.",
        "3. For each assumption, give the cheapest test that could falsify it.",
        "4. Identify which single assumption, if wrong, invalidates the most downstream work. Say so directly.",
        "",
        "End with the version of this goal that a smart outsider with no attachment to my framing would pursue instead.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function architectureSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const blocks: Block[] = [
    {
      kind: "prose",
      heading: "The map",
      text: `Five layers govern ${ex.subject}. Failures almost never originate in the layer where they become visible — they originate one or two layers up. Diagnose from the top.`,
    },
    {
      kind: "pairs",
      heading: "Layer stack",
      labelA: "Layer",
      labelB: "The question it must answer",
      items: play.layers.map((layer) => ({ a: layer.name, b: layer.question })),
    },
    {
      kind: "list",
      heading: "Leverage ranking — where effort converts best",
      items: play.levers,
    },
    {
      kind: "callout",
      tone: "insight",
      text: `Pick exactly one layer as the bottleneck for the next cycle. Work spread evenly across five layers produces five partial systems and zero working ones.`,
    },
  ];

  return {
    id: "architecture",
    index: 3,
    title: "Strategic Architecture",
    purpose: "See the whole system before touching any part of it.",
    blocks,
    modelPrompt: promptFor(
      "Strategic Architecture",
      [
        "Map this goal as a system before any tactics.",
        "",
        "1. Identify the 4–6 layers or components that determine whether this succeeds, and what question each must answer.",
        "2. Show the dependencies — which layers gate which others.",
        "3. Rank the layers by leverage: where does a unit of effort convert into the most progress right now?",
        "4. Name the single current bottleneck layer and justify it against the alternatives.",
        "",
        "Render the map as an indented text tree, then give the ranking as a numbered list. No diagrams.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function executionSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const { subject } = ex;

  const phaseOne = [
    `Write the one-sentence success definition for ${subject} and pin it where you work. Everything below is invalid if this sentence is fuzzy.`,
    ...play.openingMoves.slice(0, 2),
    "**Decision point:** if you cannot state success in one sentence, stop and close the clarifying questions first. Proceeding past a fuzzy definition is the single most expensive mistake available to you here.",
  ];

  const phaseTwo = [
    `Build the thinnest complete version: ${play.atom}, end to end, at embarrassing quality.`,
    ...play.openingMoves.slice(2),
    "Put it in front of one person outside your own head and watch what they do, not what they say.",
    "**Decision point:** did the atom work once, unaided? If yes, proceed to widening. If no, the problem is the atom itself — do not add scope on top of a broken core.",
  ];

  const phaseThree = [
    "Instrument the loop: pick one leading indicator from the metrics section and start recording it before you optimize anything.",
    "Fix only the step with the largest observed drop-off. Resist the urge to improve the part you find most interesting.",
    "Run three full cycles before judging the approach. One cycle is noise.",
    "**Decision point:** after three cycles, is the leading indicator trending? If flat, change the approach, not the effort level.",
  ];

  const phaseFour = [
    "Remove one thing. There is always one piece of scope, one tool, or one commitment that costs more than it returns.",
    "Write down what you learned that contradicts your original brief — this is the highest-value artifact of the whole cycle.",
    "Decide explicitly: double down, pivot the approach, or stop. Make it a stated decision with a date, not a drift.",
  ];

  const blocks: Block[] = [
    {
      kind: "ordered",
      heading: "Phase 1 — Define and de-risk",
      items: phaseOne,
    },
    { kind: "ordered", heading: "Phase 2 — Thin end-to-end slice", items: phaseTwo },
    { kind: "ordered", heading: "Phase 3 — Instrument and iterate", items: phaseThree },
    { kind: "ordered", heading: "Phase 4 — Prune and decide", items: phaseFour },
    {
      kind: "callout",
      tone: "warning",
      text:
        "Phases are sequential by dependency, not by calendar. Phase 2 cannot start honestly until Phase 1's success sentence exists, but Phase 1 is an afternoon, not a milestone.",
    },
  ];

  return {
    id: "execution",
    index: 4,
    title: "Step-by-Step Execution Plan",
    purpose: "A sequence with explicit decision points, not a wish list.",
    blocks,
    modelPrompt: promptFor(
      "Step-by-Step Execution Plan",
      [
        "Write the execution plan.",
        "",
        "- Organize it into 3–5 phases ordered by dependency, not by calendar time. Do not estimate days or weeks.",
        "- Within each phase, give numbered concrete actions. Each action must be something I could start without asking another question.",
        "- End each phase with an explicit decision point: the condition to check, and what to do for each answer (proceed / repeat / abandon).",
        "- Mark any step that can run in parallel with another.",
        "- Flag the one step most likely to be skipped under pressure and say what breaks if it is.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function risksSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const universal = [
    {
      risk: "The plan survives contact with reality but not with your calendar",
      mitigation:
        "Pre-commit the specific hours. An unscheduled plan is a preference, and preferences lose to whatever is urgent.",
    },
    {
      risk: "Silent scope growth: each addition is individually reasonable",
      mitigation:
        "Keep a visible cut-list. Every new idea goes on it by default; moving something off the list requires removing something else.",
    },
  ];

  const blocks: Block[] = [
    {
      kind: "pairs",
      heading: `Where ${play.label.toLowerCase()} projects actually stall`,
      labelA: "Risk / bottleneck",
      labelB: "Mitigation",
      items: [...play.bottlenecks, ...universal].map((entry) => ({
        a: entry.risk,
        b: entry.mitigation,
      })),
    },
    {
      kind: "list",
      heading: "Pre-mortem — it is 90 days out and this failed. Why?",
      items: [
        `The atom (${play.atom}) never worked cleanly, and you kept adding around it.`,
        "You optimized a metric that was easy to measure instead of the one that mattered.",
        "The feedback loop was longer than your motivation, so you were flying blind when enthusiasm ran out.",
        ex.signals.constraint
          ? "A stated constraint turned out to be harder than modelled and there was no slack anywhere in the plan."
          : "An unstated constraint — time, money, or a skill gap — surfaced late and there was no plan for it.",
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      text:
        "Rank these by probability × impact and mitigate the top two only. A plan that mitigates every risk is a plan that never ships.",
    },
  ];

  return {
    id: "risks",
    index: 5,
    title: "Key Risks, Bottlenecks & Mitigations",
    purpose: "Find the failure modes while they are still cheap.",
    blocks,
    modelPrompt: promptFor(
      "Key Risks, Bottlenecks & Mitigations",
      [
        "Run a rigorous risk pass.",
        "",
        "1. Pre-mortem: assume this has failed 90 days from now. Write the five most likely post-mortem causes, most probable first.",
        "2. For each, give a specific mitigation — an action, not a principle — and the early warning signal that tells me it is happening.",
        "3. Separate risks I control from risks I can only monitor.",
        "4. Name the single highest probability × impact risk and tell me what to do about it this week.",
        "",
        "Do not list generic risks. Every item must be traceable to something specific in my context.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function alternativesSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const blocks: Block[] = [
    {
      kind: "list",
      heading: "Reframes worth taking seriously",
      items: [
        ...play.alternatives,
        `Invert the goal: instead of asking how to ${ex.verb} ${ex.subject}, ask what would have to be true for it to be unnecessary. Sometimes the answer is the actual opportunity.`,
        "Ten-times test: what would this look like if it had to be ten times bigger? And a tenth the size? The second usually reveals the real plan.",
      ],
    },
    {
      kind: "pairs",
      heading: "Leverage multipliers",
      labelA: "Move",
      labelB: "Why it compounds",
      items: [
        {
          a: "Borrow an existing audience, codebase, or distribution instead of building one",
          b: "Removes the slowest input from the critical path — usually months of compounding you do not have to do.",
        },
        {
          a: "Make the output reusable: template it, document it, or turn the process into an asset",
          b: "Converts one-time effort into a stock that pays on every future cycle.",
        },
        {
          a: "Shorten the feedback loop by one order of magnitude",
          b: "Iteration speed dominates iteration quality over any horizon longer than a few cycles.",
        },
        {
          a: "Find the person who has already done this and buy an hour of their time",
          b: "Collapses weeks of search into one conversation; the highest ROI move available in almost every plan.",
        },
      ],
    },
    {
      kind: "callout",
      tone: "insight",
      text:
        brief.stance === "challenge"
          ? "Direct challenge: the conventional version of this plan is likely 3× more work than necessary. Before executing, spend one hour genuinely trying to kill the approach. If it survives, you will execute with far more conviction."
          : "Spend one hour on the reframes before committing. An hour here routinely saves weeks of well-executed work in the wrong direction.",
    },
  ];

  return {
    id: "alternatives",
    index: 6,
    title: "Creative Alternatives & High-Leverage Improvements",
    purpose: "Check you are solving the right problem before solving it well.",
    blocks,
    modelPrompt: promptFor(
      "Creative Alternatives & High-Leverage Improvements",
      [
        "Challenge the framing and generate better paths.",
        "",
        "1. Give me three genuinely different approaches to this goal — not variations, different strategies. For each: the core bet, what makes it better, and what it costs.",
        "2. Give me one reframe that questions whether the stated goal is the right goal at all.",
        "3. Identify the 2–3 highest-leverage improvements to my current plan — changes with disproportionate return relative to effort.",
        "4. Tell me what a world-class operator in this space would do that I am not doing.",
        "",
        "Be direct where my approach is weak. I want the better path, not encouragement.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function toolkitSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const blocks: Block[] = [
    {
      kind: "pairs",
      heading: "Load-bearing tools",
      labelA: "Tool",
      labelB: "Why it earns its place",
      items: play.tools.map((tool) => ({ a: tool.name, b: tool.why })),
    },
    {
      kind: "pairs",
      heading: "Frameworks that apply here",
      labelA: "Framework",
      labelB: "What it does for you",
      items: play.frameworks.map((framework) => ({ a: framework.name, b: framework.why })),
    },
    {
      kind: "list",
      heading: "Prompt moves for this work",
      items: [
        `Deep dive: "Act as a practitioner who has shipped ${ex.subject} three times. Walk me through what you would do differently on attempt four."`,
        `Adversarial: "Argue the strongest case that ${ex.subject} is a bad use of my time. Use my own stated constraints against me."`,
        `Compression: "Reduce my plan to the three steps that account for 80% of the outcome. Justify each cut."`,
        `Research: "Find the three best existing solutions to this. For each: what they do well, where they fail, and what gap that leaves."`,
      ],
    },
    {
      kind: "callout",
      tone: "warning",
      text:
        "Tool selection is the most common form of productive procrastination. Adopt at most two new tools per cycle; everything else waits until the current ones are genuinely limiting.",
    },
  ];

  return {
    id: "toolkit",
    index: 7,
    title: "Recommended Tools, Frameworks & Prompts",
    purpose: "The minimum viable toolkit, not a catalogue.",
    blocks,
    modelPrompt: promptFor(
      "Recommended Tools, Frameworks & Prompts",
      [
        "Recommend the minimum viable toolkit.",
        "",
        "1. Name at most five tools. For each: what it replaces, why it earns its place, and the switching cost. Exclude anything that is merely nice to have.",
        "2. Give me 2–4 mental models or frameworks that apply specifically here, with a one-line statement of what each one prevents me from getting wrong.",
        "3. Write three copy-ready prompts I can use with a frontier model at specific points in this plan. Make them full prompts with role, context, task, and output format — not one-liners.",
        "4. Point me to the highest-signal resource for this exact problem, and say why it beats the obvious popular answer.",
        "",
        "Flag anything where your knowledge may be out of date and I should verify.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function metricsSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const blocks: Block[] = [
    {
      kind: "list",
      heading: "Leading indicators — check these weekly",
      items: play.leadingMetrics,
    },
    {
      kind: "list",
      heading: "Lagging indicators — check these per cycle, not per week",
      items: play.laggingMetrics,
    },
    {
      kind: "pairs",
      heading: "Feedback loop design",
      labelA: "Loop",
      labelB: "Cadence and trigger",
      items: [
        { a: "Did the work happen?", b: "Weekly. Binary check against the committed actions. No analysis, just the fact." },
        { a: "Is the leading indicator moving?", b: "Weekly after cycle one. Three flat weeks is a signal to change approach, not effort." },
        { a: "Is the approach still right?", b: "Every cycle. Re-read the first-principles section and check whether its assumptions still hold." },
        { a: "What did I learn that contradicts the brief?", b: "Every cycle, written down. This is the compounding asset." },
      ],
    },
    {
      kind: "callout",
      tone: ex.signals.metric ? "insight" : "warning",
      text: ex.signals.metric
        ? "You named a metric in your brief — good. Verify it is a leading indicator you can influence this week, not a lagging one you can only watch."
        : "You have not named a target number. Pick one leading indicator above and commit to a value before the next cycle. Unmeasured plans drift toward whatever feels productive.",
    },
  ];

  return {
    id: "metrics",
    index: 8,
    title: "Success Metrics & Feedback Loops",
    purpose: "Know whether it is working before the results arrive.",
    blocks,
    modelPrompt: promptFor(
      "Success Metrics & Feedback Loops",
      [
        "Design the measurement system.",
        "",
        "1. Define the single north-star metric and why it beats the alternatives for this goal.",
        "2. Give 3–4 leading indicators that move before the north star does, with a realistic target for each.",
        "3. Name the vanity metrics I am most likely to be seduced by here, and what to watch instead.",
        "4. Design the feedback loops: what gets reviewed, at what cadence, and what specific threshold triggers a change of approach rather than more effort.",
        "",
        "Every metric must be something I can actually measure with the tools I have.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

function nextSection(brief: Brief, ex: Extraction, play: DomainPlaybook): Section {
  const { signals, subject } = ex;

  const actions: string[] = [];

  if (!signals.done || !signals.metric) {
    actions.push(
      `**Write the success sentence.** One sentence, in the notes below: "${sentenceCase(subject)} has worked when ______." Fifteen minutes. Everything downstream depends on it.`,
    );
  }
  actions.push(`**${play.openingMoves[0]}.** This is the cheapest possible start and it breaks inertia today.`);
  actions.push(
    `**Book the contact.** ${
      play.label === "Research & Analysis"
        ? "Find the three best existing sources and skim them before reading broadly."
        : "Identify one real person who will see the first version, and tell them it is coming."
    } An external commitment converts a plan into a deadline.`,
  );

  if (actions.length < 3) {
    actions.push(`**${play.openingMoves[1]}.**`);
  }

  const blocks: Block[] = [
    { kind: "checks", heading: "Do these now — in this order", items: pick(actions, 3) },
    {
      kind: "prose",
      heading: "The test",
      text:
        "If you do nothing else from this walkthrough, do the first item. The rest of the plan is worth exactly nothing until the success definition exists, and everything gets sharper the moment it does.",
    },
  ];

  return {
    id: "next",
    index: 9,
    title: "Next Immediate Actions",
    purpose: "The one to three things to do right now.",
    blocks,
    modelPrompt: promptFor(
      "Next Immediate Actions",
      [
        "Tell me exactly what to do next.",
        "",
        "Give me the 1–3 actions I should take right now, ordered. For each: what to do, roughly how long it takes, what it unblocks, and how I know it is done.",
        "Nothing aspirational. Nothing that requires a decision I have not yet made. If the correct next action is to answer one of your own clarifying questions, say that.",
      ].join("\n"),
      brief,
      ex,
    ),
  };
}

/* ------------------------------------------------------------------ */

export function synthesize(brief: Brief): Walkthrough {
  const ex = extract(brief);
  const play = DOMAINS[ex.domain];

  const sections: Section[] = [
    clarifySection(brief, ex, play),
    firstPrinciplesSection(brief, ex, play),
    architectureSection(brief, ex, play),
    executionSection(brief, ex, play),
    risksSection(brief, ex, play),
    alternativesSection(brief, ex, play),
    toolkitSection(brief, ex, play),
    metricsSection(brief, ex, play),
    nextSection(brief, ex, play),
  ];

  const gaps: string[] = [];
  if (!ex.signals.audience) gaps.push("No specific audience or beneficiary named.");
  if (!ex.signals.metric) gaps.push("No success metric or target number stated.");
  if (!ex.signals.horizon) gaps.push("No deadline or horizon given.");
  if (!ex.signals.constraint) gaps.push("Constraints unstated — plan assumes moderate time and no budget.");
  if (!ex.signals.priorArt) gaps.push("No prior attempts described, so nothing is ruled out by experience.");

  const assumptions = [
    `Classified as **${play.label}** — ${play.blurb} If that is wrong, override the domain and regenerate; it changes the levers, risks, and metrics.`,
    "Assumes you are resource-constrained and optimizing for learning speed over polish.",
    "Assumes no external mandate forces a specific sequence.",
    ex.signals.horizon
      ? "Assumes your stated horizon is real rather than aspirational."
      : "Assumes no hard deadline, so the plan optimizes for the shortest path to signal.",
  ];

  return {
    generatedAt: Date.now(),
    mode: "local",
    resolvedDomain: ex.domain,
    headline: sentenceCase(ex.subject),
    thesis: `The whole plan reduces to one question: can you make **${play.atom}** work once, quickly, and then repeat it? Sections 1–3 sharpen that question. Sections 4–6 answer it. Sections 7–9 keep you honest while you do.`,
    assumptions,
    gaps,
    sections,
  };
}

export function missionTitle(goal: string): string {
  const subject = extractSubject(goal);
  const title = sentenceCase(subject);
  return title.length > 60 ? `${title.slice(0, 57)}...` : title;
}
