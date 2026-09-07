CREATE TABLE `conversions` (
	`id` text PRIMARY KEY NOT NULL,
	`quote_id` text NOT NULL,
	`user_id` text NOT NULL,
	`wallet_address` text NOT NULL,
	`transaction_hash` text,
	`state` text NOT NULL,
	`confirmations` integer DEFAULT 0 NOT NULL,
	`required_confirmations` integer NOT NULL,
	`safety_json` text NOT NULL,
	`ledger_transaction_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ledger_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`transaction_id` text NOT NULL,
	`conversion_id` text NOT NULL,
	`account` text NOT NULL,
	`side` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`currency` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`amount_in` text NOT NULL,
	`rate` text NOT NULL,
	`fee` text NOT NULL,
	`amount_out` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
