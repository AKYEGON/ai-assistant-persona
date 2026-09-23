import Link from "next/link";
import { BriefComposer } from "@/components/brief-composer";
import { MissionList } from "@/components/mission-list";

const SECTIONS = [
  "Clarifying Questions",
  "First-Principles Breakdown",
  "Strategic Architecture",
  "Execution Plan",
  "Risks & Mitigations",
  "Creative Alternatives",
  "Tools & Frameworks",
  "Metrics & Feedback Loops",
  "Next Immediate Actions",
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
        <div className="min-w-0 space-y-10">
          <section className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Full Walkthrough Mode
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Give it a goal. Get the whole map.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
              Every plan you bring here comes back as nine sections — from the questions you have not
              answered to the three things to do right now. The structure is deterministic, so it never
              drifts. The depth comes from the prompts it hands you for whichever model you are using.
            </p>
          </section>

          <BriefComposer />

          <section className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="font-heading text-lg font-semibold tracking-tight">Your missions</h2>
              <Link href="/forge" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                Or forge a prompt instead
              </Link>
            </div>
            <MissionList />
          </section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-sm font-semibold">What a walkthrough contains</h2>
            <ol className="mt-3 space-y-1.5">
              {SECTIONS.map((section, index) => (
                <li key={section} className="flex gap-2.5 text-sm text-muted-foreground">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {section}
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading text-sm font-semibold">Why it is not just a chatbot</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A model gives you a different answer every time you ask. This gives you the same rigorous
              scaffold every time, tuned to your domain, then hands the reasoning to the model through
              prompts built for the job.
            </p>
            <Link
              href="/persona"
              className="mt-3 inline-block text-sm font-medium underline-offset-4 hover:underline"
            >
              Read the operating system →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
