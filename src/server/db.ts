/**
 * SQLite database for prepaid balance tracking.
 *
 * Tables:
 * - users: API key, email, balance (in cents), Stripe customer ID
 * - transactions: top-ups and retirement debits with full audit trail
 */

import Database from "better-sqlite3";
import { randomBytes } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { dirname } from "path";

let _db: Database.Database | undefined;

export function getDb(dbPath = "data/regen-for-ai.db"): Database.Database {
  if (_db) return _db;

  const dir = dirname(dbPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      api_key TEXT UNIQUE NOT NULL,
      email TEXT,
      balance_cents INTEGER NOT NULL DEFAULT 0,
      stripe_customer_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('topup', 'retirement')),
      amount_cents INTEGER NOT NULL,
      description TEXT,
      stripe_session_id TEXT,
      retirement_tx_hash TEXT,
      credit_class TEXT,
      credits_retired REAL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  `);

  return _db;
}

export function generateApiKey(): string {
  return "rfa_" + randomBytes(24).toString("hex");
}

export interface User {
  id: number;
  api_key: string;
  email: string | null;
  balance_cents: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: "topup" | "retirement";
  amount_cents: number;
  description: string | null;
  stripe_session_id: string | null;
  retirement_tx_hash: string | null;
  credit_class: string | null;
  credits_retired: number | null;
  created_at: string;
}

export function getUserByApiKey(db: Database.Database, apiKey: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE api_key = ?").get(apiKey) as User | undefined;
}

export function getUserByEmail(db: Database.Database, email: string): User | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as User | undefined;
}

export function createUser(db: Database.Database, email: string | null, stripeCustomerId: string | null): User {
  const apiKey = generateApiKey();
  const stmt = db.prepare(
    "INSERT INTO users (api_key, email, stripe_customer_id) VALUES (?, ?, ?)"
  );
  const result = stmt.run(apiKey, email, stripeCustomerId);
  return db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid) as User;
}

export function creditBalance(
  db: Database.Database,
  userId: number,
  amountCents: number,
  stripeSessionId: string,
  description: string
): void {
  const txn = db.transaction(() => {
    db.prepare(
      "UPDATE users SET balance_cents = balance_cents + ?, updated_at = datetime('now') WHERE id = ?"
    ).run(amountCents, userId);

    db.prepare(
      "INSERT INTO transactions (user_id, type, amount_cents, description, stripe_session_id) VALUES (?, 'topup', ?, ?, ?)"
    ).run(userId, amountCents, description, stripeSessionId);
  });
  txn();
}

export function debitBalance(
  db: Database.Database,
  userId: number,
  amountCents: number,
  description: string,
  retirementTxHash?: string,
  creditClass?: string,
  creditsRetired?: number
): { success: boolean; balance_cents: number } {
  const result = { success: false, balance_cents: 0 };

  const txn = db.transaction(() => {
    const user = db.prepare("SELECT balance_cents FROM users WHERE id = ?").get(userId) as { balance_cents: number } | undefined;
    if (!user || user.balance_cents < amountCents) {
      result.balance_cents = user?.balance_cents ?? 0;
      return;
    }

    db.prepare(
      "UPDATE users SET balance_cents = balance_cents - ?, updated_at = datetime('now') WHERE id = ?"
    ).run(amountCents, userId);

    db.prepare(
      "INSERT INTO transactions (user_id, type, amount_cents, description, retirement_tx_hash, credit_class, credits_retired) VALUES (?, 'retirement', ?, ?, ?, ?, ?)"
    ).run(userId, amountCents, description, retirementTxHash ?? null, creditClass ?? null, creditsRetired ?? null);

    result.success = true;
    result.balance_cents = user.balance_cents - amountCents;
  });
  txn();

  return result;
}

export function getTransactions(db: Database.Database, userId: number, limit = 20): Transaction[] {
  return db.prepare(
    "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?"
  ).all(userId, limit) as Transaction[];
}
