"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DOMAIN_LIST } from "@/lib/domains";
import { missionTitle, synthesize } from "@/lib/synthesize";
import { newId, saveMission } from "@/lib/storage";
import type { Brief, DomainId, Mission, Stance } from "@/lib/types";

const STANCES: { value: Stance; label: string; hint: string }[] = [
  { value: "challenge", label: "Challenge me", hint: "Attack the assumptions first" },
  { value: "expand", label: "Expand options", hint: "Generate angles I have not considered" },
  { value: "execute", label: "Get me moving", hint: "Skip theory, maximize executability" },
];

const STARTERS: { label: string; brief: Partial<Brief> }[] = [
  {
    label: "Launch a paid product",
    brief: {
      goal: "Launch a paid product to my existing audience in the next quarter",
      context:
        "I have an audience of about 4,000 people from writing online. I have never sold anything to them and I do not know what they would pay for.",
      constraints: "Around 8 hours a week, no budget for contractors, I am not a designer.",
      definitionOfDone: "",
    },
  },
  {
    label: "Ship an internal tool",
    brief: {
      goal: "Build an internal tool that replaces the spreadsheet our ops team runs on",
      context:
        "Five people update the same sheet daily and it breaks constantly. I am the only engineer who can work on this and it is not my main project.",
      constraints: "Must integrate with our existing auth. Cannot introduce a new database vendor.",
      definitionOfDone: "",
    },
  },
  {
    label: "Make a research decision",
    brief: {
      goal: "Decide whether to migrate our stack before the next hiring round",
      context:
        "The current stack works but two senior candidates declined partly because of it. No hard data on whether that generalizes.",
      constraints: "Any migration has to happen without pausing feature work.",
      definitionOfDone: "",
    },
  },
];

export function BriefComposer() {
  const router = useRouter();
  const [brief, setBrief] = useState<Brief>({
    goal: "",
    context: "",
    constraints: "",
    definitionOfDone: "",
    domain: "auto",
    stance: "challenge",
  });
  const [busy, setBusy] = useState(false);

  function update<K extends keyof Brief>(key: K, value: Brief[K]) {
    setBrief((prev) => ({ ...prev, [key]: value }));
  }

  function applyStarter(starter: (typeof STARTERS)[number]) {
    setBrief((prev) => ({ ...prev, ...starter.brief }));
  }

  function run() {
    if (brief.goal.trim().length < 8) {
      toast.error("Describe the goal in a sentence or two first.");
      return;
    }
    setBusy(true);

    const mission: Mission = {
      id: newId(),
      title: missionTitle(brief.goal),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      brief,
      walkthrough: synthesize(brief),
      notes: {},
      checked: {},
    };

    saveMission(mission);
    router.push(`/mission/${mission.id}`);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="goal" className="text-sm font-medium">
            What are you trying to do?
          </Label>
          <Textarea
            id="goal"
            value={brief.goal}
            onChange={(e) => update("goal", e.target.value)}
            placeholder="Launch a paid community for independent designers without building a custom platform first."
            className="min-h-24 resize-none text-base"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="py-1 text-xs text-muted-foreground">Try:</span>
            {STARTERS.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => applyStarter(starter)}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="context" className="text-sm font-medium">
              Where you are now
              <span className="ml-1.5 font-normal text-muted-foreground">optional</span>
            </Label>
            <Textarea
              id="context"
              value={brief.context}
              onChange={(e) => update("context", e.target.value)}
              placeholder="What exists already, what you have tried, and where it stopped working."
              className="min-h-20 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="constraints" className="text-sm font-medium">
              Hard constraints
              <span className="ml-1.5 font-normal text-muted-foreground">optional</span>
            </Label>
            <Textarea
              id="constraints"
              value={brief.constraints}
              onChange={(e) => update("constraints", e.target.value)}
              placeholder="Hours per week, budget, skills you do not have, things you will not do."
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="done" className="text-sm font-medium">
            What &ldquo;done&rdquo; looks like
            <span className="ml-1.5 font-normal text-muted-foreground">optional, but it sharpens everything</span>
          </Label>
          <Input
            id="done"
            value={brief.definitionOfDone}
            onChange={(e) => update("definitionOfDone", e.target.value)}
            placeholder="30 paying members and a repeatable weekly rhythm I can sustain."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Domain</Label>
            <Select
              value={brief.domain}
              onValueChange={(value) => update("domain", value as DomainId | "auto")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Detect automatically</SelectItem>
                {DOMAIN_LIST.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id}>
                    {domain.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">How should I push back?</Label>
            <Select value={brief.stance} onValueChange={(value) => update("stance", value as Stance)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STANCES.map((stance) => (
                  <SelectItem key={stance.value} value={stance.value}>
                    {stance.label} — <span className="text-muted-foreground">{stance.hint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Produces all nine sections plus a copy-ready deep-dive prompt for each one.
          </p>
          <Button onClick={run} disabled={busy} size="lg" className="gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            Run Full Walkthrough
            {!busy && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
