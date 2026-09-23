"use client";

import Link from "next/link";
import { ArrowUpRight, Inbox, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DOMAINS } from "@/lib/domains";
import { useMissions } from "@/lib/storage";

function relativeTime(timestamp: number): string {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export function MissionList() {
  const { missions, hydrated, remove } = useMissions();

  if (!hydrated) {
    return (
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl border border-border/60 bg-card/50" />
        ))}
      </div>
    );
  }

  if (missions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <Inbox className="size-6 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No missions yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Describe a goal above and it becomes a working document: nine sections, decision points, and a
          deep-dive prompt for every part of it.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {missions.map((mission) => {
        const domain = mission.walkthrough ? DOMAINS[mission.walkthrough.resolvedDomain] : null;
        const done = Object.values(mission.checked).filter(Boolean).length;

        return (
          <li key={mission.id}>
            <div className="group relative flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/25">
              <div className="min-w-0 flex-1">
                <Link href={`/mission/${mission.id}`} className="block">
                  <span className="absolute inset-0" aria-hidden />
                  <h3 className="truncate font-heading text-sm font-semibold sm:text-base">
                    {mission.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{mission.brief.goal}</p>
                </Link>
                <div className="relative z-10 mt-2.5 flex flex-wrap items-center gap-2">
                  {domain && (
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {domain.label}
                    </Badge>
                  )}
                  {done > 0 && (
                    <Badge variant="outline" className="text-[11px] font-normal">
                      {done} action{done === 1 ? "" : "s"} checked
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{relativeTime(mission.updatedAt)}</span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${mission.title}`}
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                  onClick={() => {
                    remove(mission.id);
                    toast.success("Mission deleted");
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
                <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
