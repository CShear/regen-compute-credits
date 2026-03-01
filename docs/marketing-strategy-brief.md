# Regen for AI — Marketing & Communications Strategy Brief

> **Prepared for**: Marketing & Communications Lead
> **Date**: March 1, 2026
> **Product**: Regen for AI (MCP server for ecological accountability in AI workflows)
> **Category**: Regenerative AI
> **Status**: Product built and live on npm (v0.3.0). Content assets drafted. Ready for launch execution.

---

## 1. What This Product Is (30-Second Version)

Regen for AI is a plugin for AI coding assistants (Claude Code, Cursor, VS Code, etc.) that lets developers estimate their AI session's ecological footprint and fund verified ecological regeneration with on-chain proof. It connects to Regen Network, a public blockchain for ecological credits. Users never need crypto knowledge — credit card purchases work out of the box.

**One-liner for external use**: "Fund verified ecological regeneration from your AI sessions — one command to install, on-chain proof of every retirement."

---

## 2. Brand Voice & Positioning

### The Core Frame: "Regenerative Contribution" (NOT "Carbon Offset")

This distinction is the single most important messaging decision. It is both a strategic and legal choice. Every piece of content must use this framing consistently.

| DO say | DO NOT say |
|--------|-----------|
| "Regenerative contribution" | "Carbon offset" |
| "Fund ecological regeneration" | "Offset your footprint" |
| "Verified on-chain proof" | "Carbon neutral" |
| "Approximate estimate" (for footprint) | "Precise measurement" |
| "Accountability, not guilt" | "Make up for your emissions" |
| "Contribution to real projects" | "Neutralize your impact" |

**Why this matters**: Carbon offset claims are legally fraught — companies have faced FTC scrutiny and greenwashing lawsuits for unsubstantiated offset claims. Our framing is deliberately factual and defensible: "Your AI session funded the retirement of X verified ecological credits on Regen Network." That is a verifiable, on-chain fact. We never claim equivalence between compute energy and ecological damage.

### Voice Characteristics

| Attribute | Description | Example |
|-----------|-------------|---------|
| **Honest** | We admit what we don't know. The footprint is a heuristic, and we say so. | "The footprint estimate is approximate — we're honest about the uncertainty because that honesty is what separates this from greenwashing." |
| **Technical but accessible** | The audience is developers. They respect substance. But non-technical supporters should understand the value proposition too. | "Every retirement is an on-chain transaction — immutable, auditable, permanent. Not a dashboard claim." |
| **Confident, not hype** | Let facts carry the weight. No exclamation points, no "revolutionary," no "game-changing." | "We built one." (from the blog post opening — understated, factual) |
| **Contribution-framed** | Always positive action, never guilt or shame. | "This is not about guilt. It is about building accountability into the tools we already use." |
| **Specific over general** | Name actual projects, countries, credit types. Specificity builds trust. | "Forests in Kenya, biodiversity reserves in Colombia, marine ecosystems in Indonesia, grazing lands in the UK." |

### Words and Phrases to Use

- Regenerative contribution
- Verified ecological regeneration
- On-chain proof
- Immutable, auditable, permanent
- Real projects in real places
- Ecological accountability (not "sustainability tool")
- Fund regeneration (not "buy offsets")

### Words and Phrases to Avoid

- Carbon neutral / net zero (we never claim this)
- Offset / offsetting
- Green AI (too vague, too marketing)
- Sustainable AI (overused, no teeth)
- Revolutionary / game-changing / disruptive (hype words)
- Guilt-based language ("your footprint is destroying...")

---

## 3. Target Audiences (Prioritized)

### Primary: AI-Native Developers (Track A — launch audience)

**Who**: Developers who use Claude Code, Cursor, or similar AI coding assistants daily. Technically literate. Many care about sustainability but have no actionable tool inside their workflow.

**Where they are**: Hacker News, r/MachineLearning, r/ClaudeAI, Claude Code Discord, Cursor forums, Dev.to, Twitter/X tech community.

**What resonates**: On-chain verification (they understand blockchain proofs), open source (they can audit it), one-command install (they value simplicity), honest heuristics (they distrust marketing precision).

**Example hook**: "Your AI sessions can fund verified ecological regeneration. One command to install. On-chain proof of every retirement."

### Secondary: Regen / Web3 Ecosystem (Track A — amplification)

**Who**: Existing Regen Network community, REGEN token holders, ecological credit developers, regenerative finance (ReFi) community.

**Where they are**: Regen Discord, Regen Forum, Cosmos ecosystem channels, ReFi Twitter.

**What resonates**: Demand-side value for REGEN token (retirements drive burns), new outside capital entering the ecosystem, credit type diversity, `MsgBuyDirect` on-chain flow.

**Example hook**: "A new demand engine for ecocredits — AI developers become credit buyers, creating persistent buy pressure from outside the crypto ecosystem."

### Tertiary: Climate Tech / AI Ethics Community (Track A — credibility)

**Who**: Researchers, journalists, and advocates focused on AI's environmental impact. They follow papers like Luccioni et al. (2023) on AI energy costs.

**Where they are**: Academic conferences (NeurIPS, ICML), climate tech newsletters, AI ethics publications, Twitter/X.

**What resonates**: Honest methodology (heuristic, not precision claims), multi-credit portfolio (beyond carbon), on-chain transparency, open source auditability.

**Example hook**: "Most 'green AI' solutions are corporate dashboards with unverifiable claims. This one puts every retirement on a public blockchain."

### Future: Enterprise / Platform Partners (Track C — later)

**Who**: AI platform companies (Anthropic, Cursor, etc.), enterprise sustainability teams, API consumers.

**What resonates**: White-label potential, ESG reporting, API integration, subscription revenue model.

*Not the launch audience — comes after traction data from Tracks A and B.*

---

## 4. Content Assets (What Exists Today)

All content is in the repo at `/docs/`. Here's what's ready and what's needed:

### Ready (drafts complete, need brand review)

| Asset | Location | Status | Notes |
|-------|----------|--------|-------|
| **Launch blog post** | `docs/blog-launch-post.md` | Draft complete (~1,500 words) | Needs brand voice review, screenshot/GIF insertion, publication |
| **Community seeding drafts** | `docs/community-seeding-drafts.md` | 8 channel drafts ready | Need brand review, `[BLOG_URL]` and `[DEMO_URL]` placeholder replacement |
| **Subscription landing page** | Live in codebase (HTML) | Built and functional | Needs brand/design polish before public launch |
| **README** | `README.md` | Complete with 8-platform install docs | Functional but could use brand polish |

### Needed (not yet created)

| Asset | Priority | Notes |
|-------|----------|-------|
| **Demo video/GIF** (60-90s) | HIGH | Script exists in issue #15. Needs screen recording of the full workflow in Claude Code. This is the #1 missing asset — every channel draft references it. |
| **Social media imagery** | HIGH | OG image for blog post, Twitter card, certificate page screenshot for sharing |
| **Retirement certificate screenshot** | HIGH | The certificate page is the viral artifact. Need a beautiful screenshot of a real retirement certificate for use across all channels. |
| **Condensed "How it works" graphic** | MEDIUM | 4-step visual (Install -> Estimate -> Retire -> Certificate) for landing page and social |
| **Press/media one-pager** | MEDIUM | For journalist outreach, newsletter features |

---

## 5. Channel Strategy & Timing

### Launch Sequence (Recommended Order)

The launch should be sequenced to build momentum, not shotgunned all at once. Each step creates an asset or proof point that makes the next step more effective.

**Week 1: Foundation**
1. Record demo video/GIF (blocks everything else)
2. Brand-review and finalize blog post
3. Brand-review community seeding drafts
4. Create social media imagery (OG cards, certificate screenshot)

**Week 2: Owned Channels First**
5. Publish blog post on Regen blog / Medium
6. Post to Regen Discord and Forum (friendly audience, low risk, get initial feedback)
7. Cross-post to Dev.to
8. Post to Claude Code Discord and r/ClaudeAI (direct user community)

**Week 3: Broader Developer Community**
9. Post to Cursor forums
10. Twitter/X thread (with demo GIF)
11. Submit to Hacker News (Show HN) — ideally on a Tuesday or Wednesday morning US time
12. Post to r/MachineLearning

**Week 4: Amplification & Follow-up**
13. Respond to all comments and feedback across channels
14. Write follow-up content based on community response (FAQ, "what we learned" post)
15. Pitch to climate tech / AI newsletters

### Channel-Specific Notes

| Channel | Tone | Key Rule | Draft Location |
|---------|------|----------|---------------|
| **Hacker News** | Technical, understated, factual | No marketing language. Link to GitHub, not blog. Let the repo speak. | Section 1 of community-seeding-drafts.md |
| **r/MachineLearning** | Academic-adjacent, cites papers | Use [P] tag. Reference Luccioni et al. (2023) and IEA data. | Section 2 |
| **r/ClaudeAI** | Casual, community-member | "Built an MCP" framing. Show the install command. Invite feedback. | Section 3 |
| **Twitter/X** | Punchy, progressive disclosure | 5-7 tweet thread. Hook first (energy problem), reveal solution, end with CTA. Tag @AnthropicAI and Regen Network's handle. | Section 4 |
| **Dev.to** | Tutorial-style, actionable | "How to" framing. Code blocks. Both Claude and Cursor install. | Section 5 |
| **Claude Code Discord** | Brief, non-promotional | Single message. Community member sharing a tool. 100-150 words max. | Section 6 |
| **Cursor Forums** | Practical, tool-focused | Include Cursor-specific JSON config, not Claude command. | Section 7 |
| **Regen Discord/Forum** | Ecosystem-insider | Emphasize demand-side value, REGEN burn flywheel, MsgBuyDirect. | Section 8 |

---

## 6. Key Messages by Audience

### For Developers (primary audience)

**Problem**: "AI coding assistants consume real energy. Data centers are projected to hit 1,000 TWh/year by 2026. Most developers know this but can't act on it from inside their workflow."

**Solution**: "Regen for AI adds ecological accountability to your AI assistant. One command to install. Estimate your footprint, browse credits, retire them, get a verifiable certificate. All without leaving your workflow."

**Differentiator**: "Every retirement is on a public blockchain — not a private database, not a marketing dashboard. Anyone can verify it. That's what makes this different from every 'green AI' claim you've seen."

**CTA**: "Install it: `claude mcp add -s user regen-for-ai -- npx regen-for-ai`"

### For the Regen Ecosystem

**Value**: "AI developers become a new demand engine for ecocredits. Outside capital flows in from people who would never have found Regen Network otherwise."

**Mechanism**: "Every retirement is a real MsgBuyDirect on Regen Ledger. Subscription tiers (coming soon) automate monthly batch retirements. 10% of subscription revenue goes to REGEN buy-and-burn."

**CTA**: "Spread the word. Every MCP install is a potential recurring credit buyer."

### For Media / Newsletters

**Angle**: "The first AI tool with verified ecological accountability — not corporate greenwashing, but on-chain proof. Built on the same MCP protocol that Anthropic uses for Claude's tool ecosystem."

**Hook stat**: "~$2M+ in ecological credits from 9+ countries, purchasable directly from an AI assistant. Carbon, biodiversity, marine stewardship, and more."

---

## 7. The Viral Mechanic: Retirement Certificates

The shareable retirement certificate page is the single most important growth mechanic. Every retirement produces a permanent, beautiful, shareable URL showing:

- What project was funded
- How many credits were retired
- The on-chain transaction proof
- The beneficiary name

**This is what people share.** Not the blog post, not the install command — the certificate. Design and presentation of this page should be a priority.

Encourage sharing via:
- "Share your impact" buttons in monthly emails (Twitter, LinkedIn)
- Certificate URL in every retirement confirmation
- Social media posts that show real certificate screenshots

---

## 8. Content Examples (for brand calibration)

These are short excerpts from the existing drafts. Use them to calibrate the voice before the marketing lead reviews the full documents.

### Blog Post Opening (confident, understated)

> Every AI session consumes energy. Data centers are projected to consume over 1,000 TWh annually by 2026 — roughly the electricity demand of Japan. If you use Claude Code, Cursor, or any AI coding assistant daily, your work has an ecological footprint. Most developers know this. Almost none can do anything about it from inside their workflow.
>
> We built one.

### The Framing Distinction (the most important paragraph to get right)

> This is **regenerative contribution**, not carbon offsetting. We do not claim your AI session becomes "carbon neutral." We do not pretend to know the exact kilowatt-hours your session consumed. What we do is fund verified ecological regeneration and give you on-chain proof that you did it.

### The Vision Close (aspirational but grounded)

> AI, which is powered by burning energy, can provide the economic engine to fund ecological regeneration. Not through guilt. Not through marketing. Through verified, on-chain, permanent proof of contribution to real projects in real places — forests in Kenya, biodiversity reserves in Colombia, marine ecosystems in Indonesia, grazing lands in the UK.

### HN Comment (technical, no-BS tone)

> One design decision worth noting: we deliberately call this "regenerative contribution," not "carbon offsetting." The footprint estimate is a heuristic — we don't pretend to know your exact kWh. What we do know is that the retirement happened, on-chain, with a transaction hash anyone can verify. That honesty is the point.

### Regen Community (ecosystem-value framing)

> AI developers are a massive, untapped demand-side audience for ecocredits. There are millions of developers using AI coding assistants daily. Many of these developers care about sustainability but have no way to act on it inside their workflow. Regen for AI puts ecocredit retirement one command away.

---

## 9. Metrics & Success Criteria

### Track A Launch (first 30 days)

| Metric | Target | How to measure |
|--------|--------|---------------|
| MCP installs (npm downloads) | 500 | npm download stats |
| On-chain retirements | 50 | Regen Indexer query |
| Certificate page shares | 3+ on social media | Social monitoring |
| Media/newsletter mention | 1+ | Manual tracking |
| GitHub stars | 100+ | GitHub |
| Blog post views | 2,000+ | Publishing platform analytics |

### Ongoing (month 2+)

| Metric | Target |
|--------|--------|
| Subscription sign-ups | 100 in first month of availability |
| MRR (monthly recurring revenue) | $500 within 60 days of subscription launch |
| Retention (month 2) | 70%+ |
| Community-generated certificate shares | Organic, not prompted |

---

## 10. How to Engage with This Project

### For the Marketing & Communications Lead

**The repo is your source of truth.** Here's how to interact with it:

#### Key files to read first

| File | What it tells you |
|------|-------------------|
| `CLAUDE.md` | Full technical and strategic context for the project |
| `ROADMAP.md` | Three-track rollout plan, timing, dependencies |
| `docs/blog-launch-post.md` | The launch blog post draft (review for voice/brand) |
| `docs/community-seeding-drafts.md` | 8 channel-specific content drafts (review/adapt) |
| `docs/marketing-strategy-brief.md` | This document |

#### Immediate actions for the marketing lead

1. **Review the blog post** (`docs/blog-launch-post.md`) for brand alignment. Adjust voice, add/remove sections as needed. The core messaging and framing should stay, but the writing style should match Regen's brand voice.

2. **Review the community seeding drafts** (`docs/community-seeding-drafts.md`). These are calibrated per-channel but written by an AI — they need a human ear for tone, especially for community channels where inauthenticity is penalized (HN, Discord).

3. **Record or commission the demo video** (Issue #15). A 60-90 second screen recording of the workflow in Claude Code. Script outline is in the issue. This blocks every channel launch — without it, the seeding drafts are incomplete.

4. **Create social media imagery**. OG image for the blog post, Twitter card, a beautiful screenshot of a real retirement certificate. The certificate page is at `{server_url}/impact/{nodeId}` — it's functional but may need design polish.

5. **Replace placeholders**. All community drafts use `[BLOG_URL]` and `[DEMO_URL]` — these get filled in once the blog is published and the video is hosted.

6. **Execute the launch sequence** (Section 5 above). Owned channels first, then broader community, then amplification.

#### How to suggest changes

- **Content edits**: Edit the markdown files in `docs/` directly and commit, or open a GitHub issue with suggested changes.
- **Brand/voice feedback**: Open a GitHub issue tagged `design` describing what should change and why. Reference specific lines/sections.
- **New content needs**: Open a GitHub issue describing the asset needed, the audience, and the channel. The engineering team or AI agents can draft technical content; the marketing lead owns voice and brand.
- **Strategic questions**: Issue #25 (Strategic decisions) is open and covers pricing, revenue split, and open source decisions that affect marketing. Add comments there.

#### What the engineering team has built that's marketing-relevant

| Feature | Marketing implication |
|---------|---------------------|
| Subscription landing page (live) | Needs brand/design review before public promotion |
| Certificate page (live) | The viral mechanic — needs to look great for sharing |
| Monthly impact emails (built) | Template needs brand review; currently functional but plain |
| 8-platform install docs (README) | Can reference in content: "Works with Claude, Cursor, VS Code, Windsurf, JetBrains, Gemini CLI..." |
| Developer REST API with OpenAPI spec | Enables "Build on Regen for AI" developer marketing angle |
| REGEN buy-and-burn mechanism | Narrative fuel for ecosystem community: "Every subscription burns REGEN tokens" |

---

## Appendix: Content Production Pipeline (Suggested)

For ongoing content after launch:

| Cadence | Content | Owner |
|---------|---------|-------|
| At launch | Blog post, demo video, seeding posts | Marketing lead + engineering |
| Week 2-3 | "What we learned from launch" follow-up post | Marketing lead |
| Monthly | Retirement impact report (automated from on-chain data) | Engineering (automated) + marketing (narrative) |
| Monthly | Subscriber email (built, needs brand template) | Engineering (sends) + marketing (template) |
| Quarterly | Ecosystem update blog post | Marketing lead |
| As needed | Press/newsletter pitches | Marketing lead |
| As needed | Conference talk proposals (Issue #26) | Marketing lead + founder |
