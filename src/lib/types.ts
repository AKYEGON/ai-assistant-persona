export type ModelTarget = "cursor" | "claude" | "gpt" | "grok" | "generic";

export type DomainId =
  | "software"
  | "business"
  | "content"
  | "research"
  | "creative"
  | "personal";

export type Stance = "challenge" | "expand" | "execute";

export type SectionId =
  | "clarify"
  | "first-principles"
  | "architecture"
  | "execution"
  | "risks"
  | "alternatives"
  | "toolkit"
  | "metrics"
  | "next";

export interface Brief {
  goal: string;
  context: string;
  constraints: string;
  definitionOfDone: string;
  domain: DomainId | "auto";
  stance: Stance;
}

export interface Pair {
  a: string;
  b: string;
}

export type Block =
  | { kind: "prose"; heading?: string; text: string }
  | { kind: "list"; heading?: string; items: string[] }
  | { kind: "ordered"; heading?: string; items: string[] }
  | { kind: "checks"; heading?: string; items: string[] }
  | { kind: "pairs"; heading?: string; labelA: string; labelB: string; items: Pair[] }
  | { kind: "callout"; tone: "insight" | "warning"; text: string };

export interface Section {
  id: SectionId;
  index: number;
  title: string;
  purpose: string;
  blocks: Block[];
  modelPrompt: string;
}

export interface Walkthrough {
  generatedAt: number;
  mode: "local" | "live";
  resolvedDomain: DomainId;
  headline: string;
  thesis: string;
  assumptions: string[];
  gaps: string[];
  sections: Section[];
}

export interface Mission {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  brief: Brief;
  walkthrough: Walkthrough | null;
  notes: Partial<Record<SectionId, string>>;
  checked: Record<string, boolean>;
}
