# Make Claude the First AI Assistant with Verified Ecological Accountability

> **A partnership proposal from Regen Network**
> Prepared: March 2026

---

## Slide 1 — Title

### Make Claude the First AI Assistant with Verified Ecological Accountability

A partnership proposal from Regen Network

*Regenerative Compute — the first MCP server for ecological accountability in AI workflows*

---

## Slide 2 — The Problem: AI's Ecological Footprint Has No Verifiable Solution

AI compute consumes real energy at growing scale:

- **1,000 TWh/year by 2026** — data centers are projected to consume roughly the electricity demand of Japan (IEA, 2024)
- **Doubling by 2030** — data center share of global electricity demand is on track to double within the decade
- **Regulatory pressure is arriving** — the EU AI Act introduces environmental reporting requirements; SEC climate disclosure rules affect AI infrastructure providers and heavy API users

Public scrutiny is intensifying. Luccioni et al. (2023) quantified the energy costs of large language models. Media coverage of AI's environmental footprint is persistent and growing. Developers and enterprises are aware of the problem.

**Yet no solution exists inside the AI workflow itself.**

The "green AI" landscape today:

| Approach | Limitation |
|----------|-----------|
| Corporate sustainability reports | Unverifiable claims in private databases |
| Traditional REC markets | Retirement claims impossible to independently audit |
| "Green API" marketing | No on-chain proof, no independent verification |
| Carbon offset purchases | Separate workflow, private registries, greenwashing litigation risk |

**The gap**: There is no tool that lives inside your AI assistant, connects to a verifiable public registry, and lets users fund real ecological regeneration with proof anyone can audit.

---

## Slide 3 — The Solution: Regenerative Compute

**Regenerative Compute is an MCP server that connects Claude to verified ecological credit retirement on Regen Network.** It is live on npm today (v0.3.0) and works with Claude Code right now.

One command to install:

```bash
claude mcp add -s user regen-compute -- npx regen-compute
```

No API keys. No wallet. No configuration required. It works immediately.

**What it provides:**

| Tool | Function |
|------|----------|
| `estimate_session_footprint` | Heuristic energy/CO2 estimate per AI session (clearly labeled as approximate) |
| `browse_available_credits` | Live marketplace inventory from Regen Ledger — real prices, real projects |
| `retire_credits` | On-chain retirement via wallet OR credit card marketplace link |
| `get_retirement_certificate` | On-chain verification — immutable, auditable, shareable |
| `get_impact_summary` | Network-level ecological impact statistics |
| `browse_ecobridge_tokens` | 50+ tokens across 10+ blockchains for cross-chain payment |
| `retire_via_ecobridge` | Retire credits using USDC, ETH, or other tokens on any supported chain |

**Key design decisions:**

- **"Regenerative contribution" framing** — we never claim "carbon neutral." We make factual, verifiable claims: "Your AI session funded the retirement of X verified ecological credits on Regen Network." This is legally defensible and immune to greenwashing criticism.
- **Heuristic footprint, not false precision** — MCP servers cannot see Claude's internal compute. We estimate based on session characteristics and label it clearly as approximate. This honesty is the differentiator.
- **Graceful degradation** — no wallet configured? Get a marketplace link. Wallet configured? On-chain retirement. Error? Fallback to link. The user is never stuck.

**Already proven end-to-end**: Real on-chain retirements have been executed via USDC on Base through the ecoBridge integration (tx `278B4A46...`, Regen Ledger block 25,725,290).

---

## Slide 4 — How It Works

The workflow has four steps, all inside Claude:

### Step 1 — Install

```bash
claude mcp add -s user regen-compute -- npx regen-compute
```

One command. Zero configuration. Works immediately.

### Step 2 — Estimate

Ask Claude: *"What's the ecological footprint of this session?"*

The tool returns an energy estimate (kWh), CO2 equivalent (kg), and a suggested credit retirement quantity. Clearly labeled as a heuristic approximation.

### Step 3 — Retire

Ask Claude: *"Retire credits to fund ecological regeneration."*

Three payment modes:
1. **Credit card** (default) — direct link to Regen Marketplace
2. **On-chain wallet** — single-transaction retirement via MsgBuyDirect
3. **Any token, any chain** — USDC on Base, ETH on Arbitrum, 50+ tokens via ecoBridge

### Step 4 — Certificate

Every retirement produces a permanent, verifiable certificate:
- Project funded (name, location, credit type)
- Credits retired (quantity, vintage)
- Beneficiary name
- On-chain transaction hash
- Shareable URL: `regen.network/certificate/[hash]`

**The user never leaves Claude.** The entire experience is native to the AI assistant.

**Five credit types available:**

| Type | What It Funds | Geography |
|------|---------------|-----------|
| Carbon (C) | Verified carbon removal and avoidance | US, Kenya, Peru, Indonesia, Congo, Cambodia |
| Biodiversity (BT) | Voluntary biodiversity conservation | Colombia (Terrasos) |
| Marine Biodiversity (MBS) | Marine ecosystem stewardship | Indonesia, Australia |
| Umbrella Species (USS) | Habitat conservation via umbrella species | Multiple regions |
| Kilo-Sheep-Hour (KSH) | Grazing-based land stewardship | UK |

This is ecological regeneration — not just carbon accounting.

---

## Slide 5 — Traction and Market Readiness

### What is live today

- **npm v0.3.0 published** — installable via `npx regen-compute`
- **[PLACEHOLDER]** npm downloads to date
- **[PLACEHOLDER]** on-chain retirements executed through the MCP
- **End-to-end cross-chain retirement proven** — Base USDC to Regen Ledger retirement, verified on-chain
- **8-platform install support** — Claude Code, Cursor, VS Code, Windsurf, JetBrains, Gemini CLI, and any MCP-compatible client
- **Open source** under Apache-2.0 — fully auditable, no black box

### Marketplace inventory

| Credit Type | Available | Price Range | Value |
|-------------|-----------|-------------|-------|
| Carbon (C02, C03, C06) | ~1,851 credits | $3.95–$45 | ~$30K–$83K |
| Umbrella Species (USS) | ~73,936 credits | ~$24–$36 | ~$1.8M–$2.7M |
| Biodiversity (BT01) | ~7,397 credits | ~$25 | ~$185K |
| **Total** | **~83,000+ credits** | | **~$2.0M–$2.9M** |

13 credit classes. 58 projects. 78 credit batches. 9+ countries. Enough inventory to serve tens of thousands of users.

### Regen Network on-chain (cumulative)

- ~6.1 million credits issued
- ~1.4 million credits retired (~23% retirement rate)
- Purpose-built ecological credit blockchain, operational since 2017

---

## Slide 6 — The Ask: Three Partnership Tiers

### Tier 1 — Feature Regenerative Compute in Claude's MCP Ecosystem

**Anthropic effort: Near zero.**

- List Regenerative Compute in Claude's recommended MCP servers / connector marketplace
- Include in "featured" or "sustainability" category
- Optional: mention in a blog post or changelog

**What Anthropic gets**: Sustainability narrative. "Claude is the first AI assistant with a verified ecological accountability integration." Defensible claim, zero engineering.

**What Regen gets**: Distribution to Claude's user base.

---

### Tier 2 — Native "Regenerative AI" Toggle in Claude Pro Settings

**Anthropic effort: Settings UI + MCP auto-configuration.**

- Add a "Regenerative AI" toggle in Claude Pro/Team account settings
- When enabled, Claude auto-configures the Regenerative Compute MCP and periodically surfaces footprint estimates and retirement opportunities
- Optional subscription upsell: "Add ecological accountability for $2.50-$15/month"
- Revenue share on subscription tier revenue

**What Anthropic gets**: A differentiated product feature no competitor has. Recurring sustainability-linked revenue. A defensible answer to "what is Anthropic doing about AI's environmental footprint?"

**What Regen gets**: Native distribution, subscription volume, category validation.

---

### Tier 3 — Per-API-Call Ecological Fee for Enterprise Customers

**Anthropic effort: Billing integration + enterprise ESG dashboard.**

- Automatic ecological credit retirement scaled to enterprise API usage
- Configurable: percentage of API spend allocated to ecological contribution
- White-label ESG reporting: "In Q1 2026, [Enterprise] funded the retirement of X verified ecological credits through their Claude API usage"
- Revenue share on retirement volume

**What Anthropic gets**: Enterprise differentiation. ESG compliance feature that enterprise procurement teams actively seek. New revenue stream. Deepens enterprise lock-in.

**What Regen gets**: Enterprise-scale retirement volume. The demand-side flywheel at full power.

---

Each tier escalates Anthropic's commitment — and their defensibility in the "Regenerative AI" category.

---

## Slide 7 — Revenue Model and Opportunity

### Subscription tiers (B2C)

| Tier | Price | Credits/month | AI sessions covered |
|------|-------|---------------|---------------------|
| Seedling | $2.50/mo | ~0.5 carbon | ~30–50 |
| Grove | $7/mo | ~1.5 carbon | ~80–125 |
| Forest | $15/mo | ~3 carbon | ~160–250 |

### Revenue allocation

| Allocation | Percentage | Purpose |
|------------|-----------|---------|
| Credit purchases | 85% | Funds verified ecological regeneration |
| REGEN buy-and-burn | 5% | Protocol-level value accrual |
| Operations | 10% | Service maintenance, support, Stripe fees |

### Market sizing

- Claude has millions of active users ([PLACEHOLDER] for exact subscriber count)
- At 1% conversion to Seedling ($2.50/mo): [PLACEHOLDER] subscribers = [PLACEHOLDER] MRR
- At 0.5% conversion to Grove ($7/mo): [PLACEHOLDER] subscribers = [PLACEHOLDER] MRR
- Enterprise API customers represent much higher per-account value ($500–$5,000/mo depending on API spend)

### Revenue share opportunity

Anthropic revenue share is negotiable across all tiers:
- Tier 1: No direct revenue; narrative and brand value
- Tier 2: Percentage of subscription revenue (e.g., 20–30% of MCP-facilitated subscriptions)
- Tier 3: Percentage of enterprise ecological retirement revenue

### The competitive advantage

**Anthropic becomes the only AI platform with verified, on-chain ecological accountability.** This is not a marketing claim — it is a structural fact. No competitor offers this today. The first to integrate owns the "Regenerative AI" category.

---

## Slide 8 — Why Now

### The MCP ecosystem is defining its categories

MCP is early. The servers that become "default" now will be default forever. Regenerative Compute is the only ecological accountability MCP in existence. Featuring it now costs Anthropic nothing and claims the category.

### "Regenerative AI" is unclaimed

No AI company has claimed this term or this positioning. The first to do so — with a verifiable, on-chain product backing the claim — owns it. This is a narrow window.

### Regulation is arriving

- **EU AI Act**: Environmental reporting requirements for high-risk AI systems
- **SEC climate disclosure**: Affects companies with significant compute infrastructure
- **FTC greenwashing enforcement**: Traditional offset claims face increasing scrutiny

On-chain retirement is the strongest possible defense against greenwashing allegations. The proof is public, immutable, and independently verifiable.

### Competitor risk

If Cursor, OpenAI, or Google adds ecological features to their AI platforms first, Anthropic loses the narrative advantage. The cost of acting later is the loss of category ownership.

### The product is live today

This is not a proposal for future work. Regenerative Compute is published on npm, works with Claude Code, and has executed real on-chain retirements. The ask is partnership around a working product — not investment in a concept.

### Credit supply is ready

$2M+ in purchasable ecological credits across 5 types, 13 classes, and 9+ countries. Supply pipeline development is underway for soil carbon, biochar, mangrove, and kelp credits to support scale.

---

## Slide 9 — Team and Contact

### Regen Network

Regen Network has been building purpose-built infrastructure for ecological credits since 2017. The Regen Ledger is a Cosmos SDK blockchain designed specifically for ecological asset issuance, transfer, and retirement.

**On-chain track record:**
- 13 credit classes spanning 5 ecological credit types
- 58 projects across 9+ countries
- 78 credit batches issued
- ~6.1 million credits issued to date
- ~1.4 million credits retired on-chain (~23% retirement rate)
- Credit card purchase rails live on Regen Marketplace

**Technical capabilities:**
- Cosmos SDK and CosmWasm smart contract development
- MCP server development and deployment
- Ecological credit domain expertise (methodology development, registry operations)
- Cross-chain integration via ecoBridge (EVM chains, Solana)

### Contact

- **[PLACEHOLDER]**: Name, title
- **Email**: [PLACEHOLDER]
- **GitHub**: [github.com/CShear/regen-compute](https://github.com/CShear/regen-compute)
- **npm**: [npmjs.com/package/regen-compute](https://www.npmjs.com/package/regen-compute)
- **Regen Network**: [regen.network](https://regen.network)

---

---

# One-Page Partnership Overview: Regenerative Compute x Anthropic

## What It Is

Regenerative Compute is a live MCP server (npm v0.3.0) that adds verified ecological accountability to Claude. Users estimate their AI session's footprint, browse ecological credits on Regen Network, retire them on-chain, and receive a permanent, shareable certificate — all without leaving Claude.

## The Opportunity

**Own "Regenerative AI" before anyone else does.** No AI platform has verified, on-chain ecological accountability. The first to integrate it defines the category. Regenerative Compute is built, tested, and working with Claude Code today.

## What Already Works

- 7 MCP tools: footprint estimation, credit browsing, on-chain retirement, certificate retrieval, cross-chain payment
- $2M+ in ecological credits available: carbon, biodiversity, marine, umbrella species, grazing — projects in 9+ countries
- Three payment modes: credit card, on-chain wallet, any token on any chain (50+ tokens via ecoBridge)
- Real on-chain retirements executed and verified
- 8-platform install support, open source (Apache-2.0)

## Three Partnership Tiers

1. **Feature in MCP marketplace** — Zero engineering. Anthropic gets sustainability narrative. Regen gets distribution.
2. **Native "Regenerative AI" toggle in Claude Pro** — Settings UI integration. Revenue share on subscriptions. Anthropic gets a differentiated feature.
3. **Per-API-call ecological fee for enterprise** — Billing integration. White-label ESG reporting. Anthropic gets enterprise differentiation and new revenue.

## Revenue Potential

- Subscription tiers: $2.50–$15/month per user (85% goes to credit purchases, revenue share negotiable)
- Enterprise: Custom pricing based on API spend (higher per-account value)
- At 1% Claude Pro conversion: significant recurring revenue with zero marginal cost to Anthropic

## Why Act Now

- MCP ecosystem is early — categories are being defined now
- EU AI Act environmental reporting requirements are arriving
- Competitors (OpenAI, Google, Cursor) could claim the category first
- The product is live today — this is a partnership around a working product, not a concept

## Next Steps

Schedule a 30-minute demo. See the full workflow running in Claude Code — from footprint estimation to on-chain retirement to verifiable certificate.

**Contact**: [PLACEHOLDER]
