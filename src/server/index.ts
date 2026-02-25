/**
 * Regen for AI — Payment & Balance Server
 *
 * A small Express server that handles:
 * - Stripe Checkout for prepaid balance top-ups
 * - Stripe webhooks for payment confirmation
 * - Balance checking and debiting for MCP clients
 *
 * Run: npx regen-for-ai serve [--port 3141]
 */

import express from "express";
import Stripe from "stripe";
import { getDb } from "./db.js";
import { createRoutes } from "./routes.js";

export function startServer(options: { port?: number; dbPath?: string } = {}) {
  const port = options.port ?? parseInt(process.env.REGEN_SERVER_PORT ?? "3141", 10);
  const dbPath = options.dbPath ?? process.env.REGEN_DB_PATH ?? "data/regen-for-ai.db";

  // Validate Stripe key
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("Error: STRIPE_SECRET_KEY environment variable is required.");
    console.error("Get your key from: https://dashboard.stripe.com/apikeys");
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey);
  const db = getDb(dbPath);

  const baseUrl = process.env.REGEN_SERVER_URL ?? `http://localhost:${port}`;

  const app = express();

  // Stripe webhooks need raw body for signature verification
  app.use("/webhook", express.raw({ type: "application/json" }));

  // Everything else uses JSON
  app.use(express.json());

  // Mount routes
  const routes = createRoutes(stripe, db, baseUrl);
  app.use(routes);

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", version: "0.3.0" });
  });

  app.listen(port, () => {
    console.log(`Regen for AI payment server running on ${baseUrl}`);
    console.log(`  Checkout page: ${baseUrl}/checkout-page`);
    console.log(`  Stripe mode: ${stripeKey.startsWith("sk_test_") ? "TEST" : "LIVE"}`);
    console.log(`  Database: ${dbPath}`);
  });
}
