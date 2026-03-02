# Verified Ecological Accountability for Enterprise AI

> **On-chain proof. Real projects. Zero greenwashing risk.**
> Regen for AI — Enterprise Sales Deck
> March 2026

---

## Slide 1 — Title

### Verified Ecological Accountability for Enterprise AI

On-chain proof. Real projects. Zero greenwashing risk.

*Regen for AI — powered by Regen Network*

---

## Slide 2 — The Problem: AI's Ecological Footprint Is a Reporting Liability

Enterprise AI usage is growing. So is the scrutiny.

**The energy reality:**
- Data centers are projected to consume **1,000 TWh annually by 2026** — roughly the electricity demand of Japan (IEA, 2024)
- Data center share of global electricity demand is projected to **double by 2030**
- Every API call to a large language model consumes measurable energy

**The regulatory reality:**
- **EU AI Act** introduces environmental reporting requirements for AI systems
- **SEC climate disclosure rules** affect companies with significant compute infrastructure
- **EU CSRD** (Corporate Sustainability Reporting Directive) requires detailed environmental impact disclosures
- **FTC greenwashing enforcement** is intensifying — traditional offset claims face legal risk

**The credibility gap:**

Most enterprise "green AI" initiatives rely on:

| Current Approach | Risk |
|-----------------|------|
| Corporate sustainability reports | Self-reported claims in private databases — no independent verification |
| Traditional carbon offset purchases | Private registries, opaque retirement claims, growing litigation exposure |
| Renewable Energy Certificates (RECs) | Cannot be independently audited; no public proof of retirement |
| "Carbon neutral" marketing claims | FTC scrutiny, shareholder lawsuits, reputational damage |

**The result**: Enterprises face a compliance and reputational gap. They use AI at scale, know it has an ecological footprint, and have no verifiable way to demonstrate accountability.

---

## Slide 3 — The Solution: Regen for AI

Regen for AI connects your enterprise AI usage to verified ecological credit retirement on Regen Network — a public blockchain purpose-built for ecological assets.

**What makes it different:**

- **Every retirement is on a public blockchain.** Not a private database. Not a marketing dashboard. An immutable, publicly auditable record that any third party — auditor, regulator, shareholder — can independently verify.

- **"Regenerative contribution" — not "carbon offset."** We make factual claims only: "Your enterprise funded the retirement of X verified ecological credits on Regen Network." This is a verifiable on-chain fact. We never claim equivalence, neutrality, or offset. This framing eliminates greenwashing risk by design.

- **Multi-credit ecological portfolio.** Carbon is only one dimension. Regen Network hosts five credit types — carbon, biodiversity, marine biodiversity, umbrella species stewardship, and grazing — from projects in 9+ countries. This is ecological regeneration, not just carbon accounting.

- **No crypto knowledge required.** Credit card payments work out of the box. Enterprise invoicing available. Your team never touches a wallet, manages keys, or interacts with blockchain directly.

- **Approximate footprint, honest methodology.** We estimate AI compute energy using heuristics, clearly labeled as approximations. We never claim false precision. This honesty is a strength — it is exactly what separates verifiable contribution from unsubstantiated marketing claims.

---

## Slide 4 — How It Works: Enterprise Integration

### Two integration paths

**Path 1 — MCP Server (for developer teams)**

Install in your team's AI coding environment with a single command:

```bash
claude mcp add -s user regen-for-ai -- npx regen-for-ai
```

Zero configuration. Developers can immediately estimate session footprints, browse credits, and retire via credit card or on-chain wallet. Works with Claude Code, Cursor, VS Code, Windsurf, JetBrains, and any MCP-compatible client.

**Path 2 — REST API (for programmatic integration)**

Tie ecological retirement directly to your AI API usage metrics:

```
POST /retire
Authorization: Bearer <api_key>
{
  "credit_type": "carbon",
  "quantity": 5.0,
  "beneficiary": "Acme Corp",
  "retirement_reason": "Q1 2026 AI API ecological contribution"
}
```

Returns: retirement certificate with on-chain transaction hash, project details, and shareable URL.

### Enterprise workflow

```
Your AI Infrastructure (API calls, sessions, compute hours)
    |
    | Usage metrics
    v
Regen for AI Service
    |
    |-- Estimate footprint (heuristic, labeled as approximate)
    |-- Select credits (by type, geography, project preference)
    |-- Execute retirement (on-chain, non-reversible)
    |-- Generate certificate (verifiable, shareable)
    |
    v
On-Chain Retirement on Regen Ledger
    |
    v
Certificate + Impact Report --> Your ESG Dashboard
```

### Enterprise controls

- Set monthly retirement budget
- Choose credit type preferences (carbon, biodiversity, mixed portfolio)
- Configure retirement frequency (per-session, daily batch, monthly batch)
- Set beneficiary name and retirement reason per batch
- Receive webhook notifications for every retirement event

---

## Slide 5 — The Compliance Advantage: On-Chain Verification

### Traditional offset registries vs. Regen Network

| Dimension | Traditional Offset Registry | Regen Network (On-Chain) |
|-----------|---------------------------|--------------------------|
| **Data storage** | Private database | Public blockchain |
| **Verification** | Self-reported, registry-controlled | Independently verifiable by anyone |
| **Audit trail** | Opaque; requires registry cooperation | Transparent; open to any third party |
| **Permanence** | Database can be modified | Immutable; retirements are non-reversible |
| **Double-counting risk** | Depends on registry integrity | Cryptographically impossible on-chain |
| **Greenwashing defense** | "We bought offsets" (unverifiable claim) | "Here is the transaction hash" (verifiable fact) |
| **Auditor access** | Requires data request to registry | Direct public access to ledger state |

### What a retirement certificate contains

Every on-chain retirement produces a permanent record with:

- **Project name and location** — the specific ecological project funded
- **Credit type** — carbon, biodiversity, marine, umbrella species, or grazing
- **Credit quantity** — exact number of credits retired
- **Credit vintage** — the time period the credits represent
- **Beneficiary** — your company name, permanently associated with the retirement
- **Retirement reason** — your stated purpose (e.g., "Q1 2026 AI compute ecological contribution")
- **Transaction hash** — the on-chain proof, verifiable by anyone
- **Shareable URL** — `regen.network/certificate/[hash]` — embeddable in reports

### The auditor conversation

With traditional offsets: *"We purchased carbon offsets from [registry]. Here is our purchase receipt."* The auditor must trust the registry.

With Regen: *"We retired ecological credits on Regen Network. Here is the transaction hash: [hash]. You can verify it independently on the public ledger at any time."* The auditor trusts mathematics, not a private company.

---

## Slide 6 — Credit Portfolio: Ecological Diversity Beyond Carbon

Regen Network hosts five types of verified ecological credits, spanning multiple methodologies and geographies:

### Available credit types

| Credit Type | Description | Available Inventory | Price Range |
|-------------|-------------|---------------------|-------------|
| **Carbon (C)** | Verified carbon removal and avoidance — forest conservation, avoided deforestation, soil carbon | ~1,851 credits | $3.95–$45/credit |
| **Biodiversity (BT)** | Voluntary biodiversity conservation — habitat preservation, species protection (Terrasos methodology) | ~7,397 credits | ~$25/credit |
| **Marine Biodiversity (MBS)** | Marine ecosystem stewardship — reef and coastal habitat protection | Included in portfolio | Market price |
| **Umbrella Species (USS)** | Habitat conservation via umbrella species protection — preserving ecosystems through keystone species | ~73,936 credits | ~$24–$36/credit |
| **Kilo-Sheep-Hour (KSH)** | Grazing-based land stewardship — regenerative grazing practices for soil health | Included in portfolio | Market price |

### Geographic diversity

Projects across **9+ countries**: United States, Kenya, Peru, Indonesia, Democratic Republic of the Congo, Cambodia, United Kingdom, Australia, Colombia.

### Total marketplace

- **~83,000+ credits** available for purchase
- **~$2.0M–$2.9M** total marketplace value
- **13 credit classes** spanning **5 credit types**
- **58 projects** across **78 credit batches**

### Why multi-credit matters for enterprise

- **Narrative strength**: "We fund ecological regeneration" is more comprehensive than "we buy carbon offsets"
- **Supply resilience**: Multiple credit types reduce dependence on any single category
- **Reporting richness**: ESG disclosures can reference biodiversity, marine, and species conservation — not just carbon
- **Stakeholder appeal**: Employees, customers, and investors respond to ecological breadth — forests AND marine ecosystems AND biodiversity

---

## Slide 7 — ESG Reporting: Verifiable Claims for Every Disclosure

### The reporting problem

Enterprise ESG reports are under increasing scrutiny. Vague sustainability claims are liabilities. Regulators, auditors, and shareholders demand specificity and verifiability.

### What Regen for AI provides for your ESG reporting

**Automated monthly impact reports** containing:
- Total credits retired (by type, project, and geography)
- Total estimated ecological contribution
- On-chain transaction references for every retirement
- Beneficiary attribution (your company name on every certificate)
- Year-to-date cumulative impact

**Verifiable claim language for disclosures:**

> "In Q1 2026, [Company Name] funded the retirement of 150 verified ecological credits on Regen Network, spanning carbon removal, biodiversity conservation, and marine stewardship projects across 6 countries. Each retirement is independently verifiable on the Regen Ledger, a public blockchain purpose-built for ecological assets."

Every word of this statement is factual and on-chain verifiable. No qualification needed. No greenwashing risk.

### Alignment with reporting frameworks

| Framework | How Regen for AI supports it |
|-----------|------------------------------|
| **GRI Standards** | On-chain data feeds directly into GRI 305 (Emissions) and GRI 304 (Biodiversity) disclosures |
| **CDP** | Verifiable credit retirement data for CDP climate and forests questionnaires |
| **TCFD** | Supports "Metrics and Targets" pillar with auditable ecological contribution data |
| **EU CSRD** | Provides independently verifiable environmental impact data for double materiality assessments |
| **SEC Climate Rules** | On-chain proof strengthens disclosure accuracy and reduces material misstatement risk |

### Certificate URLs in annual reports

Every retirement certificate has a permanent, shareable URL. Embed these directly in sustainability reports, investor presentations, and regulatory filings. Auditors can click through and verify independently.

---

## Slide 8 — Traction and Social Proof

### Product readiness

- **npm v0.3.0** published and installable today via `npx regen-for-ai`
- **8-platform support**: Claude Code, Cursor, VS Code, Windsurf, JetBrains, Gemini CLI, and any MCP-compatible client
- **End-to-end cross-chain retirement proven**: USDC on Base -> ecoBridge -> Regen Ledger retirement (verified on-chain)
- **Open source** under Apache-2.0 — your security team can audit every line

### Adoption metrics

- **[PLACEHOLDER]** total npm downloads
- **[PLACEHOLDER]** on-chain retirements executed through the MCP
- **[PLACEHOLDER]** total credits retired via the service
- **[PLACEHOLDER]** enterprise pilot participants

### Regen Network on-chain track record

| Metric | Value |
|--------|-------|
| Years operational | 8+ (since 2017) |
| Credit classes | 13 |
| Projects | 58 |
| Credit batches | 78 |
| Credits issued (cumulative) | ~6.1 million |
| Credits retired (cumulative) | ~1.4 million (~23% retirement rate) |
| Countries represented | 9+ |
| Credit types | 5 (Carbon, Biodiversity, Marine, Umbrella Species, Grazing) |

### Case studies

**[PLACEHOLDER] — Case Study 1**

> [Company Name], a [industry] company with [X] monthly Claude API calls, integrated Regen for AI in [month]. Over [X] months, they retired [X] ecological credits across [X] projects in [X] countries. Their Q[X] sustainability report cited on-chain retirement certificates as evidence of ecological contribution — the first time their ESG disclosures referenced independently verifiable, blockchain-based proof.

**[PLACEHOLDER] — Case Study 2**

> [Company Name], a developer tools company, deployed Regen for AI across their engineering team of [X] developers. Monthly ecological contribution became part of their team culture. [X] individual retirement certificates were shared on social media, generating [X] impressions and direct inquiries from [X] prospective customers about their sustainability practices.

---

## Slide 9 — Pricing

### Enterprise pricing philosophy

Pricing is custom, designed around your AI usage profile and ecological contribution goals. There is no one-size-fits-all tier — we scope each engagement to deliver meaningful impact within your budget.

### Pricing dimensions

| Factor | How it affects pricing |
|--------|----------------------|
| **Monthly AI API spend** | Base metric for sizing ecological contribution |
| **Desired retirement volume** | More credits = volume discounts on per-credit pricing |
| **Credit type preferences** | Carbon credits are priced differently from biodiversity or marine |
| **Reporting requirements** | Standard monthly reports included; custom dashboards and integrations priced separately |
| **Attribution requirements** | Per-team or per-project attribution available |

### Example scenarios

| Scenario | Monthly AI Spend | Ecological Allocation | Credits Retired/Month | Annual Value |
|----------|-----------------|----------------------|----------------------|--------------|
| **Starter** | $5K–$25K | 1% of API spend | [PLACEHOLDER] | [PLACEHOLDER] |
| **Growth** | $25K–$100K | 1–2% of API spend | [PLACEHOLDER] | [PLACEHOLDER] |
| **Enterprise** | $100K+ | Custom | [PLACEHOLDER] | [PLACEHOLDER] |

### What is included in every tier

- Retirement execution on Regen Ledger (on-chain, non-reversible)
- Certificate generation for every retirement batch
- Monthly impact report (credits retired, projects funded, geographies covered)
- Dedicated support contact
- API access for programmatic retirement
- Webhook notifications for retirement events

### Contract structure

- **Annual contracts** with quarterly retirement batches (standard)
- **Monthly contracts** available for pilot engagements
- **90-day pilot program**: [PLACEHOLDER] credits included, full reporting, no long-term commitment

All pricing includes the full service — there are no hidden fees for retirement execution, certificate generation, or reporting.

---

## Slide 10 — Integration Architecture

### System overview

```
┌─────────────────────────────────────────────────────────┐
│                Your Enterprise Infrastructure            │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ AI API Usage  │   │ Developer    │   │ ESG / Ops   │ │
│  │ (Claude,     │   │ Teams        │   │ Dashboard   │ │
│  │  GPT, etc.)  │   │ (Claude Code,│   │             │ │
│  │              │   │  Cursor)     │   │             │ │
│  └──────┬───────┘   └──────┬───────┘   └──────┬──────┘ │
│         │                  │                   │        │
└─────────┼──────────────────┼───────────────────┼────────┘
          │                  │                   │
          │ REST API         │ MCP Protocol      │ Reports
          │                  │                   │
┌─────────┼──────────────────┼───────────────────┼────────┐
│         v                  v                   v        │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Regen for AI Service                   │    │
│  │                                                  │    │
│  │  Footprint Estimation    Credit Selection        │    │
│  │  Order Routing           Retirement Execution    │    │
│  │  Certificate Generation  Impact Reporting        │    │
│  └──────────────────────┬───────────────────────────┘    │
│                         │                                │
│         Regen for AI    │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
                          v
              ┌───────────────────────┐
              │    Regen Network      │
              │    (Public Ledger)    │
              │                      │
              │  On-chain retirement  │
              │  Certificate records  │
              │  Transaction proofs   │
              └───────────────────────┘
```

### Integration options

| Method | Setup Time | Best For |
|--------|-----------|----------|
| **MCP Server** | 1 minute | Developer teams using Claude Code, Cursor, or other MCP clients |
| **REST API** | 5 minutes | Programmatic integration with existing infrastructure, usage-based retirement |
| **Webhook notifications** | 10 minutes | Real-time retirement event feeds into internal systems |
| **Monthly CSV/JSON export** | Zero setup | ESG reporting teams who need structured data for disclosures |

### REST API capabilities

| Endpoint | Function |
|----------|----------|
| `POST /retire` | Execute retirement with specified credit type, quantity, and beneficiary |
| `GET /certificates/{hash}` | Retrieve certificate details for a specific retirement |
| `GET /credits/available` | Browse current marketplace inventory and pricing |
| `GET /impact/summary` | Get aggregate impact statistics |
| `GET /reports/monthly` | Download monthly impact report |

### Security and compliance

- API key authentication (rotate via dashboard)
- All transactions are retirements — non-reversible by design (this is a feature, not a bug)
- No wallet management required on your end
- No sensitive financial data stored — credit card processing handled by Regen Marketplace
- Open source codebase — auditable by your security team
- SOC 2 compliance: [PLACEHOLDER — in progress / planned]

---

## Slide 11 — Why Regen Network

### Purpose-built for ecological credits

Regen Network is not a generic blockchain with ecological features added on. It is a Cosmos SDK blockchain designed from the ground up — since 2017 — for ecological asset issuance, transfer, and retirement.

**What this means for enterprise:**

- **Domain-specific primitives**: Credit classes, project metadata, retirement with beneficiary attribution, and certificate generation are native protocol features — not smart contract add-ons
- **8+ years of operation**: Proven infrastructure with real credit issuances and retirements
- **Regulated credit methodologies**: Credits are issued under specific, auditable methodologies (not self-certified)
- **Fiat purchase rails**: Credit card purchasing is live on Regen Marketplace. Your team never touches cryptocurrency.
- **Cross-chain flexibility**: ecoBridge integration supports 50+ tokens across 10+ blockchains (Ethereum, Base, Polygon, Arbitrum, Optimism, Celo, Solana, and more) for organizations that prefer crypto payment
- **Growing credit supply**: Active pipeline for new project developers and methodologies — soil carbon, biochar, mangrove, kelp

### On-chain retirement is permanent

When credits are retired on Regen Ledger, they are permanently removed from circulation. This is not a database entry that can be modified — it is a cryptographic state change on a public blockchain. The retirement is:

- **Immutable** — cannot be altered after the fact
- **Non-reversible** — retired credits cannot be "un-retired"
- **Publicly verifiable** — anyone with internet access can confirm the retirement
- **Permanently attributed** — your company name is recorded on-chain as the beneficiary

This is the strongest form of ecological contribution proof available today.

---

## Slide 12 — Next Steps

### Start with a conversation

We scope every enterprise engagement to your AI usage profile, ecological contribution goals, and reporting requirements. The first step is a 30-minute demo where we walk through:

1. The full workflow running in Claude Code (install to retirement to certificate)
2. The REST API integration for programmatic retirement
3. A sample monthly impact report
4. The on-chain verification experience (from certificate URL to ledger proof)

### Pilot program

- **Duration**: 90 days
- **Includes**: [PLACEHOLDER] ecological credits for retirement
- **Full reporting**: Monthly impact reports, certificate generation, webhook integration
- **No long-term commitment** — evaluate the product and the proof before scaling
- **Outcome**: Verifiable retirement data for your next ESG disclosure cycle

### Contact

- **[PLACEHOLDER]**: Name, title, email
- **Schedule a demo**: [PLACEHOLDER — Calendly or booking link]
- **Phone**: [PLACEHOLDER]

### Resources

- **GitHub**: [github.com/CShear/regen-for-ai](https://github.com/CShear/regen-for-ai) (open source, Apache-2.0)
- **npm**: [npmjs.com/package/regen-for-ai](https://www.npmjs.com/package/regen-for-ai)
- **Regen Network**: [regen.network](https://regen.network)
- **Regen Marketplace**: [app.regen.network](https://app.regen.network)
- **API Documentation**: [PLACEHOLDER]

---

*Your AI compute can fund verified ecological regeneration. Every retirement is on-chain, immutable, and independently verifiable. That is not a marketing claim — it is a mathematical fact.*

---

*Regen for AI is published on [npm](https://www.npmjs.com/package/regen-for-ai) as v0.3.0. Powered by [Regen Network](https://regen.network). Licensed Apache-2.0.*
