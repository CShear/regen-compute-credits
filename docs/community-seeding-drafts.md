# Community Seeding Drafts — Regenerative Compute

> Ready to copy-paste. Replace `[BLOG_URL]` and `[DEMO_URL]` with actual links before posting.

---

## 1. Hacker News — "Show HN"

### Post Title

```
Show HN: Regenerative Compute – On-chain ecological credit retirement from your AI assistant
```

**Link**: https://github.com/CShear/regen-compute

### Top-Level Comment

I built an MCP server that connects AI coding assistants (Claude Code, Cursor, etc.) to verified ecological credit retirement on Regen Network.

The problem it addresses: AI compute has a real energy footprint, and the existing "green AI" options are either corporate marketing with no verifiable proof or traditional offset registries that live in private databases nobody can audit.

This tool takes a different approach. Every retirement happens on the Regen Ledger — a public blockchain purpose-built for ecological credits. The retirement is immutable, independently verifiable, and permanent. Not a dashboard claim. An on-chain transaction.

Install with one command:

    claude mcp add -s user regen-compute -- npx regen-compute

No API keys. No wallet required. No configuration.

What it does: estimate session footprint (heuristic, explicitly labeled as approximate), browse live credit inventory from the Regen marketplace, retire credits via credit card or on-chain, and retrieve a verifiable retirement certificate.

One design decision worth noting: we deliberately call this "regenerative contribution," not "carbon offsetting." The footprint estimate is a heuristic — we don't pretend to know your exact kWh. What we do know is that the retirement happened, on-chain, with a transaction hash anyone can verify. That honesty is the point.

Credits available include carbon, biodiversity (Terrasos, Colombia), marine biodiversity, umbrella species stewardship, and grazing-based land stewardship across 9+ countries.

Open source, Apache-2.0. TypeScript, Node.js 20+, @modelcontextprotocol/sdk.

GitHub: https://github.com/CShear/regen-compute
npm: https://www.npmjs.com/package/regen-compute

Happy to answer questions about the architecture, the on-chain retirement flow, or the credit market mechanics.

---

## 2. r/MachineLearning

### Post Title

```
[P] Regenerative Compute — An MCP tool for verified ecological accountability in AI workflows
```

### Body

The IEA projects data centers will consume over 1,000 TWh annually by 2026 — roughly Japan's electricity demand. Luccioni et al. (2023) showed that a single large language model query can consume 0.001–0.01 kWh depending on the model and task. As AI-assisted development becomes the norm, the aggregate footprint is non-trivial.

The problem is that developers who care about this have no actionable tool inside their workflow. Corporate sustainability dashboards are unverifiable. Traditional offset registries (Gold Standard, Verra) operate on private databases where retirement claims can't be independently audited.

I built **Regenerative Compute**, an MCP (Model Context Protocol) server that connects AI coding assistants to the Regen Network — a public blockchain purpose-built for ecological credit issuance and retirement. Every retirement is an on-chain transaction: immutable, auditable, permanent.

**Key design choice**: the footprint estimation is explicitly a heuristic. We don't claim to know your session's exact energy consumption — the variables (model size, data center location, energy mix, inference hardware) make per-session precision impossible. Instead, we provide an approximate estimate and frame the retirement as a "regenerative contribution," not a carbon offset. No neutrality claims. This is deliberate — it sidesteps the greenwashing critique entirely.

The credit inventory goes beyond carbon: biodiversity credits (Terrasos, Colombia), marine biodiversity stewardship, umbrella species habitat conservation, and grazing-based land stewardship. Projects span 9+ countries.

**Install** (Claude Code):
```
claude mcp add -s user regen-compute -- npx regen-compute
```

Works with any MCP-compatible client (Cursor, Windsurf, etc.). No wallet or API keys needed — credit card purchases work out of the box. For on-chain users, direct wallet retirement and cross-chain payment (USDC on Base, ETH on Arbitrum, etc.) are supported.

Open source (Apache-2.0): https://github.com/CShear/regen-compute

Paper references:
- Luccioni, A.S. et al. (2023). "Power Hungry Processing: Watts Driving the Cost of AI Deployment?" — arXiv:2311.16863
- IEA (2024). "Electricity 2024: Analysis and Forecast to 2026"

Interested in feedback on the estimation methodology — the heuristic approach is intentionally conservative, but there's room for improvement if better per-model energy data becomes available.

---

## 3. r/ClaudeAI

### Post Title

```
Built an MCP that lets Claude estimate and offset its own ecological footprint
```

### Body

I made an MCP server called **Regenerative Compute** that adds ecological accountability to Claude Code. One command to install:

```
claude mcp add -s user regen-compute -- npx regen-compute
```

No API keys, no wallet, no config. It just works.

Once installed, you can ask Claude things like:

- "What's the ecological footprint of this session?"
- "Show me what ecological credits are available on Regen Network"
- "Retire some credits to offset this session"
- "Get me a certificate for that retirement"

It connects to the Regen Network, a public blockchain for ecological credits. Every retirement is on-chain and verifiable — you get a permanent certificate with a transaction hash anyone can look up.

The footprint estimate is a heuristic (it's honest about being approximate), and the credits aren't just carbon — there's biodiversity, marine stewardship, and more from projects in 9+ countries.

You can pay with a credit card (no crypto needed), or if you're into that, configure a wallet for direct on-chain retirement or pay with USDC/ETH via cross-chain bridge.

It's open source: https://github.com/CShear/regen-compute

Would love to hear if anyone tries it out. Feedback welcome.

---

## 4. Twitter/X Thread

### Tweet 1 (Hook)

```
AI coding assistants are projected to consume over 1,000 TWh/year by 2026 — roughly Japan's entire electricity demand.

Most developers know this. Almost none can do anything about it from inside their workflow.

We built a tool that changes that. Thread:
```

### Tweet 2 (What it is)

```
Regenerative Compute is an MCP server that connects your AI assistant (Claude Code, Cursor, etc.) to verified ecological credit retirement on @raboretum's Regen Network.

One command to install. No API keys. No wallet. No config.

claude mcp add -s user regen-compute -- npx regen-compute
```

### Tweet 3 (How it works)

```
The workflow:

1. Estimate your session's ecological footprint
2. Browse live credit inventory (carbon, biodiversity, marine, and more)
3. Retire credits on-chain — credit card or crypto
4. Get a verifiable retirement certificate

Every retirement is an immutable on-chain transaction on Regen Ledger.
```

### Tweet 4 (What makes it different)

```
This is NOT "carbon offsetting."

We don't claim your session is carbon neutral. The footprint estimate is a heuristic — we're honest about the uncertainty.

What we DO provide: verified, permanent, on-chain proof that your AI session funded real ecological regeneration.

That's "regenerative contribution."
```

### Tweet 5 (The credits)

```
Credits available on Regen Network right now:

- Carbon removal (US, Kenya, Peru, Congo)
- Biodiversity conservation (Terrasos, Colombia)
- Marine ecosystem stewardship (Indonesia)
- Umbrella species habitat (Cambodia)
- Grazing-based land stewardship (UK, Australia)

~$2M+ in live inventory across 9+ countries.
```

### Tweet 6 (CTA)

```
Open source. Apache-2.0. TypeScript + Node.js.

GitHub: github.com/CShear/regen-compute
npm: npmjs.com/package/regen-compute
Blog: [BLOG_URL]

Works with @AnthropicAI Claude Code, Cursor, Windsurf, or any MCP client.

Try it. Retire a credit. Share the certificate.
```

### Tweet 7 (Vision — optional)

```
AI burns energy. That energy can fund ecological regeneration — not through guilt, but through verified on-chain proof of contribution.

Forests in Kenya. Biodiversity in Colombia. Marine ecosystems in Indonesia.

One command to install. Permanent proof of every retirement.

That's what Regenerative AI looks like.
```

---

## 5. Dev.to

### Title

```
How to Add Ecological Accountability to Your AI Workflow in One Command
```

### Tags

`#ai` `#opensource` `#sustainability` `#typescript`

### Body

Every time you use an AI coding assistant, it consumes energy. Data centers are projected to hit 1,000 TWh/year by 2026. If you use Claude Code or Cursor daily, your work has an ecological footprint.

Most "green AI" solutions fall into two buckets: corporate marketing claims with no proof, or traditional offset registries on private databases nobody can audit.

I built something different.

## Regenerative Compute

[Regenerative Compute](https://github.com/CShear/regen-compute) is an MCP (Model Context Protocol) server that connects your AI assistant to verified ecological credit retirement on [Regen Network](https://regen.network).

**MCP** is an open protocol that lets AI assistants call external tools. If you use Claude Code, Cursor, Windsurf, or any MCP-compatible client, you can install this with one command.

### Install (Claude Code)

```bash
claude mcp add -s user regen-compute -- npx regen-compute
```

### Install (Cursor / Windsurf / other MCP clients)

Add to your MCP config:

```json
{
  "mcpServers": {
    "regen-compute": {
      "type": "stdio",
      "command": "npx",
      "args": ["regen-compute"]
    }
  }
}
```

No API keys. No wallet. No configuration.

## What You Can Do

Once connected, ask your AI assistant:

- **"What's the ecological footprint of this session?"** — Returns an energy estimate (kWh), CO2 equivalent, and a suggested credit amount. Explicitly labeled as a heuristic.
- **"Show me available ecological credits"** — Pulls live inventory from Regen Network. Carbon, biodiversity, marine stewardship, umbrella species, and grazing credits from projects in 9+ countries.
- **"Retire some credits"** — Get a marketplace link (credit card, no crypto needed) or execute on-chain if you have a wallet configured.
- **"Get my retirement certificate"** — Returns project details, credits retired, and an on-chain transaction proof. Permanent, verifiable, shareable.

## Why "Regenerative Contribution" and Not "Carbon Offset"

The footprint estimate is approximate — we don't pretend to know your exact kWh. Different models, different data centers, different energy mixes. Precision at the session level is impossible.

So we frame it differently. We don't claim your session is "carbon neutral." We make a factual, verifiable claim: *your AI session funded the retirement of X ecological credits on Regen Network*. The retirement is on-chain, immutable, and anyone can verify it.

No greenwashing. Just verified contribution.

## Three Ways to Pay

1. **Credit card** (default) — Get a Regen Marketplace purchase link. No setup.
2. **Direct on-chain** — Configure a Regen wallet and retire in a single transaction.
3. **Any token, any chain** — Send USDC on Base, ETH on Arbitrum, or 50+ other tokens via ecoBridge.

## Get Started

```bash
claude mcp add -s user regen-compute -- npx regen-compute
```

Then ask: *"What's the ecological footprint of this session?"*

- **GitHub**: [github.com/CShear/regen-compute](https://github.com/CShear/regen-compute)
- **npm**: [npmjs.com/package/regen-compute](https://www.npmjs.com/package/regen-compute)
- **License**: Apache-2.0

Open source contributions welcome. Check the [issues](https://github.com/CShear/regen-compute/issues) for open tasks.

---

## 6. Claude Code Discord

### Message

Hey all — I built an MCP server called **Regenerative Compute** that adds ecological accountability to Claude Code.

Install:
```
claude mcp add -s user regen-compute -- npx regen-compute
```

It lets Claude estimate your session's ecological footprint, browse live ecological credits on Regen Network (carbon, biodiversity, marine, and more), retire them via credit card or on-chain, and get a verifiable retirement certificate.

Every retirement is an on-chain transaction — permanent and auditable. No wallet or API keys needed to get started.

Open source: https://github.com/CShear/regen-compute

Would appreciate any feedback if you try it out.

---

## 7. Cursor Forums

### Post Title

```
MCP Server: Ecological accountability for your AI sessions (Regenerative Compute)
```

### Body

I built an MCP server that works with Cursor to add ecological accountability to AI coding sessions.

**Add to your Cursor MCP config:**

```json
{
  "mcpServers": {
    "regen-compute": {
      "type": "stdio",
      "command": "npx",
      "args": ["regen-compute"]
    }
  }
}
```

No API keys or wallet needed.

**What it provides (7 tools):**

- `estimate_session_footprint` — Heuristic energy/CO2 estimate for your session
- `browse_available_credits` — Live ecological credit inventory from Regen Network
- `retire_credits` — Retire credits via credit card link or direct on-chain transaction
- `get_retirement_certificate` — On-chain verification of your retirement
- `get_impact_summary` — Network-wide ecological impact statistics
- `browse_ecobridge_tokens` — Supported tokens/chains for cross-chain payment
- `retire_via_ecobridge` — Pay with USDC, ETH, or 50+ tokens across 10+ blockchains

Credits include carbon, biodiversity (Colombia), marine stewardship (Indonesia), umbrella species (Cambodia), and grazing land stewardship (UK/Australia). Every retirement is an immutable on-chain transaction on Regen Ledger.

This is framed as "regenerative contribution," not carbon offsetting — the footprint estimate is honestly labeled as a heuristic, and we don't make neutrality claims.

- **GitHub**: https://github.com/CShear/regen-compute
- **npm**: https://www.npmjs.com/package/regen-compute
- **License**: Apache-2.0

Feedback welcome, especially on Cursor-specific UX.

---

## 8. Regen Discord / Forum

### Post Title

```
Regenerative Compute — A new demand engine for ecocredits via AI developers
```

### Body

Hi Regen community,

I built **Regenerative Compute** — an MCP (Model Context Protocol) server that connects AI coding assistants like Claude Code and Cursor directly to ecocredit retirement on Regen Ledger.

**Why this matters for the Regen ecosystem:**

AI developers are a massive, untapped demand-side audience for ecocredits. There are millions of developers using AI coding assistants daily, and data center energy consumption is projected to hit 1,000 TWh/year by 2026. Many of these developers care about sustainability but have no way to act on it inside their workflow.

Regenerative Compute puts ecocredit retirement one command away. Developers install the MCP, their AI assistant gains tools to estimate ecological footprint, browse live sell orders on Regen Marketplace, retire credits (via credit card or on-chain), and retrieve verifiable retirement certificates.

**What this means for REGEN:**

Every credit retirement through this tool is a real `MsgBuyDirect` with auto-retire on Regen Ledger. As adoption grows, this becomes a persistent demand engine for ecocredits — new outside capital flowing into the ecosystem from AI compute users who would never have found Regen Network otherwise.

The current marketplace has ~$2M+ in live inventory across carbon, BT (Terrasos biodiversity), USS (umbrella species), MBS (marine biodiversity), and KSH (grazing) credit types. The tool routes to the cheapest available sell orders automatically.

**Current status:**

- v0.3.0 live on npm (`npx regen-compute`)
- 7 tools including cross-chain payment via ecoBridge (USDC on Base, ETH on Arbitrum, etc.)
- Open source, Apache-2.0
- Subscription tiers (automated monthly batch retirements) coming next

**Links:**
- GitHub: https://github.com/CShear/regen-compute
- npm: https://www.npmjs.com/package/regen-compute
- Blog post: [BLOG_URL]

Would love feedback from the community, especially on which credit classes resonate most with the AI developer audience and any ideas for expanding the supply side.
