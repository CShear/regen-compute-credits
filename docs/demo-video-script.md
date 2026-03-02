# Regen for AI — Demo Video Script

**Target length**: 60-90 seconds
**Format**: Screen recording of Claude Code terminal
**Recorder**: User (not automated)

---

## Recording Setup

### Terminal Configuration

- **Font size**: 18-20px (must be readable at 1080p on a phone screen)
- **Theme**: Dark background with high-contrast text. Recommended:
  - macOS Terminal: "Pro" or "Homebrew" profile
  - iTerm2: "Solarized Dark" or "Dracula"
  - VS Code integrated terminal: default dark theme works well
- **Window size**: 1920x1080 (full HD). If using a Retina display, set window to ~960x540 logical pixels so text renders large.
- **Columns**: ~100 columns max. Wider terminals cause text to be small. Resize the window narrower if needed.
- **Cursor**: Block cursor with blink enabled (looks better on camera)
- **Hide**: Menu bar, dock, desktop icons, notification badges

### Screen Recording Tools

| Platform | Recommended Tool | Notes |
|----------|-----------------|-------|
| macOS | **OBS Studio** (free) or **ScreenFlow** ($) | OBS: use "Window Capture" source for clean borders |
| macOS | QuickTime Player (built-in) | File > New Screen Recording. Simple but no editing. |
| Linux | OBS Studio | Window or display capture |
| Any | **asciinema** + **agg** | Records terminal natively. Export to GIF with `agg`. No mouse/UI clutter. |

**Recommended**: OBS Studio at 1080p, 30fps, CRF 18 (high quality). Record to MP4 (H.264).

### Pre-Recording Checklist

- [ ] Regen for AI MCP server is installed: `claude mcp add -s user regen-for-ai -- npx regen-for-ai`
- [ ] Restart Claude Code after adding the MCP server so it loads
- [ ] Run `npx regen-for-ai --version` to confirm it resolves (should print `0.3.0`)
- [ ] Close all other applications to avoid notification popups
- [ ] Silence system notifications (macOS: Focus mode; Linux: DND)
- [ ] Set terminal font to 18-20px
- [ ] Set terminal window to 1920x1080 or similar 16:9 aspect ratio
- [ ] Have this script open on a second monitor or printed out
- [ ] Practice typing the prompts 2-3 times first (or pre-type and paste)
- [ ] Note: you do NOT need a wallet configured. The demo works with zero configuration.

---

## Full Script

### Scene 1 — Hook
**Time**: 0:00 - 0:05 (5 seconds)
**Caption overlay** (add in post): `Every AI session uses energy. What if your AI could fund regeneration?`

**Action**: Show a clean Claude Code terminal. The cursor blinks. Maybe a line or two of previous coding context visible (e.g., the tail end of some prior conversation) to show this is a real coding session, not a fresh start.

**Timing**: Hold for 5 seconds. Let the caption sink in.

---

### Scene 2 — Install
**Time**: 0:05 - 0:12 (7 seconds)
**Caption overlay**: `One command to install.`

**Action**: Show the install command. You have two options:

**Option A** (type it live): Type in a fresh terminal:
```
claude mcp add -s user regen-for-ai -- npx regen-for-ai
```
Expected output:
```
Added stdio MCP server regen-for-ai with command: npx regen-for-ai
```

**Option B** (show it as text overlay only): Skip the terminal typing and just overlay the install command as large styled text in post-production. This saves time and looks cleaner.

**Recommendation**: Option B. The viewer gets the install command visually. You avoid wasting demo seconds on something they have already seen.

**Timing**: Hold 5 seconds on the command text, then transition.

---

### Scene 3 — Footprint Estimate
**Time**: 0:12 - 0:30 (18 seconds)
**Caption overlay**: `I've been coding with Claude for an hour. Let's see the ecological cost.`

**Action**: In Claude Code, type this prompt:

```
What's the ecological footprint of this AI session? It's been about 60 minutes.
```

**What happens**: Claude calls the `estimate_session_footprint` tool with `session_minutes=60`. You will see the tool call in the Claude Code UI, then the result.

**Expected output** (representative — exact numbers may vary slightly):

```
## Estimated Session Ecological Footprint

| Metric | Value |
|--------|-------|
| Session duration | 60 minutes |
| Estimated queries | ~90 |
| Energy consumption | ~0.9 kWh |
| CO2 equivalent | ~0.36 kg |
| Equivalent carbon credits | ~0.00036 credits |
| Estimated retirement cost | ~$0.01 |

> **Note**: This is an approximate estimate based on published research
> on AI energy consumption (IEA 2024, Luccioni et al. 2023). Actual energy
> use varies by model, data center, and grid energy mix.

To fund ecological regeneration equivalent to this session's footprint,
use the `retire_credits` tool to retire ecocredits on Regen Network.
```

**Key visual moments**:
- The tool call appearing (shows MCP in action)
- The table rendering with 0.36 kg CO2 (the "aha" number)
- The suggestion to use `retire_credits`

**Timing**: Let the output fully render. Pause 3 seconds on the completed table so the viewer can read the key numbers (0.9 kWh, 0.36 kg CO2).

---

### Scene 4 — Browse Credits
**Time**: 0:30 - 0:48 (18 seconds)
**Caption overlay**: `Now let's see what credits are available.`

**Action**: Type this prompt:

```
Show me what ecological credits are available on Regen Network
```

**What happens**: Claude calls `browse_available_credits` with `credit_type="all"`. This fetches live data from Regen Ledger.

**Expected output** (representative — numbers are live and will vary):

```
## Available Ecocredits on Regen Network

Regen Marketplace currently offers credits across 24 credit classes.
Purchase with credit card at app.regen.network — no crypto wallet needed.

### Marketplace Snapshot (Live)
| Credit Type | Available Credits | Sell Orders |
|-------------|-------------------|-------------|
| Carbon | 214,891.2 | 38 |
| Biodiversity (Terrasos) | 3,500 | 4 |
| Kilo-Sheep-Hour | 120.5 | 2 |

### Credit Classes
**C01** — Carbon
  - 12 project(s) in US-OR, KE, IN, CO, ...

**C02** — Carbon
  - 3 project(s) in US-CA, BR

**BT01** — Biodiversity (Terrasos)
  - 5 project(s) in CO

...
```

**Key visual moments**:
- The marketplace snapshot table with BOTH Carbon AND Biodiversity showing
- The "no crypto wallet needed" line
- The variety of credit types (carbon, biodiversity, marine)

**Timing**: Let the output render. Pause 3 seconds on the marketplace snapshot table. The viewer does not need to read every credit class.

---

### Scene 5 — Retire Credits
**Time**: 0:48 - 1:05 (17 seconds)
**Caption overlay**: `Fund regeneration. One command.`

**Action**: Type this prompt:

```
Retire 1 carbon credit for ecological regeneration
```

**What happens**: Claude calls `retire_credits` with `quantity=1`, `reason="ecological regeneration"`. Since no wallet is configured (default setup), it returns a marketplace link.

**Expected output** (marketplace fallback path — no wallet configured):

```
## Retire Ecocredits on Regen Network

### Purchase & Retire

Visit the Regen Marketplace to complete your credit retirement:

**app.regen.network**

**How it works:**
1. Browse available credits on the marketplace
2. Select credits and choose "Retire" at checkout
3. Pay with credit card (no crypto wallet needed)
4. Your name appears as beneficiary on the on-chain retirement certificate
5. Credits are permanently retired — verifiable, immutable, non-reversible

Use `browse_available_credits` to see current pricing and availability.

After retiring, use `get_retirement_certificate` to retrieve your
verifiable certificate.
```

**If wallet IS configured** (optional advanced demo path), the output would instead be:

```
## Ecocredit Retirement Successful

Credits have been permanently retired on Regen Ledger.

| Field | Value |
|-------|-------|
| Credits Retired | 1 |
| Cost | 1.50 uregen |
| Jurisdiction | US |
| Reason | ecological regeneration |
| Transaction Hash | `a1b2c3d4...` |
| Block Height | 25808100 |
| Certificate ID | WyJyZXRpcm... |
```

**Key visual moments**:
- The clear step-by-step instructions
- "Pay with credit card (no crypto wallet needed)" — shows accessibility
- "permanently retired — verifiable, immutable, non-reversible" — shows credibility

**Timing**: Let the output render. Pause 3 seconds. The "how it works" list is the money shot for credibility.

---

### Scene 6 — Certificate Verification
**Time**: 1:05 - 1:18 (13 seconds)
**Caption overlay**: `Verifiable. Immutable. On-chain.`

**Action**: Type this prompt, using a real certificate ID from the Regen Network:

```
Get me the retirement certificate for WyJyZXRpcmVtZW50cyIsMSwyNTgwODA2NCwwLDBd
```

**Note**: This is a real on-chain retirement certificate ID. You can also use a recent tx hash instead:
`94d92bca29ce58f09534570a1cf692f4547c574194aabf2b7f0ed088e81e6eae`

**What happens**: Claude calls `get_retirement_certificate` with the ID. It queries the Regen indexer.

**Expected output**:

```
## Retirement Certificate

| Field | Value |
|-------|-------|
| Certificate ID | WyJyZXRpcmVtZW50cyIsMSwyNTgwODA2NCwwLDBd |
| Credits Retired | 0.09 |
| Credit Batch | C03-006-20150101-20151231-001 |
| Beneficiary | regen1xfw890d6chkud69c9h3rrhcgjg4zaqaqf0543r |
| Jurisdiction | US-OR |
| Reason | 0G Foundation |
| Timestamp | 2026-03-02T01:45:01+00:00 |
| Block Height | 25808064 |
| Transaction Hash | 94d92bca29ce58f09534570a...e81e6eae |

**On-chain verification**: This retirement is permanently recorded on
Regen Ledger and cannot be altered or reversed.
```

**Key visual moments**:
- The full certificate table with real on-chain data
- The tx hash (proves it is real, not mocked)
- "permanently recorded... cannot be altered or reversed"

**Timing**: Let the output render fully. Pause 3 seconds on the certificate. This is the proof-of-concept moment.

---

### Scene 7 — Closing
**Time**: 1:18 - 1:28 (10 seconds)
**Caption overlay** (large, centered):

```
Regenerative AI.
One command to install.
```

**Overlay below** (styled as a terminal command):

```bash
claude mcp add -s user regen-for-ai -- npx regen-for-ai
```

**Overlay below that** (smaller, as a link):

```
github.com/CShear/regen-for-ai
```

**Action**: Fade to black or hold on the caption screen. No terminal interaction.

**Timing**: Hold 8-10 seconds. This is where the viewer decides to install or not.

---

## Post-Production Notes

### Captions / Annotations

Add captions as overlays (not burned into the terminal). This keeps the terminal clean and lets you adjust text in editing.

**Caption style**:
- Font: Sans-serif (Inter, Helvetica, SF Pro)
- Size: 36-48px
- Color: White text with a subtle dark shadow or semi-transparent dark background bar
- Position: Top-center of frame (above the terminal content)
- Duration: Each caption stays visible for the full duration of its scene

### Editing Cuts

- **Speed up typing**: If your typing is slow, speed up the typing portions 2-3x in post. Keep the output display at 1x speed.
- **Cut loading time**: If the MCP tool takes more than 2-3 seconds to respond, cut the wait. Jump straight to the output appearing.
- **No dead air**: Every second should show either typing, tool calls appearing, output rendering, or a caption.

### GIF Conversion (for Twitter/X, GitHub, social)

After exporting the final MP4, create a GIF of the key 15-20 seconds (Scene 3, the footprint estimate). This is the viral clip.

Using **ffmpeg**:
```bash
# Extract 15 seconds starting at 0:12 (the footprint scene)
ffmpeg -i demo.mp4 -ss 12 -t 15 -vf "fps=12,scale=800:-1:flags=lanczos" -c:v gif demo-footprint.gif

# For higher quality with palette optimization:
ffmpeg -i demo.mp4 -ss 12 -t 15 -vf "fps=12,scale=800:-1:flags=lanczos,palettegen" palette.png
ffmpeg -i demo.mp4 -i palette.png -ss 12 -t 15 -lavfi "fps=12,scale=800:-1:flags=lanczos [x]; [x][1:v] paletteuse" demo-footprint.gif
```

Using **Gifski** (better quality, macOS):
```bash
# Extract frames first
ffmpeg -i demo.mp4 -ss 12 -t 15 -vf "fps=12,scale=800:-1" frame%04d.png
gifski -o demo-footprint.gif --fps 12 --width 800 frame*.png
rm frame*.png
```

**Target GIF size**: Under 5MB for Twitter/X, under 10MB for GitHub README.

### asciinema Alternative

If you prefer a terminal-native recording (no mouse, no window chrome):

```bash
# Record
asciinema rec demo.cast --idle-time-limit 2

# Replay
asciinema play demo.cast

# Convert to GIF using agg
agg demo.cast demo.gif --theme monokai --font-size 20

# Convert to SVG (for embedding in web pages)
svg-term --in demo.cast --out demo.svg --window --width 80 --height 24
```

---

## YouTube Description

### Title
**Regen for AI — Ecological accountability for AI coding in 60 seconds**

### Description
```
Every AI session consumes energy. Regen for AI is an MCP server that lets your AI coding assistant estimate that footprint and retire verified ecocredits on Regen Network — with immutable on-chain proof.

One command to install:
claude mcp add -s user regen-for-ai -- npx regen-for-ai

What you get:
- Estimate your AI session's ecological footprint (energy, CO2, cost)
- Browse carbon AND biodiversity credits on Regen Marketplace
- Retire credits with credit card — no crypto wallet needed
- Get a verifiable on-chain retirement certificate

This is regenerative contribution, not carbon offsetting. No neutrality claims. Just verified funding of ecological regeneration.

Works with Claude Code, Cursor, Windsurf, VS Code (Copilot), JetBrains, Gemini CLI, and any MCP-compatible client.

GitHub: https://github.com/CShear/regen-for-ai
npm: https://www.npmjs.com/package/regen-for-ai
Regen Network: https://regen.network
Regen Marketplace: https://app.regen.network

#RegenForAI #RegenerativeAI #MCP #ClaudeCode #Sustainability #EcologicalCredits #RegenNetwork #CarbonCredits #BiodiversityCredits
```

### Tags
```
regen for ai, regenerative ai, mcp server, model context protocol, claude code, cursor ai, ecological credits, ecocredits, carbon credits, biodiversity credits, regen network, sustainability, climate tech, ai sustainability, ai carbon footprint, ecological regeneration, on-chain retirement, verifiable credits
```

---

## Social Media Posts

### Twitter/X

**Post text** (attach the GIF from the footprint scene):
```
Every AI session uses energy. Now your AI can fund ecological regeneration.

Regen for AI: one MCP command to install. Estimate your footprint, browse carbon & biodiversity credits, retire them on-chain.

Verifiable. Immutable. No crypto wallet needed.

claude mcp add -s user regen-for-ai -- npx regen-for-ai

github.com/CShear/regen-for-ai
```

**Alt shorter version** (280 chars):
```
Your AI sessions have an ecological footprint. Now Claude can estimate it and retire verified ecocredits on Regen Network — with on-chain proof.

One command: claude mcp add -s user regen-for-ai -- npx regen-for-ai
```

### LinkedIn

```
Introducing Regen for AI — ecological accountability for AI compute.

Every AI coding session consumes energy. With one MCP install command, your AI assistant can:

1. Estimate the session's ecological footprint
2. Browse carbon and biodiversity credits on Regen Network
3. Retire credits via credit card (no crypto wallet needed)
4. Retrieve a verifiable, immutable on-chain retirement certificate

This isn't carbon offsetting — it's regenerative contribution. Verified funding of real ecological projects, recorded permanently on Regen Ledger.

Works with Claude Code, Cursor, VS Code, and any MCP-compatible AI tool.

Install: claude mcp add -s user regen-for-ai -- npx regen-for-ai

GitHub: https://github.com/CShear/regen-for-ai

#RegenerativeAI #Sustainability #ClimTech #MCP #AItools
```

---

## Timing Summary

| Scene | Time | Duration | Caption |
|-------|------|----------|---------|
| 1. Hook | 0:00 | 5s | Every AI session uses energy... |
| 2. Install | 0:05 | 7s | One command to install. |
| 3. Footprint | 0:12 | 18s | I've been coding for an hour... |
| 4. Credits | 0:30 | 18s | Now let's see what credits are available. |
| 5. Retire | 0:48 | 17s | Fund regeneration. One command. |
| 6. Certificate | 1:05 | 13s | Verifiable. Immutable. On-chain. |
| 7. Closing | 1:18 | 10s | Regenerative AI. One command to install. |
| **Total** | | **~88s** | |

---

## Quick Reference — Prompts to Type

Copy-paste these during recording:

```
1. What's the ecological footprint of this AI session? It's been about 60 minutes.

2. Show me what ecological credits are available on Regen Network

3. Retire 1 carbon credit for ecological regeneration

4. Get me the retirement certificate for WyJyZXRpcmVtZW50cyIsMSwyNTgwODA2NCwwLDBd
```
