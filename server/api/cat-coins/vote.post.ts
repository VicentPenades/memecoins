import { readBody } from "h3";
import { useDatabase } from "../../utils/database";
import {
  CAT_COIN_POLL_KEY,
  MAX_DAILY_VOTES_PER_IP,
  getVisitorId,
  hashRequestIp,
  persistVisitorId,
} from "../../utils/voting";

class VoteConflictError extends Error {}
class VoteRateLimitError extends Error {}
class UnknownCoinError extends Error {}

type VoteBody = {
  slug?: unknown;
};

export default defineEventHandler(async (event) => {
  const body = await readBody<VoteBody>(event);
  if (
    typeof body?.slug !== "string" ||
    !/^[a-z0-9-]{1,64}$/.test(body.slug)
  ) {
    throw createError({ statusCode: 400, message: "Invalid coin identifier" });
  }

  const sql = useDatabase(event);
  const visitorId = getVisitorId(event);
  const ipHash = hashRequestIp(event);

  try {
    await sql.begin(async (transaction) => {
      await transaction`
        SELECT pg_advisory_xact_lock(hashtextextended(${ipHash}, 0))
      `;

      const coins = await transaction<{ slug: string }[]>`
        SELECT slug
        FROM cat_coins
        WHERE slug = ${body.slug}
        LIMIT 1
      `;
      const coin = coins[0];
      if (!coin) {
        throw new UnknownCoinError();
      }

      const previousVotes = await transaction<{ id: number }[]>`
        SELECT id
        FROM cat_coin_votes
        WHERE poll_key = ${CAT_COIN_POLL_KEY}
          AND visitor_id = ${visitorId}
          AND coin_slug = ${coin.slug}
        LIMIT 1
      `;
      if (previousVotes.length > 0) {
        throw new VoteConflictError();
      }

      const recentVotes = await transaction<{ count: number }[]>`
        SELECT COUNT(*)::int AS count
        FROM cat_coin_votes
        WHERE poll_key = ${CAT_COIN_POLL_KEY}
          AND ip_hash = ${ipHash}
          AND created_at >= NOW() - INTERVAL '24 hours'
      `;
      if ((recentVotes[0]?.count ?? 0) >= MAX_DAILY_VOTES_PER_IP) {
        throw new VoteRateLimitError();
      }

      const insertedVotes = await transaction<{ id: number }[]>`
        INSERT INTO cat_coin_votes (
          poll_key,
          coin_slug,
          visitor_id,
          ip_hash
        )
        VALUES (
          ${CAT_COIN_POLL_KEY},
          ${coin.slug},
          ${visitorId},
          ${ipHash}
        )
        ON CONFLICT (poll_key, visitor_id, coin_slug) DO NOTHING
        RETURNING id
      `;
      if (insertedVotes.length === 0) {
        throw new VoteConflictError();
      }

      await transaction`
        UPDATE cat_coins
        SET vote_count = vote_count + 1
        WHERE slug = ${coin.slug}
      `;
    });
  } catch (error) {
    if (error instanceof VoteConflictError) {
      throw createError({
        statusCode: 409,
        message: "You have already voted for this coin",
      });
    }
    if (error instanceof VoteRateLimitError) {
      throw createError({
        statusCode: 429,
        message: "Too many votes from this network. Try again tomorrow",
      });
    }
    if (error instanceof UnknownCoinError) {
      throw createError({ statusCode: 404, message: "Coin not found" });
    }
    throw error;
  }

  persistVisitorId(event, visitorId);

  const counts = await sql<{ slug: string; vote_count: number }[]>`
    SELECT slug, vote_count
    FROM cat_coins
    ORDER BY vote_count DESC, slug ASC
  `;

  const votedRows = await sql<{ slug: string }[]>`
    SELECT coin.slug
    FROM cat_coin_votes AS vote
    JOIN cat_coins AS coin ON coin.slug = vote.coin_slug
    WHERE vote.poll_key = ${CAT_COIN_POLL_KEY}
      AND vote.visitor_id = ${visitorId}
  `;

  return {
    votes: Object.fromEntries(
      counts.map((coin) => [coin.slug, coin.vote_count]),
    ),
    votedSlugs: votedRows.map((vote) => vote.slug),
  };
});
