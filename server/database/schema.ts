import { sql } from "drizzle-orm";
import {
  bigserial,
  char,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const catCoins = pgTable(
  "cat_coins",
  {
    slug: text("slug").primaryKey(),
    name: text("name").notNull(),
    ticker: text("ticker").notNull(),
    chain: text("chain").notNull(),
    chainId: text("chain_id"),
    contractAddress: text("contract_address"),
    imageUrl: text("image_url"),
    headerUrl: text("header_url"),
    openGraphUrl: text("open_graph_url"),
    voteCount: integer("vote_count").notNull().default(0),
  },
  (table) => [
    check("cat_coins_vote_count_check", sql`${table.voteCount} >= 0`),
    uniqueIndex("cat_coins_chain_contract_unique")
      .on(table.chainId, table.contractAddress)
      .where(sql`${table.contractAddress} IS NOT NULL`),
  ],
);

export const catCoinVotes = pgTable(
  "cat_coin_votes",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    pollKey: text("poll_key").notNull(),
    coinSlug: text("coin_slug")
      .notNull()
      .references(() => catCoins.slug),
    visitorId: uuid("visitor_id").notNull(),
    ipHash: char("ip_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("cat_coin_votes_poll_visitor_coin_key").on(
      table.pollKey,
      table.visitorId,
      table.coinSlug,
    ),
    index("cat_coin_votes_ip_rate_limit_idx").on(
      table.pollKey,
      table.ipHash,
      table.createdAt.desc(),
    ),
  ],
);
