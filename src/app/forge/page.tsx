"use client";

import { useMemo, useState } from "react";
import { CircleAlert, CircleCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CopyButton } from "@/components/copy-button";
import { forge, type Depth, type ForgeOptions, type OutputFormat } from "@/lib/forge";
import { TARGET_LABELS, TARGET_NOTES } from "@/lib/persona";
import type { ModelTarget } from "@/lib/types";

const TARGETS: ModelTarget[] = ["cursor", "claude", "gpt", "grok", "generic"];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "auto", label: "Match the task" },
  { value: "markdown", label: "Markdown sections" },
  { value: "prose", label: "Prose" },
  { value: "bullets", label: "Bullets only" },
  { value: "table", label: "Table" },
  { value: "json", label: "JSON" },
  { value: "code", label: "Code first" },
];

const DEPTHS: { value: Depth; label: string }[] = [
  { value: "tight", label: "Tight — under 300 words" },
  { value: "standard", label: "Standard — 400 to 800 words" },
  { value: "deep", label: "Deep — edge cases and second-order effects" },
];

const EXAMPLE = "write me a landing page for my app";

export default function ForgePage() {
  const [raw, setRaw] = useState("");
  const [options, setOptions] = useState<Omit<ForgeOptions, "target"> & { target: ModelTarget }>({
    target: "claude",
    role: "",
    context: "",
    outputFormat: "auto",
    depth: "standard",
    adversarial: true,
    includePersona: false,
  });

  const result = useMemo(() => (raw.trim() ? forge(raw, options) : null), [raw, options]);

  function update<K extends keyof typeof options>(key: K, value: (typeof options)[K]) {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Prompt Forge</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Turn a lazy prompt into one that earns a real answer.
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Paste what you were about to send. The forge diagnoses what is missing, then rebuilds it with a
          role, a context block, explicit constraints, and an output contract — tuned for the model you are
          sending it to.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-2 lg:gap-8">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="raw" className="text-sm font-medium">
                Your prompt
              </Label>
              <button
                type="button"
                onClick={() => setRaw(EXAMPLE)}
                className="text-xs text-muted-foreground underline-offset-4 hover:underline"
              >
                Use an example
              </button>
            </div>
            <Textarea
              id="raw"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={EXAMPLE}
              className="min-h-36 resize-y text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Target model</Label>
            <div className="flex flex-wrap gap-1.5">
              {TARGETS.map((target) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => update("target", target)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    options.target === target
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {TARGET_LABELS[target]}
                </button>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {TARGET_NOTES[options.target]}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Role override
              <span className="ml-1.5 font-normal text-muted-foreground">
                optional — inferred from the task if blank
              </span>
            </Label>
            <Input
              id="role"
              value={options.role}
              onChange={(e) => update("role", e.target.value)}
              placeholder="a conversion copywriter who has launched 50 SaaS landing pages"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ctx" className="text-sm font-medium">
              Context to inject
              <span className="ml-1.5 font-normal text-muted-foreground">optional</span>
            </Label>
            <Textarea
              id="ctx"
              value={options.context}
              onChange={(e) => update("context", e.target.value)}
              placeholder="Who it is for, what exists today, what the constraints are, what the reader should do next."
              className="min-h-24 resize-y"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Output format</Label>
              <Select
                value={options.outputFormat}
                onValueChange={(value) => update("outputFormat", value as OutputFormat)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Depth</Label>
              <Select value={options.depth} onValueChange={(value) => update("depth", value as Depth)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPTHS.map((depth) => (
                    <SelectItem key={depth.value} value={depth.value}>
                      {depth.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="adversarial" className="text-sm font-medium">
                  Self-critique pass
                </Label>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Makes the model name the strongest objection to its own answer.
                </p>
              </div>
              <Switch
                id="adversarial"
                checked={options.adversarial}
                onCheckedChange={(value) => update("adversarial", value)}
              />
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
              <div className="space-y-0.5">
                <Label htmlFor="persona" className="text-sm font-medium">
                  Prepend the operating system
                </Label>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Adds the full collaborator persona. Use for a fresh conversation, skip it mid-thread.
                </p>
              </div>
              <Switch
                id="persona"
                checked={options.includePersona}
                onCheckedChange={(value) => update("includePersona", value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          {result ? (
            <>
              <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-heading text-sm font-semibold">Diagnosis</h2>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Original <span className="font-mono text-foreground">{result.scoreBefore}%</span>
                    </span>
                    <span aria-hidden>→</span>
                    <span>
                      Forged <span className="font-mono text-foreground">{result.scoreAfter}%</span>
                    </span>
                    <Badge variant="secondary" className="ml-1 text-[11px] font-normal capitalize">
                      {result.taskType}
                    </Badge>
                  </div>
                </div>
                <ul className="mt-3 space-y-2">
                  {result.diagnostics.map((diagnostic) => (
                    <li key={diagnostic.id} className="flex gap-2.5">
                      {diagnostic.present ? (
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
                      ) : (
                        <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{diagnostic.label}</p>
                        {!diagnostic.present && (
                          <p className="text-xs leading-relaxed text-muted-foreground">{diagnostic.note}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card">
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-3 sm:px-5">
                  <h2 className="font-heading text-sm font-semibold">
                    Forged for {TARGET_LABELS[options.target]}
                  </h2>
                  <CopyButton value={result.prompt} label="Copy prompt" toastLabel="Forged prompt copied" />
                </div>
                <pre className="max-h-[32rem] overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground sm:p-5">
                  {result.prompt}
                </pre>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
              <Sparkles className="size-6 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">The forged prompt appears here</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Start typing on the left. Everything updates live — no generate button, no waiting.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
