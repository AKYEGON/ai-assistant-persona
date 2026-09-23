import type { Block, Mission } from "./types";

function blockToMarkdown(block: Block): string {
  switch (block.kind) {
    case "prose":
      return [block.heading ? `**${block.heading}**` : null, block.text].filter(Boolean).join("\n\n");
    case "list":
      return [block.heading ? `**${block.heading}**` : null, block.items.map((i) => `- ${i}`).join("\n")]
        .filter(Boolean)
        .join("\n\n");
    case "checks":
      return [block.heading ? `**${block.heading}**` : null, block.items.map((i) => `- [ ] ${i}`).join("\n")]
        .filter(Boolean)
        .join("\n\n");
    case "ordered":
      return [
        block.heading ? `**${block.heading}**` : null,
        block.items.map((item, i) => `${i + 1}. ${item}`).join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n");
    case "pairs":
      return [
        block.heading ? `**${block.heading}**` : null,
        `| ${block.labelA} | ${block.labelB} |`,
        `| --- | --- |`,
        ...block.items.map((p) => `| ${p.a} | ${p.b} |`),
      ]
        .filter(Boolean)
        .join("\n");
    case "callout":
      return `> ${block.tone === "warning" ? "⚠ " : "◆ "}${block.text}`;
  }
}

export function missionToMarkdown(mission: Mission): string {
  const { brief, walkthrough } = mission;
  const lines: string[] = [`# ${mission.title}`, ""];

  lines.push("## Brief", "");
  lines.push(`**Goal:** ${brief.goal || "—"}`);
  if (brief.context.trim()) lines.push("", `**Situation:** ${brief.context}`);
  if (brief.constraints.trim()) lines.push("", `**Constraints:** ${brief.constraints}`);
  if (brief.definitionOfDone.trim()) lines.push("", `**Definition of done:** ${brief.definitionOfDone}`);
  lines.push("");

  if (!walkthrough) {
    lines.push("_No walkthrough generated yet._");
    return lines.join("\n");
  }

  lines.push("## Thesis", "", walkthrough.thesis, "");
  lines.push("**Assumptions**", "", ...walkthrough.assumptions.map((a) => `- ${a}`), "");
  if (walkthrough.gaps.length) {
    lines.push("**Research gaps**", "", ...walkthrough.gaps.map((g) => `- ${g}`), "");
  }

  for (const section of walkthrough.sections) {
    lines.push(`## ${section.index}. ${section.title}`, "", `_${section.purpose}_`, "");
    for (const block of section.blocks) {
      lines.push(blockToMarkdown(block), "");
    }
    const note = mission.notes[section.id]?.trim();
    if (note) lines.push("**My notes**", "", note, "");
  }

  return lines.join("\n");
}

export function download(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "walkthrough"
  );
}
