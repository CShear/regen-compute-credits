/**
 * Express routes for the Regen for AI payment service.
 *
 * POST /checkout          — Create a Stripe Checkout session
 * POST /webhook           — Handle Stripe webhook events
 * GET  /balance           — Check prepaid balance (API key in header)
 * POST /debit             — Debit balance after retirement (API key in header)
 * GET  /transactions      — Transaction history (API key in header)
 */

import { Router, Request, Response } from "express";
import Stripe from "stripe";
import type Database from "better-sqlite3";
import {
  getUserByApiKey,
  getUserByEmail,
  createUser,
  creditBalance,
  debitBalance,
  getTransactions,
} from "./db.js";

export function createRoutes(stripe: Stripe, db: Database.Database, baseUrl: string): Router {
  const router = Router();

  // --- Public routes ---

  /**
   * POST /checkout
   * Body: { amount_cents: 1000, email?: "user@example.com" }
   * Returns: { url: "https://checkout.stripe.com/..." }
   */
  router.post("/checkout", async (req: Request, res: Response) => {
    try {
      const { amount_cents, email } = req.body;

      if (!amount_cents || typeof amount_cents !== "number" || amount_cents < 100) {
        res.status(400).json({ error: "amount_cents must be at least 100 ($1.00)" });
        return;
      }

      const amountDollars = (amount_cents / 100).toFixed(2);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              unit_amount: amount_cents,
              product_data: {
                name: "Regen for AI — Ecological Credit Balance",
                description: `$${amountDollars} prepaid balance for retiring verified ecocredits via your AI assistant`,
              },
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cancel`,
        ...(email ? { customer_email: email } : {}),
      };

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Checkout error:", msg);
      res.status(500).json({ error: msg });
    }
  });

  /**
   * POST /webhook
   * Stripe webhook handler — processes checkout.session.completed events.
   * Creates user if new, credits their balance, generates API key.
   */
  router.post("/webhook", async (req: Request, res: Response) => {
    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (webhookSecret && sig) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("Webhook signature verification failed:", msg);
        res.status(400).json({ error: `Webhook Error: ${msg}` });
        return;
      }
    } else {
      // In test mode without webhook secret, parse the raw body
      const body = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : req.body;
      event = (typeof body === "string" ? JSON.parse(body) : body) as Stripe.Event;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const amountCents = session.amount_total ?? 0;
      const email = session.customer_email ?? session.customer_details?.email ?? null;
      const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;

      // Find or create user
      let user = email ? getUserByEmail(db, email) : undefined;
      if (!user) {
        user = createUser(db, email, stripeCustomerId);
        console.log(`New user created: ${user.api_key} (${email})`);
      }

      // Credit balance
      creditBalance(
        db,
        user.id,
        amountCents,
        session.id,
        `Stripe top-up: $${(amountCents / 100).toFixed(2)}`
      );

      console.log(
        `Balance credited: user=${user.id} amount=$${(amountCents / 100).toFixed(2)} balance=$${((user.balance_cents + amountCents) / 100).toFixed(2)}`
      );
    }

    res.json({ received: true });
  });

  /**
   * GET /success?session_id=cs_xxx
   * Success page after Stripe Checkout — shows API key and install instructions.
   */
  router.get("/success", async (req: Request, res: Response) => {
    try {
      const sessionId = req.query.session_id as string;
      if (!sessionId) {
        res.status(400).send("Missing session_id");
        return;
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      const email = session.customer_email ?? session.customer_details?.email ?? null;

      if (!email) {
        res.status(400).send("No email found for this session");
        return;
      }

      const user = getUserByEmail(db, email);
      if (!user) {
        res.status(404).send("User not found — webhook may not have processed yet. Refresh in a few seconds.");
        return;
      }

      const amountDollars = (session.amount_total ?? 0) / 100;

      res.setHeader("Content-Type", "text/html");
      res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Regen for AI — Payment Successful</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #2d6a4f; }
    .key-box { background: #f0f7f4; border: 2px solid #2d6a4f; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .api-key { font-family: monospace; font-size: 14px; background: #fff; border: 1px solid #ccc; padding: 8px 12px; border-radius: 4px; word-break: break-all; display: block; margin: 8px 0; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
    pre { background: #1a1a1a; color: #e0e0e0; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    .balance { font-size: 24px; font-weight: bold; color: #2d6a4f; }
  </style>
</head>
<body>
  <h1>Payment Successful</h1>
  <p>You've added <strong>$${amountDollars.toFixed(2)}</strong> to your Regen for AI balance.</p>
  <p>Current balance: <span class="balance">$${(user.balance_cents / 100).toFixed(2)}</span></p>

  <div class="key-box">
    <strong>Your API Key</strong>
    <span class="api-key">${user.api_key}</span>
    <p><strong>Save this key!</strong> You'll need it to connect your AI assistant.</p>
  </div>

  <h2>Setup (30 seconds)</h2>

  <p><strong>1. Install the MCP server</strong> (if you haven't already):</p>
  <pre>claude mcp add -s user regen-for-ai -- npx regen-for-ai</pre>

  <p><strong>2. Set your API key</strong> — add to your shell profile or <code>.env</code>:</p>
  <pre>export REGEN_API_KEY=${user.api_key}
export REGEN_BALANCE_URL=${baseUrl}</pre>

  <p><strong>3. Done!</strong> In Claude Code, just say "retire 1 carbon credit" and it'll happen automatically from your prepaid balance.</p>

  <h2>What happens next</h2>
  <ul>
    <li>Your AI assistant checks your balance before each retirement</li>
    <li>Credits are retired on-chain on Regen Network with verifiable proof</li>
    <li>When your balance gets low, you'll be prompted to top up</li>
  </ul>

  <p><a href="${baseUrl}/checkout-page">Top up again</a></p>
</body>
</html>`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Success page error:", msg);
      res.status(500).send("Error loading success page. Your payment was received — check back shortly.");
    }
  });

  /**
   * GET /cancel
   * Cancelled checkout — redirect or show message.
   */
  router.get("/cancel", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Regen for AI — Checkout Cancelled</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { color: #666; }
  </style>
</head>
<body>
  <h1>Checkout Cancelled</h1>
  <p>No payment was processed. <a href="/checkout-page">Try again</a> when you're ready.</p>
</body>
</html>`);
  });

  /**
   * GET /checkout-page
   * Simple landing page with top-up options.
   */
  router.get("/checkout-page", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Regen for AI — Fund Ecological Regeneration</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 640px; margin: 60px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #2d6a4f; }
    .tiers { display: flex; gap: 16px; margin: 24px 0; }
    .tier { flex: 1; border: 2px solid #ddd; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .tier:hover { border-color: #2d6a4f; }
    .tier.selected { border-color: #2d6a4f; background: #f0f7f4; }
    .tier-name { font-weight: bold; font-size: 18px; color: #2d6a4f; }
    .tier-price { font-size: 28px; font-weight: bold; margin: 8px 0; }
    .tier-desc { font-size: 13px; color: #666; }
    button { background: #2d6a4f; color: white; border: none; padding: 14px 28px; font-size: 16px; border-radius: 8px; cursor: pointer; margin-top: 16px; }
    button:hover { background: #245a42; }
    button:disabled { background: #999; cursor: not-allowed; }
    .info { background: #f0f7f4; border-left: 4px solid #2d6a4f; padding: 12px 16px; margin: 20px 0; }
    #email { padding: 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; width: 100%; box-sizing: border-box; margin: 8px 0 16px; }
  </style>
</head>
<body>
  <h1>Regen for AI</h1>
  <p>Fund verified ecological regeneration from your AI sessions. Pay once, retire credits seamlessly from Claude Code.</p>

  <div class="info">
    <strong>How it works:</strong> Add funds to your balance → get an API key → your AI assistant retires ecocredits on-chain without you ever leaving your coding session.
  </div>

  <label for="email"><strong>Your email</strong></label>
  <input type="email" id="email" placeholder="you@example.com" required>

  <div class="tiers">
    <div class="tier selected" data-amount="500" onclick="selectTier(this)">
      <div class="tier-name">Seedling</div>
      <div class="tier-price">$5</div>
      <div class="tier-desc">~1 carbon credit<br>~125 sessions</div>
    </div>
    <div class="tier" data-amount="1000" onclick="selectTier(this)">
      <div class="tier-name">Grove</div>
      <div class="tier-price">$10</div>
      <div class="tier-desc">~2.5 carbon credits<br>~250 sessions</div>
    </div>
    <div class="tier" data-amount="2500" onclick="selectTier(this)">
      <div class="tier-name">Forest</div>
      <div class="tier-price">$25</div>
      <div class="tier-desc">~6 carbon credits<br>~625 sessions</div>
    </div>
  </div>

  <button id="checkout-btn" onclick="checkout()">Fund ecological regeneration</button>

  <script>
    let selectedAmount = 500;

    function selectTier(el) {
      document.querySelectorAll('.tier').forEach(t => t.classList.remove('selected'));
      el.classList.add('selected');
      selectedAmount = parseInt(el.dataset.amount);
    }

    async function checkout() {
      const email = document.getElementById('email').value;
      if (!email) { alert('Please enter your email'); return; }

      const btn = document.getElementById('checkout-btn');
      btn.disabled = true;
      btn.textContent = 'Redirecting...';

      try {
        const res = await fetch('/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount_cents: selectedAmount, email }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('Error: ' + (data.error || 'Unknown error'));
          btn.disabled = false;
          btn.textContent = 'Fund ecological regeneration';
        }
      } catch (err) {
        alert('Error: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Fund ecological regeneration';
      }
    }
  </script>
</body>
</html>`);
  });

  // --- Authenticated routes (API key in header) ---

  /**
   * GET /balance
   * Header: Authorization: Bearer rfa_xxx
   * Returns: { balance_cents, balance_dollars, email }
   */
  router.get("/balance", (req: Request, res: Response) => {
    const user = authenticateRequest(req, res, db);
    if (!user) return;

    res.json({
      balance_cents: user.balance_cents,
      balance_dollars: (user.balance_cents / 100).toFixed(2),
      email: user.email,
      topup_url: `${baseUrl}/checkout-page`,
    });
  });

  /**
   * POST /debit
   * Header: Authorization: Bearer rfa_xxx
   * Body: { amount_cents, description, retirement_tx_hash?, credit_class?, credits_retired? }
   * Returns: { success, balance_cents, balance_dollars }
   */
  router.post("/debit", (req: Request, res: Response) => {
    const user = authenticateRequest(req, res, db);
    if (!user) return;

    const { amount_cents, description, retirement_tx_hash, credit_class, credits_retired } = req.body;

    if (!amount_cents || typeof amount_cents !== "number" || amount_cents <= 0) {
      res.status(400).json({ error: "amount_cents must be a positive number" });
      return;
    }

    const result = debitBalance(
      db,
      user.id,
      amount_cents,
      description ?? "Credit retirement",
      retirement_tx_hash,
      credit_class,
      credits_retired
    );

    if (!result.success) {
      res.status(402).json({
        error: "Insufficient balance",
        balance_cents: result.balance_cents,
        balance_dollars: (result.balance_cents / 100).toFixed(2),
        topup_url: `${baseUrl}/checkout-page`,
      });
      return;
    }

    res.json({
      success: true,
      balance_cents: result.balance_cents,
      balance_dollars: (result.balance_cents / 100).toFixed(2),
    });
  });

  /**
   * GET /transactions
   * Header: Authorization: Bearer rfa_xxx
   * Returns: { transactions: [...] }
   */
  router.get("/transactions", (req: Request, res: Response) => {
    const user = authenticateRequest(req, res, db);
    if (!user) return;

    const txns = getTransactions(db, user.id);
    res.json({
      transactions: txns.map((t) => ({
        ...t,
        amount_dollars: (t.amount_cents / 100).toFixed(2),
      })),
    });
  });

  return router;
}

/** Extract and validate API key from Authorization header */
function authenticateRequest(req: Request, res: Response, db: Database.Database) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing Authorization header. Use: Bearer <api_key>" });
    return null;
  }

  const apiKey = auth.slice(7).trim();
  const user = getUserByApiKey(db, apiKey);
  if (!user) {
    res.status(401).json({ error: "Invalid API key" });
    return null;
  }

  return user;
}
