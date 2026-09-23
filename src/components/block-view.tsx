"use client";

import { AlertTriangle, Sparkles } from "lucide-react";
import type { Block } from "@/lib/types";
import { RichText } from "@/components/rich-text";
import { cn } from "@/lib/utils";

interface BlockViewProps {
  block: Block;
  blockKey: string;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2.5 font-heading text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {children}
    </h4>
  );
}

export function BlockView({ block, blockKey, checked, onToggle }: BlockViewProps) {
  switch (block.kind) {
    case "prose":
      return (
        <div>
          {block.heading && <Heading>{block.heading}</Heading>}
          <p className="text-sm leading-relaxed text-muted-foreground">
            <RichText text={block.text} />
          </p>
        </div>
      );

    case "list":
      return (
        <div>
          {block.heading && <Heading>{block.heading}</Heading>}
          <ul className="space-y-2">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-foreground/30" />
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "ordered":
      return (
        <div>
          {block.heading && <Heading>{block.heading}</Heading>}
          <ol className="space-y-2.5">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-secondary font-mono text-[10px] font-semibold text-secondary-foreground">
                  {i + 1}
                </span>
                <span>
                  <RichText text={item} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "checks":
      return (
        <div>
          {block.heading && <Heading>{block.heading}</Heading>}
          <ul className="space-y-1">
            {block.items.map((item, i) => {
              const key = `${blockKey}:${i}`;
              const isChecked = Boolean(checked[key]);
              return (
                <li key={i}>
                  <label className="flex cursor-pointer gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(key)}
                      className="mt-1 size-4 shrink-0 cursor-pointer accent-foreground"
                    />
                    <span
                      className={cn(
                        "text-sm leading-relaxed transition-colors",
                        isChecked ? "text-muted-foreground/50 line-through" : "text-muted-foreground",
                      )}
                    >
                      <RichText text={item} />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      );

    case "pairs":
      return (
        <div>
          {block.heading && <Heading>{block.heading}</Heading>}
          <div className="overflow-hidden rounded-lg border border-border/70">
            <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-border/70 bg-secondary/40 px-4 py-2 sm:grid">
              <span className="font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {block.labelA}
              </span>
              <span className="font-heading text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {block.labelB}
              </span>
            </div>
            <div className="divide-y divide-border/70">
              {block.items.map((pair, i) => (
                <div
                  key={i}
                  className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-4"
                >
                  <span className="text-sm font-medium leading-relaxed text-foreground">
                    <RichText text={pair.a} />
                  </span>
                  <span className="text-sm leading-relaxed text-muted-foreground">
                    <RichText text={pair.b} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "callout": {
      const warning = block.tone === "warning";
      const Icon = warning ? AlertTriangle : Sparkles;
      return (
        <div
          className={cn(
            "flex gap-3 rounded-lg border px-4 py-3",
            warning ? "border-amber-500/30 bg-amber-500/5" : "border-border bg-secondary/40",
          )}
        >
          <Icon
            className={cn("mt-0.5 size-4 shrink-0", warning ? "text-amber-600 dark:text-amber-500" : "text-foreground/70")}
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            <RichText text={block.text} />
          </p>
        </div>
      );
    }
  }
}
