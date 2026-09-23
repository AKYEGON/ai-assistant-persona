# Walkthrough OS

A thinking instrument for turning any plan, idea, or problem into a complete strategic walkthrough — and for turning lazy prompts into ones that earn real answers.

It exists because frontier models are excellent at reasoning and unreliable at structure. Ask the same model the same question twice and you get two different shapes of answer. Walkthrough OS inverts that: the **structure is deterministic and runs locally**, and the **depth is delegated to whichever model you prefer**, through prompts the app writes for you.

## What it does

### 1. Full Walkthrough Mode (`/`)

Describe a goal. You get nine sections back, every time:

1. **Clarifying Questions** — only the ones where a different answer produces a different plan
2. **First-Principles Breakdown** — what is necessary versus what you inherited by convention
3. **Strategic Architecture** — the layer map, with the current bottleneck named
4. **Step-by-Step Execution Plan** — phases ordered by dependency, each ending in a decision point
5. **Key Risks, Bottlenecks & Mitigations** — pre-mortem first, then specific countermeasures
6. **Creative Alternatives & High-Leverage Improvements** — including a reframe of the goal itself
7. **Recommended Tools, Frameworks & Prompts** — a minimum viable toolkit, not a catalogue
8. **Success Metrics & Feedback Loops** — leading indicators and the threshold that means "change approach"
9. **Next Immediate Actions** — the one to three things to do right now

The content is tuned by **domain playbook**. A software goal gets walking-skeleton thinking and integration risk; a business goal gets buyer conversations and unit economics; a personal-systems goal gets triggers, friction, and never-miss-twice. The domain is detected from your brief and can be overridden.

Every section also carries a **copy-ready deep-dive prompt** that embeds your full brief, so you can hand that one section to Claude, GPT, Grok, or Cursor without re-explaining anything.

### 2. Prompt Forge (`/forge`)

Paste the prompt you were about to send. The forge:

- **Diagnoses** it against seven dimensions (role, context, single task, constraints, output contract, success criteria, audience) and tells you what each omission costs you
- **Rebuilds** it with a role, a context block, numbered constraints, quality bars specific to the task type, an explicit output contract, and a depth directive
- **Targets a model** — Cursor gets repo-relative scope and verification steps, Claude gets format contracts and inference marking, GPT gets constraint precedence, Grok gets anti-hedging directives

Everything updates live as you type. No generate button, no API call.

### 3. Operating System (`/persona`)

The system prompt the whole tool is built around, in a generic version plus four model-specific variants. Paste it into custom instructions once and any model becomes a collaborator that challenges assumptions, names its own knowledge gaps, and defaults to the nine-section structure.

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:43917.

```bash
npm run build && npm start   # production build
npm run typecheck            # tsc --noEmit
npm run lint                 # eslint
npm run smoke                # headless browser pass over every surface
```

`npm run smoke` drives a real Chromium through mission creation, persistence across reload, the forge, the persona tabs, and a 390px mobile pass, and fails on any console error. It needs the dev server already running and `npx playwright install chromium` done once.

## Design notes

- **No API keys, no backend, no network calls.** Synthesis is a deterministic engine in `src/lib/synthesize.ts`. That is a deliberate trade: you get an instant, reproducible, offline scaffold instead of a slower, non-deterministic one — and the model does the part models are actually better at.
- **Missions are stored in `localStorage`.** Nothing leaves your machine. The consequence is that missions do not sync across devices or survive a cleared browser store, so export anything you care about — every mission copies or downloads as Markdown.
- **Notes and checkboxes persist per mission**, so a walkthrough is a working document rather than a one-shot output. Edit the brief assumptions, hit Regenerate, and the plan updates.

## Layout

```
src/
  app/
    page.tsx              Mission dashboard + brief composer
    mission/[id]/         Walkthrough workspace
    forge/                Prompt Forge
    persona/              System prompt library
  components/             UI, including shadcn/ui primitives in components/ui
  lib/
    synthesize.ts         The nine-section engine
    domains.ts            Six domain playbooks (levers, bottlenecks, metrics, tools)
    forge.ts              Prompt diagnosis and reconstruction
    persona.ts            Master persona + per-model directives
    export.ts             Markdown export
    storage.ts            localStorage-backed mission store
```

Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
