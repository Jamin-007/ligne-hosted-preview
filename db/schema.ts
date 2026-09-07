import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const quotes = sqliteTable("quotes", {
  id: text("id").primaryKey(), userId: text("user_id").notNull(), amountIn: text("amount_in").notNull(),
  rate: text("rate").notNull(), fee: text("fee").notNull(), amountOut: text("amount_out").notNull(),
  expiresAt: text("expires_at").notNull(), createdAt: text("created_at").notNull(),
});

export const conversions = sqliteTable("conversions", {
  id: text("id").primaryKey(), quoteId: text("quote_id").notNull(), userId: text("user_id").notNull(),
  walletAddress: text("wallet_address").notNull(), transactionHash: text("transaction_hash"),
  state: text("state").notNull(), confirmations: integer("confirmations").notNull().default(0),
  requiredConfirmations: integer("required_confirmations").notNull(), safetyJson: text("safety_json").notNull(),
  ledgerTransactionId: text("ledger_transaction_id"), createdAt: text("created_at").notNull(), updatedAt: text("updated_at").notNull(),
}, (table) => [index("idx_conversions_user_id").on(table.userId)]);

export const ledgerEntries = sqliteTable("ledger_entries", {
  id: text("id").primaryKey(), transactionId: text("transaction_id").notNull(), conversionId: text("conversion_id").notNull(),
  account: text("account").notNull(), side: text("side").notNull(), amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(), createdAt: text("created_at").notNull(),
}, (table) => [index("idx_ledger_account").on(table.account)]);
