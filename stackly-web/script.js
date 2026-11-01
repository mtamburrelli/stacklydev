/* StacklyDev landing — vanilla JS, no dependencies */

// Set this to your form backend (Formspree, Netlify, your API...) to receive messages.
// While empty, the form only shows a demo confirmation.
const FORM_ENDPOINT = "";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- tiny syntax highlighter ---------- */
const KEYWORDS = new Set((
  "const let var function async await return if else for while import from export default class new this " +
  "def in not and or is None True False print with as try except lambda yield pragma contract public " +
  "external view returns require emit event mapping uint256 address msg memory storage true false null undefined " +
  "type interface extends implements void"
).split(" "));

const TOKEN_RE = new RegExp([
  "(\\/\\/[^\\n]*|#[^\\n]*)",                       // 1 comments
  "(\"(?:\\\\.|[^\"\\\\])*\"|'(?:\\\\.|[^'\\\\])*'|`(?:\\\\.|[^`\\\\])*`)", // 2 strings
  "(\\b\\d+(?:\\.\\d+)?\\b)",                        // 3 numbers
  "(\\b[A-Za-z_][\\w]*)(?=\\s*\\()",                 // 4 function calls
  "(\\b[A-Za-z_][\\w]*)(?=\\s*:)",                   // 5 object keys
  "(\\b[A-Z][A-Za-z0-9_]*\\b)",                      // 6 types / classes
  "(\\b[a-z_][\\w]*\\b)"                             // 7 words (keywords)
].join("|"), "g");

function tokenize(code) {
  const out = [];
  let last = 0, m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(code))) {
    if (m.index > last) out.push({ c: "", t: code.slice(last, m.index) });
    let cls = "";
    if (m[1]) cls = "tk-c";
    else if (m[2]) cls = "tk-s";
    else if (m[3]) cls = "tk-n";
    else if (m[4]) cls = KEYWORDS.has(m[4]) ? "tk-k" : "tk-f";
    else if (m[5]) cls = "tk-p";
    else if (m[6]) cls = KEYWORDS.has(m[6]) ? "tk-k" : "tk-t";
    else if (m[7]) cls = KEYWORDS.has(m[7]) ? "tk-k" : "";
    out.push({ c: cls, t: m[0] });
    last = TOKEN_RE.lastIndex;
  }
  if (last < code.length) out.push({ c: "", t: code.slice(last) });
  return out;
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderTokens(tokens, limit = Infinity) {
  let n = 0, html = "";
  for (const { c, t } of tokens) {
    if (n >= limit) break;
    const piece = t.slice(0, limit - n);
    n += piece.length;
    html += c ? `<span class="${c}">${esc(piece)}</span>` : esc(piece);
  }
  return html;
}

function highlightLines(code) {
  // keep per-line wrappers so line numbers can be drawn with CSS counters
  return code.split("\n").map((line) => `<span class="ln">${renderTokens(tokenize(line)) || " "}</span>`).join("");
}

/* ---------- typing effect ---------- */
function typeInto(el, code, speed = 14) {
  const tokens = tokenize(code);
  const total = code.length;
  if (reduceMotion) { el.innerHTML = renderTokens(tokens); return; }
  let i = 0;
  const tick = () => {
    i = Math.min(total, i + 2);
    el.innerHTML = renderTokens(tokens, i) + (i < total ? '<span class="caret">▍</span>' : '<span class="caret">▍</span>');
    if (i < total) setTimeout(tick, speed);
  };
  tick();
}

/* ---------- content ---------- */
const HERO_CODE = `const stacklydev = {
  base: "Panama",
  reach: "worldwide",
  services: ["web", "software", "mobile", "RPA", "AI", "web3", "SEO"],

  async build(idea) {
    const plan = await this.design(idea);
    return ship(plan, { scalable: true });
  },
};

stacklydev.build("your idea");
// → digital innovation without borders`;

const SERVICES = [
  {
    name: "Web Development",
    file: "app/page.tsx",
    desc: "<b>Fast, accessible, conversion-ready sites</b> and web apps, from marketing pages to complex platforms.",
    code: `export default async function Page() {
  const products = await getProducts();

  return (
    <main className="grid">
      {products.map((p) => (
        <Card key={p.id} title={p.name} price={p.price} />
      ))}
    </main>
  );
}`
  },
  {
    name: "Custom Software",
    file: "billing/invoice.ts",
    desc: "<b>Software shaped around your operation</b>: internal tools, platforms and integrations that fit how you work.",
    code: `class InvoiceService {
  constructor(private repo: Repository) {}

  async create(order: Order): Promise<Invoice> {
    const total = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    const invoice = await this.repo.save({ orderId: order.id, total });
    await notify(order.customer, invoice);
    return invoice;
  }
}`
  },
  {
    name: "Mobile Apps",
    file: "App.tsx",
    desc: "<b>Cross-platform apps</b> for iOS and Android from a single codebase, so you ship faster and maintain less.",
    code: `import { View, Text, Pressable } from "react-native";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <View>
      <Text>Shipped to {count} stores</Text>
      <Pressable onPress={() => setCount(count + 1)} />
    </View>
  );
}`
  },
  {
    name: "RPA",
    file: "bots/reconcile.py",
    desc: "<b>Robotic Process Automation</b> that takes repetitive, rules-based work off your team's plate.",
    code: `from rpa import Bot, Excel, Mail

bot = Bot("reconcile-payments")

for row in Excel("payments.xlsx").rows():
    match = bot.lookup(row["reference"])
    if not match:
        Mail.send("finance@company.com", "Mismatch: " + row["reference"])
    else:
        bot.mark_paid(match, row["amount"])

print("done: 0 humans harmed, 100% coffee saved")`
  },
  {
    name: "Python Automation",
    file: "automate.py",
    desc: "<b>Scripts and pipelines</b> that clean data, generate reports and connect your tools on autopilot.",
    code: `import pandas as pd
from pathlib import Path

def weekly_report(folder: str):
    frames = [pd.read_csv(f) for f in Path(folder).glob("*.csv")]
    df = pd.concat(frames).dropna()
    summary = df.groupby("region")["sales"].sum()
    summary.to_excel("report.xlsx")
    return summary

weekly_report("./data")`
  },
  {
    name: "AI Agents",
    file: "agents/support.ts",
    desc: "<b>AI agents with real tools</b>: they read your data, take action and hand off to humans when it matters.",
    code: `const agent = createAgent({
  name: "support",
  tools: [searchDocs, lookupOrder, createTicket],
  guardrails: { escalateTo: "human", maxSteps: 8 },
});

const reply = await agent.run(
  "Where is my order #4821?"
);
console.log(reply.text);`
  },
  {
    name: "Smart Contracts",
    file: "contracts/Escrow.sol",
    desc: "<b>Transparent, auditable agreements</b> on-chain, written with security first.",
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Escrow {
    address public buyer;
    address public seller;
    uint256 public amount;

    function release() external {
        require(msg.sender == buyer, "only buyer");
        payable(seller).transfer(amount);
    }
}`
  },
  {
    name: "Digital Marketing",
    file: "growth/funnel.js",
    desc: "<b>Campaigns driven by data</b>: attract the right audience, measure everything, iterate quickly.",
    code: `const funnel = {
  visit: 10000,
  signup: 1200,
  customer: 180,
};

const rate = (a, b) => ((b / a) * 100).toFixed(1) + "%";

console.log("visit → signup:", rate(funnel.visit, funnel.signup));
console.log("signup → customer:", rate(funnel.signup, funnel.customer));
// optimize, test, repeat`
  },
  {
    name: "SEO",
    file: "seo/meta.html",
    desc: "<b>Visibility that compounds</b>: technical SEO, content structure and performance that search engines reward.",
    code: `const seo = {
  title: "Your Brand | What you do best",
  description: "A clear, compelling 155-character summary.",
  schema: "Organization",
  canonical: "https://yourbrand.com",
  vitals: { LCP: 1.8, CLS: 0.02 },
};

export const rank = (page) => audit(page, seo);`
  }
];

const JSON_CODE = `{
  "company": "StacklyDev",
  "base": "Panama",
  "clients": "worldwide",
  "partners": ["businesses", "entrepreneurs", "organizations"],
  "borders": null,
  "goal": "smarter, more efficient, future-ready",
  "open_for_projects": true
}`;

const STACK = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Solidity", "React Native",
  "PostgreSQL", "Docker", "AWS", "RPA", "LLMs", "REST", "GraphQL", "Git", "SEO", "Analytics"
];

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();

  // hero typing
  typeInto($("#hero-code"), HERO_CODE);

  // json snippet (static highlight)
  $("#json-code").innerHTML = renderTokens(tokenize(JSON_CODE));

  // services tabs
  const tabs = $("#tabs");
  const panelCode = $("#panel-code");
  let current = 0;

  SERVICES.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "tab";
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.innerHTML = `<span class="idx">${String(i + 1).padStart(2, "0")}</span>${s.name}`;
    b.addEventListener("click", () => select(i));
    tabs.appendChild(b);
  });

  function select(i) {
    current = i;
    $$(".tab", tabs).forEach((t, k) => t.setAttribute("aria-selected", k === i ? "true" : "false"));
    const s = SERVICES[i];
    $("#panel-file").textContent = s.file;
    $("#panel-desc").innerHTML = s.desc;
    panelCode.innerHTML = highlightLines(s.code);
    $("#copy").textContent = "copy";
  }
  select(0);

  // keyboard arrows on tabs
  tabs.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"].includes(e.key)) return;
    e.preventDefault();
    const dir = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const next = (current + dir + SERVICES.length) % SERVICES.length;
    select(next);
    $$(".tab", tabs)[next].focus();
  });

  // copy button
  $("#copy").addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText(SERVICES[current].code);
      e.target.textContent = "copied ✓";
    } catch {
      e.target.textContent = "press Ctrl+C";
    }
    setTimeout(() => (e.target.textContent = "copy"), 1600);
  });

  // marquee (duplicated for a seamless loop)
  const track = $("#track");
  [...STACK, ...STACK].forEach((name) => {
    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = name;
    track.appendChild(c);
  });

  // mobile nav
  const toggle = $(".nav-toggle");
  const links = $(".nav-links");
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$(".nav-links a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );

  // reveal on scroll
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }),
    { threshold: 0.12 }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  // cursor glow + hero tilt
  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      document.documentElement.style.setProperty("--mx", e.clientX + "px");
      document.documentElement.style.setProperty("--my", e.clientY + "px");
    }, { passive: true });

    const win = $(".hero-window");
    const hero = $(".hero");
    hero.addEventListener("pointermove", (e) => {
      const r = win.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / r.width;
      const y = (e.clientY - (r.top + r.height / 2)) / r.height;
      win.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
    });
    hero.addEventListener("pointerleave", () => (win.style.transform = ""));
  }

  // form
  const form = $("#form");
  const status = $("#status");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    let valid = true;
    $$("input, textarea", form).forEach((f) => {
      const ok = f.value.trim() && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value));
      f.classList.toggle("invalid", !ok);
      if (!ok) valid = false;
    });
    status.className = "form-status full";
    if (!valid) {
      status.classList.add("err");
      status.textContent = "// error: please complete all fields with a valid email.";
      return;
    }
    try {
      if (FORM_ENDPOINT) {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("bad response");
      }
      status.classList.add("ok");
      status.textContent = "// success: message sent. We'll be in touch soon.";
      form.reset();
    } catch {
      status.classList.add("err");
      status.textContent = "// error: something went wrong, please try again.";
    }
  });
});
