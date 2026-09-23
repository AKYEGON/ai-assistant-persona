import { MASTER_PERSONA, TARGET_DIRECTIVES } from "./persona";
import type { ModelTarget } from "./types";

export type TaskType = "code" | "research" | "writing" | "analysis" | "planning" | "creative";

export type OutputFormat = "auto" | "markdown" | "prose" | "bullets" | "json" | "table" | "code";

export type Depth = "tight" | "standard" | "deep";

export interface ForgeOptions {
  target: ModelTarget;
  role: string;
  context: string;
  outputFormat: OutputFormat;
  depth: Depth;
  adversarial: boolean;
  includePersona: boolean;
}

export interface Diagnostic {
  id: string;
  label: string;
  present: boolean;
  note: string;
}

export interface ForgeResult {
  prompt: string;
  diagnostics: Diagnostic[];
  taskType: TaskType;
  scoreBefore: number;
  scoreAfter: number;
}

const TASK_SIGNALS: { type: TaskType; words: RegExp }[] = [
  { type: "code", words: /\b(code|function|bug|refactor|api|component|typescript|python|test|build|deploy|repo|script|implement|debug|sql|css)\b/i },
  { type: "research", words: /\b(research|find|sources|compare|evidence|study|investigate|survey|landscape|competitors|literature|benchmark)\b/i },
  { type: "writing", words: /\b(write|draft|essay|email|copy|post|article|newsletter|caption|headline|script|rewrite|edit)\b/i },
  { type: "analysis", words: /\b(analy[sz]e|evaluate|review|critique|assess|diagnose|why did|breakdown|interpret|data)\b/i },
  { type: "planning", words: /\b(plan|strategy|roadmap|steps|how (do|should) i|launch|organize|prioriti[sz]e|schedule|goal)\b/i },
  { type: "creative", words: /\b(story|idea|brainstorm|names?|concept|creative|imagine|character|world|slogan|brand)\b/i },
];

export function detectTaskType(text: string): TaskType {
  for (const { type, words } of TASK_SIGNALS) {
    if (words.test(text)) return type;
  }
  return "planning";
}

const ROLE_DEFAULTS: Record<TaskType, string> = {
  code: "a senior engineer who has shipped and maintained this kind of system in production",
  research: "a research analyst who is judged on whether your conclusions survive expert scrutiny",
  writing: "an editor with taste, who cuts anything that does not earn its place",
  analysis: "a strategist who finds the real cause rather than the first plausible one",
  planning: "an operator who has executed this kind of plan before and knows where it breaks",
  creative: "a creative director with strong taste and a bias toward the specific over the safe",
};

const QUALITY_BARS: Record<TaskType, string[]> = {
  code: [
    "Read before you write: do not invent APIs, file paths, or library behaviour.",
    "Handle the error and empty cases, not just the happy path.",
    "Explain any non-obvious trade-off in one line; skip narration of what the code plainly does.",
  ],
  research: [
    "Every non-obvious claim carries a source or an explicit confidence level.",
    "Include the strongest counter-evidence you can find, not just supporting material.",
    "Separate what is established from what is contested from what is your inference.",
  ],
  writing: [
    "No filler openings, no throat-clearing, no summary of what you are about to say.",
    "Concrete nouns and verbs. Cut adverbs and hedges.",
    "Every paragraph must earn the reader's next thirty seconds.",
  ],
  analysis: [
    "Distinguish correlation from causation explicitly.",
    "Give the second-best explanation as well as your primary one, and say why you prefer yours.",
    "Quantify where you can; flag clearly where you cannot.",
  ],
  planning: [
    "Every step must be something that can be started without another decision first.",
    "Order by dependency, not by calendar. Do not estimate days or weeks.",
    "Include explicit decision points with branch conditions.",
  ],
  creative: [
    "Specific beats safe. Give me the option you would defend, not the median of all options.",
    "Include at least one idea that makes you slightly uncomfortable.",
    "No lorem, no placeholders, no 'insert X here'.",
  ],
};

const FORMAT_CONTRACTS: Record<Exclude<OutputFormat, "auto">, string> = {
  markdown: "Markdown with `##` section headings. Bold the key insight in each section. No preamble before the first heading.",
  prose: "Flowing prose in complete sentences. No headings, no bullet lists. Maximum four paragraphs.",
  bullets: "Bullet points only. One idea per bullet, maximum two lines each. No introduction, no conclusion.",
  json: "A single valid JSON object and nothing else. No markdown fences, no commentary. Use null for unknown values rather than omitting keys.",
  table: "A markdown table. Keep cells to short factual fragments and put any explanation in one paragraph below the table.",
  code: "Code first, in a single fenced block with the language tag. Below it, at most five bullets covering assumptions and how to verify.",
};

const FORMAT_BY_TASK: Record<TaskType, Exclude<OutputFormat, "auto">> = {
  code: "code",
  research: "markdown",
  writing: "prose",
  analysis: "markdown",
  planning: "markdown",
  creative: "bullets",
};

const DEPTH_DIRECTIVE: Record<Depth, string> = {
  tight: "Keep it under 300 words. Ruthlessly compressed. If a section adds nothing, drop it.",
  standard: "Aim for 400-800 words. Complete but not padded.",
  deep: "Go deep. Cover edge cases, second-order effects, and the failure modes a first pass would miss. Length is not a constraint; relevance is.",
};

function has(text: string, pattern: RegExp): boolean {
  return pattern.test(text);
}

export function diagnose(raw: string): Diagnostic[] {
  const text = raw.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  return [
    {
      id: "role",
      label: "Role / expertise framing",
      present: has(text, /\b(you are|act as|as an? (expert|senior|professional)|role:)\b/i),
      note: "Without a role, the model answers from its average voice instead of its best one.",
    },
    {
      id: "context",
      label: "Situational context",
      present: wordCount > 25 || has(text, /\b(context|background|currently|my situation|i have|we have|given that)\b/i),
      note: "Context is what makes an answer yours rather than generic.",
    },
    {
      id: "task",
      label: "Single unambiguous task",
      present: has(text, /\b(write|build|create|analy[sz]e|compare|list|explain|design|plan|review|find|generate|rewrite|summari[sz]e)\b/i),
      note: "A prompt with two tasks gets two half-answers.",
    },
    {
      id: "constraints",
      label: "Constraints and exclusions",
      present: has(text, /\b(must|should not|don't|do not|avoid|without|only|no more than|at most|constraint|limit)\b/i),
      note: "Negative constraints steer output more efficiently than positive ones.",
    },
    {
      id: "format",
      label: "Output format contract",
      present: has(text, /\b(format|json|table|bullet|markdown|paragraph|list|words|sections?|headings?)\b/i),
      note: "Unspecified format means you get the model's default, which is usually too long.",
    },
    {
      id: "criteria",
      label: "Success criteria",
      present: has(text, /\b(good (answer|result)|success|criteria|i'll judge|make sure|quality|should feel|goal is)\b/i),
      note: "Telling the model how it will be judged raises the ceiling more than any other single addition.",
    },
    {
      id: "audience",
      label: "Audience or reader",
      present: has(text, /\b(for (my|a|an|the)|audience|reader|customer|team|beginner|expert|non-technical|stakeholder)\b/i),
      note: "Register, depth, and jargon level all follow from who is reading.",
    },
  ];
}

function sanitizeRole(role: string, taskType: TaskType): string {
  const trimmed = role.trim();
  if (!trimmed) return ROLE_DEFAULTS[taskType];
  return trimmed.replace(/^you are\s+/i, "").replace(/\.$/, "");
}

function normalizeTask(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "(no task provided)";
  return trimmed;
}

export function forge(raw: string, options: ForgeOptions): ForgeResult {
  const taskType = detectTaskType(`${raw} ${options.context}`);
  const diagnostics = diagnose(raw);
  const scoreBefore = Math.round((diagnostics.filter((d) => d.present).length / diagnostics.length) * 100);

  const role = sanitizeRole(options.role, taskType);
  const format =
    options.outputFormat === "auto" ? FORMAT_BY_TASK[taskType] : options.outputFormat;

  const missing = diagnostics.filter((d) => !d.present).map((d) => d.id);

  const constraints: string[] = [
    "Be specific to the context above. If a sentence would apply to any project, replace it with one that would not.",
    "State assumptions explicitly instead of filling gaps silently. If something is genuinely blocking, ask before proceeding.",
    ...QUALITY_BARS[taskType],
  ];

  if (missing.includes("criteria")) {
    constraints.push(
      "Before answering, state in one line what would make this answer excellent rather than merely adequate — then meet that bar.",
    );
  }

  if (options.adversarial) {
    constraints.push(
      "Adversarial pass: after your answer, add a short section titled 'Where this is weak' naming the strongest objection to your own output and what you would change if that objection holds.",
    );
  }

  constraints.push(...TARGET_DIRECTIVES[options.target]);

  const sections: string[] = [];

  if (options.includePersona) {
    sections.push(MASTER_PERSONA, "---", "");
  }

  sections.push(`# Role\nYou are ${role}.`);

  const contextBody = options.context.trim();
  sections.push(
    `# Context\n${
      contextBody ||
      "(Not provided. Ask me for the two pieces of context that would most change your answer before going deep, then proceed with clearly labelled assumptions.)"
    }`,
  );

  sections.push(`# Task\n${normalizeTask(raw)}`);

  sections.push(
    `# Constraints\n${constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")}`,
  );

  sections.push(`# Output format\n${FORMAT_CONTRACTS[format]}\n\n${DEPTH_DIRECTIVE[options.depth]}`);

  sections.push(
    `# Finally\nEnd with one line titled "Sharper prompt" suggesting the single change to this prompt that would have produced a better answer.`,
  );

  return {
    prompt: sections.join("\n\n"),
    diagnostics,
    taskType,
    scoreBefore,
    scoreAfter: Math.min(100, 88 + (options.adversarial ? 6 : 0) + (contextBody ? 6 : 0)),
  };
}
