# Regen for AI — Outreach Research

> **Date**: March 1, 2026
> **Covers**: GitHub Issues #27 (AI Platform Outreach), #26 (Conferences & Podcasts), #16 (Carbon API Aggregators)
> **Product**: Regen for AI — MCP server for ecological accountability in AI workflows
> **Status**: Research complete. Ready for outreach execution.

---

## Part A: AI Platform Outreach Strategy (Issue #27)

### Platform Analysis

#### 1. GitHub Copilot — HIGHEST PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | MCP (native). Copilot Chat supports local and remote MCP servers across VS Code, JetBrains, Xcode, and Copilot CLI (GA Feb 25, 2026). |
| **Technical requirements** | stdio MCP server (already supported by `regen-for-ai`). Remote MCP via Streamable HTTP also supported. |
| **User base** | 30M+ developers. Largest AI coding assistant by install base. |
| **Values alignment** | Medium. GitHub has sustainability messaging but no ecological accountability features. |
| **Ease of integration** | HIGH — MCP already works. User adds server config to `.vscode/mcp.json` or global settings. Already documented in our README. |
| **Discovery** | GitHub MCP Registry — curated list of MCP servers. Listing `regen-for-ai` here would be a major distribution win. |
| **Contact path** | Submit to GitHub MCP Registry. Copilot extensions team via GitHub partnerships. |
| **Outreach priority** | **P0** — Registry listing is the single highest-leverage distribution action. |

#### 2. OpenAI / ChatGPT — HIGH PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | Dual path: (1) MCP via OpenAI Agents SDK and Codex CLI (adopted March 2025), (2) GPT Actions via OpenAPI spec for ChatGPT web app. |
| **Technical requirements** | MCP path: stdio server works with Agents SDK and Codex. GPT Actions path: requires HTTP endpoint serving OpenAPI spec — our MCP server would need an HTTP transport wrapper. |
| **User base** | 200M+ ChatGPT users, plus growing Codex CLI user base. |
| **Values alignment** | Medium. OpenAI has published on AI energy costs but no ecological product. |
| **Ease of integration** | MCP path: HIGH (already works with Codex CLI). GPT Actions path: MEDIUM (needs HTTP transport, which is on our roadmap). |
| **Key development** | Assistants API sunset mid-2026 — entire OpenAI ecosystem migrating to MCP-based architectures. Validates our MCP-first approach. |
| **Contact path** | OpenAI developer relations. GPT Store submission for ChatGPT web. |
| **Outreach priority** | **P1** — MCP path works now via Codex; GPT Actions path needs HTTP transport. |

#### 3. Amazon Q Developer — HIGH PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | MCP (native). Supported in IDE plugins (VS Code, JetBrains) and Q Developer CLI since April 2025. |
| **Technical requirements** | stdio transport supported. Global or workspace-scoped MCP configuration. |
| **User base** | Large — entire AWS developer ecosystem. Strong enterprise presence. |
| **Values alignment** | Medium-High. AWS has Climate Pledge and sustainability programs. |
| **Ease of integration** | HIGH — stdio MCP server already works. Configuration via `.amazonq/mcp.json`. |
| **Contact path** | AWS DevOps blog accepts guest posts. AWS partner network for marketplace listing. |
| **Outreach priority** | **P1** — Enterprise distribution channel. Already works technically. |

#### 4. Windsurf (Codeium) — HIGH PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | MCP (native). Cascade integrates MCP natively with MCP Marketplace for one-click installs. |
| **Technical requirements** | Supports stdio, Streamable HTTP, SSE, and OAuth. 21+ third-party tools already integrated. |
| **User base** | Growing rapidly. AI-native developer audience — exactly our target. |
| **Values alignment** | Medium. Developer-focused, innovation-oriented. |
| **Ease of integration** | HIGHEST — MCP Marketplace enables one-click install. Submit `regen-for-ai` to Marketplace. |
| **Contact path** | Windsurf MCP Marketplace submission. Already documented in our README. |
| **Outreach priority** | **P1** — Marketplace listing is low-effort, high-distribution. |

#### 5. Google Gemini — MEDIUM PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | Gemini CLI Extensions (MCP-compatible "playbooks"). Open ecosystem — extensions published freely. |
| **Technical requirements** | CLI: MCP server works now. Web app: requires HTTP transport or Gemini-specific extension format. |
| **User base** | Massive (Google scale). Gemini CLI is newer but growing. |
| **Values alignment** | High. Google has strong sustainability commitments and carbon-free energy goals. |
| **Ease of integration** | CLI: HIGH (already works, documented in README). Web app: LOW (different extension system). |
| **Contact path** | Gemini CLI extensions directory. Google developer relations for deeper integration. |
| **Outreach priority** | **P2** — CLI already works. Web app integration can wait for HTTP transport. |

#### 6. Mistral AI — MEDIUM PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | MCP via Agents API and Python SDK. Supports custom MCP servers. |
| **Technical requirements** | MCP server works. Mistral's SDK handles MCP client integration. |
| **User base** | Growing, particularly strong in EU market. Enterprise-focused. |
| **Values alignment** | Medium. French company, EU sustainability regulations create alignment. |
| **Ease of integration** | MEDIUM — works via SDK but no marketplace or one-click install. |
| **Contact path** | Mistral developer documentation. Community contributions. |
| **Outreach priority** | **P2** — Works technically. Lower user base than top-tier platforms. |

#### 7. Sourcegraph Cody — MEDIUM PRIORITY

| Attribute | Detail |
|-----------|--------|
| **Integration path** | MCP via agentic context gathering. Local MCP server configuration. |
| **Technical requirements** | stdio MCP server works. Configure via extension settings. |
| **User base** | Enterprise-focused. Strong among large engineering orgs. |
| **Values alignment** | Medium. Developer productivity focus, not sustainability-oriented. |
| **Ease of integration** | MEDIUM — works but requires manual configuration. |
| **Contact path** | Sourcegraph community, extension marketplace. |
| **Outreach priority** | **P2** — Enterprise channel. Lower volume but higher-value accounts. |

#### 8. Perplexity — LOW PRIORITY (WATCH)

| Attribute | Detail |
|-----------|--------|
| **Integration path** | No direct MCP or plugin system yet. Has Search API and new "Computer" platform (Feb 2026). |
| **Technical requirements** | No clear integration path today. |
| **User base** | Growing rapidly. Consumer-focused AI search. |
| **Values alignment** | Low — search-focused, no sustainability angle. |
| **Ease of integration** | NOT POSSIBLE currently. |
| **Key event** | Developer conference "Ask" on March 11, 2026 in San Francisco — attend to assess plugin/tool roadmap. |
| **Contact path** | Wait for tool/extension system announcement. Monitor "Ask" conference. |
| **Outreach priority** | **P3** — Monitor. No integration path exists yet. |

### Priority Summary

| Priority | Platform | Integration Type | Effort | Key Action |
|----------|----------|-----------------|--------|------------|
| **P0** | GitHub Copilot | MCP native | Low | Submit to MCP Registry |
| **P1** | OpenAI / ChatGPT | MCP (Codex) + GPT Actions (future) | Low-Med | Document Codex setup; plan HTTP transport |
| **P1** | Amazon Q Developer | MCP native | Low | Document setup; explore AWS Marketplace |
| **P1** | Windsurf | MCP native | Low | Submit to MCP Marketplace |
| **P2** | Google Gemini | MCP (CLI) | Low | Already works; improve docs |
| **P2** | Mistral | MCP (Agents API) | Medium | Community integration guide |
| **P2** | Sourcegraph Cody | MCP native | Medium | Enterprise outreach |
| **P3** | Perplexity | None yet | N/A | Monitor; attend "Ask" conference Mar 11 |

### Outreach Email Templates

#### Template 1: MCP-Native Platforms (Copilot, Q Developer, Windsurf, Cody)

> **Subject**: Regen for AI — Ecological accountability MCP server for [Platform Name]
>
> Hi [Name/Team],
>
> I built Regen for AI, an MCP server that adds ecological accountability to AI coding workflows. It lets developers estimate their AI session's footprint and retire verified ecological credits on Regen Network — with on-chain proof of every retirement.
>
> It already works with [Platform Name] via MCP (stdio transport). The npm package is live: `npx regen-for-ai`.
>
> I'd love to get it listed in [Platform's MCP registry/marketplace] so developers can discover it easily. Key stats:
>
> - 7 tools, 3 prompt templates
> - ~$2M+ in live ecological credits (carbon, biodiversity, marine, grazing)
> - On-chain verification on Regen Network — immutable, auditable, public
> - Credit card purchases work out of the box (no crypto knowledge needed)
> - Open source: github.com/CShear/regen-for-ai
>
> Would you be open to a quick call, or should I submit through [standard submission process]?
>
> Best,
> [Name]

#### Template 2: Platforms Needing HTTP Transport (OpenAI GPT Actions, Gemini Web)

> **Subject**: Regenerative AI — ecological credit retirement as a GPT Action / Gemini Extension
>
> Hi [Name/Team],
>
> I'm building Regen for AI, a tool that connects AI compute usage to verified ecological credit retirement. It's live as an MCP server (works with Claude Code, Cursor, Copilot, etc.) and I'm expanding to support HTTP-based integrations.
>
> For [Platform Name], I'd like to create a [GPT Action / Gemini Extension] that lets users:
>
> 1. Estimate their session's ecological footprint
> 2. Browse available credits (carbon, biodiversity, marine stewardship)
> 3. Retire credits with on-chain proof on Regen Network
>
> This isn't "carbon offsetting" — it's verifiable regenerative contribution. Every retirement is an on-chain transaction on a public blockchain.
>
> I'd like to understand the best path for listing this on [GPT Store / Gemini Extensions]. Is there a review process or partnership track for sustainability-focused tools?
>
> Best,
> [Name]

---

## Part B: Conference & Podcast Targets (Issue #26)

### Target Conferences

#### 1. AI Engineer World's Fair — San Francisco

| Attribute | Detail |
|-----------|--------|
| **Dates** | June 29 - July 2, 2026 |
| **Location** | San Francisco, CA |
| **Audience** | 6,000+ AI engineers, founders, VPs of AI |
| **Format** | 29 tracks, 300 speakers, 100 expo partners |
| **Fit** | EXCELLENT — developer audience, practical AI tools, MCP is a hot topic |
| **Submission** | CFP via ai.engineer/worldsfair. Propose a talk or demo booth. |
| **Proposed talk** | "Regenerative AI — On-Chain Ecological Accountability for AI Compute" |
| **Priority** | **HIGH** — best audience-product fit of any conference |

#### 2. AI Engineer Europe — London

| Attribute | Detail |
|-----------|--------|
| **Dates** | April 8-10, 2026 |
| **Location** | London, UK |
| **Audience** | European AI engineering community |
| **Fit** | EXCELLENT — same audience as World's Fair, EU sustainability context |
| **Submission** | CFP via ai.engineer/europe |
| **Note** | SOON — check if CFP is still open. EU AI Act creates sustainability angle. |
| **Priority** | **HIGH** — if CFP deadline hasn't passed |

#### 3. NeurIPS 2026 — San Diego

| Attribute | Detail |
|-----------|--------|
| **Dates** | December 6-12, 2026 |
| **Location** | San Diego, CA |
| **Audience** | 15,000+ ML researchers, practitioners, industry |
| **Fit** | GOOD — academic credibility, AI sustainability workshop track |
| **Submission** | Main track CFP typically May-June. Workshop proposals earlier. |
| **Proposed approach** | Submit to Sustainable AI workshop (if one exists) or propose one. Demo track for the MCP tool. Reference Luccioni et al. (2023) on AI energy costs. |
| **Priority** | **MEDIUM-HIGH** — credibility builder, long lead time |

#### 4. Climate Week NYC

| Attribute | Detail |
|-----------|--------|
| **Dates** | September 20-27, 2026 |
| **Location** | New York City |
| **Audience** | 100,000+ participants — heads of state, business leaders, civil society |
| **Fit** | GOOD — sustainability audience, but less technical |
| **Submission** | Host a side event or join an existing panel. Register at climateweeknyc.org |
| **Proposed approach** | Panel on "AI's Ecological Footprint and Regenerative Solutions" or demo at a side event. Partner with Regen Network for co-hosted event. |
| **Priority** | **MEDIUM** — credibility and media, not direct user acquisition |

#### 5. Cosmoverse 2026 — Hong Kong

| Attribute | Detail |
|-----------|--------|
| **Dates** | November 2026 (exact TBD) |
| **Location** | Hong Kong |
| **Audience** | Cosmos ecosystem builders, validators, institutional finance |
| **Fit** | EXCELLENT — Regen Network is a Cosmos chain. Direct ecosystem event. |
| **Submission** | Speaker application via cosmoverse.org |
| **Proposed talk** | "How AI Demand is Driving Ecocredit Retirements on Regen Ledger" |
| **Priority** | **HIGH** — direct ecosystem alignment, REGEN token narrative |

#### 6. EthCC[9] — Cannes

| Attribute | Detail |
|-----------|--------|
| **Dates** | March 30 - April 2, 2026 |
| **Location** | Cannes, France (Palais des Festivals) |
| **Audience** | 5,000+ Ethereum community members, 400+ speakers |
| **Fit** | GOOD — ReFi track (if available), on-chain verification narrative |
| **Submission** | ethcc.io — check if speaker applications still open |
| **Note** | VERY SOON — less than 4 weeks away. May be too late for speaker slot, but could attend for networking and side events. |
| **Priority** | **MEDIUM** — timing may be too tight for a talk, but attendance valuable |

#### 7. Token2049 Dubai

| Attribute | Detail |
|-----------|--------|
| **Dates** | April 29-30, 2026 |
| **Location** | Dubai (Madinat Jumeirah) |
| **Audience** | 15,000+ blockchain/crypto industry |
| **Fit** | MEDIUM — web3 audience, but more trading/DeFi-focused than ReFi |
| **Submission** | Speaker application via token2049.com/dubai |
| **Priority** | **LOW-MEDIUM** — good for visibility, less aligned with core audience |

#### 8. Token2049 Singapore

| Attribute | Detail |
|-----------|--------|
| **Dates** | October 7-8, 2026 |
| **Location** | Singapore |
| **Audience** | 15,000+ blockchain/crypto industry (Asia focus) |
| **Fit** | MEDIUM — same as Dubai but Asian market |
| **Priority** | **LOW-MEDIUM** — consider if Dubai goes well |

#### 9. Sustainable AI Conference — Europe

| Attribute | Detail |
|-----------|--------|
| **Dates** | 2026 (exact TBD) |
| **Location** | Europe (sustainable-ai-conference.eu) |
| **Audience** | Researchers and practitioners in sustainable AI |
| **Fit** | EXCELLENT — direct topic match. "Regenerative AI" as a new category. |
| **Submission** | Check sustainable-ai-conference.eu for CFP |
| **Priority** | **HIGH** — perfect audience alignment |

#### 10. IEEE SusTech 2026

| Attribute | Detail |
|-----------|--------|
| **Dates** | 2026 (TBD) |
| **Location** | TBD |
| **Audience** | IEEE sustainability technology researchers |
| **Fit** | GOOD — academic credibility, sustainability tech focus |
| **Submission** | ieee-sustech.org for CFP |
| **Priority** | **MEDIUM** — academic audience, long-term credibility |

### Conference Calendar (Sorted by Date)

| Month | Conference | Location | Priority |
|-------|-----------|----------|----------|
| Mar 30 - Apr 2 | EthCC[9] | Cannes, France | MEDIUM |
| Apr 8-10 | AI Engineer Europe | London, UK | HIGH |
| Apr 29-30 | Token2049 Dubai | Dubai | LOW-MEDIUM |
| Jun 29 - Jul 2 | AI Engineer World's Fair | San Francisco | HIGH |
| Jul 6-11 | ICML 2026 | Seoul | MEDIUM-HIGH |
| Sep 20-27 | Climate Week NYC | New York | MEDIUM |
| Oct 7-8 | Token2049 Singapore | Singapore | LOW-MEDIUM |
| Nov (TBD) | Cosmoverse 2026 | Hong Kong | HIGH |
| Dec 6-12 | NeurIPS 2026 | San Diego | MEDIUM-HIGH |
| TBD | Sustainable AI Conference | Europe | HIGH |

### Target Podcasts

#### 1. Environment Variables (Green Software Foundation)

| Attribute | Detail |
|-----------|--------|
| **Host** | Green Software Foundation; CXO Bytes series hosted by Sanjay Podder |
| **Audience** | Software engineers and leaders focused on reducing software emissions |
| **Fit** | EXCELLENT — direct overlap. AI compute emissions + actionable tool. |
| **Where to listen** | Spotify, Apple Podcasts, all major platforms |
| **Contact** | podcast.greensoftware.foundation; Green Software Foundation community channels |
| **Pitch angle** | "We built a tool that makes ecological accountability native to AI workflows. Every retirement is on-chain, not in a private database." |
| **Priority** | **P0** — best audience-topic fit |

#### 2. Practical AI (Changelog)

| Attribute | Detail |
|-----------|--------|
| **Host** | Daniel Whitenack and Chris Benson (Changelog network) |
| **Audience** | Large developer audience interested in practical AI applications |
| **Fit** | GOOD — practical tools focus, developer audience |
| **Where to listen** | changelog.com/practicalai, all major platforms |
| **Contact** | changelog.com guest submission form |
| **Pitch angle** | "MCP as a distribution channel for sustainability tools. How we connected AI compute to ecological credit retirement." |
| **Priority** | **P1** — large audience, practical angle |

#### 3. The AI Sustainability Podcast

| Attribute | Detail |
|-----------|--------|
| **Host** | Nina Benoit |
| **Audience** | AI + sustainability intersection. Covers AI energy costs, tools like AIWattch. |
| **Fit** | EXCELLENT — exact topic match. Has covered AI carbon emissions before. |
| **Where to listen** | Apple Podcasts |
| **Contact** | Via Apple Podcasts listing or social media |
| **Pitch angle** | "Beyond measurement — from footprint estimation to verified regenerative contribution, all inside the AI tool." |
| **Priority** | **P0** — direct topic fit |

#### 4. AI and Sustainability Podcast

| Attribute | Detail |
|-----------|--------|
| **Host** | Higher ed + sustainability focus |
| **Audience** | Academics, students, practitioners at AI/sustainability intersection |
| **Fit** | GOOD — academic credibility, sustainability audience |
| **Where to listen** | Apple Podcasts |
| **Contact** | Via podcast listing |
| **Pitch angle** | "Open source ecological accountability for AI — how MCP enables regenerative contribution." |
| **Priority** | **P2** — smaller audience but aligned |

#### 5. Euronews Tech Talks

| Attribute | Detail |
|-----------|--------|
| **Host** | Euronews editorial team |
| **Audience** | European tech audience, broad reach |
| **Fit** | GOOD — covered AI environmental cost in Jan 2026 episode |
| **Where to listen** | euronews.com, major platforms |
| **Contact** | Euronews editorial/pitch |
| **Pitch angle** | "A European-values approach to AI sustainability — verified, transparent, on-chain." |
| **Priority** | **P2** — media reach, less technical audience |

#### 6. BSR Podcast (Business for Social Responsibility)

| Attribute | Detail |
|-----------|--------|
| **Host** | BSR (global nonprofit) |
| **Audience** | Corporate sustainability professionals |
| **Fit** | GOOD — has covered "Environmental Impacts of AI" specifically |
| **Where to listen** | bsr.org/en/audio |
| **Contact** | BSR partnerships |
| **Pitch angle** | "How enterprises can build ecological accountability into their AI toolchains." |
| **Priority** | **P2** — enterprise/corporate angle for Track C |

### Reusable Talk Abstract

**Title**: Regenerative AI — Verified Ecological Accountability for AI Compute

**Abstract** (200 words):

AI coding assistants consume real energy. Data centers are projected to hit 1,000 TWh annually by 2026 — roughly the electricity demand of Japan. Most developers know this. Almost none can act on it from inside their workflow.

Regen for AI changes that. It is an MCP (Model Context Protocol) server that connects AI compute to verified ecological credit retirement on Regen Network, a public blockchain for ecological assets. Developers install it with one command. From inside their AI assistant, they can estimate their session's footprint, browse credits spanning carbon, biodiversity, marine stewardship, and grazing, and retire them with immutable on-chain proof.

This is not "carbon offsetting." We call it regenerative contribution — funding verified ecological regeneration with a transaction hash anyone can verify. The footprint estimate is a heuristic, and we say so. That honesty is the point.

The tool works today with Claude Code, Cursor, GitHub Copilot, VS Code, JetBrains, Amazon Q Developer, Windsurf, and Gemini CLI. Credits from 9+ countries are available via credit card. Every retirement creates a shareable certificate on a public ledger.

We will demo the full workflow live: install, estimate, browse, retire, verify.

---

## Part C: Carbon API Aggregator Research (Issue #16)

### Patch (patch.io)

| Attribute | Detail |
|-----------|--------|
| **What they do** | API-first marketplace for carbon credits. Connects buyers and suppliers. |
| **Funding** | $55M+ raised (Andreessen Horowitz lead) |
| **API** | RESTful. Projects API (browse inventory) + Orders API (purchase credits). Developer-friendly with clear documentation. |
| **Supplier onboarding** | Per-project assessment. Must align with ICVCM Core Carbon Principles (CCPs). Requires disclosure of project developer role, third-party ratings where available. Complete onboarding assessment, create project pages, add inventory. |
| **Can Regen credits be listed?** | LIKELY YES. Regen's on-chain verification would be a differentiator for Patch's transparency push. Would need to demonstrate ICVCM CCP alignment for carbon credits. Biodiversity credits (BT, USS, MBS) may need separate evaluation since ICVCM is carbon-focused. |
| **Contact** | patch.io/distribution — supplier/distribution inquiry page |
| **Key differentiator for pitch** | Patch "ushers in a new level of transparency for carbon credit purchases" — Regen's on-chain verification is the strongest transparency story possible. |
| **Priority** | **HIGH** — largest API marketplace, transparency-aligned |

### Cloverly

| Attribute | Detail |
|-----------|--------|
| **What they do** | API-first carbon credit platform. First distribution management software for carbon suppliers. |
| **Funding** | $19M Series A |
| **API** | RESTful. API docs at cloverly.com/api. Integrates carbon credits into any product or customer experience. |
| **Supplier onboarding** | Via supplier platform. Multi-channel distribution management — inventory management, distribution tracking, credit sales tracking. Most explicit supplier onboarding of the three. |
| **Can Regen credits be listed?** | YES — Cloverly's supplier platform is designed for this. They already work with multiple project developers and registries. |
| **Contact** | **suppliers@cloverly.com** — direct supplier contact email |
| **Supplier page** | cloverly.com/suppliers |
| **Key differentiator for pitch** | Cloverly emphasizes multi-channel distribution. Regen credits through Cloverly would reach Cloverly's existing buyer network (Visa partner, enterprise clients). |
| **Priority** | **HIGHEST** — most explicit supplier path, direct contact email |

### Lune (lune.co)

| Attribute | Detail |
|-----------|--------|
| **What they do** | Carbon credit API and Emissions Intelligence platform for businesses. |
| **Funding** | Well-funded (specific amount not disclosed in search) |
| **API** | RESTful. Order by mass, by value, or by estimate. Client Accounts for per-customer attribution. API key + Bearer Token auth. |
| **Supplier onboarding** | Partner model — works with "third-party carbon offset developers or registries." Uses "Project bundles" concept to group similar projects. |
| **Can Regen credits be listed?** | LIKELY — Regen Network as a registry is a natural fit for Lune's partner model. Project bundles could group Regen's multi-credit portfolio (carbon + biodiversity + marine). |
| **Contact** | General inquiry via lune.co. No explicit supplier email found. |
| **Key differentiator for pitch** | Lune's Client Accounts system (per-customer attribution) maps directly to Regen for AI's per-subscriber retirement model. Technical architecture alignment. |
| **Priority** | **HIGH** — good technical fit, registry partnership model |

### Aggregator Comparison

| Feature | Patch | Cloverly | Lune |
|---------|-------|----------|------|
| **API maturity** | High | High | High |
| **Supplier onboarding clarity** | Medium | HIGH (direct email) | Low |
| **Multi-credit support** | Carbon-focused | Carbon-focused | Carbon-focused |
| **On-chain verification interest** | High (transparency push) | Medium | Medium |
| **Contact path** | Web form | suppliers@cloverly.com | General inquiry |
| **User base** | Enterprise + developer | Enterprise (Visa partner) | Enterprise + fintech |
| **Recommended approach** | Pitch via distribution page | Email suppliers@ directly | Pitch as registry partner |

### Supplier Application Pitch (Reusable)

> **Subject**: Regen Network — On-Chain Verified Ecological Credits for [Patch/Cloverly/Lune]
>
> Hi [Team],
>
> I'm reaching out from Regen Network, the public blockchain for ecological assets. We have a live marketplace with approximately $2-3M in verified ecological credits available for purchase, and we'd like to explore listing them on [Platform Name].
>
> **Why Regen credits are different:**
>
> 1. **On-chain verification.** Every credit issuance, transfer, and retirement is recorded on an immutable public ledger — not a private database. Anyone can audit the full lifecycle of any credit. This is the strongest transparency guarantee in the market.
>
> 2. **Multi-credit portfolio.** We go beyond carbon:
>    - Carbon credits (C02, C03, C06) — forest conservation, regenerative agriculture
>    - Biodiversity credits (BT01) — Terrasos reserves in Colombia
>    - Marine Biodiversity Stewardship (MBS) — ocean ecosystems
>    - Umbrella Species Stewardship (USS) — wildlife corridor protection
>    - Kilo-Sheep-Hour (KSH) — sustainable grazing in the UK
>
> 3. **Live marketplace inventory.** ~83,000 credits from 9+ countries, priced $3.95-$45/credit. Real sell orders, not indicative pricing.
>
> 4. **New demand channel.** We've built Regen for AI, an MCP server that connects AI coding assistants to credit retirement. This creates a net-new buyer segment — AI developers — purchasing credits through their existing workflow. This demand channel is additive to [Platform Name]'s existing buyer base.
>
> 5. **Fiat rails.** Credit card purchases work today via Regen Marketplace. No crypto knowledge needed. Cross-chain crypto payments also supported via ecoBridge (USDC on Base, Ethereum, Polygon, etc.).
>
> **What we're looking for:**
>
> - Listing Regen credits as a supplier on [Platform Name]
> - Exploring API integration for automated purchasing and retirement
> - Understanding your onboarding process and any requirements we should prepare for
>
> We're happy to provide project documentation, registry access, and a demo of the on-chain verification flow. Our credits align with transparency-first approaches — the ledger is public, the retirements are permanent, and the certificates are shareable.
>
> Would you be open to a call to discuss?
>
> Best,
> [Name]
> Regen Network / Regen for AI
> github.com/CShear/regen-for-ai

### Recommended Outreach Sequence for Carbon APIs

1. **Week 1**: Email Cloverly at suppliers@cloverly.com (clearest path, direct contact).
2. **Week 1**: Submit inquiry on Patch distribution page (patch.io/distribution).
3. **Week 2**: Contact Lune via general inquiry, pitching registry partnership model.
4. **Week 3**: Follow up on all three. Prepare project documentation package (credit class details, registry info, sample certificates).

---

## Appendix: Immediate Action Items

### This Week (Urgent)

1. **Check EthCC[9] speaker applications** — conference is March 30-April 2. Deadline may have passed, but side events and networking are still valuable.
2. **Check AI Engineer Europe CFP** — conference is April 8-10. Submit talk proposal if still open.
3. **Attend Perplexity "Ask" developer conference** (March 11, SF) — assess plugin/tool roadmap.

### This Month

4. **Submit to GitHub MCP Registry** — highest-leverage single action for distribution.
5. **Submit to Windsurf MCP Marketplace** — low-effort one-click install listing.
6. **Email Cloverly** (suppliers@cloverly.com) with supplier application pitch.
7. **Submit Patch distribution inquiry** (patch.io/distribution).
8. **Pitch Environment Variables podcast** (Green Software Foundation).
9. **Pitch The AI Sustainability Podcast** (Nina Benoit).

### Next 3 Months

10. **Submit AI Engineer World's Fair CFP** — June 29-July 2, SF. Our best conference target.
11. **Submit Cosmoverse 2026 speaker application** — November, Hong Kong. Cosmos ecosystem event.
12. **Prepare NeurIPS workshop proposal** — December, San Diego. Academic credibility.
13. **Submit Sustainable AI Conference CFP** — Europe. Direct topic match.
14. **Contact Lune** re: registry partnership.
15. **Submit Climate Week NYC side event proposal** — September 20-27, NYC.
16. **Pitch Practical AI podcast** (Changelog) after launch blog post is published.
