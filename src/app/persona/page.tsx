"use client";

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MASTER_PERSONA, TARGET_DIRECTIVES, TARGET_LABELS, TARGET_NOTES } from "@/lib/persona";
import type { ModelTarget } from "@/lib/types";

const TARGETS: ModelTarget[] = ["generic", "cursor", "claude", "gpt", "grok"];

function personaFor(target: ModelTarget): string {
  if (target === "generic") return MASTER_PERSONA;
  return `${MASTER_PERSONA}\n\n## ${TARGET_LABELS[target]}-specific directives\n${TARGET_DIRECTIVES[target]
    .map((directive) => `- ${directive}`)
    .join("\n")}`;
}

const USAGE = [
  {
    title: "Paste it once, at the top",
    body: "Custom instructions, a project system prompt, or the first message of a thread. It is written to survive a long conversation without being repeated.",
  },
  {
    title: "Name the stance when you break from it",
    body: "Say 'skip the walkthrough, just the execution plan' when you want one section. The persona holds the structure; you control which parts fire.",
  },
  {
    title: "Let it rewrite your prompts",
    body: "The standing permission clause means you never have to ask. If a prompt was weak, it tells you and hands back a better one.",
  },
];

export default function PersonaPage() {
  const [target, setTarget] = useState<ModelTarget>("generic");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Operating System
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          The persona this whole tool is built around.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          One system prompt that turns any frontier model into a collaborator with a spine: it challenges weak
          assumptions, names its own knowledge gaps, and defaults to the nine-section walkthrough. Every
          model-specific version below is the same core with a tail tuned to how that model behaves.
        </p>
      </header>

      <Tabs
        value={target}
        onValueChange={(value) => setTarget(value as ModelTarget)}
        className="mt-8 gap-4"
      >
        <TabsList className="w-full justify-start overflow-x-auto">
          {TARGETS.map((item) => (
            <TabsTrigger key={item} value={item} className="text-sm">
              {TARGET_LABELS[item]}
            </TabsTrigger>
          ))}
        </TabsList>

        {TARGETS.map((item) => (
          <TabsContent key={item} value={item} className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground">{TARGET_NOTES[item]}</p>
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 sm:px-5">
                <span className="font-heading text-sm font-semibold">
                  System prompt — {TARGET_LABELS[item]}
                </span>
                <CopyButton
                  value={personaFor(item)}
                  label="Copy"
                  toastLabel={`${TARGET_LABELS[item]} persona copied`}
                />
              </div>
              <pre className="max-h-[36rem] overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground sm:p-5">
                {personaFor(item)}
              </pre>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <section className="mt-10 grid gap-4 sm:grid-cols-3">
        {USAGE.map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-heading text-sm font-semibold">{item.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
