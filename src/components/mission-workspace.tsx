"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileWarning, RefreshCw, Terminal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlockView } from "@/components/block-view";
import { CopyButton } from "@/components/copy-button";
import { RichText } from "@/components/rich-text";
import { DOMAINS } from "@/lib/domains";
import { download, missionToMarkdown, slugify } from "@/lib/export";
import { saveMission, useMission } from "@/lib/storage";
import { synthesize } from "@/lib/synthesize";
import type { Mission, SectionId } from "@/lib/types";

const STANCE_LABEL: Record<string, string> = {
  challenge: "Challenge stance",
  expand: "Expansion stance",
  execute: "Execution stance",
};

export function MissionWorkspace({ missionId }: { missionId: string }) {
  const { mission, hydrated } = useMission(missionId);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);

  const markdown = useMemo(() => (mission ? missionToMarkdown(mission) : ""), [mission]);

  function persist(next: Mission) {
    saveMission(next);
  }

  function toggleCheck(key: string) {
    if (!mission) return;
    persist({ ...mission, checked: { ...mission.checked, [key]: !mission.checked[key] } });
  }

  function setNote(sectionId: SectionId, value: string) {
    if (!mission) return;
    persist({ ...mission, notes: { ...mission.notes, [sectionId]: value } });
  }

  function regenerate() {
    if (!mission) return;
    persist({ ...mission, walkthrough: synthesize(mission.brief) });
    toast.success("Walkthrough regenerated from the current brief");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="h-40 animate-pulse rounded-xl border border-border/60 bg-card/50" />
      </div>
    );
  }

  if (!mission || !mission.walkthrough) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <FileWarning className="size-7 text-muted-foreground" />
        <h1 className="mt-4 font-heading text-xl font-semibold">This mission is not on this device</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Missions live in your browser&rsquo;s local storage, so they do not follow you across devices or
          private windows. Start a new one and it will be here whenever you come back.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">Back to missions</Link>
        </Button>
      </div>
    );
  }

  const { walkthrough, brief } = mission;
  const domain = DOMAINS[walkthrough.resolvedDomain];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All missions
      </Link>

      <header className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{domain.label}</Badge>
          <Badge variant="outline">{STANCE_LABEL[brief.stance]}</Badge>
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          {mission.title}
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{brief.goal}</p>

        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={markdown} label="Copy as Markdown" toastLabel="Full walkthrough copied" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              download(`${slugify(mission.title)}.md`, markdown);
              toast.success("Markdown downloaded");
            }}
          >
            <Download className="size-3.5" />
            Download
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={regenerate}>
            <RefreshCw className="size-3.5" />
            Regenerate
          </Button>
        </div>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <nav className="order-2 lg:order-1 lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Sections
          </p>
          <ul className="space-y-0.5">
            {walkthrough.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary/60 hover:text-foreground ${
                    activeSection === section.id ? "bg-secondary text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(section.index).padStart(2, "0")}
                  </span>
                  <span className="leading-snug">{section.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="order-1 min-w-0 space-y-6 lg:order-2">
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Thesis
            </h2>
            <p className="mt-2.5 text-base leading-relaxed">
              <RichText text={walkthrough.thesis} />
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Assumptions I am making
                </h3>
                <ul className="mt-2 space-y-1.5">
                  {walkthrough.assumptions.map((assumption, i) => (
                    <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                      <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-foreground/30" />
                      <span>
                        <RichText text={assumption} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {walkthrough.gaps.length ? "Gaps in what you told me" : "No blocking gaps"}
                </h3>
                {walkthrough.gaps.length ? (
                  <ul className="mt-2 space-y-1.5">
                    {walkthrough.gaps.map((gap, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                        <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-amber-500/60" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Your brief covered audience, metric, horizon, constraints, and prior attempts. The plan
                    below assumes all of it is accurate.
                  </p>
                )}
              </div>
            </div>
          </section>

          {walkthrough.sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20 rounded-xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-muted-foreground/60">
                  {String(section.index).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-semibold tracking-tight">{section.title}</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{section.purpose}</p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {section.blocks.map((block, i) => (
                  <BlockView
                    key={i}
                    block={block}
                    blockKey={`${section.id}:${i}`}
                    checked={mission.checked}
                    onToggle={toggleCheck}
                  />
                ))}
              </div>

              <Accordion type="single" collapsible className="mt-5 border-t border-border/60 pt-1">
                <AccordionItem value="prompt" className="border-none">
                  <AccordionTrigger className="py-3 text-sm hover:no-underline">
                    <span className="flex items-center gap-2">
                      <Terminal className="size-3.5 text-muted-foreground" />
                      Deep-dive prompt for this section
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Paste this into any frontier model. It carries your full brief, so you do not need to
                      re-explain anything.
                    </p>
                    <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-muted/40 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                      {section.modelPrompt}
                    </pre>
                    <CopyButton value={section.modelPrompt} label="Copy prompt" toastLabel="Prompt copied" />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-4 space-y-2">
                <label
                  htmlFor={`note-${section.id}`}
                  className="font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                >
                  My notes
                </label>
                <Textarea
                  id={`note-${section.id}`}
                  value={mission.notes[section.id] ?? ""}
                  onChange={(e) => setNote(section.id, e.target.value)}
                  placeholder="Answers, decisions, what the model came back with. Saved automatically."
                  className="min-h-20 resize-y bg-background"
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
