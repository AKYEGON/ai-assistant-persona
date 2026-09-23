import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://127.0.0.1:43917";
const results = [];
const consoleErrors = [];

function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

page.on("console", (msg) => {
  if (msg.type() === "error" && !/hmr|websocket|devtools/i.test(msg.text())) {
    consoleErrors.push(msg.text());
  }
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

/* ---------- Home: compose a mission ---------- */
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
check("home renders heading", await page.getByRole("heading", { name: /Give it a goal/ }).isVisible());

await page.getByRole("button", { name: "Launch a paid product" }).click();
const goal = await page.locator("#goal").inputValue();
check("starter chip fills goal", goal.includes("paid product"), `${goal.slice(0, 40)}...`);

// Domain select
await page.getByRole("combobox").first().click();
await page.waitForTimeout(400);
const optionCount = await page.getByRole("option").count();
check("domain select opens with options", optionCount > 3, `${optionCount} options`);
await page.getByRole("option", { name: "Business & Strategy" }).click();
await page.waitForTimeout(200);
check(
  "domain select applies value",
  (await page.getByRole("combobox").first().textContent())?.includes("Business") ?? false,
  (await page.getByRole("combobox").first().textContent()) ?? "",
);

// Stance select
await page.getByRole("combobox").nth(1).click();
await page.waitForTimeout(400);
await page.getByRole("option", { name: /Get me moving/ }).click();
await page.waitForTimeout(200);
check(
  "stance select applies value",
  (await page.getByRole("combobox").nth(1).textContent())?.includes("moving") ?? false,
);

// Typed input (not just chip-driven state)
await page.locator("#done").fill("30 paying members and a weekly rhythm I can sustain.");
check("typed input registers", (await page.locator("#done").inputValue()).startsWith("30 paying"));

await page.getByRole("button", { name: /Run Full Walkthrough/ }).click();
await page.waitForURL(/\/mission\//, { timeout: 15000 }).catch(() => {});
check("navigates to mission", /\/mission\//.test(page.url()), page.url());

/* ---------- Mission workspace ---------- */
await page.waitForTimeout(800);
const sectionCount = await page.locator("section[id]").count();
check("renders all nine sections", sectionCount === 9, `${sectionCount} sections`);

const boxes = page.locator('input[type="checkbox"]');
const boxCount = await boxes.count();
await boxes.first().check();
check("checkbox toggles", await boxes.first().isChecked(), `${boxCount} checkboxes present`);

const noteBox = page.locator("#note-clarify");
await noteBox.fill("My answer: 30 paying members by the end of the quarter.");
await page.waitForTimeout(400);

await page.getByRole("button", { name: /Deep-dive prompt/ }).first().click();
await page.waitForTimeout(500);
const promptText = await page.locator("pre").first().textContent();
check("deep-dive prompt has content", (promptText?.length ?? 0) > 300, `${promptText?.length ?? 0} chars`);

const missionUrl = page.url();
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
check("checkbox state persists reload", await page.locator('input[type="checkbox"]').first().isChecked());
check(
  "notes persist reload",
  (await page.locator("#note-clarify").inputValue()).includes("30 paying members"),
);

await page.getByRole("button", { name: /Regenerate/ }).click();
await page.waitForTimeout(600);
check("regenerate keeps nine sections", (await page.locator("section[id]").count()) === 9);

/* ---------- Mission list ---------- */
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const listText = await page.locator("ul").last().textContent();
check("mission appears in list", (listText ?? "").includes("Business & Strategy"), (listText ?? "").slice(0, 60));

/* ---------- Forge ---------- */
await page.goto(`${BASE}/forge`, { waitUntil: "networkidle" });
await page.locator("#raw").fill("write me a landing page for my app");
await page.waitForTimeout(500);
const forged1 = await page.locator("pre").last().textContent();
check("forge produces output", (forged1?.length ?? 0) > 400, `${forged1?.length ?? 0} chars`);
check("forge output has role section", (forged1 ?? "").includes("# Role"));

await page.getByRole("button", { name: "Cursor", exact: true }).click();
await page.waitForTimeout(400);
const forged2 = await page.locator("pre").last().textContent();
check("target pill changes output", forged1 !== forged2 && (forged2 ?? "").includes("repo-relative"));

await page.getByRole("combobox").first().click();
await page.waitForTimeout(400);
await page.getByRole("option", { name: "JSON" }).click();
await page.waitForTimeout(400);
const forged3 = await page.locator("pre").last().textContent();
check("format select changes contract", (forged3 ?? "").includes("valid JSON object"));

await page.getByLabel("Prepend the operating system").click();
await page.waitForTimeout(400);
const forged4 = await page.locator("pre").last().textContent();
check("persona switch prepends persona", (forged4 ?? "").includes("highest-leverage intelligence collaborator"));

/* ---------- Persona ---------- */
await page.goto(`${BASE}/persona`, { waitUntil: "networkidle" });
const generic = await page.locator("pre").first().textContent();
await page.getByRole("tab", { name: "Grok" }).click();
await page.waitForTimeout(500);
const grok = await page.locator("pre").first().textContent();
check(
  "persona tab switches content",
  generic !== grok && (grok ?? "").includes("Grok-specific") && !(generic ?? "").includes("Grok-specific"),
);
check(
  "persona heading updates",
  (await page.getByText(/System prompt — Grok/).count()) > 0,
);

/* ---------- Mobile ---------- */
await page.setViewportSize({ width: 390, height: 844 });
for (const [label, url] of [["home", `${BASE}/`], ["mission", missionUrl], ["forge", `${BASE}/forge`]]) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(`${label} has no horizontal overflow at 390px`, overflow <= 1, `${overflow}px overflow`);
}

await browser.close();

console.log("\nConsole errors:", consoleErrors.length ? consoleErrors : "none");
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length || consoleErrors.length ? 1 : 0);
